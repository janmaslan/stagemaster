import React, { useRef, useState } from 'react';
import { EventProject } from '../../types/audio';
import { MIXER_PROFILES } from '../../data/presets';
import { getStageIconComponent } from '../stage/StageIcons';
import { CableLayer } from '../stage/CableLayer';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Sliders, 
  Calendar, 
  MapPin, 
  User, 
  Sparkles 
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface RiderExportViewProps {
  project: EventProject;
}

export const RiderExportView: React.FC<RiderExportViewProps> = ({ project }) => {
  const printableRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const mixer = MIXER_PROFILES.find((m) => m.id === project.mixerId) || MIXER_PROFILES[0];

  // Copy plain text input list to clipboard
  const handleCopyInputListText = () => {
    let text = `TECHNICAL RIDER & INPUT LIST - ${project.bandName.toUpperCase()}\n`;
    text += `Akce: ${project.name} | Datum: ${project.date} | Místo: ${project.venue}\n`;
    text += `Zvukař: ${project.soundEngineer} | Mix: ${mixer.name}\n\n`;
    text += `INPUT LIST:\n`;
    text += `----------------------------------------------------------------------------------\n`;
    text += `CH | NÁSTROJ / ZDROJ     | MIKROFON / DI BOX                 | STOJAN         | 48V | STAGEBOX\n`;
    text += `----------------------------------------------------------------------------------\n`;
    project.channels.forEach((ch) => {
      const chNum = ch.channelNumber.toString().padEnd(2, ' ');
      const name = ch.name.padEnd(20, ' ').slice(0, 20);
      const mic = ch.micOrDi.padEnd(33, ' ').slice(0, 33);
      const stand = ch.stand.padEnd(14, ' ').slice(0, 14);
      const p48 = ch.phantom48V ? 'ANO' : ' - ';
      const snake = ch.snakePort;
      text += `${chNum} | ${name} | ${mic} | ${stand} | ${p48} | ${snake}\n`;
    });

    text += `\nOUTPUTS & MONITORING:\n`;
    text += `----------------------------------------------------------------------------------\n`;
    project.outputs.forEach((out) => {
      text += `Out #${out.outputNumber}: ${out.name} (${out.type}) -> ${out.snakePort || 'Local'} [${out.targetMusician || ''}]\n`;
    });

    if (project.generalNotes) {
      text += `\nPOZNÁMKY:\n${project.generalNotes}\n`;
    }

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Direct download PDF using html2canvas & jsPDF
  const handleDownloadPdf = async () => {
    if (!printableRef.current) return;
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(printableRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${project.bandName.replace(/\s+/g, '_')}_stage_rider.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Export PDF selhal, můžete použít tlačítko Tisk do PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Technický Rider &amp; Stage Plot pro tisk
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dokument připravený pro pořadatele, techniky a kapelu k zaslání nebo vytištění.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyInputListText}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zkopírováno!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-indigo-400" />
                <span>Kopírovat textový rider</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Tisk (A4)</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/30"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Generuji PDF...' : 'Stáhnout PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (styled cleanly with black text on white for crisp printout) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sm:p-6 overflow-x-auto flex justify-center">
        <div
          ref={printableRef}
          className="w-full max-w-4xl bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 font-sans text-xs"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                TECHNICAL RIDER &amp; STAGE PLOT
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {project.bandName || 'NÁZEV KAPELY'}
              </h1>
              <p className="text-sm font-semibold text-slate-600">{project.name}</p>
            </div>

            <div className="text-right text-xs space-y-1 font-medium text-slate-600">
              <div className="flex items-center justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Datum: <b>{project.date}</b></span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Místo: <b>{project.venue}</b></span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Zvukař: <b>{project.soundEngineer}</b></span>
              </div>
              <div className="flex items-center justify-end gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                <span>Doporučený mix: <b>{mixer.name}</b></span>
              </div>
            </div>
          </div>

          {/* Visual Stage Plot View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                1. Rozmístění na pódiu (Stage Plot)
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">
                Rozměry: {project.stageDimensions.widthMeters}m šířka × {project.stageDimensions.depthMeters}m hloubka
              </span>
            </div>

            {/* Stage Box for Printout */}
            <div className="relative w-full aspect-[16/9] bg-slate-100 border-2 border-slate-900 rounded-xl overflow-hidden shadow-inner">
              {/* Back wall */}
              <div className="absolute top-0 inset-x-0 bg-slate-200 py-0.5 px-3 flex justify-between text-[9px] font-bold text-slate-500 tracking-wider">
                <span>◄ BACKSTAGE (ZÁZEMÍ)</span>
                <span>ZADNÍ ČÁST PÓDIA</span>
                <span>BACKSTAGE ►</span>
              </div>

              {/* Audience Front */}
              <div className="absolute bottom-0 inset-x-0 bg-indigo-100 border-t border-indigo-300 py-1 px-3 text-center text-[10px] font-black text-indigo-900 tracking-wider uppercase">
                ▼ PŘEDEK PÓDIA — PUBLIKUM &amp; FOH ZVUKAŘ ▼
              </div>

              {/* Cable Layer */}
              <CableLayer
                cables={project.cables}
                items={project.items}
                filterType="all"
              />

              {/* Stage Items */}
              {project.items.map((item) => {
                const Icon = getStageIconComponent(item.type);
                return (
                  <div
                    key={item.id}
                    style={{
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                    }}
                    className="absolute z-20 pointer-events-none select-none"
                  >
                    <div className="flex flex-col items-center p-1 rounded-xl bg-white border-2 border-slate-800 shadow-md">
                      {item.powerRequired && (
                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[7px] font-black">
                          ⚡
                        </span>
                      )}
                      <div className="w-6 h-6 flex items-center justify-center text-slate-800">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-bold text-slate-900 mt-0.5 max-w-[70px] truncate whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input List Table */}
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              2. Přehled vstupních kanálů (Input / Patch List)
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-slate-800 text-[11px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 text-left font-bold">
                  <th className="p-1.5 border-r border-slate-300 text-center w-8">CH</th>
                  <th className="p-1.5 border-r border-slate-300">Zdroj / Nástroj</th>
                  <th className="p-1.5 border-r border-slate-300">Mikrofon / DI Box</th>
                  <th className="p-1.5 border-r border-slate-300">Stojan</th>
                  <th className="p-1.5 border-r border-slate-300 text-center w-12">+48V</th>
                  <th className="p-1.5 border-r border-slate-300">Stagebox port</th>
                  <th className="p-1.5">Poznámka</th>
                </tr>
              </thead>
              <tbody>
                {project.channels.map((ch, idx) => (
                  <tr
                    key={ch.id}
                    className={`border-b border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold font-mono">
                      {ch.channelNumber}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-bold">{ch.name}</td>
                    <td className="p-1.5 border-r border-slate-300">{ch.micOrDi}</td>
                    <td className="p-1.5 border-r border-slate-300">
                      {ch.stand === 'high_boom'
                        ? 'Vysoká šibenice'
                        : ch.stand === 'low_boom'
                        ? 'Malá šibenice'
                        : ch.stand === 'clip_clamp'
                        ? 'Clip / Clamp'
                        : ch.stand === 'straight'
                        ? 'Rovný stojan'
                        : 'Bez stojanu'}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                      {ch.phantom48V ? (
                        <span className="text-red-600 font-bold">ANO</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono">{ch.snakePort}</td>
                    <td className="p-1.5 text-slate-600 text-[10px]">{ch.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Outputs Table & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                3. Výstupy &amp; Monitoring (Aux Sends)
              </h2>
              <table className="w-full border-collapse border border-slate-300 text-slate-800 text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 text-left font-bold">
                    <th className="p-1.5 border-r border-slate-300 w-8 text-center">#</th>
                    <th className="p-1.5 border-r border-slate-300">Název / Odposlech</th>
                    <th className="p-1.5 border-r border-slate-300">Typ</th>
                    <th className="p-1.5">Stagebox</th>
                  </tr>
                </thead>
                <tbody>
                  {project.outputs.map((out, idx) => (
                    <tr
                      key={out.id}
                      className={`border-b border-slate-200 ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
                    >
                      <td className="p-1.5 border-r border-slate-300 text-center font-bold font-mono">
                        {out.outputNumber}
                      </td>
                      <td className="p-1.5 border-r border-slate-300 font-semibold">{out.name}</td>
                      <td className="p-1.5 border-r border-slate-300">
                        {out.type === 'wedge'
                          ? 'Wedge klín'
                          : out.type.startsWith('iem')
                          ? 'In-Ear'
                          : 'PA Systém'}
                      </td>
                      <td className="p-1.5 font-mono">{out.snakePort || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                4. Důležité technické požadavky
              </h2>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg space-y-1.5 text-[11px] text-slate-700">
                <div>
                  ⚡ <b>Napájení:</b> Zásuvky 230V u bubeníka a na obou stranách pódia pro aparáty.
                </div>
                <div>
                  🔊 <b>Zvuková zkouška:</b> Požadovaný čas minimálně 45 minut před vystoupením.
                </div>
                {project.generalNotes && (
                  <div className="pt-1 border-t border-slate-200">
                    <b>Poznámky:</b> {project.generalNotes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
