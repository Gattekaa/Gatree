import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useState } from "react";
import { Label } from "../ui/label";
import { Pencil } from "lucide-react";
import Tooltip from "../tooltip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleEditTree } from "@/requests/trees";
import { toast } from "sonner";
import type { Tree } from "@prisma/client";

interface LabelWithEditProps {
  initialText: string;
  treeId: string;
}

export default function LabelWithEdit({
  initialText,
  treeId
}: LabelWithEditProps) {
  const queryClient = useQueryClient()
  const [enableEdit, setEnableEdit] = useState<boolean>(false)

  const formSchema = z.object({
    title: z.string().min(1, "You can't leave the tree name empty"),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      title: initialText,
    }
  })

  const editTreeMutation = useMutation({
    mutationFn: async () => await handleEditTree({ id: treeId, title: form.getValues("title") }),
    onSuccess: (data: Tree) => {
      queryClient.setQueryData(["tree"], (oldData: Tree) => {
        return {
          ...oldData,
          title: data.title
        }
      })
      setEnableEdit(false)
    },
    onError: (error) => {
      console.error(error)
      toast.error("An error occurred while updating the tree name, please try again later.")
      form.setValue("title", initialText)
      setEnableEdit(false)
    }
  })

  function handleSubmit() {
    if (form.getValues("title") === initialText) {
      setEnableEdit(false)
      return
    }

    editTreeMutation.mutate()
  }

  return (
    <>
      {
        !enableEdit && (
          <Tooltip text="Click to edit tree name">
            <Label className="group relative text-xl bg-gray-950/30 px-4 py-2 rounded-xl" onClick={() => setEnableEdit(true)}>
              <Pencil size={24} className="opacity-0 group-hover:opacity-100 duration-150 absolute -left-4 -top-4 w-10 h-10 p-3 rounded-full bg-slate-800/50 hover:bg-slate-800/70" />
              {form.getValues("title")}
            </Label>
          </Tooltip>
        )
      }
      {
        enableEdit && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="w-full -mt-[6px]">
                    <FormLabel />
                    <FormControl>
                      <Tooltip text="Click outside tree name to save or press enter">
                        <Input
                          className="!bg-transparent !outline-none text-xl font-medium !ring-0 border-0 !outline-0 !ring-offset-0 text-center !w-full"
                          {...field}
                          autoFocus
                          onBlur={() => form.handleSubmit(handleSubmit)()}
                        />
                      </Tooltip>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form >
        )
      }
    </>
  )
}