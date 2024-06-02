import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Dialog, DialogContent } from "../ui/dialog"

// Form Imports
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import type { Component } from "@prisma/client"
import { Button } from "../ui/button"
import { Loader2Icon } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { handleEditTreeLink, handleNewTreeLink } from "@/requests/trees"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import type { TreeWithComponents } from "@/interfaces/tree"

interface TreeComponentDialogProps {
  component?: Component,
  open: boolean,
  onOpenChange: () => void,
  treeId: string,
  setTree: React.Dispatch<React.SetStateAction<TreeWithComponents>>,
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>
}

export default function TreeComponentDialog({ component, open, onOpenChange, treeId, setTree, setComponents }: TreeComponentDialogProps) {
  const [editButtonColor, setEditButtonColor] = useState<{ openModal: boolean, color: string | undefined }>({
    openModal: false,
    color: ""
  })
  const [editTextColor, setEditTextColor] = useState<{ openModal: boolean, color: string | undefined }>({
    openModal: false,
    color: ""
  })
  const formSchema = z.object({
    title: z.string().min(1, "Name is required"),
    url: z.string().min(1, "URL is required"),
    outlined: z.boolean().optional(),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      title: component?.label || "My awesome link",
      url: component?.url || "",
      backgroundColor: component?.backgroundColor || "",
      outlined: component?.outlined || false,
    }
  })

  const newLinkMutation = useMutation({
    mutationFn: () => handleNewTreeLink(treeId, form.getValues("title"), form.getValues("url"), editButtonColor.color, editTextColor.color, form.getValues("outlined")),
    onSuccess: (response: Component) => {
      setTree((prev) => ({
        ...prev,
        components: [
          ...prev.components,
        ]
      }))
      setComponents((prev) => ([
        ...prev,
        response
      ]))
      onOpenChange()
      form.reset()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error)
      }
    }
  })

  const editLinkMutation = useMutation({
    mutationFn: () => handleEditTreeLink(component?.id, form.getValues("title"), form.getValues("url"), editButtonColor.color, editTextColor.color, form.getValues("outlined")),
    onSuccess: (response) => {
      setTree((prev) => ({
        ...prev,
        components: prev.components.map((component) => {
          if (component.id === response.id) {
            return response
          }
          return component
        })
      }))
      setComponents((prev) => prev.map((component) => {
        if (component.id === response.id) {
          return response
        }
        return component
      }))
      onOpenChange()
      form.reset()
    }

  })

  function onSubmit() {
    if (component?.id) {
      editLinkMutation.mutate()
      return;
    }
    newLinkMutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex justify-center items-center w-full md:w-fit h-fit">
        <Card className="w-full md:w-[500px] border-0">
          <CardHeader>
            <CardTitle>Create new link</CardTitle>
            <CardDescription>
              Fill in the form below to create a new link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(() => onSubmit())} id="new_tree_link">
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5 ">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Button asChild variant="tree_link">
                              <Input
                                style={{
                                  background: form.getValues("outlined") ? "transparent" : editButtonColor.color,
                                  color: editTextColor.color,
                                  outlineWidth: form.getValues("outlined") ? "2px" : "0",
                                  outlineColor: editButtonColor.color,
                                  outlineStyle: form.getValues("outlined") ? "solid" : "none"
                                }}
                                className="h-[50px] border-0 !ring-0 !ring-transparent text-center"
                                placeholder=""
                                {...field}
                              />
                            </Button>
                          </FormControl>
                          <FormMessage className="pt-2" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Enter the URL of the link
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="py-4">
                      <FormField
                        control={form.control}
                        name="outlined"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Styles</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Switch id="outlined-button"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                                <Label htmlFor="outlined-button">Outlined</Label>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 !mt-4">
                      <Button className="w-full " type="button" onClick={() => setEditButtonColor({
                        ...editButtonColor,
                        openModal: true
                      })}>
                        Change button color
                      </Button>
                      <Button className="w-full" type="button" onClick={() => setEditTextColor({
                        ...editTextColor,
                        openModal: true
                      })}>
                        Change text color
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled={newLinkMutation.isPending} type="submit" form="new_tree_link">
              {
                component?.id ? (
                  editLinkMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "Save"
                ) : (newLinkMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "Create")
              }
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}