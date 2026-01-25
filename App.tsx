
import React, { useState, useEffect, useRef } from 'react';
import { SECTIONS, SectionConfig, Blueprint } from './types';
import { generateBlueprint, testConnection } from './services/geminiService';
import SectionSelector from './components/SectionSelector';
import LandingPagePreview from './components/LandingPagePreview';
import { Loader2, Sparkles, Send, FileUp, Palette, Wand2, Globe, Info, MessageSquarePlus, X, FileText, UploadCloud, Map, Key, AlertCircle, RefreshCcw, Camera, Briefcase, CheckCircle2, ShieldCheck } from 'lucide-react';

const STYLES = ['고급스러움', '전문적인/기업형', '레트로/빈티지', '귀여운/친근한', '미니멀/모던'];

const App: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [userInput, setUserInput] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [sections, setSections] = useState<SectionConfig[]>(SECTIONS);
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [industryType, setIndustryType] = useState<'general' | 'visual'>('general');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [file, setFile] = useState<{ mimeType: string; data: string; name: string } | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "데이터 및 파일 내용 정밀 분석 중...",
    "업종별 비주얼 강조 포인트 도출 중...",
    "섹션별 3가지 카피 및 촬영 시나리오 생성 중...",
    "조명, 구도, 색감 등 사진 전략 기획 중...",
    "최종 마스터 플랜 검토 및 출력 준비 중..."
  ];

  // 초기 로드 시 키 연결 여부 확인
  useEffect(() => {
    const checkInitialKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const isSelected = await window.aistudio.hasSelectedApiKey();
        if (isSelected) {
          // 이미 키가 선택되어 있다면 검증 시도
          setIsVerifying(true);
          const ok = await testConnection();
          setHasApiKey(ok);
          setIsVerifying(false);
          if (!ok) {
            setErrorStatus("이전에 연결된 API 키가 유효하지 않습니다. 다시 설정해주세요.");
          }
        }
      }
    };
    checkInitialKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      setErrorStatus(null);
      await window.aistudio.openSelectKey();
      
      // 키 선택 창이 닫힌 후 즉시 연결 테스트 실행
      setIsVerifying(true);
      const isConnected = await testConnection();
      setIsVerifying(false);

      if (isConnected) {
        setHasApiKey(true);
        setErrorStatus(null);
      } else {
        setErrorStatus("API 키 연결에 실패했습니다. 유효한 API 키인지, 혹은 유료 프로젝트인지 확인 후 다시 시도해주세요.");
        setHasApiKey(false);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setFile({ mimeType: selectedFile.type, data: base64, name: selectedFile.name });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!userInput && !file && !brandName) {
      alert("브랜드명 또는 원본 데이터를 입력하거나 파일을 업로드해주세요.");
      return;
    }

    if (!hasApiKey) {
      setErrorStatus("기획서를 생성하려면 API 키 연결이 완료되어야 합니다.");
      handleSelectKey();
      return;
    }
    
    setLoading(true);
    setErrorStatus(null);
    
    try {
      const result = await generateBlueprint(
        userInput,
        sections,
        primaryColor,
        selectedStyle,
        seoKeywords,
        brandName,
        file ? { mimeType: file.mimeType, data: file.data } : undefined,
        additionalInstructions,
        industryType
      );
      setBlueprint(result);
    } catch (error: any) {
      console.error("Blueprint generation failed:", error);
      const errorMsg = error.message || "";
      
      if (errorMsg.includes("Requested entity was not found")) {
        setErrorStatus("선택하신 API 키에 Pro 모델 사용 권한이 없습니다. 유료 프로젝트의 API 키를 선택해주세요.");
        setHasApiKey(false);
      } else if (errorMsg.includes("429")) {
        setErrorStatus("API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setErrorStatus("기획서 생성 중 오류가 발생했습니다. API 연결 상태를 확인하고 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfcfc]">
      <aside className="w-full md:w-[450px] bg-white border-r border-slate-200 p-8 overflow-y-auto max-h-screen sticky top-0 z-20 shadow-sm scrollbar-thin">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl shadow-lg shadow-slate-200">
              <Map className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Architect</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Blueprint v2.1</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasApiKey ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-200 text-[10px] font-black shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" /> CONNECTED
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-full border border-slate-100 text-[10px] font-black">
                NOT CONNECTED
              </div>
            )}
            <button 
              onClick={handleSelectKey}
              className={`p-2.5 rounded-xl transition-all border ${hasApiKey ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'}`}
              title="API 키 설정"
              disabled={isVerifying}
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {errorStatus && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-black text-rose-900 leading-relaxed mb-2">{errorStatus}</p>
              <button 
                onClick={handleSelectKey} 
                className="text-[10px] font-black text-white bg-rose-500 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-rose-600 transition-colors shadow-sm"
              >
                <RefreshCcw className="w-3 h-3" /> API 키 다시 연결하기
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
            <label className="block text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              업종 성격 설정
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIndustryType('general')}
                className={`flex-1 py-3 px-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                  industryType === 'general' ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-50' : 'bg-transparent border-transparent grayscale opacity-50 hover:opacity-80'
                }`}
              >
                <Briefcase className={`w-5 h-5 ${industryType === 'general' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-black ${industryType === 'general' ? 'text-slate-900' : 'text-slate-500'}`}>일반 비즈니스</span>
              </button>
              <button
                onClick={() => setIndustryType('visual')}
                className={`flex-1 py-3 px-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${
                  industryType === 'visual' ? 'bg-white border-indigo-200 shadow-md ring-2 ring-indigo-50' : 'bg-transparent border-transparent grayscale opacity-50 hover:opacity-80'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${industryType === 'visual' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-black ${industryType === 'visual' ? 'text-slate-900' : 'text-slate-500'}`}>맛집/펜션/카페</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              브랜드 명칭
            </label>
            <input
              type="text"
              className="w-full p-4 text-sm border border-slate-100 rounded-2xl bg-slate-50 outline-none font-bold focus:ring-2 focus:ring-indigo-100 transition-all focus:bg-white"
              placeholder="예: 우미남 명지 (최고급 한우 숙성 전문점)"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              참조 기획 자료
            </label>
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer group transition-all"
              >
                <FileUp className="w-8 h-8 text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-400">PDF, 이미지 등 자료 업로드 (선택)</span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold text-indigo-700 truncate">{file.name}</span>
                </div>
                <button onClick={removeFile} className="p-1.5 hover:bg-indigo-200 rounded-full transition-colors">
                  <X className="w-4 h-4 text-indigo-500" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              브랜드 상세 데이터 (텍스트)
            </label>
            <textarea
              className="w-full h-40 p-4 text-sm border border-slate-100 rounded-2xl bg-slate-50 outline-none resize-none font-medium leading-relaxed focus:bg-white transition-all shadow-inner"
              placeholder="메뉴/서비스 정보, 창업 철학, 주요 특징 등을 자세히 입력해주세요."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </div>

          <SectionSelector sections={sections} setSections={setSections} />

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              시각적 무드 (톤앤매너)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-2.5 text-[10px] font-black rounded-xl border transition-all ${
                    selectedStyle === style ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-7 text-white font-black rounded-[2.5rem] transition-all flex flex-col items-center justify-center shadow-2xl active:scale-95 group mt-10 border-t-4 ${
              loading ? 'bg-slate-700 border-slate-500' : 'bg-slate-900 border-indigo-500 hover:bg-slate-800'
            }`}
          >
            {loading ? (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>마스터 기획안 작성 중...</span>
                </div>
                <span className="text-[10px] text-indigo-300 font-medium animate-pulse tracking-wide">{loadingMessages[loadingStep]}</span>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                <span className="text-lg">기획서 생성하기</span>
              </div>
            )}
          </button>
        </div>
        <div className="h-20" />
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 relative bg-[#fcfcfc]">
        {blueprint ? <LandingPagePreview blueprint={blueprint} /> : (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <div className="w-32 h-32 bg-slate-100 rounded-[3.5rem] flex items-center justify-center mb-10 shadow-inner group">
              <Map className="w-14 h-14 text-slate-300 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight uppercase">Strategic AI Navigator</h2>
            <p className="text-lg text-slate-400 font-bold leading-relaxed max-w-xl mx-auto">
              브랜드 데이터를 입력하고 독점적인 마스터 플랜을 설계하세요.<br/>
              <span className="text-indigo-500">API 키가 연결된 상태에서 모든 기능이 활성화됩니다.</span>
            </p>
            {!hasApiKey && (
              <button 
                onClick={handleSelectKey}
                className="mt-8 flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:scale-105 transition-transform"
              >
                <Key className="w-4 h-4" /> 지금 API 키 연결하기
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
