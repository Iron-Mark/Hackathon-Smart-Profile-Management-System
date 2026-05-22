import OpenAI from 'openai';

export const analyzeDocument = async (text: string, instruction: string = 'Classify this OCR text'): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key missing. Using mock response.');
    if (instruction.toLowerCase().includes('summary')) {
        return 'Mock Summary: A highly motivated professional with extensive experience and a solid educational background, constantly seeking to leverage technology to solve complex problems and drive innovation.';
    }
    return 'Mock Classification: Research Paper (Confidence: 95%)';
  }

  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Allowed since this is a frontend Vite app
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant. ${instruction}`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 250,
    });

    return response.choices[0]?.message?.content || 'No output generated';
  } catch (error) {
    console.error('Error in analyzeDocument:', error);
    return 'Error generating response from AI';
  }
};
