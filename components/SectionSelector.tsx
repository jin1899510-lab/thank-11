
import React, { useState } from 'react';
import { SectionConfig } from '../types';
import { CheckCircle2, Circle, Plus, ListPlus } from 'lucide-react';

interface Props {
  sections: SectionConfig[];
  setSections: React.Dispatch<React.SetStateAction<SectionConfig[]>>;
}

const SectionSelector: React.FC<Props> = ({ sections, setSections }) => {
  const [newSectionName, setNewSectionName] = useState('');

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    
    const newId = `custom-${Date.now()}`;
    const newSection: SectionConfig = {
      id: newId,
      name: `${sections.length + 1}. ${newSectionName.trim()}`,
      enabled: true
    };
    
    setSections(prev => [...prev, newSection]);
    setNewSectionName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSection();
    }
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

      {/* 섹션 추가 입력창 */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="추가할 섹션 키워드 입력 (예: 이벤트 안내)"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          />
          <ListPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        </div>
        <button
          onClick={handleAddSection}
          disabled={!newSectionName.trim()}
          className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 border border-slate-100 p-3 rounded-2xl bg-slate-50/50 max-h-[350px] overflow-y-auto shadow-inner">
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
        * 새로운 섹션을 직접 추가하여 나만의 커스텀 구조를 설계할 수 있습니다.
      </p>
    </div>
  );
};

export default SectionSelector;
