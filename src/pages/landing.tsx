import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Database,
  Download,
  FileCheck2,
  Github,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  UsersRound
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

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
    question: 'Does the GitHub Pages demo need backend or OpenAI secrets?',
    answer:
      'No. The public build runs in demo mode with deterministic browser-local data and fallback AI/OCR behavior.',
  },
  {
    question: 'Who built the original hackathon project?',
    answer:
      'Team 2nd Choice: Mark Siazon, Charles Nathaniel Togle, and Alexa San Jose.',
  },
]

const workflowSteps = [
  {
    title: 'Faculty upload',
    description: 'Use generated sample credentials to test validation, OCR fallback, and classification.',
    icon: FileCheck2,
  },
  {
    title: 'Admin review',
    description: 'Open previews, approve or return documents, and keep an audit trail in demo storage.',
    icon: ShieldCheck,
  },
  {
    title: 'Profile proof',
    description: 'Turn approved records into a faculty profile and biography draft for showcase review.',
    icon: GraduationCap,
  },
]

const sampleDocuments = [
  {
    title: 'Certificate',
    fileName: 'sample-certificate.svg',
    description: 'Generated training certificate for the upload and approval flow.',
  },
  {
    title: 'Transcript',
    fileName: 'sample-transcript.svg',
    description: 'Generated academic transcript for document classification testing.',
  },
  {
    title: 'Diploma',
    fileName: 'sample-diploma.svg',
    description: 'Generated diploma seed record used by the admin review queue.',
  },
  {
    title: 'Faculty CV',
    fileName: 'sample-cv.svg',
    description: 'Generated CV summary for profile-building demo data.',
  },
  {
    title: 'Research Summary',
    fileName: 'sample-research-summary.svg',
    description: 'Generated publication summary for credential reporting.',
  },
]

const reviewerStats = [
  { label: 'Seeded roles', value: '2', icon: UsersRound },
  { label: 'Sample credential types', value: '5', icon: FileCheck2 },
  { label: 'Private services required', value: '0', icon: Database },
]

export default function Landing() {
  const assetPath = (fileName: string) => `${import.meta.env.BASE_URL}${fileName}`
  const samplePath = (fileName: string) => `${import.meta.env.BASE_URL}demo-samples/${fileName}`

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <section
        className="relative flex min-h-[86dvh] items-center bg-slate-950 px-5 py-16 text-white sm:px-8 lg:px-12"
        style={{
          backgroundImage: `url("${samplePath('sample-diploma.svg')}")`,
          backgroundPosition: 'right center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-slate-950/90" aria-hidden="true" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10">
          <nav aria-label="Public demo navigation" className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="inline-flex min-h-11 items-center gap-3 rounded-md text-sm font-semibold text-white">
              <img className="h-10 w-10 rounded-md bg-white/95 object-contain p-1" alt="FPMS logo" src={assetPath('fav-icon.png')} />
              <span>Smart Profile</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
                <Link to="/auth/login?demo=faculty">Demo</Link>
              </Button>
            </div>
          </nav>

          <div className="max-w-4xl pt-10">
            <Badge className="mb-5 border-emerald-300/40 bg-emerald-300/15 text-emerald-100">
              Browser-local demo mode
            </Badge>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              CCIS Smart Faculty Profile Management System
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              A restored UMak CCIS hackathon demo for faculty credential intake,
              admin review, and profile proofing. Reviewers can use seeded accounts
              and generated sample files without private backend or OpenAI credentials.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-11 bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
                <Link to="/auth/login?demo=faculty">
                  <Sparkles className="h-4 w-4" />
                  Start demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="min-h-11">
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to="/auth/register">Register</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-200">
              <a href={samplePath('sample-certificate.svg')} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 hover:bg-white/20">
                <Download className="h-4 w-4" />
                Download sample certificate
              </a>
              <a href={samplePath('sample-transcript.svg')} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 hover:bg-white/20">
                <Download className="h-4 w-4" />
                Download sample transcript
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-3">
          {reviewerStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="rounded-lg">
                <CardContent className="flex items-center gap-4 py-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-slate-50 px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <Badge variant="outline" className="mb-3 bg-white">Demo workflow</Badge>
            <h2 className="text-3xl font-bold tracking-normal">A complete reviewer path, not a static mockup</h2>
            <p className="mt-3 text-muted-foreground">
              The public build uses seeded browser-local data so reviewers can test the
              upload, approval, preview, and profile-building flow end to end.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {workflowSteps.map((step) => {
              const Icon = step.icon
              return (
                <Card key={step.title} className="rounded-lg">
                  <CardHeader>
                    <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-3">Generated sample assets</Badge>
              <h2 className="text-3xl font-bold tracking-normal">Sample files reviewers can safely use</h2>
              <p className="mt-3 text-muted-foreground">
                These generated credentials are intentionally fictional. They keep the
                demo safe while still exercising the upload and approval workflow.
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={samplePath('sample-certificate.svg')}>
                <Download className="h-4 w-4" />
                Download certificate
              </a>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {sampleDocuments.map((document) => (
              <Card key={document.fileName} className="overflow-hidden rounded-lg">
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={samplePath(document.fileName)}
                    alt={`${document.title} sample preview`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardHeader className="gap-2">
                  <CardTitle className="text-base">{document.title}</CardTitle>
                  <CardDescription>{document.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900" href={samplePath(document.fileName)}>
                    Open sample
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-5 py-16 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <Badge className="mb-3 border-sky-300/40 bg-sky-300/15 text-sky-100">AEO and GEO sources</Badge>
            <h2 className="text-3xl font-bold tracking-normal">Public Demo Facts</h2>
            <p className="mt-3 text-slate-300">
              Concise project facts for reviewers, search snippets, and AI answer engines.
              For canonical Q&A, use the public answer files linked below.
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {publicDemoFacts.map((fact) => (
              <Card key={fact.question} className="rounded-lg border-white/10 bg-white/[0.04] text-white">
                <CardHeader>
                  <dt className="text-base font-semibold">{fact.question}</dt>
                </CardHeader>
                <CardContent>
                  <dd className="text-sm leading-6 text-slate-300">{fact.answer}</dd>
                </CardContent>
              </Card>
            ))}
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary">
              <a href={assetPath('answers.md')}>
                <Bot className="h-4 w-4" />
                Answer-engine facts
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
              <a href={assetPath('llms.txt')}>llms.txt</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-white px-5 py-10 text-sm text-slate-600 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={assetPath('fav-icon.png')} alt="Smart Profile logo" className="h-10 w-10 rounded-md object-contain" />
            <div>
              <p className="font-semibold text-slate-950">Smart Profile Management System</p>
              <p>Team 2nd Choice for the UMak CCIS Hackathon.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/auth/login" className="inline-flex min-h-11 items-center hover:text-slate-950">Faculty Portal</Link>
            <Link to="/auth/login" className="inline-flex min-h-11 items-center hover:text-slate-950">Admin Login</Link>
            <a href="https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System" className="inline-flex min-h-11 items-center gap-2 hover:text-slate-950">
              <Github className="h-4 w-4" />
              Repository
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
