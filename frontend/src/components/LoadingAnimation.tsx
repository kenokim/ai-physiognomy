import { Loader2, Sparkles } from 'lucide-react'

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
      </div>
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-gray-700 mb-2">
          AI가 당신의 얼굴을 분석하고 있습니다
        </p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          잠시만 기다려주세요...
        </p>
      </div>
    </div>
  )
} 