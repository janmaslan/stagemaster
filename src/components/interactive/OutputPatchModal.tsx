import React, { useState } from 'react';
import { InteractiveStageItem } from '../../types/interactiveStage';
import { 
  X, 
  Volume2, 
  Speaker, 
  Check, 
  Trash2, 
  Zap,
  Cable,
  User
} from 'lucide-react';

interface OutputPatchModalProps {
  item: InteractiveStageItem;
  allItems?: InteractiveStageItem[];
  onConfirmOutputPatch: (
    outputPort: string, 
    performer: string, 
    speakerType: 'active' | 'passive_speakon' | 'passive_jack'
  ) => void;
  onUnpatch: () => void;
  onClose: () => void;
}

export const OutputPatchModal: React.FC<OutputPatchModalProps> = ({
  item,
  allItems = [],
  onConfirmOutputPatch,
  onUnpatch,
  onClose,
}) => {
  const isPASpeaker = item.subType === 'pa_speaker';
  const defaultPort = item.assignedOutputPort || (isPASpeaker ? 'Main L' : 'Aux 1');
  const [outputPort, setOutputPort] = useState<string>(defaultPort);
  const [performer, setPerformer] = useState<string>(item.targetPerformer || '');
  const [isCustomPerformer, setIsCustomPerformer] = useState<boolean>(false);

  // Normalise speakerType to 3 supported options
  const initialType: 'active' | 'passive_speakon' | 'passive_jack' = 
    item.speakerType === 'passive_jack'
      ? 'passive_jack'
      : (item.speakerType === 'passive_speakon' || item.speakerType === 'passive')
      ? 'passive_speakon'
      : 'active';

  const [speakerType, setSpeakerType] = useState<'active' | 'passive_speakon' | 'passive_jack'>(initialType);

  const ports = isPASpeaker
    ? ['Main L', 'Main R']
    : ['Aux 1', 'Aux 2', 'Aux 3', 'Aux 4', 'Aux 5', 'Aux 6'];

  // Extract candidate performers from instruments and vocals currently on stage
  const stagePerformers = allItems
    .filter((i) => ['instrument', 'vocal'].includes(i.category))
    .map((i) => i.name);

  // Add default fallback performers if none on stage yet
  const defaultPresets = ['Lead Zpěvák', 'Kytarista', 'Baskytarista', 'Bubeník', 'Klávesák'];
  const performerOptions = Array.from(new Set([...stagePerformers, ...defaultPresets])).slice(0, 8);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-1 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-150"
      tabIndex={-1}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-2xl max-h-[96vh] sm:max-h-[90vh] flex flex-col shadow-2xl my-auto"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-700 flex items-center justify-center text-sky-400">
              {isPASpeaker ? <Speaker className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                Přiřazení výstupu XR18
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {item.name}
              </h3>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs overscroll-contain touch-pan-y pb-16 sm:pb-5">
          {/* 3 Speaker Types: Active vs Passive Speakon vs Passive Jack */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-850/80 border border-slate-750">
            <label className="text-[11px] font-bold text-slate-200 block">
              Typ reprobedny &amp; kabeláže:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {/* Active */}
              <button
                type="button"
                onClick={() => setSpeakerType('active')}
                className={`p-2 rounded-xl border text-center transition active:scale-95 ${
                  speakerType === 'active'
                    ? 'bg-sky-600 border-sky-400 text-white font-bold shadow-md shadow-sky-600/30'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center justify-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-sky-300" />
                  <span>Aktivní bedna</span>
                </div>
                <div className="text-[9px] opacity-80 mt-0.5">XLR signál + 230V proud</div>
              </button>

              {/* Passive Speakon */}
              <button
                type="button"
                onClick={() => setSpeakerType('passive_speakon')}
                className={`p-2 rounded-xl border text-center transition active:scale-95 ${
                  speakerType === 'passive_speakon'
                    ? 'bg-amber-600 border-amber-400 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center justify-center gap-1">
                  <Speaker className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pasivní + Speakon</span>
                </div>
                <div className="text-[9px] opacity-80 mt-0.5">Ze zesilovače (bez 230V)</div>
              </button>

              {/* Passive Jack */}
              <button
                type="button"
                onClick={() => setSpeakerType('passive_jack')}
                className={`p-2 rounded-xl border text-center transition active:scale-95 ${
                  speakerType === 'passive_jack'
                    ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-md shadow-emerald-600/30'
                    : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-[11px] font-bold flex items-center justify-center gap-1">
                  <Cable className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Pasivní + Jack 6.3</span>
                </div>
                <div className="text-[9px] opacity-80 mt-0.5">Ze zesilovače (bez 230V)</div>
              </button>
            </div>
          </div>

          {/* Port selector */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-750">
            <label className="text-[11px] font-bold text-slate-200 block">
              {isPASpeaker ? 'Výstup z mixpultu Behringer XR18:' : 'Která Aux sběrnice na XR18 to bude?'}
            </label>

            <div className={`grid gap-1.5 ${isPASpeaker ? 'grid-cols-2' : 'grid-cols-3 sm:grid-cols-6'}`}>
              {ports.map((p) => {
                const isSelected = outputPort === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setOutputPort(p)}
                    className={`py-2 px-1 rounded-xl border text-center transition font-mono font-bold text-xs active:scale-95 ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md ring-1 ring-sky-300'
                        : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Performer (only for monitors) - Select directly from stage components */}
          {!isPASpeaker && (
            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-750">
              <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-sky-400" />
                <span>Pro koho tento odposlech je (výběr 1 klepnutím):</span>
              </label>

              {/* Performer Chips */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {performerOptions.map((opt) => {
                  const isSelected = performer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPerformer(opt);
                        setIsCustomPerformer(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow ring-1 ring-sky-300'
                          : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCustomPerformer(!isCustomPerformer)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    isCustomPerformer
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  ✏️ Vlastní...
                </button>
              </div>

              {/* Custom input only if toggled */}
              {isCustomPerformer && (
                <div className="pt-1.5 animate-in fade-in">
                  <input
                    type="text"
                    value={performer}
                    onChange={(e) => setPerformer(e.target.value)}
                    placeholder="Např. Host, Saxofonista, Vokál vlevo..."
                    className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
          {item.assignedOutputPort ? (
            <button
              type="button"
              onClick={() => {
                onUnpatch();
                onClose();
              }}
              className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Odpojit</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmOutputPatch(outputPort, performer, speakerType);
                onClose();
              }}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Zapojit do {outputPort}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
