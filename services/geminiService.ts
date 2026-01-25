
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
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "ping",
    });
    return !!response.text;
  } catch (error) {
    console.error("API Key Verification Failed:", error);
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
  // 호출 직전에 인스턴스 생성하여 주입된 키가 즉시 반영되도록 함
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const enabledSections = selectedSections.filter(s => s.enabled);
  const visualPromptAddon = industryType === 'visual' 
    ? `[비주얼 업종 특화] 사진 구도, 조명, 색감 정보를 visualAdvice에 상세히 포함하세요.` 
    : `[일반 비즈니스] 전문성과 신뢰도를 높이는 카피 위주로 구성하세요.`;

  const prompt = `
    당신은 세계 최고의 UX 기획자입니다.
    제공된 데이터와 키워드(${seoKeywords})를 바탕으로 고퀄리티 홈페이지 기획서를 작성하세요.
    ${visualPromptAddon}
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
                  visualAdvice: {
                    type: Type.OBJECT,
                    properties: { 
                      imageOrVideo: { type: Type.STRING }, 
                      description: { type: Type.STRING }, 
                      lighting: { type: Type.STRING },
                      composition: { type: Type.STRING }
                    }
                  },
                  integratedDirective: {
                    type: Type.OBJECT,
                    properties: {
                      animation: { type: Type.STRING },
                      buttonStyle: { type: Type.STRING },
                      typography: { type: Type.STRING }
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
    if (!result) throw new Error("No response from AI");

    const blueprint = JSON.parse(extractJson(result)) as Blueprint;
    blueprint.primaryColor = primaryColor;
    blueprint.selectedStyle = selectedStyle;
    blueprint.industryType = industryType;
    
    return blueprint;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
