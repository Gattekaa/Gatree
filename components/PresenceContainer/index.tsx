import { BarChartIcon, EyeIcon, LayoutGridIcon, LinkIcon, LucideIcon, PaletteIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import TreeExample from "@/assets/png/treeExample.png";
interface PresenceItemProps {
  title: string
  description: string
  Icon: LucideIcon
}

function PresenceItem({ title, description, Icon }: PresenceItemProps) {
  return (
    <div className="rounded-lg bg-neutral-950 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{title}</div>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default function PresenceContainer() {
  return (
    <section
      id="presence"
      className="w-full py-12 md:py-24 lg:py-32 bg-neutral-800"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Customization</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Tailor Your Online Presence</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Gatree gives you the tools to easily customize your links, colors, and layouts. Express your brand,
              drive traffic, and grow your audience.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <PresenceItem
                title="Link Customization"
                description="Easily customize your links with your own branding and styling."
                Icon={LinkIcon}
              />
              <PresenceItem
                title="Color Themes"
                description="Choose from a variety of pre-designed color themes or create your own."
                Icon={PaletteIcon}
              />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <PresenceItem
                  title="Layout Options"
                  description="Select from multiple layout options to showcase your links in a visually appealing way."
                  Icon={LayoutGridIcon}
                />
                <PresenceItem
                  title="Analytics"
                  description="Track your link performance and audience engagement with built-in analytics."
                  Icon={BarChartIcon}
                />
              </div>
              <Link
                href="/dashboard"
                className="hidden lg:inline-flex  w-full h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                prefetch={false}
              >
                Start for Free
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <Image
              src={TreeExample}
              width="550"
              height="310"
              unoptimized
              alt="Customization"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
            />
            <div className="grid gap-4">
              <PresenceItem
                title="Showcase Examples"
                description="See how other users have customized their Gatree pages for inspiration."
                Icon={EyeIcon}
              />
            </div>
            <Link
              href="/dashboard"
              className="inline-flex w-full lg:hidden h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              prefetch={false}
            >
              Start for Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}