import { useState, useCallback } from 'react'
import { Camera, Upload, Sparkles, ArrowRight } from 'lucide-react'
import ImageUpload from './components/ImageUpload'
import AnalysisResult from './components/AnalysisResult'
import LoadingAnimation from './components/LoadingAnimation'

export interface PhysiognomyResult {
  success: boolean
  animal: string
  similarity: number
  characteristics: string[]
  personality: string
  strengths: string[]
  recommendations: string[]
  error?: string
}

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<PhysiognomyResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file)
    setAnalysisResult(null)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [])

  const handleAnalyze = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedImage)

      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      setAnalysisResult({
        success: false,
        animal: '',
        similarity: 0,
        characteristics: [],
        personality: '',
        strengths: [],
        recommendations: [],
        error: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setPreviewUrl(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-yellow-300 mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              물형관상 AI
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-300 ml-3" />
          </div>
          <p className="text-xl text-blue-100 mb-6">
            AI가 분석하는 동물 관상학
          </p>
          <p className="text-blue-200 max-w-2xl mx-auto">
            얼굴 사진을 업로드하면 AI가 닮은 동물을 찾아 성격과 특징을 분석해드립니다
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!analysisResult ? (
            <div className="card p-8">
              <div className="text-center mb-8">
                <Camera className="w-16 h-16 text-primary-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  얼굴 사진을 업로드해주세요
                </h2>
                <p className="text-gray-600">
                  명확하게 얼굴이 보이는 사진을 선택해주세요
                </p>
              </div>

              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                previewUrl={previewUrl}
              />

              {selectedImage && (
                <div className="text-center mt-8">
                  {isAnalyzing ? (
                    <LoadingAnimation />
                  ) : (
                    <button
                      onClick={handleAnalyze}
                      className="btn-primary inline-flex items-center text-lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      물형관상 분석하기
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <AnalysisResult
              result={analysisResult}
              previewUrl={previewUrl}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-blue-200 text-sm">
            본 서비스는 재미를 위한 것으로, 실제 성격 분석과는 다를 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App 