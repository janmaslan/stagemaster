import React, { useState } from 'react';
import { InteractiveStageItem, StageCable, InstrumentChannel } from '../../types/interactiveStage';
import { 
  X, 
  Zap, 
  Sliders, 
  Check, 
  Trash2, 
  Mic,
  Cable
} from 'lucide-react';

interface XR18PatchModalProps {
  item: InteractiveStageItem;
  allItems: InteractiveStageItem[];
  cables: StageCable[];
  onConfirmPatch: (
    channelId: string, 
    channelNumber: number, 
    needsPhantom: boolean, 
    cableLength: number,
    micModel?: string,
    pickupType?: 'mic' | 'line_xlr' | 'line_jack' | 'line_di' | 'line'
  ) => void;
  onUnpatch: (channelId: string) => void;
  onClose: () => void;
}

// User requested popular microphones
const POPULAR_MICS = [
  { label: 'Shure SM58', full: 'Shure SM58 (Zpěv)', phantom: false },
  { label: 'Shure SM57', full: 'Shure SM57 (Nástroj/Kombo)', phantom: false },
  { label: 'Sennheiser e604', full: 'Sennheiser e604 (Tom clip)', phantom: false },
  { label: 'Shure Beta 91A', full: 'Shure Beta 91A (Kopák hraniční)', phantom: true },
  { label: 'Shure Beta 52A', full: 'Shure Beta 52A (Kopák basový)', phantom: false },
  { label: 'Behringer C2', full: 'Behringer C2 (Kondenzátor tužka)', phantom: true },
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

export const XR18PatchModal: React.FC<XR18PatchModalProps> = ({
  item,
  allItems,
  cables,
  onConfirmPatch,
  onUnpatch,
  onClose,
}) => {
  // Ensure item has channels
  const channels: InstrumentChannel[] = (item.channels && item.channels.length > 0)
    ? item.channels
    : [
        {
          id: 'def-' + item.id,
          name: item.name,
          pickupType: 'mic',
          micModel: 'Shure SM58 (Zpěv)',
          stand: 'high_boom',
        },
      ];

  const [selectedSubChannelId, setSelectedSubChannelId] = useState<string>(channels[0].id);
  const activeSubChannel = channels.find((c) => c.id === selectedSubChannelId) || channels[0];

  // Map occupied channels across all instruments
  const channelUsage = new Map<number, { item: InteractiveStageItem; channel: InstrumentChannel }>();
  allItems.forEach((it) => {
    it.channels?.forEach((ch) => {
      if (ch.assignedChannelNumber && ch.id !== activeSubChannel.id) {
        channelUsage.set(ch.assignedChannelNumber, { item: it, channel: ch });
      }
    });
  });

  // Suggest first free channel
  const currentCh = activeSubChannel.assignedChannelNumber || (() => {
    for (let c = 1; c <= 16; c++) {
      if (!channelUsage.has(c)) return c;
    }
    return 1;
  })();

  const [selectedXR18Channel, setSelectedXR18Channel] = useState<number>(currentCh);
  const [pickupType, setPickupType] = useState<'mic' | 'line_xlr' | 'line_jack' | 'line_di'>(
    (activeSubChannel.pickupType as any) || 'mic'
  );
  const [micModel, setMicModel] = useState<string>(activeSubChannel.micModel || 'Shure SM58 (Zpěv)');
  const [isCustomMic, setIsCustomMic] = useState<boolean>(false);
  const [needsPhantom, setNeedsPhantom] = useState<boolean>(
    activeSubChannel.needsPhantom48V ?? activeSubChannel.micModel?.toLowerCase().includes('overhead') ?? false
  );
  const [cableLength, setCableLength] = useState<number>(activeSubChannel.cableLengthMeters || 10);

  // When switching sub-channel in multi-mic instrument
  const handleSelectSubChannel = (ch: InstrumentChannel) => {
    setSelectedSubChannelId(ch.id);
    setSelectedXR18Channel(ch.assignedChannelNumber || 1);
    setPickupType((ch.pickupType as any) || 'mic');
    setMicModel(ch.micModel || 'Shure SM58 (Zpěv)');
    setIsCustomMic(false);
    setNeedsPhantom(ch.needsPhantom48V || false);
    setCableLength(ch.cableLengthMeters || 10);
  };

  const isHiZ = selectedXR18Channel === 1 || selectedXR18Channel === 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-1 sm:p-4 overflow-y-auto overscroll-contain animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-xl rounded-2xl max-h-[96vh] sm:max-h-[90vh] flex flex-col shadow-2xl my-auto">
        {/* Header */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block leading-tight">
                Zapojení do Behringer XR18
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

        {/* Scrollable Body with touch scroll support */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs overscroll-contain touch-pan-y pb-16 sm:pb-5">
          {/* If instrument has multiple microphones (e.g. Drums), show sub-channel tabs */}
          {channels.length > 1 && (
            <div className="space-y-1 p-2 rounded-xl bg-slate-850/80 border border-slate-750">
              <label className="text-[11px] font-bold text-slate-300 block">
                Zvolte snímač / mikrofon bicích či nástroje:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {channels.map((ch) => {
                  const isCurrent = ch.id === selectedSubChannelId;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => handleSelectSubChannel(ch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border active:scale-95 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span>{ch.name}</span>
                      {ch.assignedChannelNumber && (
                        <span className="ml-1 px-1 rounded bg-black/40 text-[9px] font-mono">
                          CH {ch.assignedChannelNumber}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Microphone & Signal Type Selector (Tap-to-select without typing!) */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-850/90 border border-slate-750">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-rose-400" />
                <span>Typ snímání &amp; mikrofon pro <b>„{activeSubChannel.name}“</b>:</span>
              </label>
            </div>

            {/* 4 Signal Types: Mic vs XLR Direct vs Just Jack vs Jack + DI Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-750">
              <button
                type="button"
                onClick={() => {
                  setPickupType('mic');
                  setMicModel(POPULAR_MICS[0].full);
                  setNeedsPhantom(false);
                  setIsCustomMic(false);
                }}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition text-center active:scale-95 ${
                  pickupType === 'mic'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🎙️ Mikrofon
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickupType('line_xlr');
                  setMicModel('Přímá XLR linka (Direct Out)');
                  setNeedsPhantom(false);
                  setIsCustomMic(false);
                }}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition text-center active:scale-95 ${
                  pickupType === 'line_xlr'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Přímá XLR
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickupType('line_jack');
                  setMicModel('Linka Jack 6.3mm');
                  setNeedsPhantom(false);
                  setIsCustomMic(false);
                }}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition text-center active:scale-95 ${
                  pickupType === 'line_jack'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔌 Jen Jack 6.3
              </button>

              <button
                type="button"
                onClick={() => {
                  setPickupType('line_di');
                  setMicModel('Jack 6.3mm + DI Box');
                  setNeedsPhantom(false);
                  setIsCustomMic(false);
                }}
                className={`py-1.5 rounded-lg text-[10px] font-bold transition text-center active:scale-95 ${
                  pickupType === 'line_di'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📦 Jack + DI Box
              </button>
            </div>

            {/* Signal Details based on selected pickup mode */}
            <div className="space-y-1 pt-1">
              {pickupType === 'mic' && (
                <>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Zvolte model mikrofonu (1 klepnutím):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {POPULAR_MICS.map((m) => {
                      const isSelected = 
                        micModel?.includes(m.label) || 
                        (m.label === 'Behringer C2' && (micModel?.toLowerCase().includes('c2') || micModel?.includes('C2')));
                      return (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => {
                            setMicModel(m.full);
                            setIsCustomMic(false);
                            if (m.phantom) {
                              setNeedsPhantom(true);
                            } else {
                              setNeedsPhantom(false);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                            isSelected
                              ? 'bg-rose-600 text-white shadow ring-1 ring-rose-300'
                              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          {m.label}
                          {m.phantom && <span className="ml-1 text-[8px] text-amber-300 font-mono">+48V</span>}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setIsCustomMic(!isCustomMic)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                        isCustomMic
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      ✏️ Vlastní...
                    </button>
                  </div>
                </>
              )}

              {pickupType === 'line_xlr' && (
                <div className="p-2 rounded-lg bg-sky-950/50 border border-sky-800 text-[10px] text-sky-200 flex items-center justify-between gap-2">
                  <span>⚡ <b>Přímá XLR linka:</b> Symetrický XLR signál z nástrojového preampu, aparátu (DI Out) nebo procesoru do vstupu XR18.</span>
                  <span className="text-[9px] font-mono bg-sky-900 px-1.5 py-0.5 rounded text-sky-300 shrink-0">XLR</span>
                </div>
              )}

              {pickupType === 'line_jack' && (
                <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-800 text-[10px] text-amber-200 flex items-center justify-between gap-2">
                  <span>🔌 <b>Jen Jack 6.3mm:</b> Nástrojový kabel zapojený přímo do XR18 (pro kytaru do Hi-Z CH 1/2, pro klávesy do linky).</span>
                  <span className="text-[9px] font-mono bg-amber-900 px-1.5 py-0.5 rounded text-amber-300 shrink-0">Jack 6.3mm</span>
                </div>
              )}

              {pickupType === 'line_di' && (
                <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800 text-[10px] text-emerald-200 flex items-center justify-between gap-2">
                  <span>📦 <b>Jack + DI Box:</b> Krátký Jack z nástroje do pódiového DI boxu + XLR do XR18. DI box bude automaticky započten do soupisky!</span>
                  <span className="text-[9px] font-mono bg-emerald-900 px-1.5 py-0.5 rounded text-emerald-300 shrink-0">DI Box + XLR</span>
                </div>
              )}

              {isCustomMic && (
                <div className="pt-1.5 animate-in fade-in">
                  <input
                    type="text"
                    value={micModel}
                    onChange={(e) => setMicModel(e.target.value)}
                    placeholder="Vepište přesný název mikrofonu nebo linky..."
                    className="w-full bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Channel Picker 1 to 16 */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-850/80 border border-slate-750">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Zvolte vstupní kanál na Behringer XR18:
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">
                Vybrán CH {selectedXR18Channel}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {Array.from({ length: 16 }, (_, i) => i + 1).map((chNum) => {
                const isSelected = selectedXR18Channel === chNum;
                const occupied = channelUsage.get(chNum);
                const isHiZChan = chNum === 1 || chNum === 2;

                return (
                  <button
                    key={chNum}
                    type="button"
                    onClick={() => setSelectedXR18Channel(chNum)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition relative active:scale-95 ${
                      isSelected
                        ? 'bg-indigo-600 border-white text-white ring-2 ring-indigo-400 shadow-lg'
                        : occupied
                        ? 'bg-slate-850 border-slate-700 text-slate-400 opacity-75'
                        : 'bg-slate-900 border-slate-750 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    {isHiZChan && (
                      <span className="absolute top-0.5 left-0.5 text-[7px] font-black bg-amber-500 text-black px-0.5 rounded leading-none">
                        Hi-Z
                      </span>
                    )}
                    <span className="font-mono font-black text-xs">
                      CH {chNum}
                    </span>
                    <span className="text-[8.5px] truncate w-full mt-0.5 font-medium leading-tight">
                      {occupied ? occupied.channel.name.slice(0, 7) : 'Volno'}
                    </span>
                  </button>
                );
              })}
            </div>

            {channelUsage.has(selectedXR18Channel) && (
              <p className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/80 p-2 rounded-lg">
                ⚠️ Kanál CH {selectedXR18Channel} je již obsazen ({channelUsage.get(selectedXR18Channel)?.channel.name}). Při potvrzení bude přepsán.
              </p>
            )}
          </div>

          {/* 48V Phantom & Cable Length */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* +48V Toggle */}
            <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-750 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Phantom +48V</span>
                <span className="text-[10px] text-slate-400">Pro kondenzátorové mikrofony &amp; DI</span>
              </div>
              <button
                type="button"
                onClick={() => setNeedsPhantom(!needsPhantom)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition border active:scale-95 ${
                  needsPhantom
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/50 ring-2 ring-red-400/40'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {needsPhantom ? '48V ZAPNUTO' : '48V VYPNUTO'}
              </button>
            </div>

            {/* Cable Length */}
            <div className="p-3 rounded-xl bg-slate-850/80 border border-slate-750 space-y-1">
              <span className="text-xs font-bold text-white block">
                Délka kabelu ({pickupType === 'line_jack' ? 'Jack 6.3mm' : 'XLR symetrický'}):
              </span>
              <select
                value={cableLength}
                onChange={(e) => setCableLength(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value={5}>5 metrů (u bicích / blízko mixu)</option>
                <option value={10}>10 metrů (standard po scéně)</option>
                <option value={15}>15 metrů (přední zpěvy)</option>
                <option value={20}>20 metrů (dlouhá trasa)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2 shrink-0">
          {activeSubChannel.assignedChannelNumber ? (
            <button
              type="button"
              onClick={() => {
                onUnpatch(activeSubChannel.id);
                onClose();
              }}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Odpojit z XR18</span>
            </button>
          ) : <div />}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-medium transition"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmPatch(activeSubChannel.id, selectedXR18Channel, needsPhantom, cableLength, micModel, pickupType);
                onClose();
              }}
              className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Zapojit do CH {selectedXR18Channel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
