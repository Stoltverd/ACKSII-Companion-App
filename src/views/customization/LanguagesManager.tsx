import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Settings2, Plus, Trash2 } from 'lucide-react';
import { Language } from '../../types';

export default function LanguagesManager() {
  const { languages, setLanguages } = useAppContext();
  const { alert: showAlert } = useConfirm();

  const [isEditingLanguages, setIsEditingLanguages] = useState(false);
  const [draftLanguages, setDraftLanguages] = useState<(Language & { percentage: number })[]>([]);

  const enterEditMode = () => {
    setDraftLanguages(languages.map(l => ({ ...l, percentage: l.rangeMax - l.rangeMin + 1 })));
    setIsEditingLanguages(true);
  };

  const cancelEditMode = () => {
    setIsEditingLanguages(false);
    setDraftLanguages([]);
  };

  const saveLanguages = () => {
    const sum = draftLanguages.reduce((acc, curr) => acc + curr.percentage, 0);
    if (sum !== 100) {
      showAlert({ title: 'Invalid Total', message: `The total probability must be exactly 100%. Currently it is ${sum}%. Please adjust the values.` });
      return;
    }

    if (draftLanguages.some(l => l.percentage < 0)) {
      showAlert({ title: 'Invalid Negative', message: `All languages must have a probability of at least 0%.` });
      return;
    }
    
    let currentMin = 1;
    const newLanguages = draftLanguages.map(l => {
      const rangeMin = l.percentage > 0 ? currentMin : 0;
      const rangeMax = l.percentage > 0 ? currentMin + l.percentage - 1 : -1;
      if (l.percentage > 0) {
        currentMin = rangeMax + 1;
      }
      return {
        id: l.id,
        name: l.name,
        isDivineOnly: l.isDivineOnly,
        rangeMin,
        rangeMax
      };
    });
    
    setLanguages(newLanguages);
    setIsEditingLanguages(false);
  };

  const handleDraftLanguageChange = (id: string, field: keyof (Language & { percentage: number }), value: any) => {
    setDraftLanguages(prev => prev.map(l => {
      if (l.id === id) {
        let finalValue = value;
        if (field === 'percentage') {
            if (value === '') {
                finalValue = '';
            } else {
                finalValue = Math.min(100, Math.max(0, parseInt(value as any) || 0));
            }
        }
        return { ...l, [field]: finalValue };
      }
      return l;
    }));
  };

  const removeDraftLanguage = (id: string) => {
    setDraftLanguages(prev => prev.filter(l => l.id !== id));
  };

  const addDraftLanguage = () => {
    setDraftLanguages(prev => {
       const newDrafts = [...prev];
       newDrafts.push({
          id: crypto.randomUUID(),
          name: 'New Language',
          isDivineOnly: false,
          rangeMin: 0,
          rangeMax: -1,
          percentage: 0
       });
       return newDrafts;
    });
    showAlert({ id: 'addLanguageWarning', title: 'Language Added', message: "Language added, but has a 0% encounter chance. Allocate space for it." });
  };

  const autoBalanceLanguages = () => {
    setDraftLanguages(prev => {
      const N = prev.length;
      if (N === 0) return prev;
      
      const total = prev.reduce((acc, curr) => acc + Math.max(0, curr.percentage || 0), 0);
      const zeroLangs = prev.filter(l => Math.max(0, l.percentage || 0) === 0);
      const nonZeroLangs = prev.filter(l => Math.max(0, l.percentage || 0) > 0);
      
      if (total === 100 && zeroLangs.length === 0) return prev;
      
      const newDrafts = prev.map(l => ({ ...l, percentage: Math.max(0, l.percentage || 0) }));
      
      if (total === 0 || nonZeroLangs.length === 0) {
        const base = Math.floor(100 / N);
        let remainder = 100 % N;
        newDrafts.forEach(l => {
          l.percentage = base + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder--;
        });
        return newDrafts;
      }
      
      const targetForZero = N <= 100 ? Math.max(1, Math.floor(100 / N)) : 0;
      newDrafts.forEach(l => {
        if (l.percentage === 0) l.percentage = targetForZero;
      });
      
      const spaceForZeroes = zeroLangs.length * targetForZero;
      const remainingSpace = Math.max(0, 100 - spaceForZeroes);
      
      if (remainingSpace === 0) {
        newDrafts.forEach(l => {
          if (nonZeroLangs.find(p => p.id === l.id)) l.percentage = 0;
        });
      } else {
        const originalNonZeroTotal = nonZeroLangs.reduce((acc, curr) => acc + curr.percentage, 0);
        newDrafts.forEach(l => {
          const orig = nonZeroLangs.find(p => p.id === l.id);
          if (orig) {
            const ratio = orig.percentage / originalNonZeroTotal;
            l.percentage = Math.floor(ratio * remainingSpace);
          }
        });
      }
      
      const currentNewTotal = newDrafts.reduce((acc, curr) => acc + curr.percentage, 0);
      let diff = 100 - currentNewTotal;
      
      let cycleIndex = 0;
      while (diff !== 0) {
        const increment = diff > 0 ? 1 : -1;
        let candidates = newDrafts.filter(l => nonZeroLangs.find(p => p.id === l.id));
        let eligible = candidates.filter(c => increment > 0 || c.percentage > 0);
        
        if (eligible.length === 0) {
          eligible = newDrafts.filter(c => increment > 0 || c.percentage > 0);
        }
        if (eligible.length === 0) break;
        
        const targetLang = eligible[cycleIndex % eligible.length];
        targetLang.percentage += increment;
        diff -= increment;
        cycleIndex++;
      }
      
      return newDrafts;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="font-serif text-3xl mb-2 text-main font-semibold">Language Tables</h2>
        <p className="text-muted text-sm">Edit scroll generation language probabilities.</p>
      </header>
      
      <div className="bg-surface border border-app rounded-2xl shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-app">
          <h3 className="font-medium text-lg text-main">Languages</h3>
          {!isEditingLanguages ? (
            <button onClick={enterEditMode} className="flex items-center space-x-1 text-sm bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90">
              <Settings2 size={16} />
              <span>Edit Languages</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={cancelEditMode} className="flex items-center space-x-1 text-sm bg-surface border border-app text-main px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <span>Cancel</span>
              </button>
              {(() => {
                const isValid = draftLanguages.reduce((acc, curr) => acc + (curr.percentage || 0), 0) === 100 && draftLanguages.every(l => l.percentage >= 0);
                return (
                  <button 
                    onClick={saveLanguages} 
                    disabled={!isValid}
                    className={`flex items-center space-x-1 text-sm px-3 py-1.5 rounded-lg transition-colors ${isValid ? 'bg-accent text-white hover:opacity-90' : 'bg-app border-app text-muted cursor-not-allowed opacity-50'}`}
                  >
                    <span>Save Edits</span>
                  </button>
                );
              })()}
            </div>
          )}
        </div>

        {isEditingLanguages && (
          <div className="flex flex-col space-y-3 mb-6">
            <div className="flex justify-between items-end min-h-[32px]">
              <span className="text-sm text-muted">Adjust the probability percentages. Must equal 100%.</span>
              {(() => {
                const total = draftLanguages.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
                const isExactly100 = total === 100;
                const hasNewZeroPercent = draftLanguages.some(l => (l.percentage || 0) === 0 && !languages.some(orig => orig.id === l.id));
                const shouldShowButton = !isExactly100 || hasNewZeroPercent;
                return (
                  <div className="flex items-center space-x-3">
                    {shouldShowButton && (
                      <button
                        onClick={autoBalanceLanguages}
                        className="px-2 py-1 text-xs border border-app rounded bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 text-main font-medium transition-colors shadow-sm"
                      >
                        Auto-balance
                      </button>
                    )}
                    <div className={`text-sm font-medium ${isExactly100 ? 'text-green-500' : 'text-red-500'}`}>
                      Current Total: {total}% / 100%
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-app rounded-full overflow-hidden flex shadow-inner">
              {draftLanguages.map((lang, index) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'];
                const colorClass = colors[index % colors.length];
                const width = `${Math.min(Math.max(lang.percentage || 0, 0), 100)}%`;
                return (
                  <div 
                    key={`bar-${lang.id}`} 
                    style={{ width }} 
                    onClick={(e) => {
                       const inputEl = document.getElementById(`lang-input-${lang.id}`);
                       const cardEl = document.getElementById(`lang-card-${lang.id}`);
                       if (inputEl && cardEl) {
                         cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                         setTimeout(() => inputEl.focus(), 50);
                         
                         cardEl.classList.add('ring-2', 'ring-accent', 'scale-[1.02]', 'shadow-lg');
                         setTimeout(() => {
                           cardEl.classList.remove('ring-2', 'ring-accent', 'scale-[1.02]', 'shadow-lg');
                         }, 400);
                       }
                    }}
                    className={`h-full ${colorClass} transition-all duration-300 ease-in-out border-r border-[#ffffff20] last:border-r-0 cursor-pointer hover:opacity-80`}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                );
              })}
            </div>
            
            <div className="flex justify-end pt-1">
              <button onClick={addDraftLanguage} className="flex items-center space-x-1 text-xs bg-surface border border-app px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm">
                <Plus size={14} />
                <span>Add Language</span>
              </button>
            </div>
          </div>
        )}

        {!isEditingLanguages ? (
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-app rounded-xl border border-app font-medium text-sm text-muted">
              <div className="col-span-4">Language Name</div>
              <div className="col-span-2 text-center">Probability</div>
              <div className="col-span-3 text-center">D100 Range</div>
              <div className="col-span-3 text-center">Constraints</div>
            </div>
            {languages.map(lang => (
              <div key={lang.id} className="grid grid-cols-12 gap-4 px-4 py-3 bg-surface rounded-xl border border-app items-center text-sm">
                <div className="col-span-4 text-main font-medium">{lang.name}</div>
                <div className="col-span-2 text-center text-muted">{lang.rangeMax - lang.rangeMin + 1}%</div>
                <div className="col-span-3 text-center text-muted font-mono bg-app rounded px-1 py-0.5">
                  {lang.rangeMax >= lang.rangeMin ? `${lang.rangeMin} - ${lang.rangeMax}` : 'None'}
                </div>
                <div className="col-span-3 text-center text-muted">
                  {lang.isDivineOnly ? <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md text-xs">Divine Only</span> : <span className="text-gray-400">None</span>}
                </div>
              </div>
            ))}
            <div className="text-right text-xs text-muted pt-2 px-2">
              Total: {languages.reduce((acc, curr) => acc + (curr.rangeMax - curr.rangeMin + 1), 0)}%
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {draftLanguages.map((lang, index) => {
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-orange-500'];
              const colorClass = colors[index % colors.length];
              return (
              <div id={`lang-card-${lang.id}`} key={lang.id} className="flex items-center gap-4 bg-app p-4 rounded-xl border border-app transition-all duration-300 transform">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="flex items-center space-x-1.5 text-xs font-medium text-muted mb-1">
                      <span className={`w-2 h-2 rounded-full ${colorClass}`} />
                      <span>Name</span>
                    </label>
                    <input 
                      id={`lang-input-${lang.id}`}
                      type="text" 
                      value={lang.name} 
                      onChange={e => handleDraftLanguageChange(lang.id, 'name', e.target.value)}
                      className="w-full bg-surface border border-app rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-muted mb-1">Probability (%)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        value={lang.percentage === '' ? '' : (lang.percentage || 0)} 
                        onChange={e => handleDraftLanguageChange(lang.id, 'percentage', e.target.value)}
                        className="w-full bg-surface border border-app rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:border-accent"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">%</span>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex items-center pt-5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={lang.isDivineOnly}
                        onChange={e => handleDraftLanguageChange(lang.id, 'isDivineOnly', e.target.checked)}
                        className="rounded border-app text-accent focus:ring-accent"
                      />
                      <span className="text-sm text-main">Divine Only</span>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={() => removeDraftLanguage(lang.id)}
                  className="text-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors self-end md:self-auto md:mt-5"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
