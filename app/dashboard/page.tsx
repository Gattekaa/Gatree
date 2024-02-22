"use client"

import Navbar from "@/components/navbar";
import TreesTable from "@/components/trees_table";
import { useUserContext } from "@/context/UserContext";


export default function Dashboard() {
  const { user } = useUserContext()
  return user && (
    <main className="flex flex-col items-center">
      <Navbar />
      <div className="w-full px-4 md:w-2/3 mt-24">
        <TreesTable />
      </div>
    </main>
  )
}