import { RefreshCw, Heart, Star, Lightbulb, AlertCircle } from 'lucide-react'
import { PhysiognomyResult } from '../App'

interface AnalysisResultProps {
  result: PhysiognomyResult
  previewUrl: string | null
  onReset: () => void
}

export default function AnalysisResult({ result, previewUrl, onReset }: AnalysisResultProps) {
  if (!result.success) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">분석 실패</h2>
          <p className="text-red-600 mb-6">{result.error}</p>
          <button onClick={onReset} className="btn-primary">
            다시 시도하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <div className="card p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">분석 결과</h2>
          <p className="text-gray-600">AI가 분석한 당신의 물형관상</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Image */}
          {previewUrl && (
            <div className="text-center">
              <img
                src={previewUrl}
                alt="분석된 이미지"
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Animal Result */}
          <div className="text-center md:text-left">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-primary-600 mb-2">
                🐾 {result.animal}
              </h3>
              <div className="flex items-center justify-center md:justify-start mb-4">
                <div className="bg-primary-100 rounded-full px-4 py-2">
                  <span className="text-primary-700 font-semibold">
                    유사도: {result.similarity}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={onReset}
                className="btn-secondary inline-flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 분석하기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Characteristics */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Star className="w-6 h-6 text-yellow-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">동물의 특징</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {result.characteristics.map((characteristic, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <span className="text-gray-700">{characteristic}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personality */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Heart className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">성격 분석</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">{result.personality}</p>
      </div>

      {/* Strengths */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Star className="w-6 h-6 text-green-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">당신의 장점</h3>
        </div>
        <div className="space-y-2">
          {result.strengths.map((strength, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="w-6 h-6 text-blue-500 mr-2" />
          <h3 className="text-xl font-bold text-gray-800">인생 조언</h3>
        </div>
        <div className="space-y-3">
          {result.recommendations.map((recommendation, index) => (
            <div key={index} className="bg-blue-50 rounded-lg p-4">
              <span className="text-blue-800">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 