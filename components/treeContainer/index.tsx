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

import { batchUpdateTreeLinks, handleAvailablePath, handleDeleteTreeLink, handleEditTree, handleNewTreeLink } from "@/requests/trees";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Component, Tree } from "@prisma/client";
import { Link2Icon, Link2Off, Loader2Icon, Save, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import Alert from "@/components/dialog";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import AnimatedBackground from "@/components/animatedBackground";
import Tooltip from "@/components/tooltip";
import AvatarWithUpload from "@/components/avatarWithUpload";
import LabelWithEdit from "@/components/labelWithEdit";
import BackgroundChange from "@/components/backgroundChange";
import { Reorder } from "framer-motion"
import TreeItem from "../TreeItem";
import { useDebounce } from "@/helpers/useDebounce";
import { useRouter } from "next/navigation";
import TreeComponentDialog from "../TreeComponentDialog";
import AddNewComponentButton from "../AddNewComponentButton";

export default function TreeContainer({ tree_id, tree: treeData }: {
  tree_id: string, tree: Tree & { components: Component[] }
}) {
  const { push } = useRouter()
  const [tree, setTree] = useState(treeData)
  const [deleteId, setDeleteId] = useState<string>("")
  const [newLink, setNewLink] = useState<boolean>(false)
  const [edit, setEdit] = useState({} as Component)
  const [components, setComponents] = useState<Component[]>(tree?.components || [])
  const [positionChanged, setPositionChanged] = useState<boolean>(false)
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
      title: edit.label || "My awesome link",
      url: edit.url || "",
      backgroundColor: edit.backgroundColor || "",
      outlined: edit.outlined || false,
    }
  })

  const updatePathSchema = z.object({
    path: z.string().min(1, "Path is required"),
    path_available: z.boolean().optional(),
  }).superRefine((data, ctx) => {
    if (!data.path_available) {
      ctx.addIssue({
        code: "custom",
        message: "Path is not available",
      });
    }
  });

  const updatePathForm = useForm({
    resolver: zodResolver(updatePathSchema),
    values: {
      path: tree.path,
      path_available: false
    }
  })

  const outlinedChanges = form.watch("outlined")

  const fallbackInitial = tree?.title?.[0]?.toUpperCase()

  const newLinkMutation = useMutation({
    mutationFn: () => handleNewTreeLink(treeData.id, form.getValues("title"), form.getValues("url"), editButtonColor.color, editTextColor.color, form.getValues("outlined")),
    onSuccess: (response: Component) => {
      setTree({
        ...tree,
        components: [
          ...tree.components,
          response
        ]
      })
      setComponents([
        ...components,
        response
      ])
      setNewLink(false)
      form.reset()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error)
      }
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
      setComponents(tree.components.filter((component) => component.id !== response.id))
    }
  })

  const editTreeMutation = useMutation({
    mutationFn: (action?: string) => handleEditTree({
      id: tree_id,
      backgroundColor: action === "remove" ? undefined : tree.backgroundColor || undefined, theme: tree.theme || undefined,
      path: updatePathForm.getValues("path") || undefined
    }),
    onSuccess: (response) => {

      if (response.path !== treeData.path) {
        push(`/edit/tree/${response.path}`)
      }

      setTree({
        ...tree,
        title: response.title,
        backgroundColor: response.backgroundColor
      })
    }
  })
  const batchUpdateLinksMutation = useMutation({
    mutationFn: () => batchUpdateTreeLinks(treeData.id, components),
    onSuccess: () => {
      setPositionChanged(false)
      toast.success("Links position updated successfully")
    },
    onError: () => {
      setComponents(treeData.components)
    }
  })

  const availablePathMutation = useMutation({
    mutationFn: async () => {
      if (updatePathForm.getValues("path") === tree.path) {
        return { available: true }
      }

      return await handleAvailablePath(updatePathForm.getValues().path ?? "")
    },
    onSuccess: (data) => {
      updatePathForm.clearErrors("path")

      if (!data.available) {
        updatePathForm.setValue("path_available", data.available)
        return updatePathForm.setError("path", {
          type: "manual",
          message: "Path is not available"
        })
      }

      updatePathForm.setValue("path_available", data.available)
    }
  })

  function handleBackgroundChange(action = "change") {
    editTreeMutation.mutate(action)
  }

  const hasPathChanged = useDebounce(updatePathForm.watch("path") ?? "", 500)

  useEffect(() => {
    if (hasPathChanged) {
      availablePathMutation.mutate()
    }
  }, [hasPathChanged])


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
      {
        (newLink || !!edit.id) && (
          <TreeComponentDialog
            onOpenChange={() => {
              if (edit.id) setEdit({} as Component)
              if (newLink) setNewLink(false)
            }}
            setTree={setTree}
            treeId={tree.id}
            setComponents={setComponents}
            component={edit}
          />
        )

      }
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
        <Navbar />
        <div className="w-full md:w-[500px] px-4 py-24 flex flex-col gap-10">
          <div className="flex flex-col flex-1 items-center gap-4">
            <AvatarWithUpload avatar={tree?.photo || ""} fallback={fallbackInitial} treeId={tree_id} />
            <LabelWithEdit
              initialText={tree?.title}
              treeId={tree_id}
              setTree={setTree}
            />
          </div>
          <div className="flex justify-end gap-4">
            <Dialog>
              <DialogTrigger>
                <Tooltip text="Change tree path">
                  <Button asChild size="icon" className="rounded-full">
                    <Unlink size={20} className="w-10 h-10 p-3" />
                  </Button>
                </Tooltip>
              </DialogTrigger>
              <DialogContent className="flex justify-center items-center w-full md:w-fit h-fit">
                <Card className="w-full md:w-[500px] border-0">
                  <CardHeader>
                    <CardTitle>Change tree path</CardTitle>
                    <CardDescription>
                      Fill in the form below to change the tree path
                    </CardDescription>
                  </CardHeader>
                  <CardContent >
                    <Form {...updatePathForm}>
                      <form onSubmit={updatePathForm.handleSubmit(() => editTreeMutation.mutate("update"))} id="new_tree_link">
                        <div className="grid w-full items-center gap-4">
                          <div className="flex flex-col space-y-1.5">
                            <FormField
                              control={updatePathForm.control}
                              name="path"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Path</FormLabel>
                                  <FormControl>
                                    <Input
                                      style={{
                                        ...((updatePathForm.watch().path_available || (updatePathForm.watch().path === treeData.path)) && { borderColor: "green" }),
                                        ...((!updatePathForm.watch().path_available && (updatePathForm.watch().path !== treeData.path)) && { borderColor: "red" }),
                                      }}
                                      {...field}
                                      value={field.value ?? ''}
                                      onChange={e => field.onChange(e.target.value?.replace(" ", "-")?.toLowerCase())}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This will be the new path of the tree: {process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/tree/{updatePathForm.watch().path}
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
                    <Button disabled={newLinkMutation.isPending} type="submit" form="new_tree_link">
                      Update
                    </Button>
                  </CardFooter>
                </Card>
              </DialogContent>
            </Dialog>
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
          </div>
          {
            positionChanged && (
              <div className="w-full flex justify-end">
                <Button
                  disabled={batchUpdateLinksMutation.isPending}
                  onClick={() => batchUpdateLinksMutation.mutate()}
                  className="rounded-full animate-pop gap-2"
                >
                  {
                    batchUpdateLinksMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : (
                      <>
                        <Save size={20} /> Save links position
                      </>
                    )
                  }


                </Button>
              </div>
            )
          }
          <AddNewComponentButton onClick={() => setNewLink(true)} />
          {
            components?.length === 0 && (
              <ul className="flex flex-col gap-6">
                <li className="flex flex-col items-center gap-2 text-slate-950 dark:text-slate-50/50">
                  <Link2Off size={64} absoluteStrokeWidth className="animate-pulse" />
                  <span className="text-xl">You don't have any link in this tree yet 😢.</span>
                </li>
              </ul>
            )
          }
          {
            components?.length > 0 && (
              <Reorder.Group
                as="ul"
                axis="y"
                values={components}
                onReorder={(newOrder: Component[]) => {
                  setPositionChanged(true),
                    setComponents(newOrder);
                }}
                className="flex flex-col gap-6"
              >
                {
                  components?.map((component: Component) => (
                    <TreeItem
                      key={component.id}
                      component={component}
                      setEdit={setEdit}
                      setEditTextColor={setEditTextColor}
                      setEditButtonColor={setEditButtonColor}
                      setDeleteId={setDeleteId}
                    />
                  ))}
              </Reorder.Group>
            )
          }
        </div>
      </main>
    </AnimatedBackground>
  )
}