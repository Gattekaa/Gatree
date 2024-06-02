"use client"

import AnimatedBackground from "@/components/animatedBackground";
import Navbar from "@/components/navbar";
import TreesContainer from "@/components/treesContainer";
import { useUserContext } from "@/context/UserContext";

export default function Dashboard() {
  const { user } = useUserContext()

  return user && (
    <AnimatedBackground variant="dots">
      <main className="w-full h-fit min-h-full flex flex-col items-center">
        <Navbar />
        <div className="w-full h-full px-4 md:w-2/3 mt-24 mb-12">
          <TreesContainer />
        </div>
      </main>
    </AnimatedBackground>
  )
}