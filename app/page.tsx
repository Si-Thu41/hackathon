import Link from "next/link"
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server"

export default async function Page() {
  const user=await currentUser();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* --- UNIPHARMA BRAND GLOW EFFECTS --- */}
      {/* Top Left Blue Glow */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>

    {/* Bottom Right Red Glow */}
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-red-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <div className="relative z-10 w-full max-w-5xl px-6 py-12 flex flex-col items-center">
        
       {/* --- BRANDING HERO SECTION --- */}
        <div className="text-center mb-16 animate-fade-in-up">
          
          {/* REAL LOGO IMAGE COMPONENT */}
          <div className="mx-auto mb-6 flex justify-center items-center h-32">
            <Image 
              src="/pharmacy_photo/pharmacy_logo.jpg" 
              alt="Unipharma Logo" 
              width={150} 
              height={150} 
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-800 tracking-tighter mb-2">
            Unipharma
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-emerald-600 mb-4">
            ယူနီ ဆေးဆိုင်
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">
            "A Pharma To Your Home"
          </p>
        </div>

        {/* --- PORTAL SELECTION CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          
          {/* 1. Pharmacist Portal Card (Blue Theme) */}
          <Link href="/dashboard?userrole=pharmacist" className="group relative bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Pharmacist Portal</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Process prescriptions, manage branch queues, and handle medication dispensing.
              </p>
              
              <div className="inline-flex items-center justify-center gap-2 text-blue-600 font-bold group-hover:text-blue-700 bg-blue-50 px-6 py-3 rounded-full">
                {user ? "Enter Workspace" : "Secure Login"} 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </Link>

          {/* 2. Administrator Portal Card (Red Theme) */}
          <Link href="/dashboard?userrole=admin" className="group relative bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:border-red-400 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Admin Dashboard</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Oversee branch inventory, track revenue analytics, and manage staff access.
              </p>
              
              <div className="inline-flex items-center justify-center gap-2 text-red-500 font-bold group-hover:text-red-600 bg-red-50 px-6 py-3 rounded-full">
                {user ? "View Analytics" : "Secure Login"} 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </Link>

        </div>
        
        {/* Footer info */}
        <div className="mt-16 text-slate-400 text-sm font-medium flex flex-col items-center gap-1">
          <span>Unipharma Core System v1.0</span>
          <span>Pratunam • Ramkhamhaeng • Chiang Mai</span>
        </div>

      </div>
    </div>
  );
}