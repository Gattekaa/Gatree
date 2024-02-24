"use client"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchLogin } from "../../../requests/auth";
import axios from "axios";
import { setCookie } from "nookies";
import { useRouter } from "next/navigation";
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import AnimatedBackground from "@/components/animatedBackground";
import Link from "next/link";

export default function Login() {
  const { setUser } = useUserContext()
  const { push } = useRouter()
  const formSchema = z.object({
    username: z.string().min(1, {
      message: "Username is required",
    }),
    password: z.string().min(1, {
      message: "Password is required",
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const loginMutation = useMutation({
    mutationFn: () => fetchLogin(form.getValues()),
    onSuccess: (data) => {
      setUser(data.user)
      setCookie(null, "token", data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      })
      toast("You have been logged in! 🎉", {
        description: "Welcome back!",
      })
      push("/dashboard")
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error
        toast(`${errorMessage} 😓`, {
          description: "Please try again",

        })
      }
    }
  });

  return (
    <AnimatedBackground>
      <div className="w-full h-screen flex justify-center items-center" >
        <main className="w-[350px] h-fit">
          <h1 className="text-3xl font-bold mb-8">Login</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(async () => await loginMutation.mutateAsync())} className="space-y-8 flex flex-col">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input autoFocus {...field} />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormMessage>
                <Link href="/auth/register" className="text-blue-500">
                  Don't have an account? Register here
                </Link>
              </FormMessage>
              <Button
                disabled={loginMutation.isPending}
                type="submit"
              >
                {
                  loginMutation.isPending ? <Loader2Icon className="animate-spin" /> : "Login"
                }
              </Button>
            </form>
          </Form>
        </main>
      </div >
    </AnimatedBackground>
  )
}