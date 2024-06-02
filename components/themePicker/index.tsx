import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Component, Tree } from "@prisma/client"
import { Label } from "../ui/label"
import { cn } from "@/lib/utils"
import { AnimatedBackgrounds } from "../animatedBackground"

export default function ThemePicker({
  initialTheme,
  treeId,
  setTree,
}: {
  initialTheme: string,
  treeId: string,
  setTree: React.Dispatch<React.SetStateAction<Tree & { components: Component[] }>>,
}) {

  function handleChange(theme: string) {
    setTree((prev) => ({ ...prev, theme: theme, backgroundColor: null }))
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <Label className="w-full text-base">
        Backgrounds
      </Label>
      <div className="w-[230px]" >
        <Carousel orientation="horizontal" >
          <CarouselContent>
            {
              AnimatedBackgrounds.map((background, index) => (
                <CarouselItem key={index} className="!w-[180px] max-w-[180px] h-[140px]">
                  <button
                    type="button"
                    onClick={() => handleChange(background.slug)}
                    className="w-fit flex flex-col items-center gap-4"
                  >
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className={cn(
                        "w-[180px] h-[100px] object-cover rounded-md border-[2px]",
                        initialTheme === background.slug ? "border-slate-400" : "border-slate-400/30"
                      )}
                    >
                      <source src={`/backgrounds/${background.slug}.mp4`} type="video/mp4" />
                    </video>
                    <Label>{background.name}</Label>
                  </button>
                </CarouselItem>
              ))
            }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  )
}