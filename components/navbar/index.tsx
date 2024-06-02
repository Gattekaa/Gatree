"use client"
import Image from "next/image";
import Link from "next/link";
import gatteka_logo from "@/assets/svg/gatteka_logo.svg";

import { useUserContext } from "@/context/UserContext";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import Tooltip from "../tooltip";

export default function Navbar() {
  const { handleLogout } = useUserContext()
  return (
    <nav className="bg-[#121212] w-full h-20 min-h-20 px-8 border-b-[1px] border-slate-700 flex items-center justify-between">
      <span className="flex gap-12 items-center">
        <Link href="/">
          <Image
            src={gatteka_logo}
            priority
            alt="Logo"
            width={54}
            height={54}
          />
        </Link>
        <Link href="/dashboard">
          Home
        </Link>
      </span>
      <Tooltip
        text="Logout"
        side="left"
      >
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => handleLogout()}
        >
          <LogOut size={14} />
        </Button>
      </Tooltip>
    </nav >
  );
}