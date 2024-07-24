'use client'

import useScrollIntoView from "@/hooks/useScrollIntoView";
import { PropsWithChildren } from "react";

interface ScrollIntoContainerProps extends PropsWithChildren<{ element: HTMLElement | string }>{}

export default function ScrollIntoContainer({ element, children }: ScrollIntoContainerProps) {
  const scrollTo = useScrollIntoView(element);

  return (
    <div
      className="cursor-pointer"
      onClick={scrollTo}
    >
      {children}
    </div>
  )
}