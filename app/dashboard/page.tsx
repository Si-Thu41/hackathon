import { auth } from "@clerk/nextjs/server";
import AdminPanel from "./adminPanel/adminPanel";
import PharmacistPanel from "./pharmacistPanel/pharmacistPanel";
import Link from "next/link";

export default async function DashboardPage({searchParams}:{searchParams:Promise<{userrole:string}>})
 {
  const { sessionClaims } = await auth();
  const params=await searchParams;
  const userRole=params.userrole;
  console.log(userRole)

  // Grab the role from Clerk metadata
  const role = sessionClaims?.metadata?.role;
  const isAdmin = role === "admin" && userRole === "admin";
  const isPharmacist = role === "pharmacist" && userRole === "pharmacist";
  const isMismatch =(role === "admin" && userRole === "pharmacist") ||(role === "pharmacist" && userRole === "admin");
  return (
    <main>
  {isAdmin && <AdminPanel />}
    {isPharmacist && <PharmacistPanel />}

    {isMismatch && (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-300 text-red-800 p-8 rounded-lg max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="mb-4">
            Your Clerk role is <strong>{role}</strong> but the query role is <strong>{userRole}</strong>.
          </p>
          <p>
            Please log in with the correct account or contact the administrator for role update.
          </p>
        </div>
      </div>
    )}

      {/* FALLBACK: If they log in but have no role assigned yet */}
      {!role && (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-md text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Account Not Verified</h2>
            <p className="text-slate-500 mb-6">
              Your account has been created, but you have not been assigned a Pharmacist or Admin role yet. Please contact the system administrator.
            </p>
            <Link href="/" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
              Return Home
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}