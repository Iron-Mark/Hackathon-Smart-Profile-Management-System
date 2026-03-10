import getAIResponse from '@/client/getAIResponse'
import extractTextFromImage from './extractTextFromImage'

const determineDocumentType = async (image: File): Promise<string> => {
  if (image) {
    try {
      const textFromImage = await extractTextFromImage(image)
      console.log(textFromImage)
      const prompt = `The following is OCR text extracted from a document:

                ${textFromImage}
              
                Based on the content, identify the most likely document type from the following options:
                - Curriculum Vitae
                - PRC License
                - Resume
                - Valid ID
                - Diplomas
                - Transcript of records
                - Certificates
                - Research Publications

                Respond with only the most likely document type. Keep your answer short. if it does not belong to any respond 'Others' `

      const response = await getAIResponse(prompt)
      return response
    } catch (error: any) {
      console.log(error)
    }
  }
  return 'image undefined'
}

export default determineDocumentType
