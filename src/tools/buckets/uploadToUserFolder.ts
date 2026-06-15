import backend from '@/client/backend'
import isUserFolderExisting from '@/tools/buckets/isUserFolderExisting'
import createUserFolderInBucket from './createUserFolderInBucket'

/**
 * Checks if a user folder exists, creates it if not, and then uploads or updates an image.
 * @param bucketName - The name of the bucket
 * @param userId - The unique user ID (e.g., user UUID)
 * @param file - The image file to upload
 * @param filename - The desired filename for the image
 * @returns The result of the upload operation or an error
 */
const uploadToUserFolder = async ({
  bucketName,
  file,
  type,
  filename,
  userId
}: {
  bucketName: string
  file: File
  type: string
  filename: string
  userId: string
}) => {
  const folderExists = await isUserFolderExisting(bucketName, userId)

  if (!folderExists) {
    const { error } = await createUserFolderInBucket(bucketName, userId, type)
    if (error) throw error
  }

  const filePath = `${userId}/${type}/${filename}`

  const { data, error } = await backend.storage
    .from(bucketName)
    .upload(filePath, file, { cacheControl: '3600', upsert: true })

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  return { data, success: true }
}

export default uploadToUserFolder
