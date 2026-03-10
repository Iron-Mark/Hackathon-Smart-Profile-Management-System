// src/pages/faculty/profile/ProfileHeader.tsx
import React, { useState, useRef, useEffect } from 'react'
import { CameraIcon } from 'lucide-react' // Using CameraIcon
import getFileFromFolder from '@/tools/buckets/getFileFromFolder'
import getFromDatabase from '@/tools/database/getFromDatabase'

interface ProfileHeaderProps {
  bannerImageUrl?: string | null
  profileImageUrl?: string | null
  onProfileImageUpload?: (file: File) => void
  onBannerImageUpload?: (file: File) => void
  className?: string // Added className prop
  userId: string
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  onProfileImageUpload,
  onBannerImageUpload,
  className,
  userId
}) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [userData, setUserData] = useState<{ name: string; email: string }>({
    name: '',
    email: ''
  })

  useEffect(() => {
    let isMounted = true

    async function getData () {
      if (!userId) return
      try {
        const profileImage = await getFileFromFolder({
          bucketName: 'pictures-and-documents',
          type: 'Profile Picture',
          fileName: 'profile-picture',
          userId: userId
        })
        const bannerImage = await getFileFromFolder({
          bucketName: 'pictures-and-documents',
          type: 'Banner Picture',
          fileName: 'banner-picture',
          userId: userId
        })
        const name = await getFromDatabase({
          table: 'account_details',
          column: 'name',
          getAll: false,
          match: { id: userId }
        })

        const email = await getFromDatabase({
          table: 'account_details',
          column: 'email',
          getAll: false,
          match: { id: userId }
        })
        if (isMounted) {
          setUserData({
            name: name[0]?.name || '', // Use logical OR (||) for fallback
            email: email[0]?.email || '' // Use logical OR (||) for fallback
          })
          setProfileImageUrl(profileImage)
          setBannerImageUrl(bannerImage)
        }
      } catch (error) {
        console.error('Error fetching images:', error)
      }
    }

    getData()

    return () => {
      isMounted = false
    }
  }, [userId])

  const profileImageInputRef = useRef<HTMLInputElement>(null)
  const bannerImageInputRef = useRef<HTMLInputElement>(null)

  // Update the handleImageChange function to remove the overlay when an image is uploaded
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>,
    uploadCallback?: (file: File) => void
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      if (uploadCallback) {
        try {
          // Call the upload callback to handle the file upload
          await uploadCallback(file)
          console.log('Image uploaded successfully.')

          // Remove the overlay by setting the preview state
          setImagePreview(reader.result as string)
        } catch (error) {
          console.error('Error uploading image:', error)
        }
      }
    }
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Profile Banner */}
      <div
        className='group relative  bg-gradient-to-r from-green-500 to-emerald-600 w-full h-40 md:h-48 rounded-t-md shadow-md cursor-pointer'
        onClick={() => bannerImageInputRef.current?.click()}
      >
        {bannerImageUrl ? (
          <img
            src={bannerImageUrl}
            alt='Profile Banner'
            className='object-cover w-full h-full rounded-t-md'
          />
        ) : (
          <div className='absolute inset-0 flex items-center justify-center bg-gray-200/50 rounded-t-md'>
            <span className='text-sm text-gray-600'>Upload Cover Photo</span>
          </div>
        )}
        <div className='absolute inset-0 bg-black/25 bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity duration-300 rounded-t-md'>
          <CameraIcon className='w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>
        <input
          type='file'
          ref={bannerImageInputRef}
          accept='image/*'
          onChange={e =>
            handleImageChange(e, setBannerImageUrl, onBannerImageUpload)
          }
          className='hidden'
        />
      </div>

      <div className='bg-white p-4 sm:p-6 rounded-b-md shadow-md z-10 mt-6 w-full'>
        {/* Profile Pic and Basic Info */}
        <div className='flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20'>
          <div
            className='group relative rounded-full h-24 w-24 md:h-32 md:w-32 bg-gray-300 overflow-hidden border-4 border-white shadow-lg cursor-pointer'
            onClick={() => profileImageInputRef.current?.click()}
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt='Profile Pic'
                className='object-cover w-full h-full'
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500'>
                <span className='text-xs'>No Image</span>
              </div>
            )}
            <div className='absolute inset-0 hover:bg-black/50 bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full transition-opacity duration-300'>
              <CameraIcon className='w-6 h-6 md:w-8 md:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </div>
            <input
              type='file'
              ref={profileImageInputRef}
              accept='image/*'
              onChange={e =>
                handleImageChange(e, setProfileImageUrl, onProfileImageUpload)
              }
              className='hidden'
            />
          </div>
          <div className='mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left w-full sm:w-auto'>
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate'>
              {userData.name}
            </h1>
            <p className='text-sm md:text-base text-gray-600 truncate'>
              {userData.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader
