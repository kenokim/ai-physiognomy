import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface PhysiognomyResult {
  success: boolean;
  animal: string;
  similarity: number;
  characteristics: string[];
  personality: string;
  strengths: string[];
  recommendations: string[];
  error?: string;
}

// 얼굴 감지를 위한 기본적인 이미지 유효성 검사
async function validateFaceImage(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // 기본적인 이미지 크기 검증 (너무 작거나 큰 이미지 제외)
    if (!metadata.width || !metadata.height) return false;
    if (metadata.width < 100 || metadata.height < 100) return false;
    if (metadata.width > 4000 || metadata.height > 4000) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function analyzePhysiognomy(imageBuffer: Buffer, mimeType: string): Promise<PhysiognomyResult> {
  try {
    // 이미지 유효성 검사
    const isValidImage = await validateFaceImage(imageBuffer);
    if (!isValidImage) {
      return {
        success: false,
        animal: '',
        similarity: 0,
        characteristics: [],
        personality: '',
        strengths: [],
        recommendations: [],
        error: '유효하지 않은 이미지입니다. 얼굴이 명확히 보이는 사진을 업로드해주세요.'
      };
    }

    // 이미지를 base64로 변환
    const base64Image = imageBuffer.toString('base64');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
당신은 물형관상(동물 관상) 전문가입니다. 업로드된 사진을 분석하여 다음 요구사항에 따라 결과를 제공해주세요:

1. 먼저 이 사진이 실제 사람의 얼굴 사진인지 확인해주세요.
2. 얼굴 사진이 맞다면, 이 사람과 가장 닮은 동물을 찾아주세요.
3. 해당 동물의 특징을 바탕으로 물형관상을 분석해주세요.

**얼굴 사진이 아닌 경우**: "얼굴 사진이 아닙니다"라고만 응답해주세요.

**얼굴 사진인 경우**: 다음 JSON 형식으로 응답해주세요:
{
  "isface": true,
  "animal": "닮은 동물 이름 (한국어)",
  "similarity": 85,
  "characteristics": [
    "동물의 특징 1",
    "동물의 특징 2",
    "동물의 특징 3"
  ],
  "personality": "이 동물의 특징을 바탕으로 한 성격 분석 (2-3문장)",
  "strengths": [
    "장점 1",
    "장점 2",
    "장점 3"
  ],
  "recommendations": [
    "인생 조언 1",
    "인생 조언 2",
    "인생 조언 3"
  ]
}

분석 시 긍정적이고 건설적인 관점에서 해석해주세요. 동물의 좋은 특징들을 위주로 설명하되, 균형 잡힌 시각을 유지해주세요.
`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // 얼굴 사진이 아닌 경우 체크
    if (responseText.includes('얼굴 사진이 아닙니다') || responseText.includes('얼굴이 아닙니다')) {
      return {
        success: false,
        animal: '',
        similarity: 0,
        characteristics: [],
        personality: '',
        strengths: [],
        recommendations: [],
        error: '얼굴 사진이 아닙니다. 얼굴이 명확히 보이는 사진을 업로드해주세요.'
      };
    }

    // JSON 응답 파싱
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON 형식의 응답을 찾을 수 없습니다.');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      if (!analysis.isface) {
        return {
          success: false,
          animal: '',
          similarity: 0,
          characteristics: [],
          personality: '',
          strengths: [],
          recommendations: [],
          error: '얼굴 사진이 아닙니다. 얼굴이 명확히 보이는 사진을 업로드해주세요.'
        };
      }

      return {
        success: true,
        animal: analysis.animal || '알 수 없는 동물',
        similarity: analysis.similarity || 0,
        characteristics: analysis.characteristics || [],
        personality: analysis.personality || '',
        strengths: analysis.strengths || [],
        recommendations: analysis.recommendations || []
      };

    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return {
        success: false,
        animal: '',
        similarity: 0,
        characteristics: [],
        personality: '',
        strengths: [],
        recommendations: [],
        error: '분석 결과를 처리하는 중 오류가 발생했습니다.'
      };
    }

  } catch (error) {
    console.error('물형관상 분석 오류:', error);
    return {
      success: false,
      animal: '',
      similarity: 0,
      characteristics: [],
      personality: '',
      strengths: [],
      recommendations: [],
      error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
  }
} 