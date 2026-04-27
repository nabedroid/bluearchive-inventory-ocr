import React, { useCallback, useRef } from 'react'

interface ImageUploaderProps {
  files: File[]
  onFilesSelected: (files: File[]) => void
  onRemoveFile: (index: number) => void
}

export function ImageUploader({ files, onFilesSelected, onRemoveFile }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')) as File[]
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }, [onFilesSelected])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[]
      onFilesSelected(files)
      e.target.value = '' // Reset
    }
  }

  return (
    <div className="image-uploader">
      <div
        className="drop-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>画像をドラッグ＆ドロップ、またはクリックして選択</p>
        <span className="hint">複数枚のスクリーンショットをアップロードして、重複を自動排除できます。</span>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <div className="image-preview-list">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="preview-item">
              <span className="file-name">{file.name}</span>
              <button
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveFile(index)
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
