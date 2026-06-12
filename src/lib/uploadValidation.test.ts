import { describe, expect, test } from 'vitest';
import { MAX_UPLOAD_BYTES, validateUploadFiles } from './uploadValidation';

const file = (name: string, type: string, size = 100) =>
  new File(['x'.repeat(size)], name, { type });

describe('upload validation', () => {
  test('accepts supported demo credential files within the size limit', () => {
    const result = validateUploadFiles([
      file('sample-certificate.svg', 'image/svg+xml'),
      file('sample-diploma.png', 'image/png'),
    ]);

    expect(result.validFiles).toHaveLength(2);
    expect(result.errors).toEqual([]);
  });

  test('rejects unsupported files and files over the public demo limit', () => {
    const result = validateUploadFiles([
      file('notes.txt', 'text/plain'),
      file('large-certificate.png', 'image/png', MAX_UPLOAD_BYTES + 1),
    ]);

    expect(result.validFiles).toEqual([]);
    expect(result.errors).toEqual([
      'notes.txt is not supported. Use JPG, PNG, GIF, SVG, PDF, DOC, or DOCX sample files.',
      'large-certificate.png is too large. Use a sample file up to 2 MB.',
    ]);
  });
});
