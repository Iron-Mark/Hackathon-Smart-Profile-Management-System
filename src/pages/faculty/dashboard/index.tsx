import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from "@/components/ui/skeleton"
import DropZone from '@/components/drop-zone'
import { Toaster, toast } from 'sonner'
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

      // Calculate completion (arbitrary weights)
      let score = 0
      if (account[0]?.name) score += 20
      if (prof[0]?.description) score += 20
      if (edu.length > 0) score += 20
      if (work.length > 0) score += 20
      if (dev.length > 0) score += 20
      setCompletion(score)

      // Calculate notifications
      const reviewedSubs = allSubs.filter((sub: any) => sub.status === 'Approved' || sub.status === 'Returned');
      setNotificationsCount(reviewedSubs.length);

      if (reviewedSubs.length > 0) {
        // Reviewed submissions found
      }
      
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
        fetchDashboardData(userId) // Refresh pending count
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SidebarProvider>
      <div className='flex w-screen'>
        <AppSidebar />

        <div className='flex-1 flex flex-col overflow-auto'>
          <div className='md:hidden p-4'>
            <SidebarTrigger />
          </div>

          <main className='flex-1 w-full p-6 bg-muted/40 text-foreground'>
            <Toaster position='top-right' />
            {children ?? (
              <>
                <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Faculty workspace</p>
                    <h1 className='text-3xl font-extrabold tracking-tight text-foreground'>
                      {isLoading ? <Skeleton className="h-9 w-64" /> : `Welcome, ${name}`}
                    </h1>
                    <div className='mt-2 max-w-2xl text-sm text-muted-foreground'>
                      {isLoading ? <Skeleton className="h-4 w-80" /> : 'Track your records, sample uploads, and profile readiness in one browser-local demo workspace.'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
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
                  </div>
                </div>
                <Separator className='mb-6' />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 relative'>
                  <div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      {[
                        { label: 'Profile Completion', val: `${completion}%`, color: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2, description: 'Profile sections with data' },
                        { label: 'Pending Approvals', val: pendingCount, color: 'text-amber-700 dark:text-amber-300', icon: FileStack, description: 'Credentials awaiting admin review' },
                        { label: 'Notifications', val: notificationsCount, color: 'text-sky-700 dark:text-sky-300', icon: Bell, description: 'Reviewed credential updates' },
                        { label: 'Upcoming Deadlines', val: '3', color: 'text-red-700 dark:text-red-300', icon: CalendarClock, description: 'Demo compliance reminders' }
                      ].map((item, i) => {
                        const Icon = item.icon
                        return (
                        <Card key={i} className='rounded-lg shadow-sm transition-shadow hover:shadow-md'>
                          <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-sm text-muted-foreground'>
                              <Icon className="h-4 w-4" />
                              {item.label}
                            </CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className={`text-2xl font-bold ${item.color}`}>
                              {isLoading ? <Skeleton className="h-8 w-12" /> : item.val}
                            </div>
                          </CardContent>
                        </Card>
                      )})}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">
                          <Sparkles className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="font-semibold">Smart upload</h2>
                          <p className='mt-1 text-sm text-muted-foreground'>
                            Upload generated sample credentials and let the demo classify and queue them for review.
                          </p>
                        </div>
                      </div>
                      <p className='mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200'>
                        Use sample files only. Public demo uploads stay in this browser and are meant for showcase testing.
                      </p>
                    </div>

                    <DropZone
                      setData={handleFileUpload}
                      handleSubmit={() => handleSubmit()}
                      isSubmitting={isSubmitting}
                    />

                    <div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6'>
                        {uploadResults.map((result, index) => (
                          <Card
                            key={index}
                            className='rounded-lg shadow-sm transition-shadow hover:shadow-md'
                          >
                            <CardHeader>
                              <CardTitle className='flex items-center gap-2 truncate text-sm text-muted-foreground'>
                                <FileCheck2 className="h-4 w-4" />
                                {result.fileName}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className='w-full bg-muted rounded-full h-2.5 mb-2'>
                                <div
                                  className='h-2.5 rounded-full bg-blue-600'
                                  style={{
                                    width: `${result.progress}%`,
                                    transition: 'width 0.2s ease'
                                  }}
                                ></div>
                              </div>
                              {result.status === 'uploaded' && result.documentType ? (
                                <div className='space-y-1'>
                                  <p className='text-sm font-medium text-emerald-700 dark:text-emerald-300'>
                                    Uploaded
                                  </p>
                                  <p className='text-sm text-emerald-700 dark:text-emerald-300'>
                                    Type: {result.documentType}
                                  </p>
                                </div>
                              ) : result.status === 'failed' ? (
                                <p className='text-sm text-red-700 dark:text-red-300'>
                                  Upload failed. Check the file and try again.
                                </p>
                              ) : (
                                <p className='text-sm text-muted-foreground animate-pulse'>
                                  Processing...
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
