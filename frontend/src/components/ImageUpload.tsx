import { useRef, useState } from 'react'
import { Upload, X, Camera } from 'lucide-react'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  selectedImage: File | null
  previewUrl: string | null
}

export default function ImageUpload({ onImageSelect, selectedImage, previewUrl }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    } else {
      alert('이미지 파일만 업로드 가능합니다.')
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemove = () => {
    onImageSelect(null as any)
  }

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
            ${dragOver 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">
            사진을 드래그하거나 클릭해서 업로드
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG, GIF 파일 지원 (최대 10MB)
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={previewUrl}
              alt="업로드된 이미지"
              className="w-full max-w-md mx-auto block rounded-xl shadow-md"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {selectedImage && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                파일명: {selectedImage.name}
              </p>
              <p className="text-xs text-gray-500">
                크기: {(selectedImage.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleFileSelect(file)
          }
        }}
        className="hidden"
      />
    </div>
  )
} 