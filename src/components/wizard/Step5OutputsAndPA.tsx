import React from 'react';
import { XR18OutputPatch } from '../../types/wizard';
import { 
  Speaker, 
  Volume2, 
  Headphones, 
  ArrowRight, 
  ArrowLeft, 
  Sliders, 
  Info, 
  CheckCircle2 
} from 'lucide-react';

interface Step5OutputsAndPAProps {
  outputs: XR18OutputPatch[];
  onNext: () => void;
  onPrev: () => void;
}

export const Step5OutputsAndPA: React.FC<Step5OutputsAndPAProps> = ({
  outputs,
  onNext,
  onPrev,
}) => {
  const mainOutputs = outputs.filter((o) => o.type === 'main_pa');
  const auxOutputs = outputs.filter((o) => o.type === 'aux_monitor');

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
          Krok 5 z 5
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Zapojení PA systému a odposlechů (Monitoring)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Kam zapojit hlavní ozvučení sálu (Main L/R) a kam jednotlivé odposlechy muzikantů na pódiu (Aux 1–6).
        </p>
      </div>

      {/* Main PA Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Speaker className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-sm sm:text-base">
            1. Hlavní PA systém (Zvuk pro publikum)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mainOutputs.map((main, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-white bg-indigo-600 px-2 py-0.5 rounded text-xs">
                  {main.portLabel}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Kabel: XLR (10–20m)</span>
              </div>
              <div className="font-bold text-slate-200 text-xs">{main.destination}</div>
              <p className="text-[11px] text-slate-400 leading-tight">{main.advice}</p>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
          💡 <b>Tip pro zapojení se subwoofery:</b> Pokud máte samostatné subwoofery, zapojte XLR kabely z Main L/R nejprve do vstupů subwooferu a z výstupu "Thru / High-pass Out" na subwooferu pokračujte krátkým XLR do satelitních beden.
        </div>
      </div>

      {/* Aux Monitors Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-sm sm:text-base">
              2. Odposlechy muzikantů (Aux 1 až 6)
            </h3>
          </div>
          <span className="text-xs font-mono text-indigo-400 bg-slate-800 px-2 py-0.5 rounded">
            {auxOutputs.length} odposlechů
          </span>
        </div>

        {auxOutputs.length > 0 ? (
          <div className="space-y-2.5">
            {auxOutputs.map((aux, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white bg-sky-600 px-2 py-0.5 rounded text-xs">
                      {aux.portLabel}
                    </span>
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {aux.destination}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">XLR</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  {aux.advice}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Žádný z muzikantů zatím nemá vybraný odposlech.
          </p>
        )}
      </div>

      {/* X-AIR Mixing Tip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Sliders className="w-4 h-4" />
          <span>Jak nastavit odposlech v aplikaci X-AIR:</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          V aplikaci X-AIR klepněte vpravo na tlačítko <b>SND -&gt; BUS</b> (Sends on Fader) a zvolte např. <b>BUS 1</b>. 
          Všechny fadery na mixu se přepnou na míchání odposlechu pro AUX 1! 
          Vytáhněte muzikantovi to, co potřebuje slyšet (např. zpěvák potřebuje slyšet svůj zpěv a kytaru).
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
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-emerald-600/30 active:scale-95"
        >
          <span>Výsledný tahák do kapsy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
