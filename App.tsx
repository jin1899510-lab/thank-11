
import React, { useState, useEffect, useRef } from 'react';
import { SECTIONS, SectionConfig, Blueprint } from './types';
import { generateBlueprint, testConnection } from './services/geminiService';
import SectionSelector from './components/SectionSelector';
import LandingPagePreview from './components/LandingPagePreview';
import { Loader2, Sparkles, Send, FileUp, Palette, Wand2, Globe, Info, X, FileText, UploadCloud, Map, Key, AlertCircle, RefreshCcw, Camera, Briefcase, ShieldCheck, Zap, ArrowRight, ExternalLink } from 'lucide-react';

const STYLES = ['고급스러움', '전문적인/기업형', '레트로/빈티지', '귀여운/친근한', '미니멀/모던'];

const App: React.FC = () => {
  const [brandName, setBrandName] = useState('');
  const [userInput, setUserInput] = useState('');
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
    "데이터 정밀 분석 중...",
    "업종별 비주얼 포인트 도출 중...",
    "섹션별 카피 전략 생성 중...",
    "최종 마스터 플랜 검토 중..."
  ];

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) {
          setIsVerifying(true);
          const ok = await testConnection();
          setHasApiKey(ok);
          setIsVerifying(false);
        }
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % loadingMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      setErrorStatus(null);
      await window.aistudio.openSelectKey();
      setIsVerifying(true);
      const isConnected = await testConnection();
      setIsVerifying(false);

      if (isConnected) {
        setHasApiKey(true);
      } else {
        setErrorStatus("API 키 연결에 실패했습니다. 유료 프로젝트의 키를 선택했는지 확인해주세요.");
        setHasApiKey(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!userInput && !file && !brandName) {
      alert("데이터를 입력해주세요.");
      return;
    }
    if (!hasApiKey) {
      setErrorStatus("API 키를 먼저 연결해주세요.");
      handleSelectKey();
      return;
    }
    
    setLoading(true);
    setErrorStatus(null);
    try {
      const result = await generateBlueprint(
        userInput, sections, primaryColor, selectedStyle, "", brandName, 
        file ? { mimeType: file.mimeType, data: file.data } : undefined,
        "", industryType
      );
      setBlueprint(result);
    } catch (error: any) {
      setErrorStatus("기획서 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfcfc]">
      <aside className="w-full md:w-[450px] bg-white border-r border-slate-200 p-8 overflow-y-auto max-h-screen sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <Map className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">AI Architect</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Master Blueprint v2.1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasApiKey && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-200 text-[10px] font-black">
                <ShieldCheck className="w-3.5 h-3.5" /> CONNECTED
              </div>
            )}
            <button 
              onClick={handleSelectKey}
              className={`p-2.5 rounded-xl border transition-all ${hasApiKey ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white text-slate-400'}`}
              title="API 키 설정"
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {errorStatus && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-black text-rose-900">{errorStatus}</p>
              <button onClick={handleSelectKey} className="text-[10px] font-black text-rose-600 underline mt-1">다시 연결</button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <label className="block text-xs font-black text-slate-700 mb-4 uppercase tracking-widest">업종 성격</label>
            <div className="flex gap-2">
              <button onClick={() => setIndustryType('general')} className={`flex-1 py-3 rounded-xl border transition-all ${industryType === 'general' ? 'bg-white border-indigo-200 shadow-sm text-indigo-600' : 'bg-transparent border-transparent opacity-50'}`}>일반</button>
              <button onClick={() => setIndustryType('visual')} className={`flex-1 py-3 rounded-xl border transition-all ${industryType === 'visual' ? 'bg-white border-indigo-200 shadow-sm text-indigo-600' : 'bg-transparent border-transparent opacity-50'}`}>비주얼</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">브랜드 명칭</label>
            <input type="text" className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none font-bold focus:bg-white transition-all" placeholder="예: 우미남 명지" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">참조 자료</label>
            {!file ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                <UploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-[10px] font-bold text-slate-400">PDF, 이미지 업로드</span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <span className="text-xs font-bold text-indigo-700 truncate">{file.name}</span>
                <button onClick={() => setFile(null)}><X className="w-4 h-4 text-indigo-500" /></button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">상세 데이터</label>
            <textarea className="w-full h-40 p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none resize-none font-medium leading-relaxed focus:bg-white transition-all" placeholder="브랜드 정보를 입력하세요." value={userInput} onChange={(e) => setUserInput(e.target.value)} />
          </div>

          <SectionSelector sections={sections} setSections={setSections} />

          <button onClick={handleGenerate} disabled={loading} className={`w-full py-6 text-white font-black rounded-3xl transition-all shadow-xl ${loading ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
            {loading ? <div className="flex flex-col items-center"><Loader2 className="animate-spin w-5 h-5 mb-1" /><span className="text-[10px]">{loadingMessages[loadingStep]}</span></div> : <div className="flex items-center justify-center gap-2"><Send className="w-5 h-5" /> 기획서 생성</div>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 bg-[#fcfcfc]">
        {!hasApiKey && !blueprint && (
          <div className="max-w-3xl mx-auto mb-16 animate-in zoom-in-95 duration-700">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-10 border border-white/20">
                  <Zap className="w-10 h-10 text-white fill-white" />
                </div>
                <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">AI Master Planning<br/>지금 바로 활성화하세요</h2>
                <p className="text-indigo-100 text-lg font-bold mb-12 max-w-md">Vercel 배포 버전은 사용자의 Google API 키를 통해 작동합니다. 안전하게 연결하고 독점적인 기획 환경을 구축하세요.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleSelectKey} className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <Key className="w-6 h-6" /> API 키 연결
                  </button>
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="px-8 py-5 bg-black/20 backdrop-blur-sm border border-white/10 text-white rounded-2xl font-black text-sm flex items-center gap-2">API 키 발급 안내 <ExternalLink className="w-4 h-4" /></a>
                </div>
              </div>
            </div>
          </div>
        )}

        {blueprint ? <LandingPagePreview blueprint={blueprint} /> : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center mb-10 shadow-inner ${hasApiKey ? 'bg-indigo-50' : 'bg-slate-100'}`}>
              <Map className={`w-14 h-14 ${hasApiKey ? 'text-indigo-400' : 'text-slate-300'}`} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Strategic AI Navigator</h2>
            <p className="text-lg text-slate-400 font-bold max-w-xl">
              {hasApiKey ? "기획 데이터를 입력하고 기획서 생성을 클릭하세요." : "배너를 클릭하여 API 키를 연결하면 모든 기능이 활성화됩니다."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
