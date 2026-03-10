// src/pages/faculty/profile/index.tsx
import { useEffect, useState } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Accordion } from '@/components/ui/accordion'
import { Edit3Icon } from 'lucide-react'
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
import { DatePickerWithRange } from '@/components/ui/date-picker'
import uploadToUserFolder from '@/tools/buckets/uploadToUserFolder'
import getFileFromFolder from '@/tools/buckets/getFileFromFolder'
import { useUserId } from '@/hooks/use-userId'
import insertToDatabase from '@/tools/database/insertToDatabase'
import updateDatabase from '@/tools/database/updateDatabase'

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
  useEffect(() => {
    async function getUserId () {
      const { userId, success } = await useUserId()
      if (userId && success) {
        setUserId(userId)
      } else {
        setUserId('')
      }
    }
    getUserId()
  })
  const [developmentData, setDevelopmentData] = useState<
    ProfessionalDevelopment[]
  >([
    {
      id: 'pd-1',
      role: 'Speaker – DevOps Workshop',
      organization: 'PH Tech Summit',
      period: 'Mar 2028',
      details: 'Presented CI/CD best practices for web apps.'
    },
    {
      id: '',
      role: '',
      organization: '',
      period: '',
      details: ''
    },
    {
      id: '',
      role: '',
      organization: '',
      period: '',
      details: ''
    },
    {
      id: '',
      role: '',
      organization: '',
      period: '',
      details: ''
    }
  ])

  const [workData, setWorkData] = useState<WorkExperiences[]>([
    {
      id: 'we-2',
      role: 'Software Engineer Intern',
      organization: 'TechFront Inc.',
      period: 'Jun 2026 – Aug 2026',
      details: 'Built an internal analytics dashboard with React & TailwindCSS.'
    },
    {
      id: '',
      role: '',
      organization: '',
      period: '',
      details: ''
    },
    {
      id: '',
      role: '',
      organization: '',
      period: '',
      details: ''
    },
    {
      id: '',
      role: '',
      organization: '',
      period: '',
      details: ''
    }
  ])

  const [educationData, setEducationData] = useState<EducationalBackground[]>([
    {
      id: 'edu-2',
      degree: 'M.Sc. in Information Technology',
      institution: 'Polytechnic University',
      startDate: '2027-08-01',
      endDate: '2029-05-01'
    },
    {
      id: '',
      degree: '',
      institution: '',
      startDate: '',
      endDate: ''
    },
    {
      id: '',
      degree: '',
      institution: '',
      startDate: '',
      endDate: ''
    },
    {
      id: '',
      degree: '',
      institution: '',
      startDate: '',
      endDate: ''
    }
  ])
  const [description, setDescription] = useState({
    description: ``,
    status: 'accepted'
  })

  const [openSections, setOpenSections] = useState<string[]>([
    'education',
    'work',
    'development'
  ])

  const [tempDescription, setTempDescription] = useState(
    description.description
  )
  const [editingEducation, setEditingEducation] =
    useState<EducationalBackground | null>(null)
  const [editingWork, setEditingWork] = useState<WorkExperiences | null>(null)

  const handleSaveDescription = async () => {
    try {
      const updatedDescription = {
        description: tempDescription,
        status: 'pending'
      }

      setDescription(updatedDescription)

      const success = await updateDatabase({
        table: 'profile_details',
        data: updatedDescription,
        match: { id: userId }
      })

      if (!success) {
        throw new Error('Failed to update the description in the database.')
      }

      console.log('Description updated successfully.')
    } catch (error) {
      console.error('Error updating description:', error)
    }
  }

  const handleSaveEducation = () => {
    if (editingEducation) {
      setEducationData(prev =>
        prev.map(edu =>
          edu.id === editingEducation.id ? editingEducation : edu
        )
      )
      setEditingEducation(null)
    }
  }

  const handleSaveWork = () => {
    if (editingWork) {
      setWorkData(prev =>
        prev.map(work => (work.id === editingWork.id ? editingWork : work))
      )
      setEditingWork(null)
    }
  }

  const [editingDevelopment, setEditingDevelopment] =
    useState<ProfessionalDevelopment | null>(null)
  const handleSaveDevelopment = () => {
    if (editingDevelopment) {
      setDevelopmentData(prev =>
        prev.map(dev =>
          dev.id === editingDevelopment.id ? editingDevelopment : dev
        )
      )
      setEditingDevelopment(null)
    }
  }

  // User data - replace with actual data fetching logic

  const handleProfileImageUpload = async (file: File) => {
    try {
      await uploadToUserFolder({
        bucketName: 'pictures-and-documents',
        file: file,
        filename: 'profile-picture',
        type: 'Profile Picture',
        userId: userId
      })
    } catch (error) {
      throw error
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
    } catch (error) {
      throw error
    }
  }

  return (
    <SidebarProvider>
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
              {/* Row 1: Profile Description Card */}
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
                        <Input
                          className=''
                          value={tempDescription}
                          onChange={e => setTempDescription(e.target.value)}
                          placeholder='Edit your description here'
                        />
                        <Button onClick={handleSaveDescription}>Save</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className='text-gray-700 leading-relaxed text-sm sm:text-base'>
                  {description.description}
                </CardContent>
              </Card>

              {/* Row 2: Educational Background Accordion */}
              <Accordion
                type='multiple'
                value={openSections.filter(s => s === 'education')}
                onValueChange={value => {
                  const newOpenSections = openSections.filter(
                    s => s !== 'education'
                  )
                  if (value.includes('education')) {
                    newOpenSections.push('education')
                  }
                  setOpenSections(newOpenSections)
                }}
              >
                <ProfileSection
                  value='education'
                  title='Educational Background'
                >
                  {educationData.map(ed => (
                    <div
                      key={ed.id}
                      className='mb-3 pb-3 border-b last:border-b-0 last:mb-0 last:pb-0 flex flex-row gap-x-4'
                    >
                      <div>
                        <p className='font-medium text-gray-800 text-sm sm:text-md'>
                          {ed.degree}
                        </p>
                        <p className='text-xs sm:text-sm text-gray-600'>
                          {ed.institution} • {ed.startDate} - {ed.endDate}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className='text-gray-500 hover:text-gray-700 h-fit'>
                            <Edit3Icon className='w-5 h-5' />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Edit EducationalBackground
                            </DialogTitle>
                          </DialogHeader>
                          <div className='space-y-4'>
                            <div className='flex flex-col space-y-2'>
                              <label className='text-sm font-medium text-gray-700'>
                                Degree
                              </label>
                              <Input
                                value={editingEducation?.degree || ''}
                                onChange={e =>
                                  setEditingEducation(prev =>
                                    prev
                                      ? { ...prev, degree: e.target.value }
                                      : {
                                          id: ed.id,
                                          degree: e.target.value,
                                          institution: ed.institution,
                                          startDate: ed.startDate,
                                          endDate: ed.endDate
                                        }
                                  )
                                }
                                placeholder='Degree'
                              />
                            </div>
                            <div className='flex flex-col space-y-2'>
                              <label className='text-sm font-medium text-gray-700'>
                                Institution
                              </label>
                              <Input
                                value={editingEducation?.institution || ''}
                                onChange={e =>
                                  setEditingEducation(prev =>
                                    prev
                                      ? { ...prev, institution: e.target.value }
                                      : {
                                          id: ed.id,
                                          degree: ed.degree,
                                          institution: e.target.value,
                                          startDate: ed.startDate,
                                          endDate: ed.endDate
                                        }
                                  )
                                }
                                placeholder='Institution'
                              />
                            </div>
                            <div className='flex flex-col space-y-2'>
                              <label className='text-sm font-medium text-gray-700'>
                                Date Range
                              </label>
                              <DatePickerWithRange
                                className='w-full'
                                onDateChange={range => {
                                  setEditingEducation(prev => {
                                    if (!prev) {
                                      return {
                                        id: ed.id,
                                        degree: ed.degree,
                                        institution: ed.institution,
                                        startDate:
                                          range?.from
                                            ?.toISOString()
                                            .split('T')[0] || '',
                                        endDate:
                                          range?.to
                                            ?.toISOString()
                                            .split('T')[0] || ''
                                      }
                                    }
                                    return {
                                      ...prev,
                                      startDate:
                                        range?.from
                                          ?.toISOString()
                                          .split('T')[0] || prev.startDate,
                                      endDate:
                                        range?.to
                                          ?.toISOString()
                                          .split('T')[0] || prev.endDate
                                    }
                                  })
                                }}
                              />
                              <div className='text-sm text-gray-600'>
                                {editingEducation?.startDate &&
                                  `Start Date: ${editingEducation.startDate}`}
                                {editingEducation?.endDate &&
                                  `, End Date: ${editingEducation.endDate}`}
                              </div>
                            </div>
                            <div className='flex justify-end space-x-2'>
                              <Button
                                variant='secondary'
                                onClick={() => setEditingEducation(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => {
                                  handleSaveEducation()
                                  setEditingEducation(null) // Close the dialog
                                  document.body.click() // Trigger a click outside to close the dialog
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </ProfileSection>
              </Accordion>

              {/* Row 3: Work Experience and Professional Development */}
              <Accordion
                type='multiple'
                value={openSections.filter(
                  s => s === 'work' || s === 'development'
                )}
                onValueChange={value => {
                  const newOpenSections = openSections.filter(
                    s => s !== 'work' && s !== 'development'
                  )
                  value.forEach(val => newOpenSections.push(val))
                  setOpenSections(newOpenSections)
                }}
                className='space-y-3'
              >
                <div className='flex flex-col md:flex-row md:space-x-3 space-y-3 md:space-y-0'>
                  <div className='flex-1'>
                    <ProfileSection value='work' title='Work Experiences'>
                      {workData.map(we => (
                        <div
                          key={we.id}
                          className='mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0 flex flex-row gap-x-4'
                        >
                          <div>
                            <p className='font-medium text-gray-800 text-sm sm:text-md'>
                              {we.role}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-600'>
                              {we.organization} • {we.period}
                            </p>
                            {we.details && (
                              <p className='mt-1 text-xs sm:text-sm text-gray-700'>
                                {we.details}
                              </p>
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className='text-gray-500 hover:text-gray-700 h-fit'>
                                <Edit3Icon className='w-5 h-5' />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Work Experience</DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Role
                                  </label>
                                  <Input
                                    value={editingWork?.role || ''}
                                    onChange={e =>
                                      setEditingWork(prev =>
                                        prev
                                          ? { ...prev, role: e.target.value }
                                          : null
                                      )
                                    }
                                    placeholder='Role'
                                  />
                                </div>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Organization
                                  </label>
                                  <Input
                                    value={editingWork?.organization || ''}
                                    onChange={e =>
                                      setEditingWork(prev =>
                                        prev
                                          ? {
                                              ...prev,
                                              organization: e.target.value
                                            }
                                          : null
                                      )
                                    }
                                    placeholder='Organization'
                                  />
                                </div>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Date Range
                                  </label>
                                  <DatePickerWithRange
                                    className='w-full'
                                    onDateChange={range => {
                                      setEditingWork(prev => {
                                        if (!prev) {
                                          return {
                                            id: we.id,
                                            role: we.role,
                                            organization: we.organization,
                                            period: `${
                                              range?.from
                                                ?.toISOString()
                                                .split('T')[0] || ''
                                            } - ${
                                              range?.to
                                                ?.toISOString()
                                                .split('T')[0] || ''
                                            }`,
                                            details: we.details
                                          }
                                        }
                                        return {
                                          ...prev,
                                          period: `${
                                            range?.from
                                              ?.toISOString()
                                              .split('T')[0] || prev.period
                                          } - ${
                                            range?.to
                                              ?.toISOString()
                                              .split('T')[0] || prev.period
                                          }`
                                        }
                                      })
                                    }}
                                  />
                                </div>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Details
                                  </label>
                                  <Input
                                    value={editingWork?.details || ''}
                                    onChange={e =>
                                      setEditingWork(prev =>
                                        prev
                                          ? { ...prev, details: e.target.value }
                                          : null
                                      )
                                    }
                                    placeholder='Details'
                                  />
                                </div>
                                <div className='flex justify-end space-x-2'>
                                  <Button
                                    variant='secondary'
                                    onClick={() => setEditingWork(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      handleSaveWork()
                                      setEditingWork(null)
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </ProfileSection>
                  </div>
                  <div className='flex-1'>
                    <ProfileSection
                      value='development'
                      title='Professional Development'
                    >
                      {developmentData.map(item => (
                        <div
                          key={item.id}
                          className='mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0 flex flex-row gap-x-4'
                        >
                          <div>
                            <p className='font-medium text-gray-800 text-sm sm:text-md'>
                              {item.role}
                            </p>
                            <p className='text-xs sm:text-sm text-gray-600'>
                              {item.organization} • {item.period}
                            </p>
                            {item.details && (
                              <p className='mt-1 text-xs sm:text-sm text-gray-700'>
                                {item.details}
                              </p>
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className='text-gray-500 hover:text-gray-700 h-fit'>
                                <Edit3Icon className='w-5 h-5' />
                              </button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Edit Professional Development
                                </DialogTitle>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Role
                                  </label>
                                  <Input
                                    value={editingDevelopment?.role || ''}
                                    onChange={e =>
                                      setEditingDevelopment(prev =>
                                        prev
                                          ? { ...prev, role: e.target.value }
                                          : null
                                      )
                                    }
                                    placeholder='Role'
                                  />
                                </div>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Organization
                                  </label>
                                  <Input
                                    value={
                                      editingDevelopment?.organization || ''
                                    }
                                    onChange={e =>
                                      setEditingDevelopment(prev =>
                                        prev
                                          ? {
                                              ...prev,
                                              organization: e.target.value
                                            }
                                          : null
                                      )
                                    }
                                    placeholder='Organization'
                                  />
                                </div>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Date Range
                                  </label>
                                  <DatePickerWithRange
                                    className='w-full'
                                    onDateChange={range => {
                                      setEditingDevelopment(prev => {
                                        if (!prev) {
                                          return {
                                            id: item.id,
                                            role: item.role,
                                            organization: item.organization,
                                            period: `${
                                              range?.from
                                                ?.toISOString()
                                                .split('T')[0] || ''
                                            } - ${
                                              range?.to
                                                ?.toISOString()
                                                .split('T')[0] || ''
                                            }`,
                                            details: item.details
                                          }
                                        }
                                        return {
                                          ...prev,
                                          period: `${
                                            range?.from
                                              ?.toISOString()
                                              .split('T')[0] || prev.period
                                          } - ${
                                            range?.to
                                              ?.toISOString()
                                              .split('T')[0] || prev.period
                                          }`
                                        }
                                      })
                                    }}
                                  />
                                </div>
                                <div className='flex flex-col space-y-2'>
                                  <label className='text-sm font-medium text-gray-700'>
                                    Details
                                  </label>
                                  <Input
                                    value={editingDevelopment?.details || ''}
                                    onChange={e =>
                                      setEditingDevelopment(prev =>
                                        prev
                                          ? { ...prev, details: e.target.value }
                                          : null
                                      )
                                    }
                                    placeholder='Details'
                                  />
                                </div>
                                <div className='flex justify-end space-x-2'>
                                  <Button
                                    variant='secondary'
                                    onClick={() => setEditingDevelopment(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      handleSaveDevelopment()
                                      setEditingDevelopment(null)
                                    }}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </ProfileSection>
                  </div>
                </div>
              </Accordion>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
