import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { MetricStrip } from '@/components/layout/MetricStrip'
import { Notice } from '@/components/layout/Notice'
import { Section } from '@/components/layout/Section'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import DropZone from '@/components/drop-zone'
import { toast } from 'sonner'
import determineDocumentTypeAndUpload from '@/tools/determineDocumentTypeAndUpload'
import getFromDatabase from '@/tools/database/getFromDatabase'
import { useUserId } from '@/hooks/use-userId'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { Bell, CalendarClock, CheckCircle2, Download, FileCheck2, FileStack, Sparkles } from 'lucide-react'

interface FacultyDashboardProps {
  children?: ReactNode
}

export default function FacultyDashboard ({ children }: FacultyDashboardProps) {
  useDocumentTitle('Faculty Dashboard')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadResults, setUploadResults] = useState<
    { fileName: string; progress: number; documentType?: string; status: 'processing' | 'uploaded' | 'failed' }[]
  >([])
  const [name, setName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [completion, setCompletion] = useState<number>(0)
  const [notificationsCount, setNotificationsCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const samplePath = (fileName: string) => `${import.meta.env.BASE_URL}demo-samples/${fileName}`

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
  }

  useEffect(() => {
    async function init () {
      const { userId } = await useUserId()
      if (userId) {
        setUserId(userId)
        fetchDashboardData(userId)
      }
    }
    init()
  }, [])

  const fetchDashboardData = async (uid: string) => {
    try {
      setIsLoading(true)
      const [account, pendingSubs, prof, edu, work, dev, allSubs] = await Promise.all([
        getFromDatabase({ table: 'account_details', getAll: true, match: { id: uid } }),
        getFromDatabase({ table: 'submissions', getAll: true, match: { user_id: uid, status: 'Pending' } }),
        getFromDatabase({ table: 'profile_details', getAll: true, match: { id: uid } }),
        getFromDatabase({ table: 'educational_background', getAll: true, match: { user_id: uid } }),
        getFromDatabase({ table: 'work_experiences', getAll: true, match: { user_id: uid } }),
        getFromDatabase({ table: 'professional_development', getAll: true, match: { user_id: uid } }),
        getFromDatabase({ table: 'submissions', getAll: true, match: { user_id: uid } })
      ])

      setName(account[0]?.name || '')
      setPendingCount(pendingSubs.length)

      let score = 0
      if (account[0]?.name) score += 20
      if (prof[0]?.description) score += 20
      if (edu.length > 0) score += 20
      if (work.length > 0) score += 20
      if (dev.length > 0) score += 20
      setCompletion(score)

      const reviewedSubs = allSubs.filter((sub: { status: string }) => sub.status === 'Approved' || sub.status === 'Returned')
      setNotificationsCount(reviewedSubs.length)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error('Please upload at least one file to submit.')
      return
    }

    const results = uploadedFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      documentType: undefined,
      status: 'processing' as const
    }))
    setUploadResults(results)
    setIsSubmitting(true)

    let successfulUploads = 0

    try {
      for (const [index, file] of uploadedFiles.entries()) {
        const result = await determineDocumentTypeAndUpload(file, userId)

        if (!result) {
          setUploadResults(prev =>
            prev.map((item, i) =>
              i === index
                ? {
                    ...item,
                    progress: 100,
                    status: 'failed'
                  }
                : item
            )
          )
          toast.error(`Failed to upload: ${file.name}`)
          continue
        }

        successfulUploads += 1

        setUploadResults(prev =>
          prev.map((item, i) =>
            i === index
              ? {
                  ...item,
                  progress: 100,
                  documentType: result.documentType,
                  status: 'uploaded'
                }
              : item
          )
        )
      }

      if (successfulUploads > 0) {
        toast.success(
          successfulUploads === uploadedFiles.length
            ? 'Files uploaded successfully!'
            : `${successfulUploads} file(s) uploaded. Review failed files before retrying.`
        )
        setUploadedFiles([])
        fetchDashboardData(userId)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const metricValue = (value: ReactNode) =>
    isLoading ? <Skeleton className="h-8 w-12" /> : value

  return (
    <PageShell>
      {children ?? (
        <>
          <PageHeader
            kicker="Faculty workspace"
            title={isLoading ? <Skeleton className="h-9 w-64" /> : `Welcome, ${name}`}
            description="Track your records, sample uploads, and profile readiness in one browser-local demo workspace."
            actions={
              <>
                <Button asChild variant="outline" size="sm">
                  <a href={samplePath('sample-certificate.svg')}>
                    <Download className="h-4 w-4" />
                    Certificate
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={samplePath('sample-transcript.svg')}>
                    <Download className="h-4 w-4" />
                    Transcript
                  </a>
                </Button>
              </>
            }
          />

          <MetricStrip
            items={[
              { label: 'Profile Completion', value: metricValue(`${completion}%`), hint: 'Profile sections with data', icon: CheckCircle2, tone: 'success' },
              { label: 'Pending Approvals', value: metricValue(pendingCount), hint: 'Credentials awaiting admin review', icon: FileStack, tone: 'warning' },
              { label: 'Notifications', value: metricValue(notificationsCount), hint: 'Reviewed credential updates', icon: Bell, tone: 'info' },
              { label: 'Upcoming Deadlines', value: metricValue('3'), hint: 'Demo compliance reminders', icon: CalendarClock, tone: 'destructive' },
            ]}
          />

          <Section
            title="Smart upload"
            description="Upload generated sample credentials and let the demo classify and queue them for review."
          >
            <Notice tone="warning">
              Use sample files only. Public demo uploads stay in this browser and are meant for showcase testing.
            </Notice>

            <DropZone
              setData={handleFileUpload}
              handleSubmit={() => handleSubmit()}
              isSubmitting={isSubmitting}
              h="h-52"
            />

            {uploadResults.length > 0 && (
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {uploadResults.map((result, index) => (
                  <li key={`${result.fileName}-${index}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                    <FileCheck2 className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{result.fileName}</p>
                      <Progress value={result.progress} className="mt-2 h-1.5" />
                    </div>
                    <div className="shrink-0 text-sm">
                      {result.status === 'uploaded' && result.documentType ? (
                        <span className="inline-flex items-center gap-1.5 text-success">
                          <Sparkles className="h-3.5 w-3.5" />
                          Type: {result.documentType}
                        </span>
                      ) : result.status === 'failed' ? (
                        <span className="text-destructive">Upload failed. Check the file and try again.</span>
                      ) : (
                        <span className="animate-pulse text-muted-foreground">Processing...</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </>
      )}
    </PageShell>
  )
}
