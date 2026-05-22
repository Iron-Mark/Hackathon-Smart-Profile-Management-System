import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileWarning, FileCheck2, Ban, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <main className="overflow-x-hidden text-white bg-gradient-to-br from-green-900 via-black to-yellow-900">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Glowing Circles */}
        <div className="absolute w-80 h-80 bg-green-500 opacity-30 rounded-full filter blur-3xl top-10 left-10 animate-pulse" />
        <div className="absolute w-72 h-72 bg-yellow-400 opacity-20 rounded-full filter blur-2xl bottom-10 right-10 animate-pulse" />

        {/* Logo */}
        <img
          className="w-50 h-25 mb-6 drop-shadow-lg"
          alt="FPMS Logo"
          src="/fav-icon.png"
        />

        {/* Title */}
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          CCIS Smart Faculty Profile Management System
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Manage faculty data, streamline reports, and support academic
          compliance with AI-powered automation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <Link to="/auth/login">
            <Button size="lg" className="w-full sm:w-32 hover:cursor-pointer hover:shadow-[0_0_15px_#22c55e] transition duration-300 ease-in-out">
              Login
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-32 hover:cursor-pointer border-green-400 text-green-400 hover:bg-green-400/10 hover:shadow-[0_0_12px_#facc15] transition duration-300 ease-in-out"
            >
              Register
            </Button>
          </Link>
        </div>
      </section>

      {/* FEATURES COMPARISON SECTION */}
      <section className="py-24 px-6 md:px-16 bg-gradient-to-b from-black to-green-950 text-white">
        <h2 className="text-4xl font-bold text-center mb-12 drop-shadow-[0_0_10px_#22c55e] animate-fade-in">
          Manual Process vs CCIS Smart FPMS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Manual System */}
          <div className="bg-gradient-to-br from-gray-800 to-zinc-900 p-8 rounded-xl shadow-lg border border-gray-700 hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <Ban className="text-red-400" /> Traditional System
            </h3>
            <ul className="space-y-4 text-gray-300 text-sm">
              <li className="flex gap-2 items-start">
                <FileWarning className="text-red-300 mt-1" />
                Scattered spreadsheets, emails, and manual updates
              </li>
              <li className="flex gap-2 items-start">
                <Ban className="text-red-300 mt-1" />
                No centralized access to faculty data
              </li>
              <li className="flex gap-2 items-start">
                <Ban className="text-red-300 mt-1" />
                Time-consuming CHED report generation
              </li>
              <li className="flex gap-2 items-start">
                <Ban className="text-red-300 mt-1" />
                Faculty unaware of missing documents
              </li>
            </ul>
          </div>

          {/* Smart FPMS */}
          <div className="text-green-50  bg-gradient-to-br from-green-950 to-yellow-950 p-8 rounded-xl shadow-lg border border-yellow-800 hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-green-400">
              <Sparkles className="text-green-400" /> CCIS Smart FPMS
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex gap-2 items-start">
                <FileCheck2 className="text-green-400 mt-1" />
                All data in one platform — easily managed
              </li>
              <li className="flex gap-2 items-start">
                <Sparkles className="text-green-400 mt-1" />
                Smart document tracking & auto-reminders
              </li>
              <li className="flex gap-2 items-start">
                <Sparkles className="text-green-400 mt-1" />
                Generate audit-ready reports in seconds
              </li>
              <li className="flex gap-2 items-start">
                <Sparkles className="text-green-400 mt-1" />
                Faculty dashboard with real-time updates
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-black border-t border-white/10 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img src="/fav-icon.png" alt="Logo" className="w-10 opacity-50 grayscale" />
            <p className="max-w-md">The Smart Faculty Profile Management System is a project developed for academic excellence and compliance.</p>
          </div>
          <div className="flex justify-center gap-6 mb-6">
             <Link to="/auth/login" className="hover:text-green-400 transition-colors">Faculty Portal</Link>
             <Link to="/admin/dashboard" className="hover:text-green-400 transition-colors">Admin Access</Link>
             <a href="#" className="hover:text-green-400 transition-colors">Support</a>
          </div>
          <p>&copy; 2026 Team 2nd Choice (San Jose, Siazon, Togle). Developed for the 7th UMak CCIS 2-Day Hackathon.</p>
        </div>
      </footer>
    </main>
  );
}
