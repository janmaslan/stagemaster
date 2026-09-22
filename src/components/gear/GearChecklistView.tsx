import React, { useState } from 'react';
import { EventProject, StandType } from '../../types/audio';
import { 
  Boxes, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Mic, 
  Cable, 
  Zap, 
  Speaker, 
  ShieldCheck, 
  Printer 
} from 'lucide-react';

interface GearChecklistViewProps {
  project: EventProject;
}

export const GearChecklistView: React.FC<GearChecklistViewProps> = ({ project }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetChecks = () => {
    if (confirm('Chcete odškrtnout všechny položky pro nové balení techniky?')) {
      setCheckedItems({});
    }
  };

  // 1. Calculate Microphones & DI Boxes from Input List
  const micCounts: Record<string, number> = {};
  project.channels.forEach((ch) => {
    const key = ch.micOrDi.trim() || 'Neurčený mikrofon';
    micCounts[key] = (micCounts[key] || 0) + 1;
  });

  // Additional DI boxes from stage items if not covered
  const stageDiItems = project.items.filter((i) => i.type === 'di_box');
  const stageDiCounts: Record<string, number> = {};
  stageDiItems.forEach((i) => {
    const label = i.diType ? `DI Box (${i.diType})` : i.name;
    stageDiCounts[label] = (stageDiCounts[label] || 0) + 1;
  });

  // 2. Calculate Stands from Input List
  const standCounts: Record<StandType, number> = {
    high_boom: 0,
    low_boom: 0,
    straight: 0,
    clip_clamp: 0,
    none: 0,
  };
  project.channels.forEach((ch) => {
    standCounts[ch.stand] = (standCounts[ch.stand] || 0) + 1;
  });

  // 3. Calculate Cables from connections + channel patch lengths
  const cableLengthsXLR: Record<number, number> = { 3: 0, 5: 0, 10: 0, 15: 0, 20: 0 };
  const otherCables: Record<string, number> = {};

  // Count visual stage cables
  project.cables.forEach((c) => {
    if (c.type === 'xlr') {
      const len = c.lengthMeters || 10;
      cableLengthsXLR[len] = (cableLengthsXLR[len] || 0) + 1;
    } else {
      const typeLabel =
        c.type === 'jack'
          ? `Jack 6.3mm (${c.lengthMeters}m)`
          : c.type === 'power'
          ? `Napájecí 230V (${c.lengthMeters}m)`
          : c.type === 'speakon'
          ? `Speakon repro (${c.lengthMeters}m)`
          : `Cat5/Cat6 Ethernet (${c.lengthMeters}m)`;
      otherCables[typeLabel] = (otherCables[typeLabel] || 0) + 1;
    }
  });

  // 4. Power Drops / 230V requirements
  const powerDropsCount = project.items.filter((i) => i.type === 'power_drop').length;
  const powerConsumersCount = project.items.filter((i) => i.powerRequired).length;

  // 5. Monitors & Stageboxes
  const wedgeCount = project.items.filter((i) => i.type === 'wedge_monitor').length;
  const iemCount = project.items.filter((i) => i.type === 'iem_station').length;
  const stageboxCount = project.items.filter((i) => i.type === 'stagebox').length;
  const subSnakeCount = project.items.filter((i) => i.type === 'sub_snake').length;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-indigo-400" />
            Inventář materiálu a kalkulátor kabeláže pro akci
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Automaticky spočítaný seznam techniky na základě stage plánu, vstupů a výstupů.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            <span>Vytisknout checklist</span>
          </button>
          <button
            onClick={handleResetChecks}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="Resetovat zaškrtnutí"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset zaškrtnutí</span>
          </button>
        </div>
      </div>

      {/* Grid of Inventory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Microphones & DI Boxes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-indigo-400" />
              Mikrofony &amp; DI Boxy ({project.channels.length} ks)
            </h4>
          </div>

          <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
            {Object.entries(micCounts).map(([mic, count]) => {
              const key = `mic_${mic}`;
              const isChecked = !!checkedItems[key];
              return (
                <div
                  key={mic}
                  onClick={() => toggleCheck(key)}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 line-through opacity-70'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-medium truncate max-w-[200px]">{mic}</span>
                  </div>
                  <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-indigo-300 border border-slate-800">
                    {count}×
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stands (Stojany na mikrofony) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Stojany na mikrofony
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { type: 'high_boom', label: 'Vysoká šibenice (Zpěv, OH)', count: standCounts.high_boom },
              { type: 'low_boom', label: 'Malá šibenice (Kopák, aparáty)', count: standCounts.low_boom },
              { type: 'clip_clamp', label: 'Clampy / Klipy na ráfek (Tomy)', count: standCounts.clip_clamp },
              { type: 'straight', label: 'Rovný stojan', count: standCounts.straight },
            ]
              .filter((s) => s.count > 0)
              .map((s) => {
                const key = `stand_${s.type}`;
                const isChecked = !!checkedItems[key];
                return (
                  <div
                    key={s.type}
                    onClick={() => toggleCheck(key)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 line-through opacity-70'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className="font-medium">{s.label}</span>
                    </div>
                    <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-amber-300 border border-slate-800">
                      {s.count}×
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Cables Inventory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
              <Cable className="w-4 h-4 text-sky-400" />
              Kabeláž (Signál &amp; Silové)
            </h4>
          </div>

          <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
            {/* XLR lengths */}
            {Object.entries(cableLengthsXLR)
              .filter(([_, count]) => count > 0)
              .map(([len, count]) => {
                const key = `cable_xlr_${len}`;
                const isChecked = !!checkedItems[key];
                return (
                  <div
                    key={len}
                    onClick={() => toggleCheck(key)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 line-through opacity-70'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span className="font-medium">XLR mikrofonní ({len} m)</span>
                    </div>
                    <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-sky-300 border border-slate-800">
                      {count}×
                    </span>
                  </div>
                );
              })}

            {/* Other cables */}
            {Object.entries(otherCables).map(([label, count]) => {
              const key = `cable_other_${label}`;
              const isChecked = !!checkedItems[key];
              return (
                <div
                  key={label}
                  onClick={() => toggleCheck(key)}
                  className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300 line-through opacity-70'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-yellow-300 border border-slate-800">
                    {count}×
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 230V Power Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-red-400" />
              230V Napájení na pódiu
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span>Zásuvková hnízda (rozvody):</span>
              <span className="font-mono font-bold text-red-400">{powerDropsCount || 2}×</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span>Zařízení vyžadující napájení:</span>
              <span className="font-mono font-bold text-red-400">{powerConsumersCount} spotřebičů</span>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Nezapomeňte vzít rezervní prodlužovací psy 230V k pedálboardům a aparátům.
            </p>
          </div>
        </div>

        {/* Monitoring & Stageboxes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Speaker className="w-4 h-4 text-purple-400" />
              Pódiové odposlechy &amp; Stageboxy
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span>Wedge monitory (podlahové):</span>
              <span className="font-mono font-bold text-sky-400">{wedgeCount}×</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span>In-Ear systémy (IEM vysílače/bodypacky):</span>
              <span className="font-mono font-bold text-purple-400">{iemCount}×</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <span>Hlavní pódiový Stagebox:</span>
              <span className="font-mono font-bold text-emerald-400">{stageboxCount}×</span>
            </div>
            {subSnakeCount > 0 && (
              <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <span>Sub-snakes (drop boxy např. na bicí):</span>
                <span className="font-mono font-bold text-emerald-400">{subSnakeCount}×</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
