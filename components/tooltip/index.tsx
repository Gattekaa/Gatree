import {
  Tooltip as TooltipUIComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TooltipProps {
  children: React.ReactNode
  text: string,
  delay?: number
}

export default function Tooltip({ children, text, delay }: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delay}>
      <TooltipUIComponent>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {text}
        </TooltipContent>
      </TooltipUIComponent>
    </TooltipProvider>

  )
}