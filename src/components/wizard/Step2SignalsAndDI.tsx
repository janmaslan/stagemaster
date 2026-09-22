import React from 'react';
import { SelectedInstrument } from '../../types/wizard';
import { 
  Cable, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Zap, 
  Radio 
} from 'lucide-react';

interface Step2SignalsAndDIProps {
  instruments: SelectedInstrument[];
  onUpdateInstruments: (instruments: SelectedInstrument[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Step2SignalsAndDI: React.FC<Step2SignalsAndDIProps> = ({
  instruments,
  onUpdateInstruments,
  onNext,
  onPrev,
}) => {
  const handleUpdate = (id: string, updates: Partial<SelectedInstrument>) => {
    onUpdateInstruments(
      instruments.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Step Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
          Krok 2 z 5
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Signál, DI Boxy, Jacky a Mikrofony
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Jak propojit nástroje do mixu a které potřebují DI box. Níže jsou jednoduchá doporučení přímo pro vaši sestavu.
        </p>
      </div>

      {/* Educational Info Box: What is a DI Box? */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-amber-200">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Co je to DI Box a proč ho potřebujete?</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-100/90">
          Nástroje jako klávesy, baskytara nebo akustická kytara mají silný nesymetrický signál z Jack kabelu. 
          Pokud byste dlouhý Jack kabel táhli přes celé pódium, nachytá brum a šum. 
          <b> DI Box</b> ho převede na symetrický <b>XLR signál</b>, který je čistý a mixpult mu přesně rozumí.
        </p>
      </div>

      {/* Instruments Advice Cards */}
      <div className="space-y-3">
        {instruments.map((inst, index) => {
          return (
            <div
              key={inst.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-white text-sm">{inst.name}</h3>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {inst.category}
                </span>
              </div>

              {/* Specific Advice according to Instrument Category */}
              {inst.category === 'keys' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300 text-[11px]">
                    🎹 <b>Doporučené zapojení kláves:</b> Propojte klávesy 2× krátkými Jack kabely do <b>Stereo DI Boxu</b>. Z DI boxu povedou 2× XLR kabely do mixu XR18.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(inst.id, {
                          connectionType: 'jack_stereo_di',
                          diType: 'stereo_passive',
                        })
                      }
                      className={`flex-1 p-2 rounded-xl border text-xs font-semibold transition ${
                        inst.connectionType === 'jack_stereo_di'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Stereo (2 kanály L/R)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(inst.id, {
                          connectionType: 'jack_di',
                          diType: 'mono_passive',
                        })
                      }
                      className={`flex-1 p-2 rounded-xl border text-xs font-semibold transition ${
                        inst.connectionType === 'jack_di'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Mono (1 kanál)
                    </button>
                  </div>
                </div>
              )}

              {inst.category === 'bass' && (
                <div className="space-y-2 text-xs">
                  <div className="bg-indigo-950/40 border border-indigo-800/60 p-2.5 rounded-xl flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-indigo-200">
                      <b>Skvělý tip pro Behringer XR18:</b> Vstupy 1 a 2 na pultu XR18 mají vestavěný vysokoimpedanční vstup (<b>Hi-Z</b>). 
                      Baskytaru můžete píchnout Jack kabelem přímo do Vstupu 1 nebo 2 a <b>vůbec nepotřebujete DI box!</b>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(inst.id, {
                          connectionType: 'jack_direct_hiz',
                          diType: 'none',
                        })
                      }
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        inst.connectionType === 'jack_direct_hiz'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      ⚡ Přímo Jackem do XR18 (Hi-Z, bez DI boxu)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate(inst.id, {
                          connectionType: 'jack_di',
                          diType: 'mono_active',
                        })
                      }
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                        inst.connectionType === 'jack_di'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Použít Aktivní DI Box
                    </button>
                  </div>
                </div>
              )}

              {inst.category === 'drums' && (
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300 text-[11px]">
                    🥁 <b>Kolik máte mikrofonů na bicí soupravu?</b>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(inst.id, { drumMicsOption: 'minimal' })}
                      className={`p-2 rounded-xl border text-xs font-medium text-left transition ${
                        inst.drumMicsOption === 'minimal'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="font-bold">2 Mikrofony (Minimal)</div>
                      <div className="text-[10px] opacity-80">Kopák + Snare</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdate(inst.id, { drumMicsOption: 'basic' })}
                      className={`p-2 rounded-xl border text-xs font-medium text-left transition ${
                        inst.drumMicsOption === 'basic'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="font-bold">4 Mikrofony (Doporučeno)</div>
                      <div className="text-[10px] opacity-80">Kopák, Snare, 2× Overhead</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdate(inst.id, { drumMicsOption: 'full' })}
                      className={`p-2 rounded-xl border text-xs font-medium text-left transition ${
                        inst.drumMicsOption === 'full'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <div className="font-bold">7 Mikrofonů (Plná sada)</div>
                      <div className="text-[10px] opacity-80">Kopák, Snare, Hi-Hat, Tomy, OH</div>
                    </button>
                  </div>
                </div>
              )}

              {inst.category === 'electric_guitar' && (
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="text-[11px]">
                    🎸 <b>Kytarové kombo:</b> Nasnímejte mikrofonem (např. <b>Sennheiser e906</b> zavěšený za kabel přes držadlo komba, nebo <b>Shure SM57</b> na malém stojánku).
                  </p>
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-sky-400">
                    Potřebný kabel: XLR 10 m (přímo z mikrofonu do XR18)
                  </div>
                </div>
              )}

              {inst.category === 'acoustic_guitar' && (
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="text-[11px]">
                    🎸 <b>Akustická kytara se snímačem:</b> Z kytary Jack do DI boxu (nebo přímo do vstupu 1 či 2 Hi-Z), z DI boxu XLR kabel do mixu.
                  </p>
                </div>
              )}

              {inst.category === 'vocals' && (
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="text-[11px]">
                    🎙️ <b>Zpěvový mikrofon:</b> Dynamický mikrofon (např. <b>Shure SM58</b>) na vysokém stojanu s ramenem (šibenice).
                  </p>
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 font-mono text-[11px] text-sky-400">
                    Potřebný kabel: XLR 10–15 m (přímo z mikrofonu do XR18)
                  </div>
                </div>
              )}

              {inst.category === 'backing_track' && (
                <div className="space-y-1 text-xs text-slate-300">
                  <p className="text-[11px]">
                    📱 <b>Mobil / Přehrávač:</b> Zapojte kabelem 3.5mm Jack na 2× Jack 6.3mm přímo do linkových vstupů <b>LINE IN 17/18</b> na XR18.
                  </p>
                </div>
              )}
            </div>
          );
        })}
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
          <span>3. Krok: Elektřina 230V</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
