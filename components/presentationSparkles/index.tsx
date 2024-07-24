import { ChevronDown } from "lucide-react";
import { MovingBorderContainer } from "../ui/moving-border";
import { SparklesCore } from "../animatedBackground/backgrounds/sparkles";
import { TextGenerateEffect } from "../ui/text-generate";
import ScrollIntoContainer from "../ScrollIntoContainer";

export default function PresentationSparkles() {
  return (
    <div className="w-full h-[100dvh] p-12 pt-[100px] min-h-[400px] bg-black flex flex-col items-center justify-center gap-24 overflow-hidden rounded-md ">
      <span>
        <div className="w-full absolute inset-0 h-screen">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <span className="space-y-2">
          <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-white relative z-20">
            Welcome to Gatree
          </h1>
          <TextGenerateEffect
            words="a platform to create and share trees of links."
            className="md:text-2xl text-lg lg:text-xl font-semibold text-center text-white relative z-20"
          />
        </span>
      </span>
      <ScrollIntoContainer element="#introduction">
        <MovingBorderContainer
          containerClassName="h-10"
          borderClassName="bg-[radial-gradient(var(--sky-100)_40%,transparent_60%)]"
          borderRadius="1.75rem"
          className="bg-transparent hover:bg-gray-800/50 duration-150 text-black font-medium dark:text-white border-neutral-200 dark:border-slate-800"
        >
          See more
          <ChevronDown className="w-4 h-4 ml-2" />
        </MovingBorderContainer>
      </ScrollIntoContainer>
      <div
        className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-black to-transparent pointer-events-none"
      />
    </div>
  )
}