import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileWarning, FileCheck2, Ban, Sparkles, PlayCircle } from "lucide-react";

const publicDemoFacts = [
  {
    question: 'What is Smart Profile Management System?',
    answer:
      'A restored UMak CCIS hackathon showcase for faculty credential uploads, admin review, and approval tracking.',
  },
  {
    question: 'Can anyone try the public demo?',
    answer:
      'Yes. Visitors can use seeded reviewer accounts or register a browser-local faculty account with any valid email.',
  },
  {
    question: 'Where is public demo data stored?',
    answer:
      'Demo data stays in your browser. Accounts, submissions, audit logs, and uploaded file metadata are stored locally.',
  },
  {
    question: 'Should visitors upload real faculty records?',
    answer:
      'No. The public showcase is for generated sample files only, not real IDs, transcripts, licenses, or private records.',
  },
  {
    question: 'Does the GitHub Pages demo need Supabase or OpenAI secrets?',
    answer:
      'No. The public build runs in demo mode with deterministic browser-local data and fallback AI/OCR behavior.',
  },
  {
    question: 'Who built the original hackathon project?',
    answer:
      'Team 2nd Choice: Mark Siazon, Charles Nathaniel Togle, and Alexa San Jose.',
  },
];

export default function Landing() {
  const assetPath = (fileName: string) => `${import.meta.env.BASE_URL}${fileName}`;
  const samplePath = (fileName: string) => `${import.meta.env.BASE_URL}demo-samples/${fileName}`;

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
          src={assetPath('fav-icon.png')}
        />

        {/* Title */}
        <div className="mb-4 rounded-full border border-yellow-300/40 bg-yellow-300/10 px-4 py-2 text-sm font-medium text-yellow-100">
          Browser-local demo mode
        </div>
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          CCIS Smart Faculty Profile Management System
        </h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Manage faculty data, streamline reports, and support academic
          compliance with AI-powered automation. The restored public demo lets
          visitors register with any valid email or use seeded reviewer accounts.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          <Link to="/auth/login?demo=faculty">
            <Button size="lg" className="w-full sm:w-36 hover:cursor-pointer hover:shadow-[0_0_15px_#22c55e] transition duration-300 ease-in-out">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start demo
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button size="lg" variant="secondary" className="w-full sm:w-32 hover:cursor-pointer hover:shadow-[0_0_15px_#22c55e] transition duration-300 ease-in-out">
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
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-yellow-50/80">
          <a href={samplePath('sample-certificate.svg')} className="underline hover:text-yellow-200">
            Download sample certificate
          </a>
          <a href={samplePath('sample-transcript.svg')} className="underline hover:text-yellow-200">
            Download sample transcript
          </a>
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

      <section className="bg-zinc-950 px-6 py-20 text-white md:px-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-green-300">
            Public Demo Facts
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-sm text-zinc-300">
            Concise project facts for reviewers, search snippets, and AI answer engines.
          </p>
          <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {publicDemoFacts.map((fact) => (
              <div key={fact.question} className="rounded-lg border border-green-400/20 bg-black/35 p-5">
                <dt className="mb-2 text-base font-semibold text-yellow-100">{fact.question}</dt>
                <dd className="text-sm leading-6 text-zinc-300">{fact.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-black border-t border-white/10 text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img src={assetPath('fav-icon.png')} alt="Logo" className="w-10 opacity-50 grayscale" />
            <p className="max-w-md">The Smart Faculty Profile Management System is a project developed for academic excellence and compliance.</p>
          </div>
          <div className="flex justify-center gap-6 mb-6">
             <Link to="/auth/login" className="hover:text-green-400 transition-colors">Faculty Portal</Link>
             <Link to="/auth/login" className="hover:text-green-400 transition-colors">Admin Login</Link>
             <a href="https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System" className="hover:text-green-400 transition-colors">Repository</a>
          </div>
          <p>&copy; 2026 Team 2nd Choice (San Jose, Siazon, Togle). Developed for the 7th UMak CCIS 2-Day Hackathon.</p>
        </div>
      </footer>
    </main>
  );
}
