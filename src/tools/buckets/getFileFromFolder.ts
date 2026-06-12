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
  const bucket = supabase.storage.from(bucketName)

  const { data, error } = await bucket.createSignedUrl(
    filePath,
    60 * 60
  )

  if (data?.signedUrl) {
    return data.signedUrl
  }

  console.error(
    `Error retrieving signed file URL for ${filePath}:`,
    error?.message || 'No signed URL returned'
  )
  return null
}

export default getFileFromFolder
