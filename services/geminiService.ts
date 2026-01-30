
import { GoogleGenAI, Type } from "@google/genai";
import { Blueprint, SectionConfig } from "../types";

// 간단한 키 난독화 처리 (로컬 저장용)
export const keyManager = {
  save: (key: string) => {
    const encoded = btoa(key).split('').reverse().join('');
    localStorage.setItem('_aimb_vault', encoded);
  },
  load: (): string | null => {
    const encoded = localStorage.getItem('_aimb_vault');
    if (!encoded) return null;
    try {
      return atob(encoded.split('').reverse().join(''));
    } catch {
      return null;
    }
  },
  clear: () => localStorage.removeItem('_aimb_vault')
};

const extractJson = (text: string): string => {
  const codeBlockRegex = /```json\s?([\s\S]*?)\s?```/;
  const match = text.match(codeBlockRegex);
  if (match) return match[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0].trim();
  return text.trim();
};

export const testConnection = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // 무료 키에서도 잘 작동하는 경량 모델로 테스트
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Connection Test",
    });
    return !!response.text;
  } catch (error) {
    console.error("Connection Test Error:", error);
    return false;
  }
};

export const generateBlueprint = async (
  apiKey: string,
  userInput: string,
  selectedSections: SectionConfig[],
  primaryColor: string,
  selectedStyle: string,
  brandName?: string,
  fileData?: { mimeType: string; data: string },
  industryType: 'general' | 'visual' = 'general'
): Promise<Blueprint> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const visualPromptAddon = industryType === 'visual' 
    ? `[비주얼 특화 업종] 구도(composition), 조명(lighting), 톤앤매너를 시각적으로 구체화하세요.` 
    : `[일반 비즈니스] 논리적인 설득과 전문성 있는 카피 위주로 구성하세요.`;

  const prompt = `
    당신은 세계적인 UX 전략가입니다.
    브랜드명: ${brandName || '미지정'}
    입력 데이터: ${userInput}
    선택된 섹션: ${selectedSections.filter(s => s.enabled).map(s => s.name).join(', ')}
    스타일: ${selectedStyle}
    주요 색상: ${primaryColor}

    ${visualPromptAddon}
    
    위 데이터를 바탕으로 고퀄리티 홈페이지 기획서를 작성하세요. 
    반드시 한국어로, 제공된 JSON 스키마에 맞춰 응답하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // 무료/유료 범용성이 가장 높은 모델 사용
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
                    properties: { type: Type.STRING, description: { type: Type.STRING }, benefit: { type: Type.STRING } }
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
                    properties: { animation: { type: Type.STRING }, buttonStyle: { type: Type.STRING }, typography: { type: Type.STRING } }
                  }
                },
                required: ["sectionId", "title", "copySets", "detailedAnalysis", "visualAdvice", "integratedDirective"]
              }
            }
          },
          required: ["brandName", "brandStory", "seoTitle", "metaDescription", "globalDesignGuideline", "sections"]
        }
      }
    });

    const blueprint = JSON.parse(extractJson(response.text)) as Blueprint;
    blueprint.primaryColor = primaryColor;
    blueprint.selectedStyle = selectedStyle;
    blueprint.industryType = industryType;
    return blueprint;
  } catch (error) {
    console.error("Generation Error:", error);
    throw error;
  }
};
