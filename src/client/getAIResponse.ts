import axios from 'axios'

const API_KEY = import.meta.env.VITE_COHERE_KEY
const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/generate',
      {
        model: 'command-r-plus',
        prompt: prompt,
        max_tokens: 15,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    console.log('AI Response', response.data.text)
    return response.data.text
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message)
    return 'Error fetching response.'
  }
}

export default getAIResponse
