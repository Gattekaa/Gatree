"use client"

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

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

// Dialog Imports
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"


// Card Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Dropdown Menu Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sheet Imports
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"


import { handleDeleteTreeLink, handleEditTree, handleEditTreeLink, handleNewTreeLink } from "@/requests/trees";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Component, Tree } from "@prisma/client";
import { Link2Icon, Link2Off, Loader2Icon, MoreHorizontal, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Alert from "@/components/dialog";
import ColorPicker from 'react-best-gradient-color-picker'
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Switch } from "@/components/ui/switch"
import AnimatedBackground from "@/components/animatedBackground";
import Tooltip from "@/components/tooltip";
import AvatarWithUpload from "@/components/avatarWithUpload";
import LabelWithEdit from "@/components/labelWithEdit";
import BackgroundChange from "@/components/backgroundChange";

export default function TreeContainer({ tree_id, tree: treeData }: {
  tree_id: string, tree: Tree & { components: Component[] }
}) {
  const [tree, setTree] = useState(treeData)
  const [deleteId, setDeleteId] = useState<string>("")
  const [newLink, setNewLink] = useState<boolean>(false)
  const [edit, setEdit] = useState({} as Component)
  const [editButtonColor, setEditButtonColor] = useState<{ openModal: boolean, color: string | undefined }>({
    openModal: false,
    color: ""

  })
  const [editTextColor, setEditTextColor] = useState<{ openModal: boolean, color: string | undefined }>({
    openModal: false,
    color: ""
  })

  const [color, setColor] = useState("");
  const formSchema = z.object({
    title: z.string().min(1, "Name is required"),
    url: z.string().min(1, "URL is required"),
    outlined: z.boolean().optional(),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      title: edit.label || "My awesome link",
      url: edit.url || "",
      backgroundColor: edit.backgroundColor || "",
      outlined: edit.outlined || false,
    }
  })
  const outlinedChanges = form.watch("outlined")

  const fallbackInitial = tree?.title?.[0]?.toUpperCase()

  const newLinkMutation = useMutation({
    mutationFn: () => handleNewTreeLink(tree_id, form.getValues("title"), form.getValues("url"), editButtonColor.color, editTextColor.color, form.getValues("outlined")),
    onSuccess: (response: Component) => {
      setTree({
        ...tree,
        components: [
          ...tree.components,
          response
        ]
      })
      setNewLink(false)
      form.reset()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error)
      }
    }
  })

  const editLinkMutation = useMutation({
    mutationFn: () => handleEditTreeLink(edit.id, form.getValues("title"), form.getValues("url"), editButtonColor.color, editTextColor.color, form.getValues("outlined")),
    onSuccess: (response) => {
      setTree({
        ...tree,
        components: tree.components.map((component) => {
          if (component.id === edit.id) {
            return response
          }
          return component
        })
      })
      setEdit({} as Component)
      form.reset()
    }

  })

  const deleteLinkMutation = useMutation({
    mutationFn: (id: string) => handleDeleteTreeLink(id),
    onSuccess: (response) => {
      setTree({
        ...tree,
        components: tree.components.filter((component) => component.id !== response.id)
      })
      setDeleteId("")
    }
  })

  const editTreeMutation = useMutation({
    mutationFn: (action?: string) => handleEditTree({ id: tree_id, backgroundColor: action === "remove" ? undefined : tree.backgroundColor || undefined, theme: tree.theme || undefined }),
    onSuccess: (response) => {
      setTree({
        ...tree,
        title: response.title,
        backgroundColor: response.backgroundColor
      })
    }
  })


  function handleBackgroundChange(action = "change") {
    editTreeMutation.mutate(action)
  }

  function onSubmit() {
    if (edit.id) {
      return editLinkMutation.mutate()
    }
    newLinkMutation.mutate()
  }

  useEffect(() => {
    if (form.getValues("outlined")) {
      setEditButtonColor({ openModal: false, color: edit.backgroundColor || "rgb(248 250 252)" })
      setEditTextColor({ openModal: false, color: edit.textColor || "rgb(248 250 252)" })
    } else {
      setEditButtonColor({ openModal: false, color: edit.backgroundColor || undefined })
      setEditTextColor({ openModal: false, color: edit.textColor || undefined })
    }

  }, [outlinedChanges])

  return (
    <AnimatedBackground variant={tree?.theme || undefined}>
      <main
        style={{ background: tree.backgroundColor || undefined }}
        className="w-full min-h-full flex flex-col items-center duration-150"
      >
        <Alert
          open={!!deleteId}
          onOpenChange={() => setDeleteId("")}
          title="Are you absolutely sure?"
          description="This action cannot be undone. This will permanently delete the link"
          alertFooter={<>
            <Button disabled={deleteLinkMutation.isPending} onClick={() => setDeleteId("")}>Cancel</Button>
            <Button disabled={deleteLinkMutation.isPending} onClick={() => deleteLinkMutation.mutate(deleteId)}>
              {
                deleteLinkMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "I'm sure, delete it!"
              }
            </Button>
          </>}
        />
        <Sheet open={editButtonColor.openModal || editTextColor.openModal} onOpenChange={() => {
          if (editButtonColor.openModal) {
            setEditButtonColor({ openModal: false, color: editButtonColor.color })
          } else {
            setEditTextColor({ openModal: false, color: editTextColor.color })
          }

        }} >
          <SheetContent className="flex justify-center items-center border-l-slate-800">
            <ColorPicker
              value={editButtonColor.openModal ? editButtonColor.color : editTextColor.openModal ? editTextColor.color : ""}
              hideColorTypeBtns={editTextColor.openModal || form.getValues("outlined")}
              hideEyeDrop={editTextColor.openModal}
              hideInputType={editTextColor.openModal}
              onChange={(color) => {
                if (editButtonColor.openModal) {
                  setEditButtonColor({ openModal: true, color: color })
                } else {
                  setEditTextColor({ openModal: true, color: color })
                }
              }} />
          </SheetContent>
        </Sheet>
        <Navbar />
        <div className="w-full md:w-[500px] px-4 py-24 flex flex-col gap-10">
          <div className="flex flex-col flex-1 items-center gap-4">

            <AvatarWithUpload avatar={tree?.photo || ""} fallback={fallbackInitial} treeId={tree_id} />

            <LabelWithEdit initialText={tree?.title} treeId={tree_id} />

          </div>
          <div className="flex justify-end gap-4">
            <Tooltip text="View as guest user">
              <Button size="icon" asChild className="rounded-full">
                <Link href={`/tree/${tree_id}`} target="_blank" rel="noreferrer">
                  <Link2Icon size={20} className="w-10 h-10 p-3" />
                </Link>
              </Button>
            </Tooltip>
            <BackgroundChange
              tree={tree}
              theme={tree?.theme || ""}
              handleBackgroundChange={handleBackgroundChange}
              editTreeMutation={editTreeMutation}
              setTree={setTree}
              treeId={tree_id}
            />
            <Dialog open={newLink || !!edit.id} onOpenChange={() => {
              if (edit.id) setEdit({} as Component)
              if (newLink) setNewLink(false)
            }}>
              <DialogTrigger className="">
                <Tooltip text="Add new link">
                  <Button asChild onClick={() => setNewLink(!newLink)} size="icon" className="rounded-full">
                    <Plus size={20} className="w-10 h-10 p-3" />
                  </Button>
                </Tooltip>
              </DialogTrigger>
              <DialogContent className="flex justify-center items-center w-full md:w-fit h-fit">
                <Card className="w-full md:w-[500px] border-0">
                  <CardHeader>
                    <CardTitle>Create new link</CardTitle>
                    <CardDescription>
                      Fill in the form below to create a new link
                    </CardDescription>
                  </CardHeader>
                  <CardContent >
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
                        edit.id ? (
                          editLinkMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "Save"
                        ) : (newLinkMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "Create")
                      }
                    </Button>
                  </CardFooter>
                </Card>
              </DialogContent>
            </Dialog>
          </div>

          <ul className="flex flex-col gap-6">
            {
              tree?.components?.length === 0 && (
                <li className="flex flex-col items-center gap-2 text-slate-950 dark:text-slate-50/50">
                  <Link2Off size={64} absoluteStrokeWidth className="animate-pulse" />
                  <span className="text-xl">You don't have any link in this tree yet 😢.</span>
                </li>
              )
            }
            {
              tree?.components?.map((component: Component) => {
                const linkHasMethod = component.url.startsWith("http")
                const link = linkHasMethod ? component.url : `//${component.url}`
                return (
                  (
                    <li key={component.id} className="bg-gray-500/10 pb-4 flex flex-col">
                      <header className="flex px-4 py-2 justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setDeleteId(component.id)}>Delete</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEdit(component)
                              setEditButtonColor({
                                openModal: false,
                                color: component.backgroundColor || undefined
                              })
                              setEditTextColor({ openModal: false, color: component.textColor || undefined })
                            }}>Edit</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </header>
                      <div className="px-4">
                        <Button
                          className="cursor-default"
                          style={{
                            ...(component.outlined && {
                              outlineWidth: "2px",
                              outlineColor: component.backgroundColor || undefined,
                              outlineStyle: "solid",
                            }),
                            background: !component.outlined ? component.backgroundColor || undefined : "transparent",
                            color: component.textColor || undefined,

                          }}
                          variant="tree_link"
                        >
                          {component.label}
                        </Button>
                      </div>
                    </li>
                  )
                )
              })
            }
          </ul>
        </div>
      </main>
    </AnimatedBackground>)
}