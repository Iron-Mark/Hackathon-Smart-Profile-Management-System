import type { ReactNode } from 'react'
import { useState } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import DropZone from '@/components/drop-zone'
import { Toaster, toast } from 'sonner'
import determineDocumentTypeAndUpload from '@/tools/determineDocumentTypeAndUpload'
import getFromDatabase from '@/tools/database/getFromDatabase'
import { useEffect } from 'react'
import { useUserId } from '@/hooks/use-userId'

interface FacultyDashboardProps {
  children?: ReactNode
}

export default function FacultyDashboard ({ children }: FacultyDashboardProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadResults, setUploadResults] = useState<
    { fileName: string; progress: number; documentType?: string }[]
  >([])
  const [name, setName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [pendingCount, setPendingCount] = useState<number>(0)
  const [completion, setCompletion] = useState<number>(0)
  const [notificationsCount, setNotificationsCount] = useState<number>(0)

  const handleFileUpload = (files: File[]) => {
    const newUniqueFiles = files.filter(
      file => !uploadedFiles.some(f => f.name === file.name)
    )

    if (newUniqueFiles.length < files.length) {
      toast.warning('Some files were already uploaded')
    }

    if (newUniqueFiles.length === 0) return

    setUploadedFiles(prev => [...prev, ...newUniqueFiles])
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
        const returnedCount = reviewedSubs.filter((sub: any) => sub.status === 'Returned').length;
        const approvedCount = reviewedSubs.filter((sub: any) => sub.status === 'Approved').length;
        if (returnedCount > 0) toast.error(`You have ${returnedCount} returned document(s) requiring attention.`);
        if (approvedCount > 0) toast.success(`You have ${approvedCount} approved document(s).`);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const handleSubmit = async () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast.error('Please upload at least one file to submit.')
      return
    }

    const results = uploadedFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      documentType: undefined
    }))
    setUploadResults(results)

    for (const [index, file] of uploadedFiles.entries()) {
      const result = await determineDocumentTypeAndUpload(file)

      if (!result) {
        toast.error(`Failed to upload: ${file.name}`)
        continue
      }

      setUploadResults(prev =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                progress: 100,
                documentType: result.documentType
              }
            : item
        )
      )
    }

    toast.success('Files uploaded successfully!')
    setUploadedFiles([])
    fetchDashboardData(userId) // Refresh pending count
  }

  return (
    <SidebarProvider>
      <div className='flex w-screen'>
        <AppSidebar />

        <div className='flex-1 flex flex-col overflow-auto'>
          <div className='md:hidden p-4'>
            <SidebarTrigger />
          </div>

          <main className='flex-1 w-full p-6 bg-gray-100'>
            <Toaster position='top-right' />
            {children ?? (
              <>
                <h1 className='text-3xl font-extrabold text-gray-800 mb-2'>
                  Welcome, {name}
                </h1>
                <p className='text-gray-600 mb-6'>
                  Track your records and compliance status here.
                </p>
                <Separator className='mb-6' />

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 relative'>
                  <div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                      <Card className='shadow-sm hover:shadow-md transition-shadow'>
                        <CardHeader>
                          <CardTitle className='text-sm text-gray-500'>
                            Profile Completion
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-2xl font-bold text-green-400'>
                            {completion}%
                          </p>
                        </CardContent>
                      </Card>
                      <Card className='shadow-sm hover:shadow-md transition-shadow'>
                        <CardHeader>
                          <CardTitle className='text-sm text-gray-500'>
                            Pending Approvals
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-2xl font-bold text-amber-400'>
                            {pendingCount}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className='shadow-sm hover:shadow-md transition-shadow'>
                        <CardHeader>
                          <CardTitle className='text-sm text-gray-500'>
                            Notifications
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-2xl font-bold text-stone-800'>
                            {notificationsCount}
                          </p>
                        </CardContent>
                      </Card>
                      <Card className='shadow-sm hover:shadow-md transition-shadow'>
                        <CardHeader>
                          <CardTitle className='text-sm text-gray-500'>
                            Upcoming Deadlines
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className='text-2xl font-bold text-red-500'>3</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <p className='text-gray-600 mb-3'>
                      Use our AI-powered smart upload to automatically organize
                      and process your documents effortlessly.
                    </p>

                    <DropZone
                      setData={handleFileUpload}
                      handleSubmit={() => handleSubmit()}
                    />

                    <div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6'>
                        {uploadResults.map((result, index) => (
                          <Card
                            key={index}
                            className='shadow-sm hover:shadow-md transition-shadow'
                          >
                            <CardHeader>
                              <CardTitle className='text-sm text-gray-500'>
                                {result.fileName}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2'>
                                <div
                                  className='h-2.5 rounded-full bg-blue-600'
                                  style={{
                                    width: `${result.progress}%`,
                                    transition: 'width 0.2s ease'
                                  }}
                                ></div>
                              </div>
                              {result.documentType ? (
                                <p className='text-sm text-green-600'>
                                  Document Type: {result.documentType}
                                </p>
                              ) : (
                                <p className='text-sm text-gray-600'>
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
