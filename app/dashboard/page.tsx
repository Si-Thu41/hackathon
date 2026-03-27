import { auth } from "@clerk/nextjs/server";
import AdminPanel from "./adminPanel/adminPanel";
import PharmacistPanel from "./pharmacistPanel/pharmacistPanel";

export default async function Navbar() {
  const { sessionClaims } = await auth()

  const role = sessionClaims?.metadata?.role

  return (
    <nav>
      {role === "admin" && <AdminPanel />}
      {role === "pharmacist" && <PharmacistPanel/>}
    </nav>
  )
}