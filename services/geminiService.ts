
import { GoogleGenAI, Type } from "@google/genai";
import { Blueprint, SectionConfig } from "../types";

const extractJson = (text: string): string => {
  const codeBlockRegex = /```json\s?([\s\S]*?)\s?```/;
  const match = text.match(codeBlockRegex);
  if (match) return match[1].trim();

  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0].trim();

  return text.trim();
};

/**
 * API 키 연결 테스트용 함수
 * 간단한 응답을 요청하여 키의 유효성과 권한을 확인합니다.
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    // window.aistudio에서 주입한 최신 API 키 사용
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Connection Test. Reply with 'OK'.",
    });
    return !!response.text;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const generateBlueprint = async (
  userInput: string,
  selectedSections: SectionConfig[],
  primaryColor: string,
  selectedStyle: string,
  seoKeywords: string,
  brandName?: string,
  fileData?: { mimeType: string; data: string },
  additionalInstructions?: string,
  industryType: 'general' | 'visual' = 'general'
): Promise<Blueprint> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const enabledSections = selectedSections.filter(s => s.enabled);
  const activeSectionNames = enabledSections.map(s => `${s.id}(${s.name})`);

  const visualPromptAddon = industryType === 'visual' 
    ? `
      [비주얼 업종 특화 규칙 - 맛집/펜션/카페 등]
      1. 사진이 텍스트보다 중요합니다. 각 섹션의 'visualAdvice'에는 다음 항목을 필수 포함하세요:
         - 'imageOrVideo': 구체적인 촬영 대상
         - 'description': 사진의 무드와 색감
         - 'lighting': 조명 가이드
         - 'composition': 추천 구도
    ` 
    : `[일반 비즈니스 규칙] 전문성과 신뢰감을 주는 비주얼과 카피를 제안하세요.`;

  const prompt = `
    당신은 세계 최고의 브랜딩 기획자이자 SEO 및 UX/UI 전문가입니다. 
    제공된 [원본 데이터]와 [키워드: ${seoKeywords}]를 바탕으로 고퀄리티 홈페이지 기획서를 작성하세요.

    ${visualPromptAddon}

    [애니메이션 및 UX 지침]
    각 섹션의 'integratedDirective.animation' 필드에 Fade-in, Slide-up, Zoom-in, Parallax 중 하나를 선택해 이유와 함께 적으세요.

    [인터랙션(uxInteraction) 규칙]
    각 섹션마다 사용자의 참여를 유도하는 구체적인 마이크로 인터랙션을 제안하세요.

    [핵심 규칙]
    1. **누락 금지**: 선택된 섹션들을 반드시 포함하세요.
    2. **비교 섹션(comparison)**: 반드시 'comparisonItems' 데이터를 생성하세요.
    3. **3 Copy Sets**: 각 섹션당 3가지의 카피 전략을 제안하세요.

    응답은 반드시 지정된 JSON 포맷으로 한국어로만 출력하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: fileData 
        ? { parts: [{ text: prompt }, { inlineData: fileData }] } 
        : prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            brandStory: { type: Type.STRING },
            seoTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            globalDesignGuideline: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  copySets: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT,
                      properties: { headline: { type: Type.STRING }, body: { type: Type.STRING } },
                      required: ["headline", "body"]
                    }
                  },
                  detailedAnalysis: { type: Type.STRING },
                  uxInteraction: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                      benefit: { type: Type.STRING }
                    },
                    required: ["type", "description", "benefit"]
                  },
                  comparisonItems: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { feature: { type: Type.STRING }, us: { type: Type.STRING }, competitorA: { type: Type.STRING } }
                    }
                  },
                  faqItems: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } }
                    }
                  },
                  visualAdvice: {
                    type: Type.OBJECT,
                    properties: { 
                      imageOrVideo: { type: Type.STRING }, 
                      description: { type: Type.STRING }, 
                      motionEffect: { type: Type.STRING },
                      lighting: { type: Type.STRING },
                      composition: { type: Type.STRING }
                    }
                  },
                  integratedDirective: {
                    type: Type.OBJECT,
                    properties: {
                      animation: { type: Type.STRING },
                      buttonStyle: { type: Type.STRING },
                      typography: { type: Type.STRING },
                      divider: { type: Type.STRING },
                      layoutStrategy: { type: Type.STRING },
                      compositionAndShapes: { type: Type.STRING }
                    }
                  }
                },
                required: ["sectionId", "title", "copySets", "detailedAnalysis", "visualAdvice", "integratedDirective", "uxInteraction"]
              }
            }
          },
          required: ["brandName", "brandStory", "seoTitle", "metaDescription", "globalDesignGuideline", "sections"]
        }
      }
    });

    const result = response.text;
    if (!result) throw new Error("AI로부터 응답을 받지 못했습니다.");

    const cleanedJson = extractJson(result);
    const blueprint = JSON.parse(cleanedJson) as Blueprint;
    
    blueprint.primaryColor = primaryColor;
    blueprint.selectedStyle = selectedStyle;
    blueprint.seoKeywords = seoKeywords;
    blueprint.industryType = industryType;
    
    return blueprint;
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};
