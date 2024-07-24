import Image from "next/image";
import Link from "next/link";
import ScrollIntoContainer from "../ScrollIntoContainer";
import Showcase from "@/assets/png/showcase.png";
export default function IntroductionContainer() {
  return (
    <section
      id="introduction"
      className="w-full py-12 md:py-24 lg:py-32 xl:py-48"
    >
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Customize Your Online Presence
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Gatree is a platform to create and share trees of links.You can create a tree of links for your social media, your portfolio, your company, your project, or anything you want.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Start for Free
              </Link>
              <ScrollIntoContainer element="#presence">
                <div
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Learn More
                </div>
              </ScrollIntoContainer>
            </div>
          </div>
          <Image
            src={Showcase}
            width="550"
            height="550"
            unoptimized
            alt="Hero"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
          />
        </div>
      </div>
    </section>
  )
}