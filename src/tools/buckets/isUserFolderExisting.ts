import supabase from '@/client/supabase'

/**
 * Checks if a user folder exists in the specified bucket.
 * @param bucketName - The name of the bucket
 * @param userId - The unique user ID (e.g., user UUID)
 * @returns Boolean - `true` if the folder exists, `false` if not
 */
const doesUserFolderExist = async (
  bucketName: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(`${userId}/`, { limit: 1 })

    if (error || data.length === 0) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking if user folder exists:', error)
    return false
  }
}

export default doesUserFolderExist
