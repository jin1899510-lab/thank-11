
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
         - 'imageOrVideo': 구체적인 촬영 대상 (예: "지글거리는 한우 등심의 육즙 클로즈업")
         - 'description': 사진의 전체적인 무드와 색감 (예: "따뜻한 텅스텐 조명, 블랙 톤의 고급스러운 배경")
         - 'lighting': 구체적인 조명 가이드 (예: "자연광 80% + 간접 조명 20%")
         - 'composition': 추천 구도 (예: "45도 탑샷, 아웃포커싱 적용")
    ` 
    : `[일반 비즈니스 규칙] 전문성과 신뢰감을 주는 비주얼과 카피를 제안하세요.`;

  const prompt = `
    당신은 세계 최고의 브랜딩 기획자이자 SEO 및 UX/UI 모션 그래픽 전문가입니다. 
    제공된 [원본 데이터]와 [키워드: ${seoKeywords}]를 바탕으로 고퀄리티 홈페이지 기획서를 작성하세요.

    ${visualPromptAddon}

    [애니메이션 및 UX 지침]
    각 섹션의 'integratedDirective.animation' 필드에 단순히 애니메이션 이름만 적지 말고, 섹션의 역할에 최적화된 구체적인 모션을 제안하세요:
    - **Fade-in**: 신뢰와 여백의 미가 필요한 섹션 (철학, 푸터 등)
    - **Slide-up**: 정보가 아래에서 위로 흐르며 상승감을 주는 섹션 (히어로, 스토리 등)
    - **Slide-left/right**: 좌우 대조가 필요한 비교 섹션이나 가로 리스트
    - **Zoom-in**: 강력한 시각적 임팩트가 필요한 섹션 (상품 특징, 갤러리 메인 등)
    - **Staggered-reveal**: 리스트 형태의 정보가 순차적으로 등장하여 리듬감을 주는 방식 (메뉴, 상품 리스트, 리뷰 등)
    - **Parallax**: 스크롤 깊이감을 주는 웅장한 섹션 (브랜드 스토리 배경 등)
    형식 예시: "Slide-up (브랜드의 성장 가치를 시각적으로 전달하며 시선이 위로 향하게 유도)"

    [인터랙션(uxInteraction) 규칙]
    각 섹션마다 사용자의 참여를 유도하는 구체적인 마이크로 인터랙션을 제안하세요.
    - 예: "Hover Detail (마우스 오버 시 원재료의 산지 정보가 툴팁으로 노출)", "Click to Expand (클릭 시 오너의 육성 메시지 팝업 노출)"

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
