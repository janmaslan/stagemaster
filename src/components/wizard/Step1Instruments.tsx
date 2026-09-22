import React from 'react';
import { SelectedInstrument, InstrumentCategory, StagePosition } from '../../types/wizard';
import { 
  Mic2, 
  Music, 
  Trash2, 
  Plus, 
  Volume2, 
  Headphones, 
  Smartphone, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  DrumsIcon, 
  GuitarAmpIcon, 
  BassAmpIcon, 
  AcousticGuitarIcon, 
  KeyboardIcon, 
  VocalMicIcon, 
  HornIcon 
} from '../stage/StageIcons';

interface Step1InstrumentsProps {
  instruments: SelectedInstrument[];
  onUpdateInstruments: (instruments: SelectedInstrument[]) => void;
  onNext: () => void;
}

const PRESET_OPTIONS: {
  category: InstrumentCategory;
  label: string;
  defaultName: string;
  defaultConnection: SelectedInstrument['connectionType'];
  needsPower: boolean;
  icon: React.FC<{ className?: string }>;
}[] = [
  { category: 'vocals', label: 'Zpěv (Vokál)', defaultName: 'Hlavní zpěv', defaultConnection: 'xlr_mic', needsPower: false, icon: VocalMicIcon },
  { category: 'electric_guitar', label: 'Elektrická kytara', defaultName: 'Kytara kombo', defaultConnection: 'xlr_mic', needsPower: true, icon: GuitarAmpIcon },
  { category: 'bass', label: 'Baskytara', defaultName: 'Basa', defaultConnection: 'jack_direct_hiz', needsPower: true, icon: BassAmpIcon },
  { category: 'drums', label: 'Bicí souprava', defaultName: 'Bicí', defaultConnection: 'drum_kit', needsPower: false, icon: DrumsIcon },
  { category: 'keys', label: 'Klávesy / Piano', defaultName: 'Klávesy Stereo', defaultConnection: 'jack_stereo_di', needsPower: true, icon: KeyboardIcon },
  { category: 'acoustic_guitar', label: 'Akustická kytara', defaultName: 'Akustická kytara', defaultConnection: 'jack_di', needsPower: false, icon: AcousticGuitarIcon },
  { category: 'horns', label: 'Dechy / Jiné', defaultName: 'Saxofon', defaultConnection: 'xlr_mic', needsPower: false, icon: HornIcon },
  { category: 'backing_track', label: 'Mobil / Podkres', defaultName: 'Mobil podkres', defaultConnection: 'jack_di', needsPower: false, icon: Smartphone as any },
];

export const Step1Instruments: React.FC<Step1InstrumentsProps> = ({
  instruments,
  onUpdateInstruments,
  onNext,
}) => {
  const handleAdd = (option: typeof PRESET_OPTIONS[0]) => {
    // Determine default position
    let defaultPos: StagePosition = 'center';
    if (option.category === 'drums') defaultPos = 'back_center';
    else if (option.category === 'electric_guitar') defaultPos = 'left';
    else if (option.category === 'bass') defaultPos = 'right';
    else if (option.category === 'keys') defaultPos = 'right';
    else if (option.category === 'vocals') {
      const existingVocals = instruments.filter((i) => i.category === 'vocals');
      if (existingVocals.length === 0) defaultPos = 'center';
      else if (existingVocals.length === 1) defaultPos = 'left';
      else defaultPos = 'right';
    }

    const countOfSame = instruments.filter((i) => i.category === option.category).length;
    const name = countOfSame > 0 ? `${option.defaultName} ${countOfSame + 1}` : option.defaultName;

    const newItem: SelectedInstrument = {
      id: 'inst-' + Date.now() + Math.random().toString(36).slice(2, 6),
      category: option.category,
      name,
      position: defaultPos,
      connectionType: option.defaultConnection,
      drumMicsOption: option.category === 'drums' ? 'basic' : undefined,
      diType: option.category === 'keys' ? 'stereo_passive' : option.category === 'bass' ? 'none' : 'none',
      needsPower230V: option.needsPower,
      monitorType: option.category === 'backing_track' ? 'none' : 'wedge',
    };

    onUpdateInstruments([...instruments, newItem]);
  };

  const handleRemove = (id: string) => {
    onUpdateInstruments(instruments.filter((i) => i.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<SelectedInstrument>) => {
    onUpdateInstruments(
      instruments.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
          Krok 1 z 5
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
          Kdo a co bude na pódiu?
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Klepnutím na tlačítka níže jednoduše přidejte nástroje a zpěváky, které vaše kapela má.
        </p>
      </div>

      {/* Buttons to Add Instruments */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESET_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.category}
              onClick={() => handleAdd(opt)}
              className="flex items-center gap-2 p-3 bg-slate-900/90 hover:bg-indigo-950/60 active:scale-95 border border-slate-800 hover:border-indigo-600 rounded-xl transition text-left group shadow-md"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:text-white group-hover:bg-indigo-600 transition shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  + {opt.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mini Visual Stage Representation */}
      {instruments.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="font-semibold">Vizuální přehled scény</span>
            <span className="font-mono text-indigo-400">{instruments.length} na scéně</span>
          </div>

          <div className="relative aspect-[16/7] bg-slate-950 border border-slate-800 rounded-xl mt-2 overflow-hidden flex flex-col justify-between p-2">
            {/* Backstage row */}
            <div className="flex justify-around items-center">
              {instruments
                .filter((i) => i.position.startsWith('back'))
                .map((i) => (
                  <span
                    key={i.id}
                    className="text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-lg shadow truncate max-w-[100px]"
                  >
                    {i.name}
                  </span>
                ))}
            </div>

            {/* Frontstage row */}
            <div className="flex justify-around items-center">
              {instruments
                .filter((i) => !i.position.startsWith('back'))
                .map((i) => (
                  <span
                    key={i.id}
                    className="text-[10px] font-bold bg-indigo-950 text-indigo-200 border border-indigo-700 px-2 py-0.5 rounded-lg shadow truncate max-w-[100px]"
                  >
                    {i.name}
                  </span>
                ))}
            </div>

            <div className="text-center text-[9px] font-extrabold text-slate-600 tracking-widest uppercase border-t border-slate-900 pt-0.5">
              ▼ PUBLIKUM &amp; ZVUKAŘ (FOH) ▼
            </div>
          </div>
        </div>
      )}

      {/* List of Added Instruments with Quick Configuration Cards */}
      {instruments.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl p-6">
          <Music className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-bounce" />
          <p className="text-sm font-semibold text-slate-300">
            Pódium je zatím prázdné
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Klepněte na tlačítka nahoře a přidejte své nástroje a zpěvy (např. Zpěv, Kytara, Basa, Bicí).
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Seznam vybraných prvků ({instruments.length})
          </h3>

          {instruments.map((inst, index) => (
            <div
              key={inst.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md space-y-2"
            >
              {/* Row 1: Name and Delete */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={inst.name}
                    onChange={(e) => handleUpdate(inst.id, { name: e.target.value })}
                    className="bg-slate-800/80 font-bold text-white text-xs sm:text-sm px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 flex-1 truncate"
                    placeholder="Název (např. Kytara - Pavel)"
                  />
                </div>

                <button
                  onClick={() => handleRemove(inst.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                  title="Odstranit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Row 2: Position & Monitoring Selectors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Kde stojí na pódiu:
                  </label>
                  <select
                    value={inst.position}
                    onChange={(e) => handleUpdate(inst.id, { position: e.target.value as StagePosition })}
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="left">Vlevo (Stage Right)</option>
                    <option value="center">Střed pódia</option>
                    <option value="right">Vpravo (Stage Left)</option>
                    <option value="back_center">Vzadu uprostřed (Bicí)</option>
                    <option value="back_left">Vzadu vlevo</option>
                    <option value="back_right">Vzadu vpravo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    Typ odposlechu:
                  </label>
                  <select
                    value={inst.monitorType}
                    onChange={(e) => handleUpdate(inst.id, { monitorType: e.target.value as any })}
                    className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="wedge">Podlahový klín (Wedge)</option>
                    <option value="iem">In-Ear (Sluchátka)</option>
                    <option value="none">Bez odposlechu</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sticky Bottom Bar for Next Step */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-3 flex items-center justify-between z-30 max-w-7xl mx-auto">
        <span className="text-xs text-slate-400">
          Vybráno: <b className="text-white">{instruments.length} nástrojů/zpěvů</b>
        </span>

        <button
          onClick={onNext}
          disabled={instruments.length === 0}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          <span>2. Krok: Signál a DI boxy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
