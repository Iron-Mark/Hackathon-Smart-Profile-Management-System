import { analyzeDocument } from '@/tools/ai/analyzeDocument'
import { isDemoSupabaseEnabled } from '@/client/demoSupabase'
import extractTextFromImage from './extractTextFromImage'

const inferDemoDocumentType = (fileName: string): string => {
  const normalized = fileName.toLowerCase()

  if (normalized.includes('certificate')) return 'Certificates'
  if (normalized.includes('prc') || normalized.includes('license')) return 'PRC License'
  if (normalized.includes('valid-id') || normalized.includes('id')) return 'Valid ID'
  if (normalized.includes('resume')) return 'Resume'
  if (normalized.includes('transcript') || normalized.includes('tor')) return 'Transcript of records'
  if (normalized.includes('research') || normalized.includes('publication')) return 'Research Publications'
  if (normalized.includes('diploma')) return 'Diplomas'
  if (normalized.includes('cv') || normalized.includes('curriculum')) return 'Curriculum Vitae'

  return 'Certificates'
}

const determineDocumentType = async (image: File): Promise<string> => {
  if (image) {
    try {
      if (isDemoSupabaseEnabled()) {
        return inferDemoDocumentType(image.name)
      }

      const textFromImage = await extractTextFromImage(image)
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

      const response = await analyzeDocument(textFromImage, prompt)
      return response
    } catch (error: any) {
      console.error('Document type detection failed:', error?.message || error)
    }
  }
  return 'image undefined'
}

export default determineDocumentType
