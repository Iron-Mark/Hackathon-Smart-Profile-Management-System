const inferDocumentCategory = (text: string): string => {
  const normalized = text.toLowerCase();

  if (normalized.includes('certificate')) return 'Certificates';
  if (normalized.includes('prc') || normalized.includes('license')) return 'PRC License';
  if (normalized.includes('valid id') || normalized.includes('identification')) return 'Valid ID';
  if (normalized.includes('resume')) return 'Resume';
  if (normalized.includes('transcript') || normalized.includes('tor')) return 'Transcript of records';
  if (normalized.includes('research') || normalized.includes('publication')) return 'Research Publications';
  if (normalized.includes('diploma') || normalized.includes('degree')) return 'Diplomas';
  if (normalized.includes('curriculum vitae') || normalized.includes('cv')) return 'Curriculum Vitae';

  return 'Certificates';
};

const fallbackResponse = (text: string, instruction: string): string => {
  const normalizedInstruction = instruction.toLowerCase();

  if (normalizedInstruction.includes('json object')) {
    return JSON.stringify({
      type: 'Education',
      title: 'Restored Demo Credential',
      organization: 'University of Makati',
      start_date: '',
      end_date: '',
      details: 'Extracted through local demo fallback.',
    });
  }

  if (
    normalizedInstruction.includes('categorize') ||
    normalizedInstruction.includes('classify') ||
    normalizedInstruction.includes('document type')
  ) {
    return inferDocumentCategory(`${text} ${instruction}`);
  }

  if (
    normalizedInstruction.includes('summary') ||
    normalizedInstruction.includes('biography') ||
    normalizedInstruction.includes('bio')
  ) {
    return 'This faculty professional has a documented academic background and verified credentials that support teaching, mentoring, and academic service.';
  }

  return inferDocumentCategory(`${text} ${instruction}`);
};

export const analyzeDocument = async (text: string, instruction: string = 'Classify this OCR text'): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key missing. Using deterministic demo response.');
    return fallbackResponse(text, instruction);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant. ${instruction}`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const data = await response.json();

    return data.choices?.[0]?.message?.content || fallbackResponse(text, instruction);
  } catch (error) {
    console.error('Error in analyzeDocument:', error);
    return fallbackResponse(text, instruction);
  }
};
