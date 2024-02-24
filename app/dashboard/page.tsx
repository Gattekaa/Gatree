"use client"

import AnimatedBackground from "@/components/animatedBackground";
import Navbar from "@/components/navbar";
import TreesTable from "@/components/trees_table";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { parseCookies } from "nookies";
import { useEffect } from "react";


export default function Dashboard() {
  const { token } = parseCookies()
  const { push } = useRouter()
  const { user } = useUserContext()

  useEffect(() => {
    if (!token || !user) {
      push("/auth/login")
    }
  }, [])
  return user && (
    <AnimatedBackground>
      <main className="w-full h-full flex flex-col items-center">
        <Navbar />
        <div className="w-full h-full px-4 md:w-2/3 mt-24 mb-12">
          <TreesTable />
        </div>
      </main>
    </AnimatedBackground>
  )
}