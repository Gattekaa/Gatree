"use client"

import Image from "next/image";
import Link from "next/link";
import gatteka_logo from "@/assets/svg/gatteka_logo.svg";
import useScroll from "@/hooks/useScroll";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Loader2, LogIn } from "lucide-react";
import { useUserContext } from "@/context/UserContext";
import { useCallback, useEffect, useState } from "react";

export default function LandingNavbar() {
  const { user, isLoadingUser, hasToken } = useUserContext()
  const scrollValue = useScroll();
  const [hydrated, setHydrated] = useState(false);
  const isScrolled = scrollValue > 40;
  const isLogged = !!user?.id;

  useEffect(() => {
    setHydrated(true);
  }, [])

  const RenderAuthLink = useCallback(() => {
    if (!hydrated) return <Loader2 className="animate-spin" />;

    if (isLoadingUser && hasToken) return <Loader2 className="animate-spin" />

    if (isLogged) {
      return (
        <Link href="/dashboard" className="flex gap-2 items-center">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
      )
    }

    return (
      <Link href="/auth/login" className="flex gap-2 items-center">
        <LogIn size={18} />
        Login
      </Link>
    )
  }, [hydrated, isLoadingUser, hasToken, isLogged])

  return (
    <nav className={cn(
      "w-full h-20 min-h-20 px-8 md:px-12 fixed left-0 top-0 z-50 border-b-[1px] border-transparent flex items-center justify-between duration-150",
      isScrolled && "bg-[#121212]/20 backdrop-blur-md  border-slate-700"
    )}>
      <Link href="/">
        <Image
          src={gatteka_logo}
          priority
          alt="Logo"
          width={54}
          height={54}
        />
      </Link>
      <RenderAuthLink />
    </nav >
  )
}