import React from 'react';
import { SelectedInstrument } from '../../types/wizard';
import { 
  Zap, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Wifi, 
  Plug 
} from 'lucide-react';

interface Step3Power230VProps {
  instruments: SelectedInstrument[];
  powerDrops: { location: string; reason: string; items: string[] }[];
  onNext: () => void;
  onPrev: () => void;
}

export const Step3Power230V: React.FC<Step3Power230VProps> = ({
  instruments,
  powerDrops,
  onNext,
  onPrev,
}) => {
  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
          Krok 3 z 5
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Zapojení elektřiny a prodlužovaček (230V)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Než začnete tahat audio kabely, je nejlepší nejprve bezpečně rozvést napájení 230V na pódium.
        </p>
      </div>

      {/* Critical Sound Engineering Advice about 50Hz hum */}
      <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-red-200">
        <div className="flex items-center gap-2 font-bold text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Zlaté pravidlo zvukaře: Pozor na brum 50 Hz!</span>
        </div>
        <p className="text-[11px] leading-relaxed text-red-100/90">
          Nikdy nemotejte tenké mikrofonní kabely do těsného svazku podél silových 230V prodlužovaček! 
          Elektromagnetické pole z 230V by vám naindukovalo nepříjemné bzučení (brum) do mikrofonů. 
          Pokud se kabely musí potkat, <b>překřižte je kolmo přes sebe</b>.
        </p>
      </div>

      {/* Recommended Power Drops on Stage */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Kam položit prodlužovací „psy“ na pódiu:
        </h3>

        {powerDrops.map((drop, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-950 border border-red-800 text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">{drop.location}</h4>
                  <p className="text-[10px] text-slate-400">{drop.reason}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900">
                230V
              </span>
            </div>

            {/* List of devices connected to this drop */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Do tohoto psa zapojte:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {drop.items.map((item, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium text-slate-200 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plug className="w-3 h-3 text-red-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Behringer XR18 & Wi-Fi Tip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-bold">
          <Wifi className="w-4 h-4" />
          <span>Doporučení pro ovládání Behringer XR18 přes tablet/mobil:</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Vestavěná Wi-Fi anténka v XR18 je v plném sále často rušena mobily diváků. 
          Pokud máte <b>externí Wi-Fi router</b> (např. TP-Link), zapojte ho do stejného prodlužováku jako XR18 
          a propojte krátkým síťovým kabelem (LAN) do portu Ethernet na XR18. Spojení bude 100% stabilní po celou akci!
        </p>
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
          <span>4. Krok: Zapojení do XR18</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
