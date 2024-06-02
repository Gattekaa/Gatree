import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { handleAvailablePath, handleNewTree } from "@/requests/trees";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2Icon } from "lucide-react";
import { useEffect } from "react";
import { useDebounce } from "@/helpers/useDebounce";

export default function AddNewTree() {
  const { push } = useRouter()
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    path: z.string().min(1, "Path is required"),
    status: z.string().min(1, "Status is required"),
    path_available: z.boolean()
  }).superRefine((data, ctx) => {
    if (!data.path_available) {
      ctx.addIssue({
        code: "custom",
        message: "Path is not available",
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "My awesome tree",
      path: "",
      status: "active",
      path_available: false
    }
  })
  const hasTreePathChanged = useDebounce(form.watch().path, 500)

  const newTreeMutation = useMutation({
    mutationFn: async ({ name, path, status }: { name: string, path: string, status: string }) => await handleNewTree(name, path, status),
    onSuccess: (data) => {
      push(`/edit/tree/${data.path}`)
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.error)
      }
    }
  })

  const availablePathMutation = useMutation({
    mutationFn: async () => handleAvailablePath(form.getValues().path),
    onSuccess: (data) => {
      form.clearErrors("path")

      if (!data.available) {
        form.setValue("path_available", data.available)
        return form.setError("path", {
          type: "manual",
          message: "Path is not available"
        })
      }

      form.setValue("path_available", data.available)
    }
  })

  function onSubmit(values: { name: string, path: string, status: string }) {
    if (form.formState.errors.path_available) {
      return form.setError("path", {
        type: "manual",
        message: "Path is not available"
      })
    }
    newTreeMutation.mutate(values)
  }

  useEffect(() => {
    if (hasTreePathChanged) {
      availablePathMutation.mutate()
    }
  }, [hasTreePathChanged])

  return (
    <Dialog>
      <DialogTrigger>
        <li
          className="w-full h-[350px] flex justify-center items-center bg-black rounded-xl text-slate-400 border border-dashed border-white/20 opacity-60 hover:opacity-100 duration-150"
        >
          <h2>Click to add a new tree</h2>
        </li>
      </DialogTrigger>
      <DialogContent className="flex justify-center items-center w-fit h-fit">
        <Card className="w-[350px] border-0">
          <CardHeader>
            <CardTitle>Create new tree</CardTitle>
            <CardDescription>
              Fill in the form below to create a new tree
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form id="new_tree_form" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tree Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=""
                              {...field}

                            />
                          </FormControl>
                          <FormDescription>
                            Let's start with the name of your tree
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      disabled={availablePathMutation.isPending}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tree Path</FormLabel>
                          <FormControl>
                            <Input
                              style={{
                                ...(form.formState.errors.path && form.watch().path && { borderColor: "red" }),
                                ...(form.watch().path_available && form.watch().path && { borderColor: "green" })
                              }}
                              placeholder=""
                              {...field}
                              onChange={e => field.onChange(e.target.value?.replace(" ", "-")?.toLowerCase())}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be the path of your tree ex: {process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/tree/{form.watch().path}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Choose the initial status of your tree
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled={newTreeMutation.isPending} type="submit" form="new_tree_form">
              {
                newTreeMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "Next"
              }
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}