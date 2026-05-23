import uploadToUserFolder from './buckets/uploadToUserFolder'
import determineDocumentType from './ocr/determineDocumentType'

import insertToDatabase from './database/insertToDatabase'
import { logAudit } from './database/logAudit'

const determineDocumentTypeAndUpload = async (file: File, userId: string) => {
  try {
    if (!userId) {
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
      await logAudit('DOCUMENT_UPLOAD', `User uploaded ${documentType}: ${fileName}`, userId);
      return { success: true, documentType: documentType, fileName: fileName }
    }
  } catch (error: unknown) {
    console.log(error)

    return { error: error instanceof Error ? error.message : 'Unknown error', success: false }
  }
}

export default determineDocumentTypeAndUpload
