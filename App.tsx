
import React, { useState, useEffect, useRef } from 'react';
import { SECTIONS, SectionConfig, Blueprint } from './types';
import { generateBlueprint, testConnection, keyManager } from './services/geminiService';
import SectionSelector from './components/SectionSelector';
import LandingPagePreview from './components/LandingPagePreview';
import { Loader2, Sparkles, Send, FileUp, Palette, X, FileText, UploadCloud, Map, Key, AlertCircle, RefreshCcw, ShieldCheck, Zap, ExternalLink, Shield } from 'lucide-react';

const STYLES = ['고급스러움', '전문적인/기업형', '레트로/빈티지', '귀여운/친근한', '미니멀/모던'];

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeyValid, setIsKeyValid] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
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
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = ["데이터 분석 중...", "비주얼 포인트 도출 중...", "섹션별 카피 생성 중...", "최종 검토 중..."];

  // 초기 키 로드
  useEffect(() => {
    const savedKey = keyManager.load();
    if (savedKey) {
      setApiKey(savedKey);
      validateAndSetKey(savedKey);
    }
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

  const validateAndSetKey = async (key: string) => {
    if (!key) return;
    setIsVerifying(true);
    const isValid = await testConnection(key);
    setIsVerifying(false);
    if (isValid) {
      setIsKeyValid(true);
      keyManager.save(key);
      setErrorStatus(null);
    } else {
      setIsKeyValid(false);
      setErrorStatus("유효하지 않은 API 키입니다. 키를 확인해주세요.");
    }
  };

  const handleKeySubmit = () => {
    if (apiKey.trim()) {
      validateAndSetKey(apiKey.trim());
    }
  };

  const handleClearKey = () => {
    keyManager.clear();
    setApiKey('');
    setIsKeyValid(false);
  };

  const handleGenerate = async () => {
    if (!userInput && !file && !brandName) {
      alert("데이터를 입력해주세요.");
      return;
    }
    if (!isKeyValid) {
      setErrorStatus("API 키를 먼저 올바르게 연결해주세요.");
      return;
    }
    
    setLoading(true);
    setErrorStatus(null);
    try {
      const result = await generateBlueprint(
        apiKey, userInput, sections, primaryColor, selectedStyle, brandName, 
        file ? { mimeType: file.mimeType, data: file.data } : undefined,
        industryType
      );
      setBlueprint(result);
    } catch (error: any) {
      setErrorStatus("기획서 생성 중 오류가 발생했습니다. 키 권한이나 네트워크를 확인해주세요.");
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
      {/* 사이드바 */}
      <aside className="w-full md:w-[420px] bg-white border-r border-slate-200 p-8 overflow-y-auto max-h-screen sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-xl">
              <Map className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none mb-1">AI Architect</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Master Blueprint v2.5</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isKeyValid ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-200 text-[9px] font-black">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURE
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-500 rounded-full border border-rose-100 text-[9px] font-black">
                <Shield className="w-3.5 h-3.5" /> LOCKED
              </div>
            )}
          </div>
        </div>

        {!isKeyValid ? (
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-3xl animate-in fade-in slide-in-from-top-4">
            <label className="block text-xs font-black text-slate-700 mb-3 uppercase tracking-tighter flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-indigo-500" /> GEMINI API KEY REQUIRED
            </label>
            <div className="flex gap-2 mb-3">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 p-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="AI Studio 키 입력"
              />
              <button 
                onClick={handleKeySubmit}
                disabled={isVerifying || !apiKey}
                className="px-4 bg-indigo-600 text-white rounded-xl font-black text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "연결"}
              </button>
            </div>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-bold">
              무료 키 발급받기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <div className="mb-8 flex justify-between items-center px-4 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
             <div className="flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-indigo-500" />
               <span className="text-[10px] font-black text-indigo-900 uppercase">Key Connected</span>
             </div>
             <button onClick={handleClearKey} className="text-[9px] font-bold text-indigo-400 hover:text-rose-500 uppercase tracking-tighter">Reset</button>
          </div>
        )}

        <div className="space-y-8">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <label className="block text-xs font-black text-slate-700 mb-4 uppercase tracking-widest">업종 성격</label>
            <div className="flex gap-2">
              <button onClick={() => setIndustryType('general')} className={`flex-1 py-3 rounded-xl border transition-all text-xs font-black ${industryType === 'general' ? 'bg-white border-indigo-200 shadow-sm text-indigo-600' : 'bg-transparent border-transparent opacity-50'}`}>일반 비즈니스</button>
              <button onClick={() => setIndustryType('visual')} className={`flex-1 py-3 rounded-xl border transition-all text-xs font-black ${industryType === 'visual' ? 'bg-white border-indigo-200 shadow-sm text-indigo-600' : 'bg-transparent border-transparent opacity-50'}`}>비주얼 강조형</button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">브랜드 명칭</label>
            <input type="text" className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 outline-none font-bold focus:bg-white transition-all text-sm" placeholder="예: 우미남 명지" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">참조 기획 자료</label>
            {!file ? (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all">
                <UploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-[10px] font-bold text-slate-400">PDF, 이미지 업로드 (선택)</span>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <span className="text-xs font-bold text-indigo-700 truncate">{file.name}</span>
                <button onClick={() => setFile(null)}><X className="w-4 h-4 text-indigo-500" /></button>
              </div>
            )}
          </div>

          <SectionSelector sections={sections} setSections={setSections} />

          <button 
            onClick={handleGenerate} 
            disabled={loading || !isKeyValid} 
            className={`w-full py-6 text-white font-black rounded-3xl transition-all shadow-xl glow-button ${loading ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:shadow-none'}`}
          >
            {loading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin w-5 h-5 mb-1" />
                <span className="text-[10px]">{loadingMessages[loadingStep]}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> 기획서 생성하기
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* 메인 뷰포트 */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20 bg-[#fcfcfc] flex flex-col items-center">
        {errorStatus && (
          <div className="max-w-2xl w-full mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-900 animate-in zoom-in-95">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
            <p className="text-sm font-bold leading-tight">{errorStatus}</p>
          </div>
        )}

        {blueprint ? <LandingPagePreview blueprint={blueprint} /> : (
          <div className="h-full flex flex-col items-center justify-center text-center py-20">
            <div className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center mb-10 shadow-inner transition-colors duration-500 ${isKeyValid ? 'bg-indigo-50 animate-pulse' : 'bg-slate-100'}`}>
              <Map className={`w-14 h-14 ${isKeyValid ? 'text-indigo-400' : 'text-slate-200'}`} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Master Architect</h2>
            <p className="text-lg text-slate-400 font-bold max-w-lg mb-10">
              {isKeyValid 
                ? "보안 연결이 활성화되었습니다. 사이드바에 데이터를 입력하여 최고급 기획안을 도출하세요." 
                : "Vercel 배포 버전의 기획 기능을 활성화하려면 본인의 Google API 키가 필요합니다."}
            </p>
            
            {!isKeyValid && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                 <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-left">
                   <Zap className="w-5 h-5 text-amber-500 mb-3" />
                   <h4 className="text-sm font-black mb-2 text-slate-900">무료 키 지원</h4>
                   <p className="text-xs text-slate-500 font-medium">Gemini 1.5 Flash 무료 키만으로도 고퀄리티 기획이 가능합니다.</p>
                 </div>
                 <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-left">
                   <ShieldCheck className="w-5 h-5 text-indigo-500 mb-3" />
                   <h4 className="text-sm font-black mb-2 text-slate-900">로컬 암호화</h4>
                   <p className="text-xs text-slate-500 font-medium">키값은 브라우저의 보안 저장소에만 남으며 서버로 전송되지 않습니다.</p>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
