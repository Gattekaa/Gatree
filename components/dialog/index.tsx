import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AlertProps {
  open: boolean,
  onOpenChange: () => void,
  title: string,
  description: string,
  alertFooter: JSX.Element
}
export default function Alert({ open, onOpenChange, title, description, alertFooter }: AlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {alertFooter}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}