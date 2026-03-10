import React, { useState, useCallback } from 'react'
import { UploadCloud } from 'lucide-react'
import { toast } from 'sonner'

interface DropZoneProps {
  setData: (files: File[]) => void
  handleSubmit: () => void
  w?: string
  h?: string
}

const DropZone: React.FC<DropZoneProps> = ({
  setData,
  handleSubmit,
  w = 'w-full',
  h = 'h-64'
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])

  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const droppedFiles = Array.from(e.dataTransfer.files)
      const invalidFiles = droppedFiles.filter(
        file => !allowedFileTypes.includes(file.type)
      )

      if (invalidFiles.length > 0) {
        toast.error(
          'Some files are not supported. Please upload documents or photos only.'
        )
        return
      }

      const uniqueFiles = droppedFiles.filter(
        file => !files.some(existing => existing.name === file.name)
      )

      if (uniqueFiles.length < droppedFiles.length) {
        toast.warning('Duplicate files were skipped.')
      }

      if (uniqueFiles.length > 0) {
        const updatedFiles = [...files, ...uniqueFiles]
        setFiles(updatedFiles)
        setData(updatedFiles)
      }
    },
    [files, setData]
  )

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const invalidFiles = selectedFiles.filter(
      file => !allowedFileTypes.includes(file.type)
    )

    if (invalidFiles.length > 0) {
      toast.error(
        'Some files are not supported. Please upload documents or photos only.'
      )
      return
    }

    const uniqueFiles = selectedFiles.filter(
      file => !files.some(existing => existing.name === file.name)
    )

    if (uniqueFiles.length < selectedFiles.length) {
      toast.warning('Duplicate files were skipped.')
    }

    const updatedFiles = [...files, ...uniqueFiles]
    setFiles(updatedFiles)
    setData(updatedFiles)
  }

  const handleRemove = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)

    if (typeof setData === 'function') {
      setData(updatedFiles)
    }
  }
  const handleUploadClick = () => {
    if (files.length === 0) {
      toast.error('No files to upload. Please add files before submitting.')
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
    <div
      className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 p-4 overflow-auto ${w} ${h} ${
        isDragging
          ? 'bg-blue-200 border-green-500 scale-105'
          : 'bg-white border-gray-300'
      } transition-all duration-300 ease-in-out cursor-pointer`}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className='flex flex-col items-center justify-center gap-4 animate-fade-in'>
        <div className='flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-bounce-slow'>
          <UploadCloud className='h-8 w-8 text-amber-400' />
        </div>
        <p className='text-gray-600 text-center'>
          {files.length > 0 ? (
            <span className='text-green-600 font-semibold'>
              {files.length} file(s) selected
            </span>
          ) : (
            <>
              Drag and drop files here, or
              <label
                htmlFor='file-upload'
                className='text-green-600 underline cursor-pointer ml-1'
              >
                browse
              </label>
              .
            </>
          )}
        </p>
      </div>
      <input
        id='file-upload'
        type='file'
        className='hidden'
        multiple
        onChange={handleFileInputChange}
      />

      {files.length > 0 && (
        <div className='flex flex-col gap-2 w-full'>
          {files.map((file, index) => (
            <div
              key={index}
              className='flex items-center justify-between bg-gray-100 border border-gray-300 rounded px-3 py-1 text-sm text-gray-700'
            >
              <div className='truncate w-full' title={file.name}>
                {file.name}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleRemove(index)
                }}
                className='ml-2 px-1 text-red-500 hover:text-red-700 font-bold'
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={e => {
          e.stopPropagation()
          handleUploadClick()
        }}
        className='mt-4 bg-green-400 text-white px-4 py-2 rounded hover:bg-green-500'
      >
        Submit
      </button>
    </div>
  )
}

export default DropZone
