
import React, { useEffect, useRef } from 'react';
import { Blueprint } from '../types';
import { Sparkles, Check, Copy, Layers, ArrowRight, Image as ImageIcon, Palette, Layout, ClipboardList, Database, HelpCircle, Table as TableIcon, Search, Camera, Sun, Focus, MoveUp, Wind, FileText, Share2, MousePointerClick, Zap, Eye } from 'lucide-react';

interface Props { blueprint: Blueprint; }

const LandingPagePreview: React.FC<Props> = ({ blueprint }) => {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (blueprint) {
      document.title = blueprint.seoTitle;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', blueprint.metaDescription);
    }
  }, [blueprint]);

  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { 
        if (entry.isIntersecting) entry.target.classList.add('active'); 
      });
    }, observerOptions);
    sectionRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [blueprint]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const copyAllContent = () => {
    let fullText = `[MASTER BRAND STRATEGY: ${blueprint.brandName}]\n\n`;
    fullText += `--- BRAND STORY ---\n${blueprint.brandStory}\n\n`;
    fullText += `--- SEO CONFIG ---\nTITLE: ${blueprint.seoTitle}\nDESC: ${blueprint.metaDescription}\nKEYWORDS: ${blueprint.seoKeywords}\n\n`;
    fullText += `--- DESIGN GUIDELINE ---\n${blueprint.globalDesignGuideline}\n\n`;
    
    blueprint.sections.forEach((section, idx) => {
      fullText += `[SECTION ${idx + 1}: ${section.title}]\n`;
      fullText += `ANALYSIS: ${section.detailedAnalysis}\n`;
      section.copySets.forEach((set, i) => {
        fullText += `COPY OPTION ${i+1}: ${set.headline} | ${set.body}\n`;
      });
      fullText += `VISUAL ADVICE: ${section.visualAdvice.imageOrVideo}\n`;
      fullText += `UX INTERACTION: ${section.uxInteraction?.type} - ${section.uxInteraction?.description}\n`;
      fullText += `ANIMATION: ${section.integratedDirective.animation}\n\n`;
    });

    copyToClipboard(fullText, 'copy-all');
  };

  const copyTableAsMarkdown = (items: any[]) => {
    if (!items) return;
    let markdown = "| 특징 항목 | 우리 브랜드 | 일반 경쟁사 |\n| :--- | :--- | :--- |\n";
    items.forEach(item => {
      markdown += `| ${item.feature} | ${item.us} | ${item.competitorA} |\n`;
    });
    copyToClipboard(markdown, 'copy-table');
  };

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4">
      {/* 액션 헤더 */}
      <div className="mb-10 pt-2 reveal-element active">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-[12px] text-white font-black">
              {blueprint.industryType === 'visual' ? <Camera className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{blueprint.brandName}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">High-End Blueprint Architecture</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyAllContent}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black rounded-xl shadow-lg transition-all active:scale-95"
            >
              {copiedId === 'copy-all' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
              전체 기획안 복사
            </button>
            <div className="w-6 h-6 rounded-md shadow-sm border border-slate-200" style={{ backgroundColor: blueprint.primaryColor }} />
          </div>
        </div>

        {/* SEO & 핵심 가이드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="p-4 bg-indigo-900/5 rounded-2xl border border-indigo-100 shadow-sm">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <Search className="w-3 h-3" /> Search Engine Optimization
            </h4>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800 leading-tight">Title: {blueprint.seoTitle}</p>
              <p className="text-[10px] text-slate-500 leading-snug">{blueprint.metaDescription}</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: blueprint.primaryColor }}></div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <Palette className="w-3 h-3 text-slate-300" /> Design Philosophy
            </h4>
            <p className="text-xs font-medium text-slate-700 leading-relaxed">{blueprint.globalDesignGuideline}</p>
          </div>
        </div>
      </div>

      {/* 섹션 리스트 */}
      <div className="space-y-16">
        {blueprint.sections.map((section, index) => (
          <section key={section.sectionId + index} ref={(el) => { sectionRefs.current[index] = el; }} className="reveal-element scroll-mt-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-slate-300">SECTION 0{index + 1}</span>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{section.title}</h3>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 기획 및 카피 영역 */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                     <Zap className="w-24 h-24" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 relative z-10">
                    {section.copySets.map((set, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 group relative transition-all hover:bg-white/10 hover:translate-x-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-black text-indigo-400 tracking-tighter">STRATEGY 0{i+1}</span>
                          <button onClick={() => copyToClipboard(`${set.headline}\n${set.body}`, `${section.sectionId}-${i}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedId === `${section.sectionId}-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-white" />}
                          </button>
                        </div>
                        <h5 className="text-[15px] font-black text-white leading-tight mb-1">{set.headline}</h5>
                        <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{set.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* 비교 표 */}
                  {section.sectionId === 'comparison' && section.comparisonItems && section.comparisonItems.length > 0 && (
                    <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <TableIcon className="w-4 h-4 text-indigo-400" />
                           <span className="text-[10px] font-black text-white uppercase">Competitive Matrix</span>
                        </div>
                        <button 
                          onClick={() => copyTableAsMarkdown(section.comparisonItems || [])}
                          className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === 'copy-table' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          표 복사 (MD)
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left border-collapse">
                          <thead>
                            <tr className="bg-white/10">
                              <th className="px-4 py-3 font-bold text-slate-400">특징</th>
                              <th className="px-4 py-3 font-black text-white bg-indigo-500/10">브랜드</th>
                              <th className="px-4 py-3 font-medium text-slate-500">경쟁사</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {section.comparisonItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/5">
                                <td className="px-4 py-3 text-slate-300">{item.feature}</td>
                                <td className="px-4 py-3 font-bold text-white bg-indigo-500/5">{item.us}</td>
                                <td className="px-4 py-3 text-slate-500">{item.competitorA}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                  <Database className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Strategic Logic</span>
                    <p className="text-[12px] text-indigo-900 font-bold leading-tight">{section.detailedAnalysis}</p>
                  </div>
                </div>
              </div>

              {/* 디자인/인터랙션 가이드 영역 */}
              <div className="lg:col-span-4 space-y-4">
                {/* Motion Architecture 카드 (강조된 애니메이션 제안) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden border-t-4 border-t-indigo-500">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1.5">
                      <Wind className="w-3 h-3" /> Motion Architecture
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                          <Zap className="w-4 h-4" />
                       </div>
                       <p className="text-[12px] font-black text-slate-900 leading-tight">
                         {section.integratedDirective.animation}
                       </p>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 animate-pulse" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>

                {/* UX Interaction Proposal */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MousePointerClick className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Interactive Detail</span>
                  </div>
                  {section.uxInteraction ? (
                    <div className="space-y-3">
                      <div>
                        <h6 className="text-[11px] font-black text-slate-900 mb-1 flex items-center gap-1.5">
                           <Eye className="w-3 h-3 text-indigo-500" />
                           {section.uxInteraction.type}
                        </h6>
                        <p className="text-[11px] text-slate-600 leading-snug">{section.uxInteraction.description}</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Benefit for User</span>
                        <p className="text-[10px] font-bold text-slate-700 leading-tight">{section.uxInteraction.benefit}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic">No interaction proposed.</p>
                  )}
                </div>

                {/* 시각적 가이드 */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5">
                      <Camera className="w-3 h-3" /> Visual Direction
                    </span>
                  </div>
                  <div className="p-5 space-y-5">
                    <div>
                       <h6 className="text-[8px] font-black text-indigo-500 uppercase mb-1.5 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> Asset Concept
                       </h6>
                       <p className="text-[12px] font-black text-slate-900 leading-tight mb-1">{section.visualAdvice.imageOrVideo}</p>
                       <p className="text-[10px] font-medium text-slate-500 leading-snug italic">"{section.visualAdvice.description}"</p>
                    </div>

                    {(blueprint.industryType === 'visual' || section.sectionId === 'gallery') && (
                      <div className="mt-4 p-3 bg-indigo-600 rounded-2xl text-white">
                        <div className="flex items-center gap-2 mb-2">
                           <Sun className="w-3 h-3 text-indigo-200" />
                           <span className="text-[8px] font-black uppercase">Visual Specs</span>
                        </div>
                        <p className="text-[10px] font-bold leading-tight mb-1">L: {section.visualAdvice.lighting || 'N/A'}</p>
                        <p className="text-[10px] font-bold leading-tight">C: {section.visualAdvice.composition || 'N/A'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-20 p-10 rounded-[3rem] bg-slate-900 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: blueprint.primaryColor }}></div>
        <div className="relative z-10">
          <h4 className="text-white text-2xl font-black mb-3 tracking-tight uppercase">Master Architecture Complete</h4>
          <p className="text-slate-400 text-sm mb-10 font-medium max-w-lg mx-auto">Build your premium digital presence using this high-conversion master plan.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-10 py-4 bg-white rounded-2xl font-black text-slate-900 text-[13px] transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-3"
              onClick={() => window.print()}
            >
              Master PDF <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              className="px-10 py-4 bg-indigo-600 rounded-2xl font-black text-white text-[13px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-3"
              onClick={copyAllContent}
            >
              {copiedId === 'copy-all' ? 'Copied!' : 'Copy Structure'} <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPagePreview;
