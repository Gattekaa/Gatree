import { handleTreeDeletePhoto, handleTreeUploadPhoto } from "@/requests/trees";
import { useMutation } from "@tanstack/react-query";
import { Loader2Icon, Save, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Tooltip from "../tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface AvatarWithUploadProps {
  avatar: string;
  fallback: string;
  treeId: string;
}

export default function AvatarWithUpload({
  avatar,
  fallback,
  treeId
}: AvatarWithUploadProps) {
  const [photo, setPhoto] = useState<string>(avatar)
  const [file, setFile] = useState<File | null>(null)
  const uploadImageMutation = useMutation({
    mutationFn: async () => await handleTreeUploadPhoto(treeId, file),
    onSuccess: () => {
      toast.success("Photo uploaded successfully")
      setFile(null)
    },
    onError: (error) => {
      toast.error("An error occurred while uploading the photo, please try again later.")
      setFile(null)
      console.error(error)
    }
  })

  const deleteImageMutation = useMutation({
    mutationFn: async () => await handleTreeDeletePhoto(treeId),
    onSuccess: () => {
      toast.success("Photo removed successfully")
      setPhoto("")
    },
    onError: (error) => {
      toast.error("An error occurred while removing the photo, please try again later.")
      console.error(error)
    }
  })


  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    const file = files?.[0]
    if (files && files.length > 1) {
      toast.info("You can't upload more than one photo")
    }

    if (!file) return

    if (file.size > 1024 * 1024 * 4.5) {
      toast.error("File size should be less than 4.5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("File type should be an image")
      return
    }

    setFile(file)

    setPhoto(URL.createObjectURL(file))
  }

  return (
    <div className="flex items-center gap-8 relative">
      <Tooltip text="Change tree photo">
        <div className="relative group">
          <label className="opacity-0 group-hover:opacity-100 absolute w-full h-full z-50 rounded-full duration-150">
            <UploadCloud size={24} className="w-10 h-10 p-3 rounded-full bg-slate-800/50 hover:bg-slate-800/70 text-slate-50" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
          <Avatar className="w-[100px] h-[100px]">
            <AvatarImage src={photo} className="object-cover" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </div>
      </Tooltip>
      {
        file && (
          <Tooltip text="Save photo">
            <Button
              disabled={uploadImageMutation.isPending}
              onClick={() => uploadImageMutation.mutate()}
              size="icon"
              className="absolute -right-20 rounded-full"
            >
              {
                uploadImageMutation.isPending ? (
                  <Loader2Icon size={24} className="w-10 h-10 p-3 rounded-full animate-spin bg-slate-800/50 hover:bg-slate-800/70" />
                ) : (
                  <Save size={20} />
                )
              }
            </Button>
          </Tooltip>
        )
      }
      {
        photo && !file && (
          <AlertDialog>
            <Tooltip text="Remove photo">
              <AlertDialogTrigger asChild>
                <Button
                  disabled={deleteImageMutation.isPending}
                  size="icon"
                  variant="destructive"
                  className="absolute -right-20 rounded-full"
                >
                  {
                    deleteImageMutation.isPending ? (
                      <Loader2Icon size={24} className="animate-spin" />
                    ) : (
                      <Trash2 size={20} />
                    )
                  }
                </Button>
              </AlertDialogTrigger>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove photo?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The photo will be permanently removed from your tree.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteImageMutation.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )
      }
    </div>
  )
}