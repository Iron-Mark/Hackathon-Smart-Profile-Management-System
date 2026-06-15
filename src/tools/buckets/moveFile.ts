import backend from '@/client/backend'

const moveFile = async ({
  bucketName,
  oldType,
  newType,
  filename,
  userId,
}: {
  bucketName: string
  oldType: string
  newType: string
  filename: string
  userId: string
}): Promise<boolean> => {
  try {

    const { data, error: downloadError } = await backend.storage
      .from(bucketName)
      .download(`${userId}/${oldType}/${filename}`)

    if (downloadError) throw downloadError

    const { error: uploadError } = await backend.storage
      .from(bucketName)
      .upload(`${userId}/${newType}/${filename}`, data!, {
        upsert: true
      })

    if (uploadError) throw uploadError

    const { error: deleteError } = await backend.storage
      .from(bucketName)
      .remove([`${userId}/${oldType}/${filename}`])

    if (deleteError) throw deleteError

    return true
  } catch (error) {
    console.error('Error moving file:', error)
    return false
  }
}

export default moveFile
