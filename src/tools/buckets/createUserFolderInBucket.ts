import supabase from '@/client/supabase'
import removeItemFromBucket from './removeItemFromBucket'
/**
 * Creates a folder for a user inside a bucket by uploading a placeholder file.
 * @param bucketName - The name of the bucket
 * @param userId - The unique user ID (e.g., user UUID)
 * @returns The result of the upload operation or an error
 */
const createUserFolderInBucket = async (
  bucketName: string,
  userId: string,
  type: string
) => {
  try {
    const placeholderFile = new Blob([''], { type: 'text/plain' })
    const fileName = `${userId}/${type}/.placeholder`

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, placeholderFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    await removeItemFromBucket({
      bucketName: 'pictures-and-documents',
      filename: fileName,
      type: type,
      userId: userId
    })
    console.log(`Folder created for user ${userId} in ${bucketName}.`)
    return { data }
  } catch (error) {
    console.error('Error creating user folder:', error)
    return { error }
  }
}

export default createUserFolderInBucket
