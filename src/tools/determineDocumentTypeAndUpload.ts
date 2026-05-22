import uploadToUserFolder from './buckets/uploadToUserFolder'
import determineDocumentType from './ocr/determineDocumentType'
import { useUserId } from '@/hooks/use-userId'
import insertToDatabase from './database/insertToDatabase'

const determineDocumentTypeAndUpload = async (file: File) => {
  try {
    const { userId, success } = await useUserId()
    if (!userId || !success) {
      return { error: `user ID does not exist`, success: true }
    }
    const documentType = await determineDocumentType(file)
    const fileName = file.name
    console.log(documentType, fileName)
    const response = await uploadToUserFolder({
      bucketName: 'pictures-and-documents',
      file: file,
      type: documentType,
      filename: fileName,
      userId: userId
    })
    if (response.success) {
      // Record submission in database for admin approval
      await insertToDatabase({
        table: 'submissions',
        data: {
          user_id: userId,
          document_type: documentType,
          file_name: fileName,
          status: 'Pending',
          submitted_at: new Date().toISOString()
        }
      })
      return { success: true, documentType: documentType, fileName: fileName }
    }
  } catch (error: any) {
    console.log(error)

    return { error: error.message, success: false }
  }
}

export default determineDocumentTypeAndUpload
