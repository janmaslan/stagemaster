import React, { useState } from 'react';
import { OutputRouting, StageItem } from '../../types/audio';
import { 
  Volume2, 
  Plus, 
  Trash2, 
  Radio, 
  Speaker, 
  Headphones, 
  Sliders 
} from 'lucide-react';

interface OutputRoutingViewProps {
  outputs: OutputRouting[];
  stageItems: StageItem[];
  onUpdateOutputs: (outputs: OutputRouting[]) => void;
}

const OUTPUT_TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  main_pa: { label: 'Hlavní PA systém', icon: Speaker, color: 'text-indigo-400 border-indigo-700 bg-indigo-950/60' },
  subwoofer: { label: 'Subwoofer', icon: Speaker, color: 'text-amber-400 border-amber-700 bg-amber-950/60' },
  wedge: { label: 'Wedge Monitor (Klín)', icon: Volume2, color: 'text-sky-400 border-sky-700 bg-sky-950/60' },
  iem_mono: { label: 'In-Ear (Mono)', icon: Headphones, color: 'text-purple-400 border-purple-700 bg-purple-950/60' },
  iem_stereo: { label: 'In-Ear (Stereo pár)', icon: Headphones, color: 'text-purple-400 border-purple-700 bg-purple-950/60' },
  sidefill: { label: 'Sidefill / Drumfill', icon: Speaker, color: 'text-emerald-400 border-emerald-700 bg-emerald-950/60' },
};

export const OutputRoutingView: React.FC<OutputRoutingViewProps> = ({
  outputs,
  stageItems,
  onUpdateOutputs,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const handleUpdateOutput = (id: string, updates: Partial<OutputRouting>) => {
    onUpdateOutputs(
      outputs.map((out) => (out.id === id ? { ...out, ...updates } : out))
    );
  };

  const handleDeleteOutput = (id: string) => {
    onUpdateOutputs(outputs.filter((out) => out.id !== id));
  };

  const handleAddOutput = () => {
    const nextNum = outputs.length > 0 ? Math.max(...outputs.map((o) => o.outputNumber)) + 1 : 1;
    const newOutput: OutputRouting = {
      id: 'out-' + Date.now(),
      outputNumber: nextNum,
      name: `Aux ${nextNum} - Monitor`,
      type: 'wedge',
      connector: 'XLR',
      snakePort: `Out ${nextNum}`,
      targetMusician: 'Muzikant',
      notes: '',
    };
    onUpdateOutputs([...outputs, newOutput]);
  };

  // Find monitor items on stage (wedges & IEMs)
  const monitorStageItems = stageItems.filter(
    (i) => i.type === 'wedge_monitor' || i.type === 'iem_station'
  );

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            Routing výstupů a pódiových odposlechů
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Přiřazení AUX sběrnic mixpultu, stagebox portů a pódiových monitorů.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddOutput}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Přidat výstup / Aux</span>
          </button>
        </div>
      </div>

      {/* Grid of Outputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outputs.map((out) => {
          const typeConf = OUTPUT_TYPE_CONFIG[out.type] || OUTPUT_TYPE_CONFIG.wedge;
          const Icon = typeConf.icon;

          return (
            <div
              key={out.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              {/* Card Header: Out # and Type Badge */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-xs text-indigo-400 flex items-center justify-center">
                    #{out.outputNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${typeConf.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{typeConf.label}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteOutput(out.id)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded transition"
                  title="Odstranit výstup"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Název výstupu / mixu
                  </label>
                  <input
                    type="text"
                    value={out.name}
                    onChange={(e) => handleUpdateOutput(out.id, { name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold focus:outline-none focus:border-indigo-500"
                    placeholder="Např. Aux 1 - Lead Vocal"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Typ odposlechu
                    </label>
                    <select
                      value={out.type}
                      onChange={(e) => handleUpdateOutput(out.id, { type: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="main_pa">Hlavní PA (L/R)</option>
                      <option value="subwoofer">Subwoofer</option>
                      <option value="wedge">Wedge monitor (Klín)</option>
                      <option value="iem_mono">In-Ear (Mono)</option>
                      <option value="iem_stereo">In-Ear (Stereo)</option>
                      <option value="sidefill">Sidefill / Drumfill</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Komu patří
                    </label>
                    <input
                      type="text"
                      value={out.targetMusician || ''}
                      onChange={(e) => handleUpdateOutput(out.id, { targetMusician: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="Např. Zpěvák, Bubeník..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Port na Stageboxu
                    </label>
                    <input
                      type="text"
                      value={out.snakePort || ''}
                      onChange={(e) => handleUpdateOutput(out.id, { snakePort: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="Out 1, Out 2..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Konektor / Přenos
                    </label>
                    <select
                      value={out.connector}
                      onChange={(e) => handleUpdateOutput(out.id, { connector: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="XLR">XLR kabel</option>
                      <option value="Jack">Jack 6.3 mm</option>
                      <option value="Wireless RF">Bezdrátový RF vysílač</option>
                    </select>
                  </div>
                </div>

                {/* Stage Item Link */}
                {monitorStageItems.length > 0 && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Spárovat s prvkem na pódiu
                    </label>
                    <select
                      value={out.stageItemId || ''}
                      onChange={(e) => handleUpdateOutput(out.id, { stageItemId: e.target.value || undefined })}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Nepřiřazeno k pódiovému monitoru</option>
                      {monitorStageItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.type === 'wedge_monitor' ? 'Wedge' : 'IEM'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Poznámky pro zvukaře
                  </label>
                  <input
                    type="text"
                    value={out.notes || ''}
                    onChange={(e) => handleUpdateOutput(out.id, { notes: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Např. Ořezat basy pod 80Hz, chce hodně zpěv a kopák..."
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
