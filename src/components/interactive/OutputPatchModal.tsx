import React, { useState } from 'react';
import { InteractiveStageItem } from '../../types/interactiveStage';
import { 
  X, 
  Volume2, 
  Speaker, 
  Check, 
  Trash2, 
  Zap,
  Radio
} from 'lucide-react';

interface OutputPatchModalProps {
  item: InteractiveStageItem;
  onConfirmOutputPatch: (outputPort: string, performer: string, speakerType: 'active' | 'passive') => void;
  onUnpatch: () => void;
  onClose: () => void;
}

export const OutputPatchModal: React.FC<OutputPatchModalProps> = ({
  item,
  onConfirmOutputPatch,
  onUnpatch,
  onClose,
}) => {
  const isPASpeaker = item.subType === 'pa_speaker';
  const defaultPort = item.assignedOutputPort || (isPASpeaker ? 'Main L' : 'Aux 1');
  const [outputPort, setOutputPort] = useState<string>(defaultPort);
  const [performer, setPerformer] = useState<string>(item.targetPerformer || '');
  const [speakerType, setSpeakerType] = useState<'active' | 'passive'>(item.speakerType || 'active');

  const ports = isPASpeaker
    ? ['Main L', 'Main R']
    : ['Aux 1', 'Aux 2', 'Aux 3', 'Aux 4', 'Aux 5', 'Aux 6'];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-700 flex items-center justify-center text-sky-400">
              {isPASpeaker ? <Speaker className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Přiřazení výstupu XR18
              </span>
              <h3 className="text-base font-bold text-white">{item.name}</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speaker Type: Active vs Passive (with Amp) */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-slate-800/60 border border-slate-700">
          <label className="text-xs font-bold text-slate-200 block">
            Typ reprobedny:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSpeakerType('active')}
              className={`p-2 rounded-xl border text-center transition ${
                speakerType === 'active'
                  ? 'bg-sky-600 border-sky-400 text-white font-bold shadow'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <div className="text-xs">⚡ Aktivní bedna</div>
              <div className="text-[9px] opacity-80 mt-0.5">XLR signál + 230V proud</div>
            </button>

            <button
              type="button"
              onClick={() => setSpeakerType('passive')}
              className={`p-2 rounded-xl border text-center transition ${
                speakerType === 'passive'
                  ? 'bg-sky-600 border-sky-400 text-white font-bold shadow'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <div className="text-xs">🔊 Pasivní + Zesilovač</div>
              <div className="text-[9px] opacity-80 mt-0.5">Kabel Speakon (bez 230V)</div>
            </button>
          </div>
        </div>

        {/* Port selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            {isPASpeaker ? 'Který Main výstup z pultu to je?' : 'Která Aux sběrnice na XR18 to bude?'}
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ports.map((p) => {
              const isSelected = outputPort === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setOutputPort(p)}
                  className={`p-2.5 rounded-xl border text-center transition font-mono font-bold text-xs ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md ring-2 ring-sky-400'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Performer if monitor */}
        {!isPASpeaker && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              Pro koho tento odposlech je:
            </label>
            <input
              type="text"
              value={performer}
              onChange={(e) => setPerformer(e.target.value)}
              placeholder="Např. Zpěvák, Kytarista, Bubeník..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
            />
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2">
          {item.assignedOutputPort ? (
            <button
              type="button"
              onClick={() => {
                onUnpatch();
                onClose();
              }}
              className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Odpojit</span>
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmOutputPatch(outputPort, performer, speakerType);
                onClose();
              }}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Zapojit do {outputPort}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
