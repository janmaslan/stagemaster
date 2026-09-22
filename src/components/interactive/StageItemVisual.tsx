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
  scale?: 'sm' | 'md' | 'lg';
}

export const StageItemVisual: React.FC<StageItemVisualProps> = ({
  item,
  isSelected,
  onSelect,
  onPointerDown,
  scale = 'md',
}) => {
  const isSm = scale === 'sm';
  const isMd = scale === 'md';

  // SPECIAL COMPACT VISUAL FOR 230V MAIN POWER SOURCE (HLAVNÍ PŘÍVOD ELEKTŘINY)
  if (item.subType === 'power_source' || item.category === 'power_source') {
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
        className={`absolute cursor-grab active:cursor-grabbing z-20 select-none touch-none transition-transform before:absolute before:-inset-2 before:content-[''] ${
          isSelected ? 'z-30 scale-110' : ''
        }`}
        title={`${item.name} (Hlavní zdroj / přípojka 230V na pódiu)`}
      >
        <div
          className={`flex items-center gap-1 rounded-xl border shadow-lg transition ${
            isSm ? 'px-2 py-0.5 text-[8.5px]' : isMd ? 'px-2.5 py-1 text-[9.5px]' : 'px-3 py-1.5 text-[11px]'
          } ${
            isSelected
              ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400 text-white shadow-amber-500/40'
              : 'bg-slate-900/95 border-amber-600/90 hover:border-amber-400 text-amber-300'
          }`}
        >
          <Zap className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400 shrink-0 fill-amber-400`} />
          <span className="font-black font-mono tracking-tight whitespace-nowrap">
            {item.name}
          </span>
        </div>
      </div>
    );
  }

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
        className={`absolute cursor-grab active:cursor-grabbing z-20 select-none touch-none transition-transform before:absolute before:-inset-2 before:content-[''] ${
          isSelected ? 'z-30 scale-110' : ''
        }`}
        title={`${item.name} (Klepnutím vyberte nebo přetáhněte)`}
      >
        <div
          className={`flex items-center gap-1 rounded-full border shadow-md transition ${
            isSm ? 'px-1.5 py-0.5 text-[8px]' : isMd ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
          } ${
            isSelected
              ? 'bg-red-950 border-red-400 ring-2 ring-red-400 text-white shadow-red-500/40'
              : 'bg-slate-900/90 border-red-700/80 hover:border-red-400 text-red-300'
          }`}
        >
          <Zap className={`${isSm ? 'w-2.5 h-2.5' : isMd ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-red-400 shrink-0`} />
          <span className="font-black font-mono tracking-tight whitespace-nowrap">
            {item.name.replace('Prodlužka 230V', '230V').replace('Prodlužka', '230V')}
          </span>
        </div>
      </div>
    );
  }

  const renderIcon = () => {
    const iconCls = isSm ? 'w-4.5 h-4.5' : isMd ? 'w-6 h-6' : 'w-7 h-7';
    const drumsCls = isSm ? 'w-5.5 h-5.5' : isMd ? 'w-7 h-7' : 'w-8 h-8';

    if (item.speakerType === 'iem') {
      return <IemStationIcon className={`${iconCls} text-purple-400`} />;
    }

    switch (item.subType) {
      case 'drums': return <DrumsIcon className={`${drumsCls} text-amber-400`} />;
      case 'guitar_amp': return <GuitarAmpIcon className={`${iconCls} text-blue-400`} />;
      case 'bass_amp': return <BassAmpIcon className={`${iconCls} text-emerald-400`} />;
      case 'keyboard': return <KeyboardIcon className={`${iconCls} text-purple-400`} />;
      case 'acoustic_guitar': return <AcousticGuitarIcon className={`${iconCls} text-amber-500`} />;
      case 'lead_vox':
      case 'backing_vox':
      case 'vocal': return <VocalMicIcon className={`${iconCls} text-rose-400`} />;
      case 'pa_speaker': return <Speaker className={`${iconCls} text-indigo-400`} />;
      case 'wedge':
      case 'monitor_wedge': return <WedgeMonitorIcon className={`${iconCls} text-sky-400`} />;
      case 'iem_station': return <IemStationIcon className={`${iconCls} text-purple-400`} />;
      case 'xr18':
      case 'mixer':
        return (
          <div className={`${isSm ? 'w-6 h-6' : isMd ? 'w-7.5 h-7.5' : 'w-9 h-9'} rounded-lg bg-indigo-950 border border-indigo-600 flex flex-col items-center justify-center text-white`}>
            <span className={`${isSm ? 'text-[6px]' : 'text-[8px]'} font-black leading-none text-amber-400`}>XR18</span>
            <Sliders className={`${isSm ? 'w-3 h-3' : 'w-4 h-4'} text-indigo-300 mt-0.5`} />
          </div>
        );
      default:
        return <VocalMicIcon className={`${iconCls} text-slate-300`} />;
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
      className={`absolute cursor-grab active:cursor-grabbing z-20 transition-transform select-none touch-none before:absolute before:-inset-2 before:content-[''] ${
        isSelected ? 'z-30 scale-110' : ''
      }`}
    >
      <div
        className={`relative flex flex-col items-center transition border shadow-xl ${
          isSm ? 'p-1 rounded-xl' : isMd ? 'p-1.5 rounded-xl' : 'p-2 rounded-2xl'
        } ${
          isSelected
            ? 'bg-indigo-950/95 border-indigo-400 ring-2 ring-indigo-400 shadow-indigo-500/40'
            : 'bg-slate-900/95 border-slate-700/80 hover:border-slate-500'
        }`}
      >
        {/* Channel badge if patched (e.g. CH 1,2 or CH 3) */}
        {channelNumbers.length > 0 && (
          <span
            className={`absolute font-mono font-black shadow border border-indigo-400 z-30 bg-indigo-600 text-white ${
              isSm
                ? '-top-1.5 -left-1 px-1 py-0.2 rounded text-[7px]'
                : '-top-2 -left-1 px-1.5 py-0.5 rounded-md text-[9px]'
            }`}
          >
            CH {channelNumbers.join(',')}
            {hasAnyPhantom && <span className="text-red-300 ml-0.5 font-bold">+48V</span>}
          </span>
        )}

        {/* Output Aux/Main badge for PA and monitors */}
        {item.assignedOutputPort && (
          <span
            className={`absolute font-mono font-black shadow border border-sky-400 z-30 bg-sky-600 text-white ${
              isSm
                ? '-top-1.5 -right-1 px-1 py-0.2 rounded text-[7px]'
                : '-top-2 -right-1 px-1.5 py-0.5 rounded-md text-[9px]'
            }`}
          >
            {item.assignedOutputPort}
          </span>
        )}

        {/* Number of mics badge if multi-mic */}
        {item.channels && item.channels.length > 1 && (
          <span
            className={`absolute font-bold border border-slate-700 z-30 bg-slate-800 text-amber-300 ${
              isSm
                ? '-bottom-1 -right-1 px-1 py-0.2 rounded text-[7px]'
                : '-bottom-1.5 -right-1 px-1.5 py-0.2 rounded-md text-[8px]'
            }`}
          >
            {item.channels.length}×
          </span>
        )}

        {/* 230V Power required badge */}
        {item.needsPower230V && (
          <span
            className={`absolute rounded-full flex items-center justify-center font-black shadow border border-slate-950 z-30 ${
              isSm ? '-top-1.5 -right-1.5 w-3.5 h-3.5 text-[7px]' : '-top-2 -right-1.5 w-4 h-4 text-[8px]'
            } ${
              item.powerConnectedToId ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white animate-pulse'
            }`}
            title={item.powerConnectedToId ? 'Zapojeno do prodlužky 230V' : 'Vyžaduje 230V napájení!'}
          >
            ⚡
          </span>
        )}

        {/* Visual Icon */}
        <div className={`${isSm ? 'w-5.5 h-5.5' : isMd ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} flex items-center justify-center`}>
          {renderIcon()}
        </div>

        {/* Label */}
        <div
          style={{ transform: `rotate(-${item.rotation || 0}deg)` }}
          className={`rounded bg-slate-950/90 border border-slate-800 font-bold text-slate-200 text-center truncate shadow whitespace-nowrap ${
            isSm
              ? 'mt-0.5 px-1 py-0.2 text-[8px] max-w-[54px]'
              : isMd
              ? 'mt-0.5 px-1.5 py-0.2 text-[9px] max-w-[68px]'
              : 'mt-1 px-1.5 py-0.5 text-[10px] max-w-[85px]'
          }`}
        >
          {item.name}
        </div>
      </div>
    </div>
  );
};
