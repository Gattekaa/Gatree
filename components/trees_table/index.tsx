"use client"

// Form Imports
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

//Table Imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Tree } from "@prisma/client"

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

import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getTreeQRCode, getUserTrees, handleDeleteTree, handleNewTree, handleTreeStatusToggle } from "@/requests/trees"
import { useRouter } from "next/navigation"
import { CloudOff, Download, Loader2Icon, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import Alert from "../dialog"
import { useUserContext } from "@/context/UserContext"
import Link from "next/link"
import { Skeleton } from "../ui/skeleton"
import Image from "next/image"
import Tooltip from "../tooltip"

export default function TreesTable() {
  const { user } = useUserContext()
  const queryClient = useQueryClient()
  const [QrCodeTree, setQrCodeTree] = useState<Tree>({} as Tree)
  const [deleteId, setDeleteId] = useState<string>("")
  const { push } = useRouter()

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    status: z.string().min(1, "Status is required"),
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "My awesome tree",
      status: "active",
    }
  })

  const { data: trees, error: errorOnGetUserTrees, isPending: isUserTreesLoading } = useQuery({
    queryKey: ["user_trees"],
    queryFn: getUserTrees,
    enabled: !!user,
  });

  const newTreeMutation = useMutation({
    mutationFn: async () => await handleNewTree(form.getValues().name, form.getValues().status),
    onSuccess: (data) => {
      push(`/edit/tree/${data.id}`)
    }
  })

  const deleteTreeMutation = useMutation({
    mutationFn: async () => await handleDeleteTree(deleteId),
    onSuccess: (response) => {
      queryClient.setQueryData(["user_trees"], (data: Tree[]) => {
        return data.filter((tree) => tree.id !== response.id)
      })
      setDeleteId("")
    }
  })

  const toggleTreeStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => await handleTreeStatusToggle(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(["user_trees"], (trees: Tree[]) => {
        return trees.map((tree) => {
          if (tree.id === data.id) {
            return data
          }
          return tree
        })
      })
    }
  })

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    newTreeMutation.mutate()
  }

  function QrCode() {

    const { data: qrCode, error: qrCodeError, isPending: isQrCodeLoading } = useQuery({
      queryKey: ["qrcode", QrCodeTree],
      queryFn: () => getTreeQRCode(QrCodeTree.id),
      enabled: !!QrCodeTree,
    })

    function handleDownload() {
      const downloadLink = document.createElement('a');
      downloadLink.href = qrCode;
      downloadLink.download = 'qrcode.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    return (
      <Dialog open={!!QrCodeTree.id} onOpenChange={() => setQrCodeTree({} as Tree)}>
        <DialogContent className="flex justify-center items-center w-fit h-fit">
          <Card className="w-[350px] border-0">
            {
              !isQrCodeLoading && !qrCodeError && (
                <CardHeader>
                  <CardTitle>QRCode</CardTitle>
                  <CardDescription>
                    Use the following QRCode to share your tree
                  </CardDescription>
                </CardHeader>
              )
            }
            <CardContent className="flex items-center justify-center">
              {
                isQrCodeLoading && <Loader2Icon size={40} className="animate-spin" />
              }
              {
                !isQrCodeLoading && qrCode && (
                  <Tooltip delay={100} text="Click to download QRCode image">
                    <div className="relative group">
                      <Button
                        className="absolute top-0 left-0 w-full h-full hover:backdrop-blur-sm !bg-transparent !rounded-none hover:!bg-slate-950/50 opacity-0 hover:opacity-100 duration-150"
                        onClick={handleDownload}
                        variant="ghost"
                      >
                        <Download size={64} className="animate-bounce" />
                      </Button>
                      <Image
                        src={qrCode}
                        width={400}
                        height={400}
                        alt="QRCode"
                      />
                    </div>
                  </Tooltip>
                )
              }
              {
                !isQrCodeLoading && qrCodeError && (
                  <div className="flex flex-col justify-center items-center text-center gap-4 mt-4">
                    <CloudOff size={64} className="text-slate-400" />
                    <p className="text-slate-400">An error occurred while fetching the QRCode. Please try again later.</p>
                  </div>
                )
              }
            </CardContent>

          </Card>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <Alert
        open={!!deleteId}
        onOpenChange={() => setDeleteId("")}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete the tree and all of its components."
        alertFooter={<>
          <Button disabled={deleteTreeMutation.isPending} onClick={() => setDeleteId("")}>Cancel</Button>
          <Button disabled={deleteTreeMutation.isPending} onClick={() => deleteTreeMutation.mutate()}>
            {
              deleteTreeMutation.isPending ? <Loader2Icon size={20} className="animate-spin" /> : "I'm sure, delete it!"
            }
          </Button>
        </>}
      />
      <div className="flex justify-between py-4">
        <h1 className="text-2xl font-bold text-center">Your Trees</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Tree</Button>
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
                  <form id="new_tree_form" onSubmit={onSubmit}>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tree Name</FormLabel>
                              <FormControl>
                                <Input placeholder="" {...field} />
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
                <Button type="submit" form="new_tree_form">Next</Button>
              </CardFooter>
            </Card>
          </DialogContent>
        </Dialog>
        <QrCode />
      </div>
      <div className="flex-1 rounded-md border border-slate-700">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 bg-slate-950">
              <TableHead className="text-center">Title</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Created</TableHead>
              <TableHead className="text-center">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="h-full">
            {
              isUserTreesLoading && (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="text-center border-slate-700">
                    <TableCell>
                      <div className="flex justify-center items-center">
                        <Skeleton className="w-40 h-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center">
                        <Skeleton className="w-[78px] h-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Skeleton className="w-[78px] h-4" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-4 items-center justify-center">
                        <Skeleton className="w-[78px] h-4" />
                        <Skeleton className="w-6 h-6 flex-shrink-0" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )
            }
            {
              !isUserTreesLoading && errorOnGetUserTrees && (
                <TableRow className="text-center border-slate-700">
                  <TableCell colSpan={4}>
                    <p className="text-slate-400 py-10">An error occurred while fetching your trees. Please try again later.</p>
                  </TableCell>
                </TableRow>
              )
            }
            {
              !isUserTreesLoading && trees?.map((tree: Tree) => (
                <TableRow key={tree.id} className="text-center">
                  <TableCell>{tree.title}</TableCell>
                  <TableCell className="capitalize">{tree.status}</TableCell>
                  <TableCell>
                    {new Date(tree.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-grow-0 justify-center items-center gap-4">
                      {new Date(tree.updatedAt).toLocaleDateString()}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Link className="w-full h-full" href={`/tree/${tree.id}`}>View</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link className="w-full h-full" href={`/edit/tree/${tree.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteId(tree.id)}>Delete</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQrCodeTree(tree)}>
                            QRCode
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleTreeStatusMutation.mutate({ id: tree.id, status: tree.status })}
                          >
                            {tree.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </div >
  )
}