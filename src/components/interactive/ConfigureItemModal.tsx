import React, { useState } from 'react';
import { 
  InteractiveStageItem, 
  InstrumentChannel, 
  StandType 
} from '../../types/interactiveStage';
import { 
  X, 
  Mic, 
  Plug, 
  Zap, 
  RotateCw, 
  Trash2, 
  Check, 
  Plus, 
  Volume2 
} from 'lucide-react';

interface ConfigureItemModalProps {
  item: InteractiveStageItem;
  onUpdate: (updated: InteractiveStageItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const COMMON_MIC_PRESETS = [
  'Shure SM58 (Zpěv)',
  'Shure Beta 58A',
  'Shure SM57 (Nástroj/Kombo)',
  'Sennheiser e906 (Kombo aparát)',
  'Shure Beta 52A (Kopák)',
  'AKG D112 (Kopák)',
  'Audix D6 (Kopák)',
  'Sennheiser e604 (Tom clip)',
  'Rode NT5 (Overhead)',
  'AKG C414',
  'SE Electronics V7',
  'Bezdrátový mikrofon',
];

const COMMON_DIRECT_XLR_PRESETS = [
  'DI Out z basového aparátu (XLR)',
  'Kemper / Line6 Helix Direct (XLR)',
  'Quad Cortex Direct Out (XLR)',
  'Akustický preamp XLR Out',
  'Klávesy XLR symetrický',
  'Aktivní DI box (XLR)',
  'Pasivní DI box (XLR)',
];

const COMMON_JACK_PRESETS = [
  'Linkový Jack 6.3mm z kláves',
  'Nástrojový Jack 6.3mm do DI boxu',
  'Akustická kytara Jack 6.3mm',
  'Elektronické bicí / Sampler Jack',
];

export const ConfigureItemModal: React.FC<ConfigureItemModalProps> = ({
  item,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(item.name);
  const [needsPower, setNeedsPower] = useState<boolean>(!!item.needsPower230V);
  const [rotation, setRotation] = useState<number>(item.rotation || 0);

  // Channels state
  const initialChannels: InstrumentChannel[] = (item.channels && item.channels.length > 0)
    ? item.channels
    : [
        {
          id: 'ch-' + Date.now(),
          name: item.name,
          pickupType: item.subType === 'keyboard' || item.subType === 'bass_amp' ? 'line' : 'mic',
          micModel: item.subType === 'drums' ? 'Shure Beta 52A (Kopák)' : item.subType === 'guitar_amp' ? 'Sennheiser e906' : 'Shure SM58',
          stand: item.subType === 'guitar_amp' ? 'low_boom' : 'high_boom',
        },
      ];

  const [channels, setChannels] = useState<InstrumentChannel[]>(initialChannels);

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleAddChannel = () => {
    const nextIndex = channels.length + 1;
    let defaultMic = 'Shure SM57';
    let defaultName = `${name} Mic ${nextIndex}`;

    if (item.subType === 'drums') {
      if (nextIndex === 2) { defaultName = 'Virbl (Snare)'; defaultMic = 'Shure SM57'; }
      else if (nextIndex === 3) { defaultName = 'Overhead L'; defaultMic = 'Rode NT5 (Overhead)'; }
      else if (nextIndex === 4) { defaultName = 'Overhead R'; defaultMic = 'Rode NT5 (Overhead)'; }
      else if (nextIndex === 5) { defaultName = 'Tom 1'; defaultMic = 'Sennheiser e604 (Tom clip)'; }
      else if (nextIndex === 6) { defaultName = 'Floor Tom'; defaultMic = 'Sennheiser e604 (Tom clip)'; }
    }

    const newCh: InstrumentChannel = {
      id: 'ch-' + Date.now() + Math.random().toString(36).slice(2, 5),
      name: defaultName,
      pickupType: 'mic',
      micModel: defaultMic,
      stand: 'high_boom',
    };
    setChannels([...channels, newCh]);
  };

  const handleUpdateChannel = (chId: string, updates: Partial<InstrumentChannel>) => {
    setChannels(
      channels.map((c) => (c.id === chId ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteChannel = (chId: string) => {
    if (channels.length <= 1) {
      alert('Nástroj musí mít alespoň jeden mikrofon nebo linku.');
      return;
    }
    setChannels(channels.filter((c) => c.id !== chId));
  };

  const handleSave = () => {
    onUpdate({
      ...item,
      name,
      channels,
      needsPower230V: needsPower,
      rotation,
    });
    onClose();
  };

  const isInstrumentOrVocal = ['instrument', 'vocal'].includes(item.category);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Nastavení prvku na pódiu
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
              {name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Basic Name and Rotation */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Název nástroje / aparátu:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
              placeholder="Např. Bicí, Kytara kombo..."
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Otočit:
            </label>
            <button
              type="button"
              onClick={handleRotate}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 transition"
              title="Otočit o 90 stupňů"
            >
              <RotateCw className="w-4 h-4 text-indigo-400" />
              <span>{rotation}°</span>
            </button>
          </div>
        </div>

        {/* 230V Power Checkbox */}
        {item.category !== 'power_strip' && item.category !== 'pa_speaker' && item.category !== 'monitor_wedge' && (
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 cursor-pointer hover:bg-slate-800 transition">
            <input
              type="checkbox"
              checked={needsPower}
              onChange={(e) => setNeedsPower(e.target.checked)}
              className="w-4 h-4 rounded text-red-500 focus:ring-0 bg-slate-900 border-slate-600"
            />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Zap className="w-4 h-4 text-red-400" />
              <span>Vyžaduje 230V zásuvku na pódiu (napájení aparátu, kláves, pedálboardu)</span>
            </div>
          </label>
        )}

        {/* Multiple Microphones / Channels Section */}
        {isInstrumentOrVocal && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  Mikrofony a linkové vstupy ({channels.length})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Přidejte tolik mikrofonů nebo linek, kolik pro tento nástroj potřebujete.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChannel}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow transition active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Další mikrofon</span>
              </button>
            </div>

            {/* List of Mics/Channels */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {channels.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-md bg-indigo-950 font-mono font-bold text-xs text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-800">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ch.name}
                        onChange={(e) => handleUpdateChannel(ch.id, { name: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 flex-1 truncate"
                        placeholder="Popis (např. Kopák, Virbl, Kombo mic...)"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {channels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteChannel(ch.id)}
                          className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                          title="Odstranit tento vstup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3-way Pickup Selector: Mic vs Direct XLR vs Jack */}
                  <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateChannel(ch.id, {
                          pickupType: 'mic',
                          micModel: ch.pickupType !== 'mic' && !ch.micModel ? 'Shure SM57' : ch.micModel,
                          stand: ch.stand === 'none' ? 'high_boom' : ch.stand,
                        })
                      }
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-center ${
                        ch.pickupType === 'mic'
                          ? 'bg-rose-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🎙️ Mikrofon (XLR)
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateChannel(ch.id, {
                          pickupType: 'line_xlr',
                          micModel: ch.pickupType !== 'line_xlr' && !ch.micModel ? 'DI Out z aparátu (XLR)' : ch.micModel,
                          stand: 'none',
                        })
                      }
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-center ${
                        ch.pickupType === 'line_xlr'
                          ? 'bg-sky-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⚡ Přímá XLR linka
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateChannel(ch.id, {
                          pickupType: 'line_jack',
                          micModel: (ch.pickupType === 'mic' || ch.pickupType === 'line_xlr') ? 'Linkový Jack 6.3mm' : ch.micModel,
                          stand: 'none',
                        })
                      }
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition text-center ${
                        ch.pickupType === 'line_jack' || ch.pickupType === 'line'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔌 Linka Jack 6.3mm
                    </button>
                  </div>

                  {/* Channel Model and Stand */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        {ch.pickupType === 'mic'
                          ? 'Model mikrofonu (lze vepsat libovolný):'
                          : ch.pickupType === 'line_xlr'
                          ? 'Popis přímé XLR linky:'
                          : 'Popis linky Jack 6.3mm:'}
                      </label>
                      <div className="relative">
                        <input
                          list={`list-${ch.id}`}
                          type="text"
                          value={ch.micModel}
                          onChange={(e) => handleUpdateChannel(ch.id, { micModel: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          placeholder={
                            ch.pickupType === 'mic'
                              ? 'Např. Shure SM58, Beta 52A...'
                              : ch.pickupType === 'line_xlr'
                              ? 'Např. DI Out ze zesilovače, Helix XLR...'
                              : 'Např. Linkový Jack z kláves...'
                          }
                        />
                        <datalist id={`list-${ch.id}`}>
                          {(ch.pickupType === 'mic'
                            ? COMMON_MIC_PRESETS
                            : ch.pickupType === 'line_xlr'
                            ? COMMON_DIRECT_XLR_PRESETS
                            : COMMON_JACK_PRESETS
                          ).map((m) => (
                            <option key={m} value={m} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {ch.pickupType === 'mic' ? (
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">
                          Stojan:
                        </label>
                        <select
                          value={ch.stand}
                          onChange={(e) => handleUpdateChannel(ch.id, { stand: e.target.value as StandType })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="high_boom">Vysoká šibenice (Zpěv, OH)</option>
                          <option value="low_boom">Malá šibenice (Kopák, kombo)</option>
                          <option value="clip_clamp">Clamp / Klip na ráfek</option>
                          <option value="straight">Rovný stojan</option>
                          <option value="none">Bez stojanu (např. zavěšený)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-end">
                        <div
                          className={`p-2 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 ${
                            ch.pickupType === 'line_xlr'
                              ? 'bg-sky-950/60 border-sky-800 text-sky-300'
                              : 'bg-amber-950/60 border-amber-800 text-amber-300'
                          }`}
                        >
                          <span>{ch.pickupType === 'line_xlr' ? 'Kabeláž: ⚡ XLR symetrický kabel' : 'Kabeláž: 🔌 Jack 6.3mm kabel'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2">
          {item.category !== 'mixer' ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Opravdu chcete odstranit "${item.name}" z pódia?`)) {
                  onDelete(item.id);
                  onClose();
                }
              }}
              className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Smazat prvek</span>
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Uložit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
