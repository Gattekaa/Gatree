import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Dialog, DialogContent } from "../ui/dialog";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { isAValidYoutubeVideo } from "@/helpers/isAValidYoutubeVideo";
import type { TreeWithComponents } from "@/interfaces/tree";
import { handleEditTreeLink, handleNewTreeLink } from "@/requests/trees";
import type { Component } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import ColorPicker from "react-best-gradient-color-picker";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sheet, SheetContent } from "../ui/sheet";
import { Switch } from "../ui/switch";
import { YoutubeVideo } from "../youtubeVideo";

interface TreeComponentDialogProps {
  component?: Component;
  onOpenChange: () => void;
  treeId: string;
  setTree: React.Dispatch<React.SetStateAction<TreeWithComponents>>;
  setComponents: React.Dispatch<React.SetStateAction<Component[]>>;
}

export default function TreeComponentDialog({
  component,
  onOpenChange,
  treeId,
  setTree,
  setComponents,
}: TreeComponentDialogProps) {
  const [editButtonColor, setEditButtonColor] = useState<{
    openModal: boolean;
    color: string | undefined;
  }>({
    openModal: false,
    color: component?.backgroundColor ?? "",
  });

  const [editTextColor, setEditTextColor] = useState<{
    openModal: boolean;
    color: string | undefined;
  }>({
    openModal: false,
    color: component?.textColor ?? "",
  });

  const formSchema = z.object({
    title: z.string().refine((val) => {
      const selectedType = form.getValues("type");
      if (selectedType === "youtube-video") {
        return true;
      }
      return val.length > 0;
    }),
    url: z
      .string()
      .min(1, "URL is required")
      .refine(
        (val): boolean => {
          const selectedType = form.getValues("type");
          if (selectedType === "youtube-video") {
            const url = form.getValues("url");

            return isAValidYoutubeVideo(url);
          }

          return true;
        },
        {
          message: "URL must be a valid URL for a Youtube video",
        },
      ),
    outlined: z.boolean().optional(),
    type: z
      .enum(["component", "youtube-video"])
      .default("component")
      .optional(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    values: {
      title: component?.label || "My awesome link",
      url: component?.url || "",
      backgroundColor: component?.backgroundColor || "",
      outlined: component?.outlined || false,
      type: component?.type || "component",
    },
    reValidateMode: "onChange",
  });

  const newLinkMutation = useMutation({
    mutationFn: () =>
      handleNewTreeLink(
        treeId,
        form.getValues("title"),
        form.getValues("url"),
        editButtonColor.color,
        editTextColor.color,
        form.getValues("outlined"),
        form.getValues("type"),
      ),
    onSuccess: (response: Component) => {
      setTree((prev) => ({
        ...prev,
        components: [...prev.components],
      }));
      setComponents((prev) => [...prev, response]);
      onOpenChange();
      form.reset();
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error);
      }
    },
  });

  const editLinkMutation = useMutation({
    mutationFn: () =>
      handleEditTreeLink(
        component?.id,
        form.getValues("title"),
        form.getValues("url"),
        editButtonColor.color,
        editTextColor.color,
        form.getValues("outlined"),
        form.getValues("type"),
      ),
    onSuccess: (response) => {
      setTree((prev) => ({
        ...prev,
        components: prev.components.map((component) => {
          if (component.id === response.id) {
            return response;
          }
          return component;
        }),
      }));
      setComponents((prev) =>
        prev.map((component) => {
          if (component.id === response.id) {
            return response;
          }
          return component;
        }),
      );
      onOpenChange();
      form.reset();
    },
  });

  function onSubmit() {
    if (component?.id) {
      editLinkMutation.mutate();
      return;
    }
    newLinkMutation.mutate();
  }

  return (
    <>
      <Sheet
        open={editButtonColor.openModal || editTextColor.openModal}
        onOpenChange={() => {
          if (editButtonColor.openModal) {
            setEditButtonColor({
              openModal: false,
              color: editButtonColor.color,
            });
          } else {
            setEditTextColor({ openModal: false, color: editTextColor.color });
          }
        }}
      >
        <SheetContent className="flex justify-center items-center border-l-slate-800">
          <ColorPicker
            value={
              editButtonColor.openModal
                ? editButtonColor.color
                : editTextColor.openModal
                  ? editTextColor.color
                  : ""
            }
            hideColorTypeBtns={
              editTextColor.openModal || form.getValues("outlined")
            }
            hideEyeDrop={editTextColor.openModal}
            hideInputType={editTextColor.openModal}
            onChange={(color) => {
              if (editButtonColor.openModal) {
                setEditButtonColor({ openModal: true, color: color });
              } else {
                setEditTextColor({ openModal: true, color: color });
              }
            }}
          />
        </SheetContent>
      </Sheet>
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent className="flex justify-center items-center w-full md:w-fit h-fit">
          <Card className="w-full md:w-[500px] border-0">
            <CardHeader>
              <CardTitle>
                {component?.id ? "Edit link" : "Create new link"}
              </CardTitle>
              <CardDescription>
                Fill in the form below to create a new link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(() => onSubmit())}
                  id="new_tree_link"
                >
                  <div className="grid w-full items-center gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link Type</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="component">
                                    Link
                                  </SelectItem>
                                  <SelectItem value="youtube-video">
                                    Youtube Video
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              Select with type of link you want to show on your
                              tree
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              {form.watch("type") === "youtube-video" ? (
                                isAValidYoutubeVideo(form.watch("url")) ? (
                                  <YoutubeVideo url={form.watch("url")} />
                                ) : (
                                  <div className="w-full aspect-video bg-slate-500/10 rounded-md flex items-center justify-center">
                                    <span className="text-sm text-slate-500">
                                      No video selected
                                    </span>
                                  </div>
                                )
                              ) : (
                                <Button asChild variant="tree_link">
                                  <Input
                                    style={{
                                      background: form.getValues("outlined")
                                        ? "transparent"
                                        : editButtonColor.color,
                                      color: editTextColor.color,
                                      outlineWidth: form.getValues("outlined")
                                        ? "2px"
                                        : "0",
                                      outlineColor: editButtonColor.color,
                                      outlineStyle: form.getValues("outlined")
                                        ? "solid"
                                        : "none",
                                    }}
                                  className="h-[50px] border-0 !ring-0 !ring-transparent text-center"
                                    placeholder=""
                                    {...field}
                                  />
                                </Button>
                              )}
                            </FormControl>
                            <FormMessage className="pt-2" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
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
                      {form.watch("type") === "component" && (
                        <>
                          <div className="py-4">
                            <FormField
                              control={form.control}
                              name="outlined"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Styles</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        id="outlined-button"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                      <Label htmlFor="outlined-button">
                                        Outlined
                                      </Label>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4!">
                            <Button
                              className="w-full "
                              type="button"
                              onClick={() =>
                                setEditButtonColor({
                                  ...editButtonColor,
                                  openModal: true,
                                })
                              }
                            >
                              Change button color
                            </Button>
                            <Button
                              className="w-full"
                              type="button"
                              onClick={() =>
                                setEditTextColor({
                                  ...editTextColor,
                                  openModal: true,
                                })
                              }
                            >
                              Change text color
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                disabled={newLinkMutation.isPending}
                type="submit"
                className="w-full"
                form="new_tree_link"
              >
                {component?.id ? (
                  editLinkMutation.isPending ? (
                    <Loader2Icon size={20} className="animate-spin" />
                  ) : (
                    "Save"
                  )
                ) : newLinkMutation.isPending ? (
                  <Loader2Icon size={20} className="animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
