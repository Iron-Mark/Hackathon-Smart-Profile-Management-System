import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import DropZone from './drop-zone';
import { MAX_UPLOAD_BYTES } from '@/lib/uploadValidation';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
});

const file = (name: string, type: string, size = 100) =>
  new File([new Uint8Array(size)], name, { type });

function setupDropZone(props: Partial<React.ComponentProps<typeof DropZone>> = {}) {
  const setData = vi.fn();
  const handleSubmit = vi.fn();
  const view = render(
    <DropZone setData={setData} handleSubmit={handleSubmit} {...props} />
  );
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;

  return { ...view, input, setData, handleSubmit };
}

describe('DropZone', () => {
  test('keeps submit disabled until a valid file is selected', () => {
    setupDropZone();

    expect(screen.getByRole('button', { name: 'Submit files' })).toBeDisabled();
  });

  test('shows selected files and enables the primary upload action', () => {
    const { input, setData } = setupDropZone();

    fireEvent.change(input, {
      target: { files: [file('sample-certificate.svg', 'image/svg+xml')] },
    });

    expect(screen.getByText('1 file selected')).toBeInTheDocument();
    expect(screen.getByText('sample-certificate.svg')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit files' })).toBeEnabled();
    expect(setData).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'sample-certificate.svg' }),
    ]);
  });

  test('keeps validation errors visible near the uploader', () => {
    const { input } = setupDropZone();

    fireEvent.change(input, {
      target: {
        files: [
          file('notes.txt', 'text/plain'),
          file('large-certificate.png', 'image/png', MAX_UPLOAD_BYTES + 1),
        ],
      },
    });

    expect(
      screen.getByText('notes.txt is not supported. Use JPG, PNG, GIF, SVG, PDF, DOC, or DOCX sample files.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('large-certificate.png is too large. Use a sample file up to 2 MB.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit files' })).toBeDisabled();
  });

  test('shows duplicate feedback without adding the same file twice', () => {
    const { input, setData } = setupDropZone();
    const selectedFile = file('sample-certificate.svg', 'image/svg+xml');

    fireEvent.change(input, { target: { files: [selectedFile] } });
    fireEvent.change(input, { target: { files: [selectedFile] } });

    expect(screen.getByText('Duplicate files were skipped.')).toBeInTheDocument();
    expect(screen.getAllByText('sample-certificate.svg')).toHaveLength(1);
    expect(setData).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'sample-certificate.svg' }),
    ]);
  });

  test('removes a selected file with an accessible action', () => {
    const { input, setData } = setupDropZone();

    fireEvent.change(input, {
      target: {
        files: [
          file('sample-certificate.svg', 'image/svg+xml'),
          file('sample-transcript.svg', 'image/svg+xml'),
        ],
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove sample-certificate.svg' }));

    expect(screen.queryByText('sample-certificate.svg')).not.toBeInTheDocument();
    expect(screen.getByText('sample-transcript.svg')).toBeInTheDocument();
    expect(setData).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'sample-transcript.svg' }),
    ]);
  });

  test('locks upload controls while files are submitting', () => {
    const { input } = setupDropZone({ isSubmitting: true });

    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Processing files...' })).toBeDisabled();
    expect(screen.getByText('Processing files...')).toHaveAttribute('aria-live', 'polite');
  });
});
