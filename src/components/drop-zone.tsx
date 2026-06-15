import React, { useCallback, useId, useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { ALLOWED_UPLOAD_TYPES, validateUploadFiles } from '@/lib/uploadValidation'

export interface DropZoneProps {
  setData: (files: File[]) => void
  handleSubmit: () => void
  isSubmitting?: boolean
  w?: string
  h?: string
}

const DropZone: React.FC<DropZoneProps> = ({
  setData,
  handleSubmit,
  isSubmitting = false,
  w = 'w-full',
  h = 'h-64'
}) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([])

  const selectedCountLabel =
    files.length === 1 ? '1 file selected' : `${files.length} files selected`

  const handleFiles = useCallback(
    (incomingFiles: File[]) => {
      if (isSubmitting) return

      const { validFiles, errors } = validateUploadFiles(incomingFiles)
      const duplicateFiles = validFiles.filter(file =>
        files.some(existing => existing.name === file.name)
      )
      const uniqueFiles = validFiles.filter(
        file => !files.some(existing => existing.name === file.name)
      )
      const nextMessages = [...errors]

      errors.forEach(error => toast.error(error))

      if (duplicateFiles.length > 0) {
        nextMessages.push('Duplicate files were skipped.')
        toast.warning('Duplicate files were skipped.')
      }

      setFeedbackMessages(nextMessages)

      if (uniqueFiles.length === 0) return

      const updatedFiles = [...files, ...uniqueFiles]
      setFiles(updatedFiles)
      setData(updatedFiles)
    },
    [files, isSubmitting, setData]
  )

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsDragging(true)
  }, [isSubmitting])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(Array.from(e.dataTransfer.files))
    },
    [handleFiles]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(e.target.files || []))
    e.target.value = ''
  }

  const handleRemove = (index: number) => {
    if (isSubmitting) return

    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    setFeedbackMessages([])

    if (typeof setData === 'function') {
      setData(updatedFiles)
    }
  }

  const handleUploadClick = () => {
    if (files.length === 0 || isSubmitting) {
      return
    }

    if (typeof setData === 'function') {
      setData(files)
      handleSubmit()
      setFiles([])
    } else {
      console.error('setData is not a function')
    }
  }

  return (
    <section
      aria-label='Smart upload'
      className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4 p-4 overflow-auto ${w} ${h} ${
        isDragging
          ? 'bg-blue-50 border-green-600 dark:bg-blue-950/50 dark:border-green-400'
          : 'bg-card border-border'
      } transition-[background-color,border-color,box-shadow] duration-200 ease-out`}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className='flex flex-col items-center justify-center gap-4 text-center'>
        <div className='flex items-center justify-center w-16 h-16 bg-green-100 rounded-full dark:bg-green-950/60'>
          <UploadCloud className='h-8 w-8 text-amber-600 dark:text-amber-300' />
        </div>
        <p className='text-muted-foreground'>
          {files.length > 0 ? (
            <span className='text-green-700 font-semibold dark:text-green-300'>
              {selectedCountLabel}
            </span>
          ) : (
            'Drag and drop sample files here.'
          )}
        </p>
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Supported: JPG, PNG, GIF, SVG, PDF, DOC, or DOCX sample files up to 2 MB.
        </p>
      </div>
      <input
        ref={inputRef}
        id={inputId}
        type='file'
        className='hidden'
        multiple
        disabled={isSubmitting}
        accept={ALLOWED_UPLOAD_TYPES.join(',')}
        onChange={handleFileInputChange}
      />

      <button
        type='button'
        onClick={() => inputRef.current?.click()}
        disabled={isSubmitting}
        className='inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30'
      >
        Browse files
      </button>

      {feedbackMessages.length > 0 && (
        <div
          className='w-full rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200'
          role='alert'
        >
          <ul className='space-y-1'>
            {feedbackMessages.map(message => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className='flex flex-col gap-2 w-full'>
          {files.map((file, index) => (
            <div
              key={index}
              className='flex min-h-11 items-center justify-between gap-2 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground'
            >
              <div className='truncate w-full' title={file.name}>
                {file.name}
              </div>
              <button
                type='button'
                aria-label={`Remove ${file.name}`}
                disabled={isSubmitting}
                onClick={e => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className='inline-flex size-11 shrink-0 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-100 hover:text-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/50 dark:hover:text-red-200'
              >
                <X className='h-4 w-4' aria-hidden='true' />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type='button'
        disabled={files.length === 0 || isSubmitting}
        onClick={e => {
          e.stopPropagation()
          handleUploadClick()
        }}
        className='inline-flex min-h-11 w-full items-center justify-center rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:w-auto dark:bg-green-500 dark:text-green-950 dark:hover:bg-green-400'
      >
        <span aria-live='polite'>
          {isSubmitting ? 'Processing files...' : 'Submit files'}
        </span>
      </button>
    </section>
  )
}

export default DropZone
