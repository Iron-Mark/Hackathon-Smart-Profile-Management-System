import backend from '@/client/backend'

const removeItemFromBucket = async ({
  bucketName,
  filename,
  userId,
  type
}: {
  bucketName: string
  filename: string
  userId: string
  type: string
}): Promise<boolean> => {
  try {
    const path = `${userId}/${type}/${filename}`
    const { error } = await backend.storage.from(bucketName).remove([path])

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error removing file:', error)
    return false
  }
}

export default removeItemFromBucket
