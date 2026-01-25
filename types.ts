
export interface SectionConfig {
  id: string;
  name: string;
  enabled: boolean;
}

export interface CopyOptionSet {
  headline: string;
  body: string;
}

export interface NavItem {
  label: string;
  link: string;
}

export interface ProductItem {
  name: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ComparisonItem {
  feature: string;
  us: string;
  competitorA: string;
}

export interface IntegratedDirective {
  animation: string;
  buttonStyle: string;
  typography: string;
  divider: string;
  layoutStrategy: string;
  compositionAndShapes: string; 
}

export interface VisualAdvice {
  imageOrVideo: string;
  description: string;
  motionEffect: string;
  lighting?: string; 
  composition?: string; 
}

export interface GeneratedContent {
  sectionId: string;
  title: string;
  copySets: CopyOptionSet[];
  detailedAnalysis: string;
  visualAdvice: VisualAdvice;
  integratedDirective: IntegratedDirective;
  faqItems?: FAQItem[];
  comparisonItems?: ComparisonItem[];
  uxInteraction?: {
    type: string;
    description: string;
    benefit: string;
  }; // 추가: 사용자 참여 유도 인터랙션 제안
}

export interface Blueprint {
  brandName: string;
  brandStory: string;
  globalDesignGuideline: string; 
  primaryColor: string;
  selectedStyle: string;
  industryType: 'general' | 'visual';
  seoKeywords: string;
  seoTitle: string;
  metaDescription: string;
  sections: GeneratedContent[];
}

export const SECTIONS: SectionConfig[] = [
  { id: 'navbar', name: '1. 네비게이션 바', enabled: true },
  { id: 'hero', name: '2. 히어로 섹션', enabled: true },
  { id: 'philosophy', name: '3. 오너의 철학 (신뢰/전문성)', enabled: true },
  { id: 'product-feature', name: '4. 상품 소개 (비주얼 중심)', enabled: true },
  { id: 'story', name: '5. 브랜드 스토리 (감성 중심)', enabled: true },
  { id: 'signature-menu', name: '6. 메뉴/시그니처/객실 상세', enabled: true },
  { id: 'problem-solution', name: '7. 문제 & 해결', enabled: true },
  { id: 'unique-solution', name: '8. 우리만의 차별점', enabled: true },
  { id: 'review', name: '9. 고객 리얼 후기', enabled: true },
  { id: 'cta', name: '10. 요약 & CTA', enabled: true },
  { id: 'faq', name: '11. 자주하는 질문', enabled: true },
  { id: 'comparison', name: '12. 제품/서비스 비교', enabled: true },
  { id: 'gallery', name: '13. 비주얼 갤러리 (캐러셀/비디오/무드보드)', enabled: true },
  { id: 'footer', name: '14. 푸터', enabled: true },
];
