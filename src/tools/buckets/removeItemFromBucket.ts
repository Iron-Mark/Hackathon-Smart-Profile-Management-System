import supabase from '@/client/supabase'

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
    console.log(path)
    const { error } = await supabase.storage.from(bucketName).remove([path])

    if (error) throw error

    console.log('File removed successfully.')
    return true
  } catch (error) {
    console.error('Error removing file:', error)
    return false
  }
}

export default removeItemFromBucket
