
import React from 'react';
import { SectionConfig } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface Props {
  sections: SectionConfig[];
  setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>;
}

const SectionSelector: React.FC<Props> = ({ sections, setSections }) => {
  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const enabledCount = sections.filter(s => s.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-2">
        <label className="text-sm font-black text-slate-700 flex items-center gap-2">
          사이트 구성 섹션 마스터 리스트
        </label>
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">
          {enabledCount} / {sections.length} Selected
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 border border-slate-100 p-3 rounded-2xl bg-slate-50/50 max-h-[400px] overflow-y-auto shadow-inner">
        {sections.map(section => (
          <div
            key={section.id}
            onClick={() => toggleSection(section.id)}
            className={`flex items-center gap-2.5 p-3 rounded-xl cursor-pointer transition-all border ${
              section.enabled 
                ? 'bg-white shadow-sm border-indigo-100 ring-1 ring-indigo-50' 
                : 'bg-transparent border-transparent opacity-40 grayscale hover:opacity-70'
            }`}
          >
            {section.enabled ? (
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={`text-[11px] leading-tight break-keep ${section.enabled ? 'font-black text-slate-900' : 'font-bold text-slate-400'}`}>
              {section.name}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 font-medium px-1">
        * 선택된 섹션들을 기반으로 AI가 유기적인 홈페이지 네비게이션을 설계합니다.
      </p>
    </div>
  );
};

export default SectionSelector;
