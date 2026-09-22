import React, { useState } from 'react';
import { 
  InteractiveStageItem, 
  InstrumentChannel, 
  StandType 
} from '../../types/interactiveStage';
import { 
  X, 
  Mic, 
  Zap, 
  RotateCw, 
  Trash2, 
  Check, 
  Plus,
  Edit2,
  Speaker,
  Volume2,
  Cable,
  User
} from 'lucide-react';

interface ConfigureItemModalProps {
  item: InteractiveStageItem;
  allItems?: InteractiveStageItem[];
  onUpdate: (updated: InteractiveStageItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

// User requested microphone choices
const POPULAR_MICS = [
  { label: 'Shure SM58', full: 'Shure SM58 (Zpěv)', phantom: false },
  { label: 'Shure SM57', full: 'Shure SM57 (Nástroj/Kombo)', phantom: false },
  { label: 'Sennheiser e604', full: 'Sennheiser e604 (Tom clip)', phantom: false },
  { label: 'Shure Beta 91A', full: 'Shure Beta 91A (Kopák hraniční)', phantom: true },
  { label: 'Shure Beta 52A', full: 'Shure Beta 52A (Kopák basový)', phantom: false },
  { label: 'Røde NT5', full: 'Rode NT5 (Kondenzátor)', phantom: true },
];

const POPULAR_DIRECT_XLR = [
  'DI Out ze zesilovače (XLR)',
  'Kemper / Line6 Helix Direct (XLR)',
  'Akustický preamp XLR Out',
  'Aktivní DI box (XLR)',
];

const POPULAR_JACKS = [
  'Linkový Jack 6.3mm z kláves',
  'Nástrojový Jack 6.3mm do DI boxu',
  'Akustická kytara Jack 6.3mm',
];

const NAME_PRESETS = [
  'Bicí',
  'Kytarové kombo',
  'Baskytara',
  'Klávesy',
  'Akustická kytara',
  'Lead Zpěv',
  'Backing zpěv',
];

export const ConfigureItemModal: React.FC<ConfigureItemModalProps> = ({
  item,
  allItems = [],
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [name, setName] = useState(item.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [needsPower, setNeedsPower] = useState<boolean>(!!item.needsPower230V);
  const [rotation, setRotation] = useState<number>(item.rotation || 0);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Channels state (for instruments/vocals)
  const initialChannels: InstrumentChannel[] = (item.channels && item.channels.length > 0)
    ? item.channels
    : [
        {
          id: 'ch-' + Date.now(),
          name: item.name,
          pickupType: item.subType === 'keyboard' || item.subType === 'bass_amp' ? 'line_xlr' : 'mic',
          micModel: item.subType === 'drums' ? 'Shure Beta 52A (Kopák basový)' : item.subType === 'guitar_amp' ? 'Shure SM57 (Nástroj/Kombo)' : 'Shure SM58 (Zpěv)',
          stand: item.subType === 'guitar_amp' ? 'low_boom' : 'high_boom',
        },
      ];

  const [channels, setChannels] = useState<InstrumentChannel[]>(initialChannels);
  const [customInputOpenFor, setCustomInputOpenFor] = useState<Record<string, boolean>>({});

  // Speaker / Output configuration (if item is PA or Wedge)
  const isPASpeaker = item.subType === 'pa_speaker';
  const isSpeakerOrWedge = ['pa_speaker', 'wedge', 'monitor_wedge'].includes(item.subType) || item.category === 'pa_speaker' || item.category === 'monitor_wedge';

  const initialSpeakerType: 'active' | 'passive_speakon' | 'passive_jack' = 
    item.speakerType === 'passive_jack'
      ? 'passive_jack'
      : (item.speakerType === 'passive_speakon' || item.speakerType === 'passive')
      ? 'passive_speakon'
      : 'active';

  const [speakerType, setSpeakerType] = useState<'active' | 'passive_speakon' | 'passive_jack'>(initialSpeakerType);
  const [outputPort, setOutputPort] = useState<string>(
    item.assignedOutputPort || (isPASpeaker ? 'Main L' : 'Aux 1')
  );
  const [performer, setPerformer] = useState<string>(item.targetPerformer || '');
  const [isCustomPerformer, setIsCustomPerformer] = useState<boolean>(false);

  // Candidate performers from stage
  const stagePerformers = allItems
    .filter((i) => ['instrument', 'vocal'].includes(i.category))
    .map((i) => i.name);
  const defaultPresets = ['Lead Zpěvák', 'Kytarista', 'Baskytarista', 'Bubeník', 'Klávesák'];
  const performerOptions = Array.from(new Set([...stagePerformers, ...defaultPresets])).slice(0, 8);

  const ports = isPASpeaker
    ? ['Main L', 'Main R']
    : ['Aux 1', 'Aux 2', 'Aux 3', 'Aux 4', 'Aux 5', 'Aux 6'];

  const handleRotate = () => {
    setRotation((rotation + 90) % 360);
  };

  const handleAddChannel = () => {
    const nextIndex = channels.length + 1;
    let defaultMic = 'Shure SM57 (Nástroj/Kombo)';
    let defaultName = `${name} Mic ${nextIndex}`;

    if (item.subType === 'drums') {
      if (nextIndex === 2) { defaultName = 'Virbl (Snare)'; defaultMic = 'Shure SM57 (Nástroj/Kombo)'; }
      else if (nextIndex === 3) { defaultName = 'Overhead L'; defaultMic = 'Rode NT5 (Kondenzátor)'; }
      else if (nextIndex === 4) { defaultName = 'Overhead R'; defaultMic = 'Rode NT5 (Kondenzátor)'; }
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
    if (channels.length <= 1) return;
    setChannels(channels.filter((c) => c.id !== chId));
  };

  const handleSave = () => {
    onUpdate({
      ...item,
      name,
      channels,
      needsPower230V: isSpeakerOrWedge ? (speakerType === 'active') : needsPower,
      rotation,
      ...(isSpeakerOrWedge ? {
        speakerType,
        assignedOutputPort: outputPort,
        targetPerformer: performer,
      } : {}),
    });
    onClose();
  };

  const isInstrumentOrVocal = ['instrument', 'vocal'].includes(item.category);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-1 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-150"
      tabIndex={-1}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-2xl max-h-[96vh] sm:max-h-[90vh] flex flex-col shadow-2xl my-auto"
        tabIndex={-1}
      >
        {/* Modal Header */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
              Nastavení prvku
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Zavřít"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body with touch scroll support */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs overscroll-contain touch-pan-y pb-16 sm:pb-5">
          {/* Top Bar: Name & Rotation & Power */}
          <div className="bg-slate-850/80 border border-slate-750 p-2.5 rounded-xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Name Display / Edit */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                {isEditingName ? (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-slate-900 border border-indigo-500 rounded-lg px-2 py-1 text-xs text-white font-bold flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-white">{name}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Upravit název</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Rotation */}
              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-200 flex items-center gap-1 transition shrink-0 active:scale-95"
                title="Otočit o 90°"
              >
                <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Otočit {rotation}°</span>
              </button>
            </div>

            {/* Quick Name Preset Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] text-slate-500 font-semibold shrink-0">Šablony:</span>
              {NAME_PRESETS.map((pName) => (
                <button
                  key={pName}
                  type="button"
                  onClick={() => setName(pName)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition active:scale-95 ${
                    name === pName
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  {pName}
                </button>
              ))}
            </div>

            {/* 230V Checkbox for non-speakers */}
            {!isSpeakerOrWedge && item.category !== 'power_strip' && (
              <label className="flex items-center gap-2 pt-1.5 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={needsPower}
                  onChange={(e) => setNeedsPower(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-red-500 bg-slate-900 border-slate-700"
                />
                <span className="flex items-center gap-1 font-semibold text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                  Vyžaduje zásuvku 230V na pódiu (kombo, klávesy, pedalboard)
                </span>
              </label>
            )}
          </div>

          {/* SPEAKER / WEDGE CONFIGURATION SECTION */}
          {isSpeakerOrWedge && (
            <div className="space-y-3 p-3 rounded-xl bg-slate-850/90 border border-slate-750">
              <span className="font-bold text-sky-300 flex items-center gap-1.5 text-xs">
                {isPASpeaker ? <Speaker className="w-4 h-4 text-indigo-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                <span>Typ reprobedny &amp; výstup XR18</span>
              </span>

              {/* 3 Speaker Types */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  Typ reprobedny &amp; kabeláže:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
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
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-300 block">
                  {isPASpeaker ? 'Výstup z XR18:' : 'Která Aux sběrnice na XR18 to bude?'}
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
                            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Performer (only for monitors) */}
              {!isPASpeaker && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Pro koho tento odposlech je (výběr 1 klepnutím):</span>
                  </label>

                  <div className="flex flex-wrap gap-1">
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
          )}

          {/* Microphones & Inputs Section for Instruments and Vocals */}
          {isInstrumentOrVocal && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
                  <Mic className="w-3.5 h-3.5 text-indigo-400" />
                  Snímání &amp; Mikrofony ({channels.length})
                </span>

                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition active:scale-95 shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Další mikrofon</span>
                </button>
              </div>

              {/* Channels List */}
              <div className="space-y-2">
                {channels.map((ch, idx) => {
                  const isCustomOpen = !!customInputOpenFor[ch.id];

                  return (
                    <div
                      key={ch.id}
                      className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 space-y-2"
                    >
                      {/* Channel Row Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="w-5 h-5 rounded bg-indigo-950 font-mono font-bold text-[10px] text-indigo-300 flex items-center justify-center border border-indigo-800 shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white text-xs truncate">
                            {ch.name}
                          </span>
                        </div>

                        {channels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteChannel(ch.id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                            title="Odebrat tento vstup"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* 3-way Pickup Mode */}
                      <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-750">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateChannel(ch.id, {
                              pickupType: 'mic',
                              micModel: POPULAR_MICS[0].full,
                              stand: ch.stand === 'none' ? 'high_boom' : ch.stand,
                            })
                          }
                          className={`py-1 rounded text-[10px] font-bold transition text-center active:scale-95 ${
                            ch.pickupType === 'mic'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🎙️ Mikrofon
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateChannel(ch.id, {
                              pickupType: 'line_xlr',
                              micModel: POPULAR_DIRECT_XLR[0],
                              stand: 'none',
                            })
                          }
                          className={`py-1 rounded text-[10px] font-bold transition text-center active:scale-95 ${
                            ch.pickupType === 'line_xlr'
                              ? 'bg-sky-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ⚡ Přímá XLR
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateChannel(ch.id, {
                              pickupType: 'line_jack',
                              micModel: POPULAR_JACKS[0],
                              stand: 'none',
                            })
                          }
                          className={`py-1 rounded text-[10px] font-bold transition text-center active:scale-95 ${
                            ch.pickupType === 'line_jack' || ch.pickupType === 'line'
                              ? 'bg-amber-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🔌 Jack 6.3mm
                        </button>
                      </div>

                      {/* Quick Select Buttons (Chips) without Keyboard */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          {ch.pickupType === 'mic'
                            ? 'Zvolte model mikrofonu (1 klepnutím):'
                            : ch.pickupType === 'line_xlr'
                            ? 'Zvolte typ přímé linky XLR:'
                            : 'Zvolte typ linky Jack 6.3mm:'}
                        </span>

                        <div className="flex flex-wrap gap-1">
                          {ch.pickupType === 'mic' && (
                            <>
                              {POPULAR_MICS.map((mic) => {
                                const isSelected = ch.micModel?.includes(mic.label);
                                return (
                                  <button
                                    key={mic.label}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateChannel(ch.id, { 
                                        micModel: mic.full,
                                        needsPhantom48V: mic.phantom
                                      });
                                      setCustomInputOpenFor({ ...customInputOpenFor, [ch.id]: false });
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                                      isSelected
                                        ? 'bg-rose-600 text-white shadow ring-1 ring-rose-300'
                                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                                    }`}
                                  >
                                    {mic.label}
                                    {mic.phantom && <span className="ml-1 text-[8px] text-amber-300 font-mono">+48V</span>}
                                  </button>
                                );
                              })}
                            </>
                          )}

                          {ch.pickupType === 'line_xlr' && (
                            <>
                              {POPULAR_DIRECT_XLR.map((xlr) => {
                                const isSelected = ch.micModel === xlr;
                                return (
                                  <button
                                    key={xlr}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateChannel(ch.id, { micModel: xlr });
                                      setCustomInputOpenFor({ ...customInputOpenFor, [ch.id]: false });
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                                      isSelected
                                        ? 'bg-sky-600 text-white shadow ring-1 ring-sky-300'
                                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                                    }`}
                                  >
                                    {xlr}
                                  </button>
                                );
                              })}
                            </>
                          )}

                          {ch.pickupType !== 'mic' && ch.pickupType !== 'line_xlr' && (
                            <>
                              {POPULAR_JACKS.map((jk) => {
                                const isSelected = ch.micModel === jk;
                                return (
                                  <button
                                    key={jk}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateChannel(ch.id, { micModel: jk });
                                      setCustomInputOpenFor({ ...customInputOpenFor, [ch.id]: false });
                                    }}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                                      isSelected
                                        ? 'bg-amber-600 text-white shadow ring-1 ring-amber-300'
                                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                                    }`}
                                  >
                                    {jk}
                                  </button>
                                );
                              })}
                            </>
                          )}

                          {/* Custom Toggle */}
                          <button
                            type="button"
                            onClick={() =>
                              setCustomInputOpenFor({
                                ...customInputOpenFor,
                                [ch.id]: !isCustomOpen,
                              })
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                              isCustomOpen
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            ✏️ Vlastní...
                          </button>
                        </div>

                        {/* Optional text input if custom chosen */}
                        {isCustomOpen && (
                          <div className="pt-1 animate-in fade-in">
                            <input
                              type="text"
                              value={ch.micModel}
                              onChange={(e) => handleUpdateChannel(ch.id, { micModel: e.target.value })}
                              placeholder="Vepište přesný název nebo model..."
                              className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* Stand Selection (for mics only) */}
                      {ch.pickupType === 'mic' && (
                        <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-semibold">Stojan:</span>
                          {(['high_boom', 'low_boom', 'clip_clamp', 'straight', 'none'] as StandType[]).map((st) => {
                            const isSel = ch.stand === st;
                            const label =
                              st === 'high_boom' ? 'Velký šibenice' :
                              st === 'low_boom' ? 'Malý k aparátu/kopáku' :
                              st === 'clip_clamp' ? 'Klipsna na ráfek' :
                              st === 'straight' ? 'Rovný bez ramene' : 'Bez stojanu';

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleUpdateChannel(ch.id, { stand: st })}
                                className={`px-2 py-0.5 rounded text-[9px] font-semibold transition active:scale-95 ${
                                  isSel
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-900 text-slate-400 border border-slate-750'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
          {item.category !== 'mixer' ? (
            confirmDelete ? (
              <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(item.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Opravdu smazat?
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Smazat prvek</span>
              </button>
            )
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
              onClick={handleSave}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Uložit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
