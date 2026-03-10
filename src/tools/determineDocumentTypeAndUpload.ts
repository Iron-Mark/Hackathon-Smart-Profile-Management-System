import uploadToUserFolder from './buckets/uploadToUserFolder'
import determineDocumentType from './ocr/determineDocumentType'
import { useUserId } from '@/hooks/use-userId'

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
      return { success: true, documentType: documentType, fileName: fileName }
    }
  } catch (error: any) {
    console.log(error)

    return { error: error.message, success: false }
  }
}

export default determineDocumentTypeAndUpload
