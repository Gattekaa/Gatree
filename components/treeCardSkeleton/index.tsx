import { Skeleton } from "../ui/skeleton";

export default function TreeCardSkeleton() {
  return (
    <article
      className="w-full h-[350px] flex flex-col gap-4 relative p-6 items-center bg-black rounded-xl text-slate-400 border border-dashed border-white/20 opacity-60 duration-150"
    >
      <Skeleton className="w-20 h-20 rounded-full" />
      <Skeleton className="w-32 h-5" />
      <Skeleton className="w-10 h-3 absolute bottom-3" />
      <aside className="flex flex-col gap-2 absolute top-4 right-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="w-8 h-8 rounded-full" />
        ))}
      </aside>
    </article>
  )
}