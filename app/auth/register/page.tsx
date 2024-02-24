"use client"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchRegister } from "../../../requests/auth";
import axios from "axios";
import { setCookie } from "nookies";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import AnimatedBackground from "@/components/animatedBackground";

export default function Register() {
  const { setUser } = useUserContext()
  const { push } = useRouter()
  const formSchema = z.object({
    username: z.string().min(1, {
      message: "Username is required",
    }),
    password: z.string().min(1, {
      message: "Password is required",
    }),
    password_confirmation: z.string().min(1, {
      message: "Password confirmation is required",
    }),
  }).superRefine(({ password_confirmation, password }, ctx) => {
    if (password_confirmation !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Password confirmation must match password",
      });
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      password_confirmation: "",
    },
  })

  const registerMutation = useMutation({
    mutationFn: () => fetchRegister(form.getValues()),
    onSuccess: (data) => {
      setUser(data.user)
      setCookie(null, "token", data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      })
      toast("You have been registered! 🎉", {
        description: "Welcome to the club!",
      })
      push("/dashboard")
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data
        const field = errorMessage?.field
        if (field) {
          form.setError(field, {
            type: "manual",
            message: errorMessage.error
          })

        }
      }
    }
  });


  return (
    <AnimatedBackground>
      <div className="w-full h-[100dvh] md:h-screen flex justify-center items-center" >
        <main className="w-[350px] h-fit">
          <h1 className="text-3xl font-bold mb-8">Register</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(async () => await registerMutation.mutateAsync())} className="space-y-8 flex flex-col">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Type your best password. 😎
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Confirmation</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Confirm your password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormMessage>
                <Link href="/auth/login" className="text-blue-500">
                  Already have an account? Login here
                </Link>
              </FormMessage>
              <Button
                disabled={registerMutation.isPending}
                type="submit"
              >
                {
                  registerMutation.isPending ? <Loader2Icon className="animate-spin" /> : "Register"
                }
              </Button>
            </form>
          </Form>
        </main>
      </div >
    </AnimatedBackground>
  )
}