import Tesseract from 'tesseract.js'

const extractTextFromImage = async (image: File): Promise<string> => {
  try {
    const {
      data: { text }
    } = await Tesseract.recognize(image, 'eng')

    return text.trim()
  } catch (error) {
    console.error('Tesseract OCR error:', error)
    return 'Error extracting text.'
  }
}

export default extractTextFromImage
