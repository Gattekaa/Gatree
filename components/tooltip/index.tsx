import {
  Tooltip as TooltipUIComponent,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TooltipProps {
  children: React.ReactNode
  text: string | React.ReactNode,
  delay?: number,
  side?: "top" | "right" | "bottom" | "left" | undefined,
  asChild?: boolean
}

export default function Tooltip({ children, text, delay = 150, side, asChild = true }: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delay}>
      <TooltipUIComponent>
        <TooltipTrigger asChild={asChild}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side}>
          {text}
        </TooltipContent>
      </TooltipUIComponent>
    </TooltipProvider>

  )
}