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

export default function Tooltip({ children, text, delay = 150 }: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delay}>
      <TooltipUIComponent>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          {text}
        </TooltipContent>
      </TooltipUIComponent>
    </TooltipProvider>

  )
}