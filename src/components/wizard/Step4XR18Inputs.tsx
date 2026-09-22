import React, { useState } from 'react';
import { XR18ChannelPatch } from '../../types/wizard';
import { 
  Sliders, 
  ArrowRight, 
  ArrowLeft, 
  Zap, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface Step4XR18InputsProps {
  channels: XR18ChannelPatch[];
  onNext: () => void;
  onPrev: () => void;
}

export const Step4XR18Inputs: React.FC<Step4XR18InputsProps> = ({
  channels,
  onNext,
  onPrev,
}) => {
  const [selectedCh, setSelectedCh] = useState<number | null>(null);

  const activeChannelDetail = channels.find((c) => c.chNumber === selectedCh) || channels[0];

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
          Krok 4 z 5
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Zapojení vstupů do Behringer XR18
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Přesný plán zapojení do konektorů 1–16 na předním panelu pultu. Klepněte na kterýkoliv kanál pro detail.
        </p>
      </div>

      {/* Visual Behringer XR18 Hardware Panel */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-2xl p-3 sm:p-5 shadow-2xl space-y-3">
        {/* XR18 Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm tracking-wider">BEHRINGER X-AIR</span>
            <span className="font-extrabold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              XR18
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">16 MIDAS PREAMPS</span>
        </div>

        {/* 16 Combo XLR Sockets Grid (arranged 1-8 top, 9-16 bottom like physical XR18) */}
        <div className="space-y-2.5">
          {/* Row 1: Channels 1 to 8 */}
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-1">KANÁLY 1 – 8</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                const patch = channels.find((c) => c.chNumber === num);
                const isSelected = selectedCh === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedCh(num)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition aspect-square text-center ${
                      isSelected
                        ? 'bg-indigo-600 border-white ring-2 ring-indigo-400 text-white shadow-lg'
                        : patch
                        ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-slate-500'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                  >
                    {/* Hi-Z badge for CH 1 and 2 */}
                    {(num === 1 || num === 2) && (
                      <span className="absolute -top-1.5 -left-1 text-[7px] font-black bg-amber-600 text-black px-1 rounded">
                        Hi-Z
                      </span>
                    )}

                    {/* +48V indicator */}
                    {patch?.needsPhantom48V && (
                      <span className="absolute -top-1.5 -right-1 text-[7px] font-black bg-red-600 text-white px-1 rounded animate-pulse">
                        48V
                      </span>
                    )}

                    <span className="font-mono font-bold text-xs">{num}</span>
                    <span className="text-[9px] font-semibold truncate w-full mt-0.5 leading-tight">
                      {patch ? patch.label.split(' ')[0] : 'Volno'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Channels 9 to 16 */}
          <div>
            <span className="text-[10px] text-slate-500 font-bold block mb-1">KANÁLY 9 – 16</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {[9, 10, 11, 12, 13, 14, 15, 16].map((num) => {
                const patch = channels.find((c) => c.chNumber === num);
                const isSelected = selectedCh === num;
                return (
                  <button
                    key={num}
                    onClick={() => setSelectedCh(num)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-center transition aspect-square text-center ${
                      isSelected
                        ? 'bg-indigo-600 border-white ring-2 ring-indigo-400 text-white shadow-lg'
                        : patch
                        ? 'bg-slate-800/90 border-slate-700 text-slate-200 hover:border-slate-500'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    }`}
                  >
                    {/* +48V indicator */}
                    {patch?.needsPhantom48V && (
                      <span className="absolute -top-1.5 -right-1 text-[7px] font-black bg-red-600 text-white px-1 rounded animate-pulse">
                        48V
                      </span>
                    )}

                    <span className="font-mono font-bold text-xs">{num}</span>
                    <span className="text-[9px] font-semibold truncate w-full mt-0.5 leading-tight">
                      {patch ? patch.label.split(' ')[0] : 'Volno'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channel 17/18 (Line In for phone) */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>LINE IN 17/18 (Pauza / Mobil):</span>
            </span>
            <span className="font-mono text-indigo-300">
              {channels.find((c) => c.chNumber === 17) ? 'Mobil / Přehrávač zapojen' : 'Volný vstup'}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Channel Detail Card */}
      {activeChannelDetail ? (
        <div className="bg-slate-900 border border-indigo-700/60 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600 font-mono font-black text-white text-sm">
                VSTUP CH #{activeChannelDetail.chNumber}
              </span>
              <h3 className="font-bold text-white text-sm sm:text-base">
                {activeChannelDetail.label}
              </h3>
            </div>

            {activeChannelDetail.needsPhantom48V && (
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>POŽADUJE +48V PHANTOM</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 block">Kabel a konektor:</span>
              <span className="font-semibold text-slate-200">{activeChannelDetail.cableType}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
              <span className="text-[10px] text-slate-400 block">Délka kabelu:</span>
              <span className="font-semibold text-slate-200">cca {activeChannelDetail.cableLengthMeters} metrů</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-indigo-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Doporučení pro zvukaře:</span>
            </div>
            <p className="text-[11px] leading-relaxed">{activeChannelDetail.advice}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic text-center">
          Klepněte na libovolný kanál pro zobrazení podrobností.
        </p>
      )}

      {/* Complete Channel List Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Kompletní seznam kanálů k zapojení ({channels.length})
        </h3>

        <div className="space-y-1.5">
          {channels.map((ch) => (
            <div
              key={ch.chNumber}
              onClick={() => setSelectedCh(ch.chNumber)}
              className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs ${
                selectedCh === ch.chNumber
                  ? 'bg-indigo-950/70 border-indigo-500 ring-1 ring-indigo-500'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-800 font-mono font-bold text-indigo-400 flex items-center justify-center shrink-0 border border-slate-700">
                  {ch.chNumber}
                </span>
                <div>
                  <div className="font-bold text-white">{ch.label}</div>
                  <div className="text-[10px] text-slate-400">
                    Kabel: {ch.cableType} ({ch.cableLengthMeters}m)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {ch.isHiZ && (
                  <span className="text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                    Hi-Z
                  </span>
                )}
                {ch.needsPhantom48V && (
                  <span className="text-[9px] font-bold bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded">
                    +48V
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 flex items-center justify-between z-30 max-w-7xl mx-auto">
        <button
          onClick={onPrev}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zpět</span>
        </button>

        <button
          onClick={onNext}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          <span>5. Krok: Zapojení PA a odposlechů</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
