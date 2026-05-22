// src/pages/faculty/profile/index.tsx
import { useEffect, useState, useRef } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Accordion } from '@/components/ui/accordion'
import { Edit3Icon, SparklesIcon, PlusIcon, Trash2Icon, FileTextIcon } from 'lucide-react'
import { analyzeDocument } from '@/tools/ai/analyzeDocument'
import ProfileHeader from './ProfileHeader'
import ProfileSection from './ProfileSection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import uploadToUserFolder from '@/tools/buckets/uploadToUserFolder'
import { useUserId } from '@/hooks/use-userId'
import insertToDatabase from '@/tools/database/insertToDatabase'
import updateDatabase from '@/tools/database/updateDatabase'
import getFromDatabase from '@/tools/database/getFromDatabase'
import removeFromDatabase from '@/tools/database/removeFromDatabase'
import extractTextFromImage from '@/tools/ocr/extractTextFromImage'
import { toast, Toaster } from 'sonner'

// Define the EducationalBackground and Experience types

interface EducationalBackground {
  id: string
  degree: string
  institution: string
  startDate?: string
  endDate?: string
  accepted?: boolean
}

interface WorkExperiences {
  id: string
  role: string
  organization: string
  period: string
  details?: string
  accepted?: boolean
}

interface ProfessionalDevelopment {
  id: string
  role: string
  organization: string
  period: string
  details?: string
  accepted?: boolean
}

export default function ProfilePage () {
  const [userId, setUserId] = useState<string>('')
  const [educationData, setEducationData] = useState<EducationalBackground[]>([])
  const [workData, setWorkData] = useState<WorkExperiences[]>([])
  const [developmentData, setDevelopmentData] = useState<ProfessionalDevelopment[]>([])
  const [description, setDescription] = useState({
    description: '',
    status: 'accepted'
  })
  const [tempDescription, setTempDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const autoFillInputRef = useRef<HTMLInputElement>(null)

  const [openSections, setOpenSections] = useState<string[]>([
    'education',
    'work',
    'development'
  ])

  useEffect(() => {
    async function init () {
      const { userId, success } = await useUserId()
      if (userId && success) {
        setUserId(userId)
        fetchProfileData(userId)
      } else {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  const fetchProfileData = async (uid: string) => {
    try {
      setIsLoading(true)
      const [prof, edu, work, dev] = await Promise.all([
        getFromDatabase({ table: 'profile_details', getAll: true, match: { id: uid } }),
        getFromDatabase({ table: 'educational_background', getAll: true, match: { user_id: uid } }),
        getFromDatabase({ table: 'work_experiences', getAll: true, match: { user_id: uid } }),
        getFromDatabase({ table: 'professional_development', getAll: true, match: { user_id: uid } })
      ])

      if (prof?.[0]) {
        setDescription({
          description: prof[0].description || '',
          status: prof[0].status || 'accepted'
        })
        setTempDescription(prof[0].description || '')
      }

      setEducationData(edu || [])
      setWorkData(work || [])
      setDevelopmentData(dev || [])
    } catch (error) {
      console.error('Error fetching profile data:', error)
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoFill = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsAutoFilling(true)
    toast.info('Extracting data from document...')
    
    try {
      const text = await extractTextFromImage(file)
      const prompt = `Extract profile data from this OCR text. Return ONLY a raw JSON object with no markdown formatting. The JSON should have the following structure:
      {
        "type": "Education" | "Work" | "Development",
        "title": "Degree or Role Name",
        "organization": "Institution or Company Name",
        "start_date": "YYYY-MM-DD or empty",
        "end_date": "YYYY-MM-DD or empty",
        "details": "Brief summary or empty"
      }`

      const response = await analyzeDocument(text, prompt)
      // Clean up potential markdown formatting from AI response
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim()
      const data = JSON.parse(jsonStr)

      if (data.type === 'Education') {
        await insertToDatabase({
          table: 'educational_background',
          data: {
            user_id: userId,
            degree: data.title,
            institution: data.organization,
            startDate: data.start_date,
            endDate: data.end_date
          }
        })
      } else if (data.type === 'Work') {
        await insertToDatabase({
          table: 'work_experiences',
          data: {
            user_id: userId,
            role: data.title,
            organization: data.organization,
            period: `${data.start_date} - ${data.end_date}`,
            details: data.details
          }
        })
      } else {
        await insertToDatabase({
          table: 'professional_development',
          data: {
            user_id: userId,
            role: data.title,
            organization: data.organization,
            period: `${data.start_date} - ${data.end_date}`,
            details: data.details
          }
        })
      }

      toast.success(`Successfully auto-filled ${data.type} entry!`)
      fetchProfileData(userId)
    } catch (error) {
      console.error('Auto-fill error:', error)
      toast.error('Failed to auto-fill data. Please ensure the document is clear.')
    } finally {
      setIsAutoFilling(false)
      if (autoFillInputRef.current) autoFillInputRef.current.value = ''
    }
  }

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    const profileText = `
      Education: ${educationData.map(e => `${e.degree} at ${e.institution}`).join(', ')}.
      Work Experience: ${workData.map(w => `${w.role} at ${w.organization}`).join(', ')}.
      Professional Development: ${developmentData.map(d => `${d.role} at ${d.organization}`).join(', ')}.
    `
    const generatedSummary = await analyzeDocument(
      profileText, 
      'Generate a professional profile summary in 2-3 sentences based on the following data.'
    )
    setTempDescription(generatedSummary)
    setIsGenerating(false)
  }

  const handleSaveDescription = async () => {
    try {
      const updatedDescription = {
        description: tempDescription,
        status: 'pending'
      }

      const success = await updateDatabase({
        table: 'profile_details',
        data: updatedDescription,
        match: { id: userId }
      })

      if (success) {
        setDescription(updatedDescription)
        toast.success('Description updated and pending approval')
      }
    } catch (error) {
      console.error('Error updating description:', error)
      toast.error('Failed to update description')
    }
  }

  const [editingEducation, setEditingEducation] = useState<EducationalBackground | null>(null)
  const [isAddingEdu, setIsAddingEdu] = useState(false)

  const handleSaveEducation = async () => {
    if (!editingEducation) return
    try {
      if (isAddingEdu) {
        const { id, ...data } = editingEducation
        await insertToDatabase({
          table: 'educational_background',
          data: { ...data, user_id: userId }
        })
        toast.success('Education added')
      } else {
        await updateDatabase({
          table: 'educational_background',
          data: editingEducation,
          match: { id: editingEducation.id }
        })
        toast.success('Education updated')
      }
      fetchProfileData(userId)
      setEditingEducation(null)
      setIsAddingEdu(false)
    } catch (error) {
      toast.error('Failed to save education')
    }
  }

  const [editingWork, setEditingWork] = useState<WorkExperiences | null>(null)
  const [isAddingWork, setIsAddingWork] = useState(false)

  const handleSaveWork = async () => {
    if (!editingWork) return
    try {
      if (isAddingWork) {
        const { id, ...data } = editingWork
        await insertToDatabase({
          table: 'work_experiences',
          data: { ...data, user_id: userId }
        })
        toast.success('Work experience added')
      } else {
        await updateDatabase({
          table: 'work_experiences',
          data: editingWork,
          match: { id: editingWork.id }
        })
        toast.success('Work experience updated')
      }
      fetchProfileData(userId)
      setEditingWork(null)
      setIsAddingWork(false)
    } catch (error) {
      toast.error('Failed to save work experience')
    }
  }

  const [editingDevelopment, setEditingDevelopment] = useState<ProfessionalDevelopment | null>(null)
  const [isAddingDev, setIsAddingDev] = useState(false)

  const handleSaveDevelopment = async () => {
    if (!editingDevelopment) return
    try {
      if (isAddingDev) {
        const { id, ...data } = editingDevelopment
        await insertToDatabase({
          table: 'professional_development',
          data: { ...data, user_id: userId }
        })
        toast.success('Professional development added')
      } else {
        await updateDatabase({
          table: 'professional_development',
          data: editingDevelopment,
          match: { id: editingDevelopment.id }
        })
        toast.success('Professional development updated')
      }
      fetchProfileData(userId)
      setEditingDevelopment(null)
      setIsAddingDev(false)
    } catch (error) {
      toast.error('Failed to save professional development')
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return
    try {
      await removeFromDatabase({ table, match: { id } })
      toast.success('Entry deleted')
      fetchProfileData(userId)
    } catch (error) {
      toast.error('Failed to delete entry')
    }
  }

  const handleProfileImageUpload = async (file: File) => {
    try {
      await uploadToUserFolder({
        bucketName: 'pictures-and-documents',
        file: file,
        filename: 'profile-picture',
        type: 'Profile Picture',
        userId: userId
      })
      toast.success('Profile picture updated')
    } catch (error) {
      toast.error('Failed to upload profile picture')
    }
  }

  const handleBannerImageUpload = async (file: File) => {
    try {
      await uploadToUserFolder({
        bucketName: 'pictures-and-documents',
        file: file,
        filename: 'banner-picture',
        type: 'Banner Picture',
        userId: userId
      })
      toast.success('Banner picture updated')
    } catch (error) {
      toast.error('Failed to upload banner picture')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading Profile...</div>
  }

  return (
    <SidebarProvider>
      <Toaster position="top-right" />
      <div className='flex w-screen min-h-screen flex-col md:flex-row'>
        <AppSidebar className='hidden md:block' />
        <div className='flex-1 flex flex-col overflow-auto'>
          <div className='md:hidden p-4 border-b'>
            <SidebarTrigger />
          </div>
          <main className='flex-1 w-full bg-gray-100 p-4 md:p-6 lg:p-8'>
            <ProfileHeader
              userId={userId}
              onProfileImageUpload={handleProfileImageUpload}
              onBannerImageUpload={handleBannerImageUpload}
              className='relative flex flex-col items-center text-center'
            />

            <div className='mt-6 max-w-4xl mx-auto space-y-3'>
              {/* Auto-Fill Action Banner */}
              <Card className="bg-indigo-50 border-indigo-100 shadow-sm overflow-hidden mb-4">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-indigo-800 flex items-center">
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      Smart Profile Builder
                    </h3>
                    <p className="text-sm text-indigo-600">
                      Upload your CV, Certificate, or Diploma and let AI extract the details for you.
                    </p>
                  </div>
                  <Button 
                    onClick={() => autoFillInputRef.current?.click()}
                    disabled={isAutoFilling}
                    className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2" />
                    {isAutoFilling ? 'Extracting...' : 'Upload & Auto-fill'}
                  </Button>
                  <input
                    type="file"
                    ref={autoFillInputRef}
                    onChange={handleAutoFill}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Profile Description Card */}
              <Card className="bg-white rounded-md shadow-sm overflow-hidden">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="font-semibold text-md sm:text-lg text-green-600">
                    Profile Description
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className='text-gray-500 hover:text-gray-700'>
                        <Edit3Icon className='w-5 h-5' />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Description</DialogTitle>
                      </DialogHeader>
                      <div className='space-y-4'>
                        <textarea
                          className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          value={tempDescription}
                          onChange={e => setTempDescription(e.target.value)}
                          placeholder='Edit your professional description here'
                        />
                        <div className='flex justify-between items-center'>
                          <Button 
                            variant="outline" 
                            onClick={handleGenerateSummary} 
                            disabled={isGenerating}
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                          >
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            {isGenerating ? 'Generating...' : 'AI Generate Summary'}
                          </Button>
                          <Button onClick={handleSaveDescription}>Save</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className='text-gray-700 leading-relaxed text-sm sm:text-base'>
                  {description.description || <span className="text-gray-400 italic">No description provided. Click edit to add one.</span>}
                </CardContent>
              </Card>

              {/* Educational Background */}
              <Accordion
                type='multiple'
                value={openSections.filter(s => s === 'education')}
                onValueChange={value => {
                  const newOpenSections = openSections.filter(s => s !== 'education')
                  if (value.includes('education')) newOpenSections.push('education')
                  setOpenSections(newOpenSections)
                }}
              >
                <ProfileSection value='education' title='Educational Background'>
                  <div className="space-y-4">
                    {educationData.map(ed => (
                      <div key={ed.id} className='pb-3 border-b last:border-b-0 flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-gray-800 text-sm sm:text-md'>{ed.degree}</p>
                          <p className='text-xs sm:text-sm text-gray-600'>{ed.institution} • {ed.startDate} - {ed.endDate}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className='text-gray-400 hover:text-green-600' onClick={() => { setEditingEducation(ed); setIsAddingEdu(false); }}>
                                <Edit3Icon className='w-4 h-4' />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Education</DialogTitle></DialogHeader>
                              <EducationForm data={editingEducation} onChange={setEditingEducation} onSave={handleSaveEducation} onCancel={() => setEditingEducation(null)} />
                            </DialogContent>
                          </Dialog>
                          <button className='text-gray-400 hover:text-red-600' onClick={() => handleDelete('educational_background', ed.id)}>
                            <Trash2Icon className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed" onClick={() => { setEditingEducation({ id: '', degree: '', institution: '', startDate: '', endDate: '' }); setIsAddingEdu(true); }}>
                          <PlusIcon className="w-4 h-4 mr-2" /> Add Education
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Education</DialogTitle></DialogHeader>
                        <EducationForm data={editingEducation} onChange={setEditingEducation} onSave={handleSaveEducation} onCancel={() => setEditingEducation(null)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </ProfileSection>
              </Accordion>

              {/* Work Experience */}
              <Accordion
                type='multiple'
                value={openSections.filter(s => s === 'work')}
                onValueChange={value => {
                  const newOpenSections = openSections.filter(s => s !== 'work')
                  if (value.includes('work')) newOpenSections.push('work')
                  setOpenSections(newOpenSections)
                }}
              >
                <ProfileSection value='work' title='Work Experiences'>
                  <div className="space-y-4">
                    {workData.map(we => (
                      <div key={we.id} className='pb-4 border-b last:border-b-0 flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-gray-800 text-sm sm:text-md'>{we.role}</p>
                          <p className='text-xs sm:text-sm text-gray-600'>{we.organization} • {we.period}</p>
                          {we.details && <p className='mt-1 text-xs sm:text-sm text-gray-700'>{we.details}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className='text-gray-400 hover:text-green-600' onClick={() => { setEditingWork(we); setIsAddingWork(false); }}>
                                <Edit3Icon className='w-4 h-4' />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Work Experience</DialogTitle></DialogHeader>
                              <WorkForm data={editingWork} onChange={setEditingWork} onSave={handleSaveWork} onCancel={() => setEditingWork(null)} />
                            </DialogContent>
                          </Dialog>
                          <button className='text-gray-400 hover:text-red-600' onClick={() => handleDelete('work_experiences', we.id)}>
                            <Trash2Icon className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed" onClick={() => { setEditingWork({ id: '', role: '', organization: '', period: '', details: '' }); setIsAddingWork(true); }}>
                          <PlusIcon className="w-4 h-4 mr-2" /> Add Work Experience
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Work Experience</DialogTitle></DialogHeader>
                        <WorkForm data={editingWork} onChange={setEditingWork} onSave={handleSaveWork} onCancel={() => setEditingWork(null)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </ProfileSection>
              </Accordion>

              {/* Professional Development */}
              <Accordion
                type='multiple'
                value={openSections.filter(s => s === 'development')}
                onValueChange={value => {
                  const newOpenSections = openSections.filter(s => s !== 'development')
                  if (value.includes('development')) newOpenSections.push('development')
                  setOpenSections(newOpenSections)
                }}
              >
                <ProfileSection value='development' title='Professional Development'>
                  <div className="space-y-4">
                    {developmentData.map(item => (
                      <div key={item.id} className='pb-4 border-b last:border-b-0 flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-gray-800 text-sm sm:text-md'>{item.role}</p>
                          <p className='text-xs sm:text-sm text-gray-600'>{item.organization} • {item.period}</p>
                          {item.details && <p className='mt-1 text-xs sm:text-sm text-gray-700'>{item.details}</p>}
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className='text-gray-400 hover:text-green-600' onClick={() => { setEditingDevelopment(item); setIsAddingDev(false); }}>
                                <Edit3Icon className='w-4 h-4' />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Edit Development</DialogTitle></DialogHeader>
                              <DevForm data={editingDevelopment} onChange={setEditingDevelopment} onSave={handleSaveDevelopment} onCancel={() => setEditingDevelopment(null)} />
                            </DialogContent>
                          </Dialog>
                          <button className='text-gray-400 hover:text-red-600' onClick={() => handleDelete('professional_development', item.id)}>
                            <Trash2Icon className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed" onClick={() => { setEditingDevelopment({ id: '', role: '', organization: '', period: '', details: '' }); setIsAddingDev(true); }}>
                          <PlusIcon className="w-4 h-4 mr-2" /> Add Professional Development
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Add Professional Development</DialogTitle></DialogHeader>
                        <DevForm data={editingDevelopment} onChange={setEditingDevelopment} onSave={handleSaveDevelopment} onCancel={() => setEditingDevelopment(null)} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </ProfileSection>
              </Accordion>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

function EducationForm ({ data, onChange, onSave, onCancel }: { data: EducationalBackground | null, onChange: (d: any) => void, onSave: () => void, onCancel: () => void }) {
  if (!data) return null
  return (
    <div className='space-y-4'>
      <Input value={data.degree} onChange={e => onChange({ ...data, degree: e.target.value })} placeholder='Degree (e.g. B.S. Computer Science)' />
      <Input value={data.institution} onChange={e => onChange({ ...data, institution: e.target.value })} placeholder='Institution' />
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={data.startDate} onChange={e => onChange({ ...data, startDate: e.target.value })} placeholder="Start Date" />
        <Input type="date" value={data.endDate} onChange={e => onChange({ ...data, endDate: e.target.value })} placeholder="End Date" />
      </div>
      <div className='flex justify-end space-x-2'>
        <Button variant='secondary' onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  )
}

function WorkForm ({ data, onChange, onSave, onCancel }: { data: WorkExperiences | null, onChange: (d: any) => void, onSave: () => void, onCancel: () => void }) {
  if (!data) return null
  return (
    <div className='space-y-4'>
      <Input value={data.role} onChange={e => onChange({ ...data, role: e.target.value })} placeholder='Role' />
      <Input value={data.organization} onChange={e => onChange({ ...data, organization: e.target.value })} placeholder='Organization' />
      <Input value={data.period} onChange={e => onChange({ ...data, period: e.target.value })} placeholder='Period (e.g. Jan 2020 - Dec 2022)' />
      <textarea
        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        value={data.details}
        onChange={e => onChange({ ...data, details: e.target.value })}
        placeholder='Details'
      />
      <div className='flex justify-end space-x-2'>
        <Button variant='secondary' onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  )
}

function DevForm ({ data, onChange, onSave, onCancel }: { data: ProfessionalDevelopment | null, onChange: (d: any) => void, onSave: () => void, onCancel: () => void }) {
  if (!data) return null
  return (
    <div className='space-y-4'>
      <Input value={data.role} onChange={e => onChange({ ...data, role: e.target.value })} placeholder='Role/Activity' />
      <Input value={data.organization} onChange={e => onChange({ ...data, organization: e.target.value })} placeholder='Organization' />
      <Input value={data.period} onChange={e => onChange({ ...data, period: e.target.value })} placeholder='Period' />
      <textarea
        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
        value={data.details}
        onChange={e => onChange({ ...data, details: e.target.value })}
        placeholder='Details'
      />
      <div className='flex justify-end space-x-2'>
        <Button variant='secondary' onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  )
}
