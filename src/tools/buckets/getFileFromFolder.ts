import supabase from '@/client/supabase'

/**
 * Retrieves an image URL from the specified folder and bucket.
 * @param bucketName - The name of the bucket
 * @param folderName - The name of the folder (e.g., userId)
 * @param filename - The filename of the image to retrieve
 * @returns The URL of the image, or null if retrieval fails
 */
const getFileFromFolder = async ({
  bucketName,
  fileName,
  type,
  userId
}: {
  bucketName: string
  fileName: string
  type: string
  userId: string
}): Promise<string | null> => {
  const filePath = `${userId}/${type}/${fileName}`

  const { data } = supabase.storage.from(`${bucketName}`).getPublicUrl(filePath)

  if (!data?.publicUrl) {
    console.error('Error retrieving image')
    return null
  }

  console.log(`Image retrieved successfully: ${data.publicUrl}`)
  return data.publicUrl
}

export default getFileFromFolder