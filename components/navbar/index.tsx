"use client"
import Image from "next/image";
import Link from "next/link";
import gatteka_logo from "@/assets/svg/gatteka_logo.svg";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Dropdown Imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserContext } from "@/context/UserContext";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const { user, handleLogout } = useUserContext()
  const usernameInitial = user?.username?.[0]?.toUpperCase()
  return (
    <nav className="bg-[#121212] w-full h-20 min-h-20 px-8 border-b-[1px] border-slate-700 flex items-center justify-between">
      <Link href="/">
        <Image
          src={gatteka_logo}
          priority
          alt="Logo"
          width={54}
          height={54}
        />
      </Link>
      {
        !user ? (
          <Link href="/auth/login">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{usernameInitial}</AvatarFallback>
            </Avatar></Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{usernameInitial}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/*               <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} >
                {theme === "dark" ? "Light" : "Dark"} Mode
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleLogout()}>Log-out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    </nav >
  );
}