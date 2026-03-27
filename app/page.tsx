import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"

export default async function Page() {
  const user=await currentUser();
  return (
   <div className="text-center">
    <h1 className="text-8xl font-cursive">MAHOR</h1>
    <p className="mb-5">Your pharmacy</p>
    {user?    <Link href="/dashboard" className="bg-green-400 py-2 rounded-lg px-4 ">Dashboard</Link>: <div></div>}
   </div>
  )
}