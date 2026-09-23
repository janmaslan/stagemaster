import React from 'react';
import { 
  useFeedbackDetector, 
  SensitivityLevel,
  formatFrequency 
} from '../../utils/useFeedbackDetector';
import { 
  X, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  CheckCircle2, 
  Pause, 
  Play, 
  Sliders, 
  Volume2, 
  History, 
  Trash2, 
  Sparkles,
  ShieldAlert,
  Activity
} from 'lucide-react';

interface FeedbackHunterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackHunterModal: React.FC<FeedbackHunterModalProps> = ({ isOpen, onClose }) => {
  const {
    isListening,
    isFrozen,
    setIsFrozen,
    sensitivity,
    setSensitivity,
    activeFeedback,
    feedbackHistory,
    clearHistory,
    startListening,
    stopListening,
    audioError,
    canvasRef,
    isoBandsData,
    playTestWhistle,
    isTestTonePlaying,
  } = useFeedbackDetector();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Feedback Hunter &amp; RTA
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800">
                  Live FOH Tool
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Akustický spektrální analyzátor &amp; okamžitá identifikace pískající frekvence
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Zavřít okno"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Audio Permission Error */}
          {audioError && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300">Chyba mikrofonu</p>
                <p className="mt-0.5">{audioError}</p>
              </div>
            </div>
          )}

          {/* Top Control Bar: Mic Toggle, Sensitivity, Freeze & Quick Test */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 sm:p-4 rounded-2xl border border-slate-800">
            {/* Primary Mic Activation Button */}
            <div className="flex items-center gap-2">
              {!isListening ? (
                <button
                  onClick={startListening}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-red-600/30 transition active:scale-95"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>Zapnout mikrofon &amp; odposlech</span>
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95"
                >
                  <MicOff className="w-4 h-4 text-red-400" />
                  <span>Zastavit odposlech</span>
                </button>
              )}

              {isListening && (
                <button
                  onClick={() => setIsFrozen(!isFrozen)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                    isFrozen
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title={isFrozen ? 'Obnovit živé měření' : 'Zmrazit aktuální spektrum'}
                >
                  {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isFrozen ? 'Zmrazeno' : 'Pauza'}</span>
                </button>
              )}
            </div>

            {/* Sensitivity & Test Whistle generator */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Sensitivity Selector */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <span className="text-[10px] text-slate-400 px-2 font-semibold">Citlivost:</span>
                {(['low', 'medium', 'high'] as SensitivityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSensitivity(lvl)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition ${
                      sensitivity === lvl
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl === 'low' ? 'Nízká' : lvl === 'medium' ? 'Střední' : 'Vysoká'}
                  </button>
                ))}
              </div>

              {/* Quick Audio Test Button */}
              <button
                onClick={() => playTestWhistle(2500)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isTestTonePlaying
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-amber-300'
                }`}
                title="Přehraje jemný testovací tón 2.5 kHz do reproduktoru pro ověření detekce"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isTestTonePlaying ? 'Test běží...' : 'Test 2.5 kHz'}</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC FEEDBACK ALERT DISPLAY */}
          {activeFeedback ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950 via-red-900 to-rose-950 border-2 border-red-500/80 shadow-xl shadow-red-950/60 animate-pulse space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-xs uppercase font-black tracking-widest text-red-200">
                    Akustická vazba detekována!
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-red-300">
                  Úroveň: {activeFeedback.dbLevel} dBFS
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {formatFrequency(activeFeedback.frequency)}
                </span>
                <span className="text-sm sm:text-base font-bold text-red-200">
                  (nejbližší ISO fader: <b className="text-amber-300 underline underline-offset-4">{activeFeedback.nearestIsoBand}</b>)
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-red-500/40 text-xs text-red-100 flex items-center gap-2 mt-2">
                <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <b>Doporučený zásah na EQ:</b> Stáhněte pásmo <b className="text-amber-300">{activeFeedback.nearestIsoBand}</b> o <b className="text-white">{activeFeedback.suggestedCut}</b> na monitorové cestě nebo grafickém ekvalizéru.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-semibold">
                {isListening ? (
                  <>
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-bold">Odposlech aktivní</span> — Žádná vazba nezaznamenána
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    <span>Mikrofon je vypnutý. Pro zahájení analýzy stiskněte tlačítko výše.</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 31-BAND ISO GRAPHIC EQ RTA VISUALIZER */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>31-pásmový RTA Ekvalizér (1/3 oktávy ISO):</span>
              </span>
              <span className="text-[10px] text-slate-500">20 Hz — 20 kHz</span>
            </div>

            {/* Equalizer Bars Container */}
            <div className="h-44 sm:h-52 flex items-end justify-between gap-1 pt-4 pb-1 px-1 bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar">
              {isoBandsData.map((band) => {
                const isHighlight = band.isFeedback || (activeFeedback && activeFeedback.nearestIsoBand === band.label);
                return (
                  <div
                    key={band.freq}
                    className="flex-1 min-w-[16px] sm:min-w-[20px] flex flex-col items-center justify-end h-full gap-1 group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 hidden group-hover:flex px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-mono text-white whitespace-nowrap z-20 pointer-events-none">
                      {band.label} ({band.level}%)
                    </div>

                    {/* Bar graphic */}
                    <div className="w-full flex-1 bg-slate-950/60 rounded-t flex flex-col justify-end p-0.5 overflow-hidden">
                      <div
                        style={{ height: `${Math.max(4, band.level)}%` }}
                        className={`w-full rounded-t transition-all duration-75 ${
                          isHighlight
                            ? 'bg-red-500 shadow-lg shadow-red-500/80 animate-pulse'
                            : band.level > 70
                            ? 'bg-amber-500'
                            : band.level > 40
                            ? 'bg-indigo-500'
                            : 'bg-indigo-700/60'
                        }`}
                      />
                    </div>

                    {/* Band Label */}
                    <span
                      className={`text-[8px] sm:text-[9px] font-mono whitespace-nowrap rotate-[-55deg] origin-top-left translate-y-3 pb-2 transition-colors ${
                        isHighlight
                          ? 'text-red-400 font-black'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {band.label.replace(' Hz', '').replace(' kHz', 'k')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="h-4" /> {/* Spacer for rotated labels */}
          </div>

          {/* HIGH-RESOLUTION FFT SPECTRUM CURVE */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>Plynulé frekvenční spektrum (FFT Analyzér):</span>
              </span>
              <span className="text-[10px] text-slate-500">Logaritmická stupnice</span>
            </div>

            <div className="relative w-full h-36 bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={800}
                height={150}
                className="w-full h-full block"
              />
              {!isListening && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-slate-400 text-xs">
                  Pro zobrazení spektra zapněte odposlech mikrofonu
                </div>
              )}
            </div>
          </div>

          {/* FEEDBACK HISTORY LOG */}
          {feedbackHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Historie zachycených vazeb během zvukovky:</span>
                </span>
                <button
                  onClick={clearHistory}
                  className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vymazat historii</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {feedbackHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-red-400 text-sm">
                        {formatFrequency(item.frequency)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Pásmo: {item.nearestIsoBand} • {item.timestamp}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800/60 font-mono text-[10px] font-bold">
                      {item.suggestedCut}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Engineer's Guide */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <b>Tip zvukaře:</b> Při vytahování odposlechu při zvukovce sledujte spektrum. Jakmile se začne ozývat vazba, stačí se podívat na červeně zvýrazněné pásmo a stáhnout odpovídající fader na monitorovém grafickém ekvalizéru (např. 2.5 kHz nebo 4 kHz) o cca 3 až 6 dB. Není potřeba stahovat celkovou hlasitost odposlechu.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Zavřít
          </button>
        </div>

      </div>
    </div>
  );
};
