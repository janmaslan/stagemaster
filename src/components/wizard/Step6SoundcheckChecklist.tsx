import React, { useState } from 'react';
import { XR18ChannelPatch, XR18OutputPatch, SelectedInstrument } from '../../types/wizard';
import { 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Volume2, 
  Sliders,
  ArrowLeft
} from 'lucide-react';

interface Step6SoundcheckChecklistProps {
  bandName: string;
  instruments: SelectedInstrument[];
  channels: XR18ChannelPatch[];
  outputs: XR18OutputPatch[];
  powerDrops: { location: string; reason: string; items: string[] }[];
  completedTasks: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
  onResetTasks: () => void;
  onBackToStart: () => void;
}

export const Step6SoundcheckChecklist: React.FC<Step6SoundcheckChecklistProps> = ({
  bandName,
  instruments,
  channels,
  outputs,
  powerDrops,
  completedTasks,
  onToggleTask,
  onResetTasks,
  onBackToStart,
}) => {
  const [copied, setCopied] = useState(false);

  const checklistItems = [
    { id: 't1', title: '1. Rozmísti prodlužovačky 230V', desc: 'Polož psy u mixu vzadu a po stranách pódia pro komba a klávesy.' },
    { id: 't2', title: '2. Zapoj XR18 a Wi-Fi router do elektřiny', desc: 'Zapni mix i router a připoj tablet/mobil k Wi-Fi síti mixu.' },
    { id: 't3', title: '3. Rozmísti DI boxy a stojany na mikrofony', desc: 'Polož DI box ke klávesám a base, nastav mikrofony ke kombům a zpěvům.' },
    { id: 't4', title: '4. Zapoj XLR kabely do XR18 (vstupy 1–16)', desc: 'Postupuj podle očíslovaného seznamu níže (1 až 16).' },
    { id: 't5', title: '5. Zapoj Main L a Main R do hlavního PA', desc: 'Z výstupů Main L/R natáhni kabely do hlavních beden / subwooferů.' },
    { id: 't6', title: '6. Zapoj odposlechy do Aux 1–6', desc: 'Z konektorů Aux natáhni kabely do pódiových klínů a sluchátkových stanic.' },
    { id: 't7', title: '7. Zapni +48V Phantom v aplikaci X-AIR', desc: 'POZOR: Zapni 48V jen u vyznačených kanálů (overheady, aktivní DI).' },
    { id: 't8', title: '8. Nastav Gainy na vstupech (Soundcheck)', desc: 'Muzikanti ať hrají naplno. Hladina signálu by měla blikat v zeleném/žlutém pásmu (kolem -18 až -12 dB).' },
    { id: 't9', title: '9. Nastav muzikantům poměry v odposleších', desc: 'V aplikaci X-AIR přes tlačítko SENDS ON FADER pro jednotlivé Auxy.' },
    { id: 't10', title: '10. Vytáhni Main fader a hrajte!', desc: 'Celá aparatura je správně a bezpečně zapojena.' },
  ];

  const completedCount = checklistItems.filter((i) => completedTasks[i.id]).length;

  const handleCopyText = () => {
    let text = `ZVUKAŘSKÝ TAHÁK PRO BEHRINGER XR18 - ${bandName || 'KAPELA'}\n`;
    text += `==========================================================\n\n`;
    text += `VSTUPY DO XR18 (CHANNELS 1-16):\n`;
    channels.forEach((c) => {
      text += `CH ${c.chNumber.toString().padStart(2, '0')}: ${c.label} (${c.cableType}) ${c.needsPhantom48V ? '[+48V]' : ''} ${c.isHiZ ? '[Hi-Z]' : ''}\n`;
    });
    text += `\nVÝSTUPY (PA & MONITORING):\n`;
    outputs.forEach((o) => {
      text += `${o.portLabel}: ${o.destination}\n`;
    });
    text += `\nELEKTŘINA 230V:\n`;
    powerDrops.forEach((p) => {
      text += `- ${p.location}: ${p.items.join(', ')}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
            Hotovo • Váš tahák do kapsy
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">
            {completedCount} z {checklistItems.length} hotovo
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Postup stavby a zvukové zkoušky na pódiu
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tento tahák si nechte otevřený na mobilu. Během stavby aparatury si jednoduše odškrtávejte jednotlivé kroky.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyText}
          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
          <span>{copied ? 'Zkopírováno!' : 'Kopírovat tahák do schránky'}</span>
        </button>

        <button
          onClick={() => window.print()}
          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
          title="Tisk"
        >
          <Printer className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Tisk</span>
        </button>

        <button
          onClick={onResetTasks}
          className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          title="Resetovat odškrtávání"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Step-by-Step Checklist */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Kontrolní seznam krok za krokem:
        </h3>

        {checklistItems.map((item) => {
          const isDone = !!completedTasks[item.id];
          return (
            <div
              key={item.id}
              onClick={() => onToggleTask(item.id)}
              className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-xs sm:text-sm ${isDone ? 'line-through text-emerald-300' : 'text-white'}`}>
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Reference Table for XR18 Channels */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Rychlý tahák: Co kam zapojit na XR18
        </h3>

        <div className="space-y-1.5 text-xs">
          {channels.map((ch) => (
            <div
              key={ch.chNumber}
              className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-slate-900 font-mono font-bold text-indigo-400 text-center leading-6 shrink-0">
                  {ch.chNumber}
                </span>
                <span className="font-semibold text-white">{ch.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400 font-mono">{ch.cableType}</span>
                {ch.isHiZ && (
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                    Hi-Z
                  </span>
                )}
                {ch.needsPhantom48V && (
                  <span className="bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-bold">
                    48V
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button to Start Over / Edit Instruments */}
      <div className="pt-2 text-center">
        <button
          onClick={onBackToStart}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
        >
          ◄ Upravit nástroje nebo složení kapely (Krok 1)
        </button>
      </div>
    </div>
  );
};
