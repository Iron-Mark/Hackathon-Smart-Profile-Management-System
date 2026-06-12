export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export const ALLOWED_UPLOAD_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const SUPPORTED_LABEL = 'JPG, PNG, GIF, SVG, PDF, DOC, or DOCX';

export function validateUploadFiles(files: File[]) {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      errors.push(`${file.name} is not supported. Use ${SUPPORTED_LABEL} sample files.`);
      continue;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      errors.push(`${file.name} is too large. Use a sample file up to 2 MB.`);
      continue;
    }

    validFiles.push(file);
  }

  return { validFiles, errors };
}
