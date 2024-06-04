"use client"
import { getCurrentUser } from "@/requests/auth";
import type { User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { type AxiosError, isAxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { destroyCookie, parseCookies } from "nookies";
import type React from "react";
import { useContext, useEffect, useState } from "react";
import { createContext } from 'react';
import { toast } from "sonner";

type UserContextType = {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
  handleLogout: () => void;
  isLoadingUser: boolean;
  hasToken: boolean;
};

export const UserContext = createContext<UserContextType>({} as UserContextType)

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const { push } = useRouter()
  const pathname = usePathname()

  const publicRoutes = ["", "tree", "/auth/", "/auth/", "not-found"]
  const [user, setUser] = useState<User>()
  const { token } = parseCookies();
  const hasToken = !!token

  const { data: current_user, error: get_current_user_error, isPending: isLoadingUser, } = useQuery({
    queryKey: ["current_user"],
    queryFn: () => getCurrentUser(),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours 
    enabled: hasToken,
    retry: false,

  })

  useEffect(() => {
    if (!token && !publicRoutes.includes(pathname?.split("/")[1] as string)) {
      push("/auth/login")
    }
  }, [])

  useEffect(() => {
    if (current_user) {
      setUser(current_user)
    }
  }, [current_user])

  useEffect(() => {
    if (get_current_user_error) {
      if (isAxiosError(get_current_user_error)) {
        const error = get_current_user_error as AxiosError
        if ((error.response?.data as { error: string })?.error === "Expired token") {
          destroyCookie(null, "token")
          push("/auth/login")
        }
      }
    }
  }, [get_current_user_error])

  function handleLogout(): void {
    setUser(undefined)
    destroyCookie(null, "token")
    push("/auth/login")
    toast("You have been logged out! 😢", {
      description: "Goodbye!",
    })
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        handleLogout,
        isLoadingUser,
        hasToken
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
}