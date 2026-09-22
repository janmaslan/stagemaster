import React, { useState } from 'react';
import { InteractiveStageItem, StageCable, InstrumentChannel } from '../../types/interactiveStage';
import { 
  X, 
  Zap, 
  Sliders, 
  Check, 
  Trash2, 
  Mic 
} from 'lucide-react';

interface XR18PatchModalProps {
  item: InteractiveStageItem;
  allItems: InteractiveStageItem[];
  cables: StageCable[];
  onConfirmPatch: (channelId: string, channelNumber: number, needsPhantom: boolean, cableLength: number) => void;
  onUnpatch: (channelId: string) => void;
  onClose: () => void;
}

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
          micModel: 'Shure SM58',
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
  const [needsPhantom, setNeedsPhantom] = useState<boolean>(
    activeSubChannel.needsPhantom48V ?? activeSubChannel.micModel?.toLowerCase().includes('overhead') ?? false
  );
  const [cableLength, setCableLength] = useState<number>(activeSubChannel.cableLengthMeters || 10);

  // When switching sub-channel in multi-mic instrument
  const handleSelectSubChannel = (ch: InstrumentChannel) => {
    setSelectedSubChannelId(ch.id);
    setSelectedXR18Channel(ch.assignedChannelNumber || 1);
    setNeedsPhantom(ch.needsPhantom48V || false);
    setCableLength(ch.cableLengthMeters || 10);
  };

  const isHiZ = selectedXR18Channel === 1 || selectedXR18Channel === 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Zapojení do Behringer XR18
              </span>
              <h3 className="text-base font-bold text-white">
                {item.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If instrument has multiple microphones (e.g. Drums), show sub-channel tabs */}
        {channels.length > 1 && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 block">
              Vyberte mikrofon / linku k zapojení:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {channels.map((ch) => {
                const isCurrent = ch.id === selectedSubChannelId;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectSubChannel(ch)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
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

        {/* Channel Picker 1 to 16 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">
              Zvolte vstupní konektor na XR18 pro <b className="text-white">„{activeSubChannel.name}“</b>:
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }, (_, i) => i + 1).map((chNum) => {
              const isSelected = selectedXR18Channel === chNum;
              const occupied = channelUsage.get(chNum);
              const isHiZChan = chNum === 1 || chNum === 2;

              return (
                <button
                  key={chNum}
                  type="button"
                  onClick={() => setSelectedXR18Channel(chNum)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition relative ${
                    isSelected
                      ? 'bg-indigo-600 border-white text-white ring-2 ring-indigo-400 shadow-lg'
                      : occupied
                      ? 'bg-slate-850/80 border-slate-700 text-slate-400 opacity-75'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-200'
                  }`}
                >
                  {isHiZChan && (
                    <span className="absolute top-1 left-1 text-[7px] font-black bg-amber-600 text-black px-1 rounded">
                      Hi-Z
                    </span>
                  )}
                  <span className="font-mono font-black text-xs sm:text-sm">
                    CH {chNum}
                  </span>
                  <span className="text-[9px] truncate w-full mt-0.5 font-medium leading-tight">
                    {occupied ? occupied.channel.name.slice(0, 8) : 'Volno'}
                  </span>
                </button>
              );
            })}
          </div>

          {channelUsage.has(selectedXR18Channel) && (
            <p className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/80 p-2 rounded-lg">
              ⚠️ Kanál CH {selectedXR18Channel} je již obsazen ({channelUsage.get(selectedXR18Channel)?.channel.name}).
            </p>
          )}
        </div>

        {/* 48V Phantom & Cable Length */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* +48V Toggle */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Phantom +48V</span>
              <span className="text-[10px] text-slate-400">Pro kondenzátorové mikrofony</span>
            </div>
            <button
              type="button"
              onClick={() => setNeedsPhantom(!needsPhantom)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition border ${
                needsPhantom
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/50 ring-2 ring-red-400/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {needsPhantom ? '48V ZAPNUTO' : '48V VYPNUTO'}
            </button>
          </div>

          {/* Cable Length */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
            <span className="text-xs font-bold text-white block">
              Délka kabelu ({(activeSubChannel.pickupType === 'line_jack' || activeSubChannel.pickupType === 'line') ? 'Jack 6.3mm' : 'XLR symetrický'}):
            </span>
            <select
              value={cableLength}
              onChange={(e) => setCableLength(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value={5}>5 metrů (u bicích / blízko mixu)</option>
              <option value={10}>10 metrů (standard po scéně)</option>
              <option value={15}>15 metrů (přední zpěvy)</option>
              <option value={20}>20 metrů (dlouhá trasa)</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2">
          {activeSubChannel.assignedChannelNumber ? (
            <button
              type="button"
              onClick={() => {
                onUnpatch(activeSubChannel.id);
                onClose();
              }}
              className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Odpojit z XR18</span>
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
                onConfirmPatch(activeSubChannel.id, selectedXR18Channel, needsPhantom, cableLength);
                onClose();
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
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
