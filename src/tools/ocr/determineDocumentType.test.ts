import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import determineDocumentType from './determineDocumentType';
import extractTextFromImage from './extractTextFromImage';
import { analyzeDocument } from '@/tools/ai/analyzeDocument';
import { isDemoBackendEnabled } from '@/client/demoBackend';

vi.mock('./extractTextFromImage', () => ({
  default: vi.fn(),
}));

vi.mock('@/tools/ai/analyzeDocument', () => ({
  analyzeDocument: vi.fn(),
}));

vi.mock('@/client/demoBackend', () => ({
  isDemoBackendEnabled: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('classifies uploaded documents through the OpenAI analyzer fallback path', async () => {
  vi.mocked(isDemoBackendEnabled).mockReturnValue(false);
  vi.mocked(extractTextFromImage).mockResolvedValue('Bachelor of Science diploma');
  vi.mocked(analyzeDocument).mockResolvedValue('Diplomas');

  const file = new File(['fake-image'], 'diploma.png', { type: 'image/png' });

  await expect(determineDocumentType(file)).resolves.toBe('Diplomas');
  expect(analyzeDocument).toHaveBeenCalledWith(
    'Bachelor of Science diploma',
    expect.stringContaining('Respond with only the most likely document type')
  );
});

test('does not print extracted OCR text to the browser console', async () => {
  vi.mocked(isDemoBackendEnabled).mockReturnValue(false);
  vi.mocked(extractTextFromImage).mockResolvedValue('Private transcript text');
  vi.mocked(analyzeDocument).mockResolvedValue('Transcript of records');
  const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => undefined);

  const file = new File(['fake-image'], 'transcript.png', { type: 'image/png' });

  await determineDocumentType(file);

  expect(consoleLog).not.toHaveBeenCalledWith('Private transcript text');
});

test('uses a deterministic filename category in local demo mode', async () => {
  vi.mocked(isDemoBackendEnabled).mockReturnValue(true);
  const file = new File(['fake-image'], 'board-exam-certificate.png', { type: 'image/png' });

  await expect(determineDocumentType(file)).resolves.toBe('Certificates');
  expect(extractTextFromImage).not.toHaveBeenCalled();
  expect(analyzeDocument).not.toHaveBeenCalled();
});
