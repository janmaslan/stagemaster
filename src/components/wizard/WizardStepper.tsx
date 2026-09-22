import React from 'react';
import { 
  Music, 
  Cable, 
  Zap, 
  Sliders, 
  Volume2, 
  CheckSquare, 
  RotateCcw 
} from 'lucide-react';

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

interface WizardStepperProps {
  currentStep: WizardStep;
  onSelectStep: (step: WizardStep) => void;
  bandName: string;
  onUpdateBandName: (name: string) => void;
  onResetAll: () => void;
}

const STEPS: { step: WizardStep; label: string; icon: React.FC<{ className?: string }> }[] = [
  { step: 1, label: 'Nástroje', icon: Music },
  { step: 2, label: 'Signál & DI', icon: Cable },
  { step: 3, label: 'Elektřina', icon: Zap },
  { step: 4, label: 'XR18 Vstupy', icon: Sliders },
  { step: 5, label: 'PA & Odposlech', icon: Volume2 },
  { step: 6, label: 'Tahák', icon: CheckSquare },
];

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  onSelectStep,
  bandName,
  onUpdateBandName,
  onResetAll,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none shadow-md">
      {/* Top Bar: Band Name & Reset */}
      <div className="max-w-7xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow">
            XR
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block leading-none">
              Průvodce zvučením • Behringer XR18
            </span>
            <input
              type="text"
              value={bandName}
              onChange={(e) => onUpdateBandName(e.target.value)}
              placeholder="Název kapely (např. Moje Kapela)"
              className="bg-transparent font-bold text-white text-sm focus:outline-none focus:bg-slate-800 px-1 py-0.5 rounded transition truncate w-full max-w-xs"
            />
          </div>
        </div>

        <button
          onClick={onResetAll}
          className="text-[11px] text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition shrink-0"
          title="Začít od začátku (vymazat pódium)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vyčistit pódium</span>
        </button>
      </div>

      {/* Stepper Tabs Bar (Mobile touch scroll) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 pb-2 pt-1 border-t border-slate-800/80">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isPassed = currentStep > s.step;

          return (
            <button
              key={s.step}
              onClick={() => onSelectStep(s.step)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : isPassed
                  ? 'bg-slate-800/90 text-indigo-300 hover:bg-slate-750'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                isActive ? 'bg-white text-indigo-600' : isPassed ? 'bg-indigo-950 text-indigo-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {s.step}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
