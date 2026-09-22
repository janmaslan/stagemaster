import React from 'react';
import { InteractiveStageItem } from '../../types/interactiveStage';
import { 
  DrumsIcon, 
  GuitarAmpIcon, 
  BassAmpIcon, 
  AcousticGuitarIcon, 
  KeyboardIcon, 
  VocalMicIcon, 
  WedgeMonitorIcon, 
  IemStationIcon 
} from '../stage/StageIcons';
import { 
  Sliders, 
  Speaker, 
  Zap, 
  Mic 
} from 'lucide-react';

interface StageItemVisualProps {
  item: InteractiveStageItem;
  isSelected: boolean;
  onSelect: () => void;
  onPointerDown: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const StageItemVisual: React.FC<StageItemVisualProps> = ({
  item,
  isSelected,
  onSelect,
  onPointerDown,
}) => {
  // SPECIAL COMPACT VISUAL FOR 230V POWER STRIP (PRODLUŽKA)
  if (item.subType === 'power_strip') {
    return (
      <div
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        style={{
          left: `${item.x}%`,
          top: `${item.y}%`,
          transform: `translate(-50%, -50%)`,
        }}
        className={`absolute cursor-grab active:cursor-grabbing z-20 select-none touch-none transition-transform ${
          isSelected ? 'z-30 scale-110' : ''
        }`}
        title={`${item.name} (Klepnutím vyberte nebo přetáhněte)`}
      >
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full border shadow-md transition ${
            isSelected
              ? 'bg-red-950 border-red-400 ring-2 ring-red-400 text-white shadow-red-500/40'
              : 'bg-slate-900/90 border-red-700/80 hover:border-red-400 text-red-300'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="text-[10px] font-black font-mono tracking-tight whitespace-nowrap">
            {item.name.replace('Prodlužka 230V', '230V').replace('Prodlužka', '230V')}
          </span>
        </div>
      </div>
    );
  }

  const renderIcon = () => {
    switch (item.subType) {
      case 'drums': return <DrumsIcon className="w-8 h-8 text-amber-400" />;
      case 'guitar_amp': return <GuitarAmpIcon className="w-7 h-7 text-blue-400" />;
      case 'bass_amp': return <BassAmpIcon className="w-7 h-7 text-emerald-400" />;
      case 'keyboard': return <KeyboardIcon className="w-7 h-7 text-purple-400" />;
      case 'acoustic_guitar': return <AcousticGuitarIcon className="w-7 h-7 text-amber-500" />;
      case 'lead_vox':
      case 'backing_vox':
      case 'vocal': return <VocalMicIcon className="w-7 h-7 text-rose-400" />;
      case 'pa_speaker': return <Speaker className="w-7 h-7 text-indigo-400" />;
      case 'wedge':
      case 'monitor_wedge': return <WedgeMonitorIcon className="w-7 h-7 text-sky-400" />;
      case 'iem_station': return <IemStationIcon className="w-7 h-7 text-purple-400" />;
      case 'xr18':
      case 'mixer':
        return (
          <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-600 flex flex-col items-center justify-center text-white">
            <span className="text-[8px] font-black leading-none text-amber-400">XR18</span>
            <Sliders className="w-4 h-4 text-indigo-300 mt-0.5" />
          </div>
        );
      default:
        return <VocalMicIcon className="w-7 h-7 text-slate-300" />;
    }
  };

  // Find assigned channel numbers from channels list
  const channelNumbers = item.channels
    ?.map((c) => c.assignedChannelNumber)
    .filter((n): n is number => typeof n === 'number') || [];

  const hasAnyPhantom = item.channels?.some((c) => c.needsPhantom48V);

  return (
    <div
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        left: `${item.x}%`,
        top: `${item.y}%`,
        transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
      }}
      className={`absolute cursor-grab active:cursor-grabbing z-20 transition-transform select-none touch-none ${
        isSelected ? 'z-30 scale-105' : ''
      }`}
    >
      <div
        className={`relative flex flex-col items-center p-2 rounded-2xl transition border shadow-xl ${
          isSelected
            ? 'bg-indigo-950/90 border-indigo-400 ring-2 ring-indigo-400 shadow-indigo-500/30'
            : 'bg-slate-900/95 border-slate-700/80 hover:border-slate-500'
        }`}
      >
        {/* Channel badge if patched (e.g. CH 1,2 or CH 3) */}
        {channelNumbers.length > 0 && (
          <span className="absolute -top-2 -left-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-black text-[9px] shadow border border-indigo-400 z-30">
            CH {channelNumbers.join(',')}
            {hasAnyPhantom && <span className="text-red-300 ml-0.5 font-bold">+48V</span>}
          </span>
        )}

        {/* Output Aux/Main badge for PA and monitors */}
        {item.assignedOutputPort && (
          <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-md bg-sky-600 text-white font-mono font-black text-[9px] shadow border border-sky-400 z-30">
            {item.assignedOutputPort}
          </span>
        )}

        {/* Number of mics badge if multi-mic */}
        {item.channels && item.channels.length > 1 && (
          <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.2 rounded-md bg-slate-800 text-amber-300 font-bold text-[8px] border border-slate-700 z-30">
            {item.channels.length}× mic
          </span>
        )}

        {/* 230V Power required badge */}
        {item.needsPower230V && (
          <span
            className={`absolute -top-2 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow border border-slate-950 z-30 ${
              item.powerConnectedToId ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-pulse'
            }`}
            title={item.powerConnectedToId ? 'Zapojeno do prodlužky 230V' : 'Vyžaduje 230V napájení!'}
          >
            ⚡
          </span>
        )}

        {/* Visual Icon */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center">
          {renderIcon()}
        </div>

        {/* Label */}
        <div
          style={{ transform: `rotate(-${item.rotation || 0}deg)` }}
          className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-bold text-slate-200 text-center max-w-[85px] truncate shadow whitespace-nowrap"
        >
          {item.name}
        </div>
      </div>
    </div>
  );
};
