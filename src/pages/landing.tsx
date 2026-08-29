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
import { MetricStrip } from '@/components/layout/MetricStrip'
import { ThemeToggle } from '@/components/ThemeToggle'

const publicDemoFacts = [
  {
    question: 'What is Smart Profile Management System?',
    answer:
      'A restored 7th CCIS Hackathon showcase for faculty credential uploads, admin review, and approval tracking.',
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
    question: 'Who maintains the restored public demo?',
    answer:
      'Mark Siazon is the sole maintainer of the restored public demo and repository.',
  },
  {
    question: 'Who built the original 7th CCIS Hackathon project?',
    answer:
      'The past initial hackathon team was Team 2nd Choice: Mark Siazon, Charles Nathaniel Togle, and Alexa San Jose.',
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
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <section className="relative flex min-h-[86dvh] items-center bg-hero px-5 py-16 text-hero-foreground sm:px-8 lg:px-12">
        <div className="relative mx-auto grid w-full max-w-7xl gap-10">
          <nav aria-label="Public demo navigation" className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="inline-flex min-h-11 items-center gap-3 rounded-md text-sm font-semibold text-hero-foreground">
              <img className="h-10 w-10 rounded-md bg-hero-foreground/95 object-contain p-1" alt="FPMS logo" src={assetPath('fav-icon.png')} />
              <span>Smart Profile</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle className="text-hero-foreground hover:bg-hero-foreground/15 hover:text-hero-foreground" />
              <Button asChild variant="secondary" size="sm">
                <Link to="/auth/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-hero-foreground text-hero hover:bg-hero-foreground/90">
                <Link to="/auth/login?demo=faculty">Demo</Link>
              </Button>
            </div>
          </nav>

          <div className="max-w-4xl pt-10">
            <Badge className="mb-5 border-hero-foreground/30 bg-hero-foreground/15 text-hero-foreground">
              Browser-local demo mode
            </Badge>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              CCIS Smart Faculty Profile Management System
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-hero-foreground/85 sm:text-lg">
              A restored 7th CCIS Hackathon demo for faculty credential intake,
              admin review, and profile proofing. Reviewers can use seeded accounts
              and generated sample files without private backend or OpenAI credentials.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-11 bg-hero-foreground text-hero hover:bg-hero-foreground/90">
                <Link to="/auth/login?demo=faculty">
                  <Sparkles className="h-4 w-4" />
                  Start demo
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="min-h-11">
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11 border-hero-foreground/40 bg-hero-foreground/10 text-hero-foreground hover:bg-hero-foreground/20 hover:text-hero-foreground">
                <Link to="/auth/register">Register</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-hero-foreground/85">
              <a href={samplePath('sample-certificate.svg')} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-hero-foreground/30 bg-hero-foreground/10 px-3 hover:bg-hero-foreground/20">
                <Download className="h-4 w-4" />
                Download sample certificate
              </a>
              <a href={samplePath('sample-transcript.svg')} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-hero-foreground/30 bg-hero-foreground/10 px-3 hover:bg-hero-foreground/20">
                <Download className="h-4 w-4" />
                Download sample transcript
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <MetricStrip
            items={reviewerStats.map((stat) => ({
              label: stat.label,
              value: stat.value,
              icon: stat.icon,
            }))}
          />
        </div>
      </section>

      <section className="bg-background px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <Badge variant="outline" className="mb-3">Demo workflow</Badge>
            <h2 className="text-3xl font-bold tracking-normal">A complete reviewer path, not a static mockup</h2>
            <p className="mt-3 text-muted-foreground">
              The public build uses seeded browser-local data so reviewers can test the
              upload, approval, preview, and profile-building flow end to end.
            </p>
          </div>
          <ol className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <li key={step.title} className="flex gap-4 px-5 py-5 sm:gap-6">
                  <span className="w-10 shrink-0 text-2xl font-semibold tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="bg-muted/40 px-5 py-16 sm:px-8 lg:px-12">
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
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-background">
            {sampleDocuments.map((document) => (
              <li key={document.fileName} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
                <img
                  src={samplePath(document.fileName)}
                  alt={`${document.title} sample preview`}
                  className="h-16 w-24 shrink-0 rounded-md object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{document.title}</p>
                  <p className="text-sm text-muted-foreground">{document.description}</p>
                </div>
                <a className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:text-primary/80" href={samplePath(document.fileName)}>
                  Open sample
                  <ArrowRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-background px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <Badge className="mb-3 border-info/30 bg-info/15 text-info">AEO and GEO sources</Badge>
            <h2 className="text-3xl font-bold tracking-normal">Public Demo Facts</h2>
            <p className="mt-3 text-muted-foreground">
              Concise project facts for reviewers, search snippets, and AI answer engines.
              For canonical Q&A, use the public answer files linked below.
            </p>
          </div>
          <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {publicDemoFacts.map((fact) => (
              <div key={fact.question} className="px-5 py-4">
                <dt className="text-base font-semibold">{fact.question}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted-foreground">{fact.answer}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary">
              <a href={assetPath('answers.md')}>
                <Bot className="h-4 w-4" />
                Answer-engine facts
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={assetPath('llms.txt')}>llms.txt</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background px-5 py-10 text-sm text-muted-foreground sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={assetPath('fav-icon.png')} alt="Smart Profile logo" className="h-10 w-10 rounded-md object-contain" />
            <div>
              <p className="font-semibold text-foreground">Smart Profile Management System</p>
              <p>Maintained by Mark Siazon. Original 7th CCIS Hackathon entry by Team 2nd Choice.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/auth/login" className="inline-flex min-h-11 items-center hover:text-foreground">Faculty Portal</Link>
            <Link to="/auth/login" className="inline-flex min-h-11 items-center hover:text-foreground">Admin Login</Link>
            <a href="https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System" className="inline-flex min-h-11 items-center gap-2 hover:text-foreground">
              <Github className="h-4 w-4" />
              Repository
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
