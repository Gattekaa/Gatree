"use client";

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
} from "@/components/ui/form";

// Dialog Imports
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Card Imports
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AnimatedBackground from "@/components/animatedBackground";
import AvatarWithUpload from "@/components/avatarWithUpload";
import BackgroundChange from "@/components/backgroundChange";
import Alert from "@/components/dialog";
import LabelWithEdit from "@/components/labelWithEdit";
import Tooltip from "@/components/tooltip";
import { Input } from "@/components/ui/input";
import type { Component, Tree } from "@prisma/client";
import { Reorder } from "framer-motion";
import { Link2Icon, Link2Off, Loader2Icon, Save, Unlink } from "lucide-react";
import Link from "next/link";
import AddNewComponentButton from "../AddNewComponentButton";
import TreeComponentDialog from "../TreeComponentDialog";
import TreeItem from "../TreeItem";
import { useTreeContainer } from "./useTreeContainer";

type Props = {
  tree_id: string;
  tree: Tree & { components: Component[] };
};

export type DisabledInfoProps = {
  id: string;
  disabled: boolean;
}

enum DisableInfoDescription {
  ENABLE = "On enabling this link, it will be visible to everyone.",
  DISABLE = "On disabling this link, it will not be visible to anyone. You can enable it again at any time.",
}

export default function TreeContainer({
  tree_id,
  tree: treeData,
}: Readonly<Props>) {

  const {
    tree,
    setTree,
    components,
    setComponents,
    handleReorder,
    handleBackgroundChange,
    editTreeMutation,
    newLinkMutation,
    batchUpdateLinksMutation,
    deleteLinkMutation,
    setNewLink,
    fallbackInitial,
    setDisabledInfo,
    disabledInfo,
    deleteId,
    positionChanged,
    newLink,
    edit,
    setEdit,
    setEditTextColor,
    setEditButtonColor,
    setDeleteId,
    updatePathForm,
    toggleLinkDisabledMutation,
  } = useTreeContainer({
    treeData,
    tree_id,
  });


  return (
    <AnimatedBackground variant={tree?.theme ?? undefined}>
      {(newLink || !!edit.id) && (
        <TreeComponentDialog
          onOpenChange={() => {
            if (edit.id) setEdit({} as Component);
            if (newLink) setNewLink(false);
          }}
          setTree={setTree}
          treeId={tree.id}
          setComponents={setComponents}
          component={edit}
        />
      )}
      <main
        style={{ background: tree.backgroundColor ?? undefined }}
        className="w-full min-h-full flex flex-col items-center duration-150"
      >
        <Alert
          open={!!disabledInfo?.id}
          onOpenChange={() => setDisabledInfo(undefined)}
          title="Are you sure?"
          description={
            disabledInfo?.disabled
              ? DisableInfoDescription.DISABLE
              : DisableInfoDescription.ENABLE
          }
          alertFooter={
            <>
              <Button
                disabled={deleteLinkMutation.isPending}
                onClick={() => setDisabledInfo(undefined)}
              >
                Cancel
              </Button>
              <Button
                disabled={deleteLinkMutation.isPending}
                onClick={() => {
                  setDisabledInfo(undefined)
                  if (!disabledInfo) return;

                  toggleLinkDisabledMutation.mutate(disabledInfo);
                }}
              >
                {deleteLinkMutation.isPending ? (
                  <Loader2Icon size={20} className="animate-spin" />
                ) : (
                  disabledInfo?.disabled ? "Yes, disable it!" : "I'm sure, enable it!"
                )}
              </Button>
            </>
          }
        />
        <Alert
          open={!!deleteId}
          onOpenChange={() => setDeleteId("")}
          title="Are you absolutely sure?"
          description="This action cannot   be undone. This will permanently delete the link"
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
            <AvatarWithUpload
              avatar={tree?.photo ?? ""}
              fallback={fallbackInitial}
              treeId={tree_id}
            />
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
                  <CardContent>
                    <Form {...updatePathForm}>
                      <form
                        onSubmit={updatePathForm.handleSubmit(() =>
                          editTreeMutation.mutate("update"),
                        )}
                        id="new_tree_link"
                      >
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
                                        ...((updatePathForm.watch()
                                          .path_available ??
                                          updatePathForm.watch().path ===
                                            treeData.path) && {
                                          borderColor: "green",
                                        }),
                                        ...(!updatePathForm.watch()
                                          .path_available &&
                                          updatePathForm.watch().path !==
                                            treeData.path && {
                                            borderColor: "red",
                                          }),
                                      }}
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value
                                            ?.replace(" ", "-")
                                            ?.toLowerCase(),
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This will be the new path of the tree:{" "}
                                    {process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}
                                    /tree/{updatePathForm.watch().path}
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
                    <Button
                      disabled={newLinkMutation.isPending}
                      type="submit"
                      form="new_tree_link"
                    >
                      Update
                    </Button>
                  </CardFooter>
                </Card>
              </DialogContent>
            </Dialog>
            <Tooltip text="View as guest user">
              <Button size="icon" asChild className="rounded-full">
                <Link
                  href={`/tree/${tree_id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Link2Icon size={20} className="w-10 h-10 p-3" />
                </Link>
              </Button>
            </Tooltip>
            <BackgroundChange
              tree={tree}
              theme={tree?.theme ?? ""}
              handleBackgroundChange={handleBackgroundChange}
              editTreeMutation={editTreeMutation}
              setTree={setTree}
              treeId={tree_id}
            />
          </div>
          {positionChanged && (
            <div className="w-full flex justify-end">
              <Button
                disabled={batchUpdateLinksMutation.isPending}
                onClick={() => batchUpdateLinksMutation.mutate()}
                className="rounded-full animate-pop gap-2"
              >
                {batchUpdateLinksMutation.isPending ? (
                  <Loader2Icon size={20} className="animate-spin" />
                ) : (
                  <>
                    <Save size={20} /> Save links position
                  </>
                )}
              </Button>
            </div>
          )}
          <AddNewComponentButton onClick={() => setNewLink(true)} />
          {components?.length === 0 && (
            <ul className="flex flex-col gap-6">
              <li className="flex flex-col items-center gap-2 text-slate-950 dark:text-slate-50/50">
                <Link2Off
                  size={64}
                  absoluteStrokeWidth
                  className="animate-pulse"
                />
                <span className="text-xl">
                  You don't have any link in this tree yet 😢.
                </span>
              </li>
            </ul>
          )}
          {components?.length > 0 && (
            <Reorder.Group
              as="ul"
              axis="y"
              values={components}
              onReorder={handleReorder}
              className="flex flex-col gap-6"
            >
              {components?.map((component: Component) => (
                <TreeItem
                  key={component.id}
                  component={component}
                  setEdit={setEdit}
                  setEditTextColor={setEditTextColor}
                  setEditButtonColor={setEditButtonColor}
                  setDeleteId={setDeleteId}
                  setDisabledInfo={setDisabledInfo}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </main>
    </AnimatedBackground>
  );
}
