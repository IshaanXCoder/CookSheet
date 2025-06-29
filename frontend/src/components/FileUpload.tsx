'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploadProps {
  onDataUpload: (data: any[], headers: string[], backendResponse?: any) => void
  dataType?: string // 'clients', 'workers', 'tasks'
}

export default function FileUpload({ onDataUpload, dataType }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true)
    setUploadStatus('Uploading and processing file with AI...')

    try {
      // Create FormData to send file to backend
      const formData = new FormData()
      formData.append('file', file)

      // Send to backend for AI processing
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Extract data and headers from backend response
      const { data, headers, mapped_headers, validation_preview, suggestions } = result
      
      // Pass the data and full backend response to parent
      onDataUpload(data, headers, result)
      
      setUploadStatus(`✅ Successfully processed ${data.length} rows with AI insights`)
      
      // Show some of the AI insights
      if (suggestions && suggestions.length > 0) {
        console.log('AI Suggestions:', suggestions)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`❌ Error uploading file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [onDataUpload])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0])
    }
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-blue-600 text-sm">Processing with AI...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">
              {dataType === 'clients' ? '📋' : dataType === 'workers' ? '👥' : dataType === 'tasks' ? '📝' : '📊'}
            </div>
            {isDragActive ? (
              <p className="text-blue-600">Drop the {dataType || 'file'} here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag and drop a CSV or Excel file here, or click to select
                </p>
                <p className="text-sm text-gray-400">
                  Supports .csv, .xlsx, and .xls files • AI processing included
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      {uploadStatus && (
        <div className={`p-3 rounded-md ${
          uploadStatus.includes('✅') 
            ? 'bg-green-50 text-green-800' 
            : 'bg-red-50 text-red-800'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  )
} 