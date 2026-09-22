import React, { useState } from 'react';
import { 
  Music, 
  Mic2, 
  Volume2, 
  Cpu, 
  Plus, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { StageElementType } from '../../types/audio';
import { 
  DrumsIcon, 
  GuitarAmpIcon, 
  BassAmpIcon, 
  AcousticGuitarIcon, 
  KeyboardIcon, 
  VocalMicIcon, 
  WedgeMonitorIcon, 
  IemStationIcon, 
  StageboxIcon, 
  SubSnakeIcon, 
  DiBoxIcon, 
  PowerDropIcon 
} from './StageIcons';

interface StageToolbarProps {
  onAddItem: (type: StageElementType, name: string) => void;
}

interface ItemPreset {
  type: StageElementType;
  name: string;
  icon: React.FC<{ className?: string }>;
}

const CATEGORIES: {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  items: ItemPreset[];
}[] = [
  {
    id: 'instruments',
    label: 'Nástroje',
    icon: Music,
    items: [
      { type: 'drums', name: 'Bicí souprava', icon: DrumsIcon },
      { type: 'guitar_amp', name: 'Kytarové kombo', icon: GuitarAmpIcon },
      { type: 'bass_amp', name: 'Baskytarový aparát', icon: BassAmpIcon },
      { type: 'keyboard', name: 'Klávesy / Piano', icon: KeyboardIcon },
      { type: 'acoustic_guitar', name: 'Akustická kytara', icon: AcousticGuitarIcon },
    ],
  },
  {
    id: 'vocals',
    label: 'Zpěvy',
    icon: Mic2,
    items: [
      { type: 'vocal', name: 'Hlavní zpěv (Lead)', icon: VocalMicIcon },
      { type: 'vocal', name: 'Doprovodný zpěv', icon: VocalMicIcon },
    ],
  },
  {
    id: 'monitors',
    label: 'Monitory',
    icon: Volume2,
    items: [
      { type: 'wedge_monitor', name: 'Wedge Monitor (Klín)', icon: WedgeMonitorIcon },
      { type: 'iem_station', name: 'In-Ear Stanice (IEM)', icon: IemStationIcon },
    ],
  },
  {
    id: 'infra',
    label: 'Pódium / Boxy',
    icon: Cpu,
    items: [
      { type: 'stagebox', name: 'Hlavní Stagebox', icon: StageboxIcon },
      { type: 'sub_snake', name: 'Sub-snake (Drop box)', icon: SubSnakeIcon },
      { type: 'di_box', name: 'Aktivní DI Box', icon: DiBoxIcon },
      { type: 'power_drop', name: '230V Zásuvkové hnízdo', icon: PowerDropIcon },
    ],
  },
];

export const StageToolbar: React.FC<StageToolbarProps> = ({ onAddItem }) => {
  const [activeCategory, setActiveCategory] = useState<string>('instruments');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const currentCat = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-2 shadow-xl">
      {/* Category selector header */}
      <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setIsExpanded(true);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 text-xs flex items-center"
          title={isExpanded ? 'Sbalit lištu' : 'Rozbalit lištu'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Item Buttons */}
      {isExpanded && (
        <div className="flex items-center gap-2 overflow-x-auto py-2 pr-2 no-scrollbar">
          {currentCat.items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onAddItem(item.type, item.name)}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition transform active:scale-95 group shadow-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300">
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.name}</span>
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
