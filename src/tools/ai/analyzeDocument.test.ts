import { expect, test } from 'vitest';
import { analyzeDocument } from './analyzeDocument';

test('returns a valid deterministic document category when OpenAI is not configured', async () => {
  await expect(
    analyzeDocument(
      'Certificate of completion for faculty development',
      'Categorize this document into exactly one of: Certificates, PRC License, Valid ID, Resume, Transcript of records, Research Publications, Diplomas, Curriculum Vitae. Return ONLY the exact category string.'
    )
  ).resolves.toBe('Certificates');
});

test('returns a useful deterministic profile summary when OpenAI is not configured', async () => {
  await expect(
    analyzeDocument(
      'Education: M.S. Information Technology. Work Experience: Assistant Professor.',
      'Generate a professional profile summary in 2-3 sentences based on the following data.'
    )
  ).resolves.toContain('faculty professional');
});
