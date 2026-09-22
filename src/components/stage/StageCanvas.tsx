import React, { useState, useRef, useCallback } from 'react';
import { 
  StageItem, 
  CableConnection, 
  CableType, 
  Channel 
} from '../../types/audio';
import { getStageIconComponent } from './StageIcons';
import { CableLayer, CABLE_COLORS } from './CableLayer';
import { ItemInspectorModal } from './ItemInspectorModal';
import { 
  Grid, 
  Eye, 
  Zap, 
  Link, 
  Plus, 
  Trash2, 
  Maximize2, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface StageCanvasProps {
  items: StageItem[];
  cables: CableConnection[];
  channels: Channel[];
  stageDimensions: { widthMeters: number; depthMeters: number };
  onUpdateItems: (items: StageItem[]) => void;
  onUpdateCables: (cables: CableConnection[]) => void;
  onUpdateChannels: (channels: Channel[]) => void;
  onCreateChannelForItem: (item: StageItem) => void;
}

export const StageCanvas: React.FC<StageCanvasProps> = ({
  items,
  cables,
  channels,
  stageDimensions,
  onUpdateItems,
  onUpdateCables,
  onUpdateChannels,
  onCreateChannelForItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction states
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [cableFilter, setCableFilter] = useState<'all' | CableType | 'none'>('all');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const itemStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMoved = useRef<boolean>(false);

  // Calculate coordinates from mouse or touch event
  const getEventCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if ('clientX' in e) {
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    }
    return { x: 0, y: 0 };
  };

  const handlePointerDown = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    // If in quick connect mode
    if (isConnectMode) {
      if (!connectSourceId) {
        setConnectSourceId(id);
      } else if (connectSourceId !== id) {
        // Create connection between connectSourceId and id
        const newCable: CableConnection = {
          id: 'cable-' + Date.now(),
          fromId: connectSourceId,
          toId: id,
          type: 'xlr',
          lengthMeters: 10,
        };
        onUpdateCables([...cables, newCable]);
        setConnectSourceId(null);
        setIsConnectMode(false);
      }
      return;
    }

    const coords = getEventCoords(e);
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setDraggingId(id);
    dragStartPos.current = coords;
    itemStartPos.current = { x: item.x, y: item.y };
    hasMoved.current = false;

    // Attach window listeners for smooth dragging outside element
    const handlePointerMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const moveCoords = getEventCoords(moveEvent);
      const dx = moveCoords.x - dragStartPos.current.x;
      const dy = moveCoords.y - dragStartPos.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = (dx / rect.width) * 100;
      const deltaYPercent = (dy / rect.height) * 100;

      let newX = Math.max(5, Math.min(95, itemStartPos.current.x + deltaXPercent));
      let newY = Math.max(5, Math.min(95, itemStartPos.current.y + deltaYPercent));

      if (snapToGrid) {
        newX = Math.round(newX / 2.5) * 2.5;
        newY = Math.round(newY / 2.5) * 2.5;
      }

      onUpdateItems(
        items.map((it) => (it.id === id ? { ...it, x: newX, y: newY } : it))
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      setDraggingId(null);

      // If user merely clicked/tapped without dragging, open inspector
      if (!hasMoved.current) {
        setSelectedItemId(id);
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleAddItem = (type: any, name: string) => {
    const newItem: StageItem = {
      id: 'item-' + Date.now(),
      name,
      type,
      x: 50,
      y: 50,
      rotation: 0,
      powerRequired: ['guitar_amp', 'bass_amp', 'keyboard', 'drums'].includes(type),
    };
    onUpdateItems([...items, newItem]);
    setSelectedItemId(newItem.id);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const selectedCable = cables.find((c) => c.id === selectedCableId);

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Stage Controls & Filters Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
        {/* Left: Cable Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
            Kabely:
          </span>
          <button
            onClick={() => setCableFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              cableFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Vše ({cables.length})
          </button>
          <button
            onClick={() => setCableFilter('xlr')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              cableFilter === 'xlr'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            XLR
          </button>
          <button
            onClick={() => setCableFilter('jack')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              cableFilter === 'jack'
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            Jack
          </button>
          <button
            onClick={() => setCableFilter('power')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
              cableFilter === 'power'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-slate-800 text-red-400 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            230V
          </button>
          <button
            onClick={() => setCableFilter('none')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              cableFilter === 'none'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Skrýt
          </button>
        </div>

        {/* Right: Quick Tools (Connect mode, Snap to grid) */}
        <div className="flex items-center gap-2">
          {/* Quick Connect Mode */}
          <button
            onClick={() => {
              setIsConnectMode(!isConnectMode);
              setConnectSourceId(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition shadow-sm ${
              isConnectMode
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title="Režim rychlého propojení kabelem"
          >
            <Link className="w-3.5 h-3.5" />
            <span>{isConnectMode ? 'Klikněte na cíl...' : '+ Propojit kabelem'}</span>
          </button>

          {/* Grid Snap Toggle */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1.5 rounded-lg text-xs border transition ${
              snapToGrid
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={snapToGrid ? 'Přichytávání k mřížce zapnuto' : 'Přichytávání k mřížce vypnuto'}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connect Mode Banner */}
      {isConnectMode && (
        <div className="bg-emerald-950/80 border border-emerald-700 text-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {connectSourceId
                ? 'Zdroj vybrán! Nyní klepněte na cílový prvek (stagebox, DI box nebo monitor) pro zapojení kabelu.'
                : 'Klepněte na výchozí prvek (nástroj, mikrofon...), ze kterého má kabel vést.'}
            </span>
          </div>
          <button
            onClick={() => {
              setIsConnectMode(false);
              setConnectSourceId(null);
            }}
            className="text-emerald-400 hover:text-white font-bold ml-2 underline"
          >
            Zrušit
          </button>
        </div>
      )}

      {/* Main Interactive Stage Box */}
      <div
        ref={containerRef}
        onClick={() => {
          setSelectedCableId(null);
          if (isConnectMode && !connectSourceId) {
            setIsConnectMode(false);
          }
        }}
        className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none"
        style={{
          backgroundImage: snapToGrid
            ? 'radial-gradient(circle, #334155 1px, transparent 1px)'
            : undefined,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Stage Rear Wall / Backstage Indicator */}
        <div className="absolute top-0 inset-x-0 bg-slate-950/90 border-b border-slate-800 py-1 px-4 flex items-center justify-between text-[10px] font-bold tracking-widest text-slate-400 uppercase z-20 pointer-events-none">
          <span>◄ BACKSTAGE (ZÁZEMÍ)</span>
          <span className="text-slate-400 font-mono">
            PÓDIUM: {stageDimensions.widthMeters}m × {stageDimensions.depthMeters}m
          </span>
          <span>BACKSTAGE ►</span>
        </div>

        {/* Audience / FOH Boundary Indicator at Bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-indigo-950/80 border-t border-indigo-800/80 py-1.5 px-4 flex items-center justify-center text-[11px] font-extrabold tracking-widest text-indigo-300 uppercase z-20 pointer-events-none shadow-lg">
          <span>▼ PŘEDEK PÓDIA — PUBLIKUM &amp; ZVUKAŘSKÁ REŽIE (FOH) ▼</span>
        </div>

        {/* Stage Left & Right Side Labels */}
        <div className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 z-0 pointer-events-none">
          STAGE RIGHT (Z POHLEDU HUDEBNÍKA)
        </div>
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] z-0 pointer-events-none">
          STAGE LEFT (Z POHLEDU HUDEBNÍKA)
        </div>

        {/* Cable SVG Layer */}
        <CableLayer
          cables={cables}
          items={items}
          filterType={cableFilter}
          selectedCableId={selectedCableId || undefined}
          onSelectCable={(id) => setSelectedCableId(id)}
          onDeleteCable={(id) => onUpdateCables(cables.filter((c) => c.id !== id))}
        />

        {/* Stage Items */}
        {items.map((item) => {
          const Icon = getStageIconComponent(item.type);
          const isDragging = draggingId === item.id;
          const isSelected = selectedItemId === item.id;
          const isConnectSource = connectSourceId === item.id;

          return (
            <div
              key={item.id}
              onMouseDown={(e) => handlePointerDown(item.id, e)}
              onTouchStart={(e) => handlePointerDown(item.id, e)}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
              }}
              className={`absolute cursor-grab active:cursor-grabbing z-20 transition-transform select-none ${
                isDragging ? 'scale-110 shadow-2xl z-30 opacity-90' : ''
              }`}
            >
              <div
                className={`relative flex flex-col items-center group p-1.5 rounded-2xl transition border ${
                  isConnectSource
                    ? 'ring-4 ring-emerald-500 bg-emerald-950/80 border-emerald-400'
                    : isSelected
                    ? 'ring-2 ring-indigo-500 bg-indigo-950/80 border-indigo-400 shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500 hover:bg-slate-850'
                }`}
              >
                {/* 230V Power indicator badge */}
                {item.powerRequired && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 border border-slate-900 flex items-center justify-center text-[9px] text-white font-black z-30"
                    title="230V zásuvka"
                  >
                    ⚡
                  </span>
                )}

                {/* DI Box indicator badge */}
                {item.diType && item.diType !== 'none' && (
                  <span
                    className="absolute -top-1.5 -left-1.5 px-1 py-0.2 rounded bg-amber-600 border border-slate-900 text-[8px] text-black font-extrabold z-30"
                    title={`DI Box: ${item.diType}`}
                  >
                    DI
                  </span>
                )}

                {/* Main Icon */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-slate-100">
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>

                {/* Item Label */}
                <div
                  style={{
                    transform: `rotate(-${item.rotation || 0}deg)`,
                  }}
                  className="mt-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] sm:text-xs font-semibold text-slate-200 text-center max-w-[90px] truncate shadow whitespace-nowrap"
                >
                  {item.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Cable Quick Actions Card (when a cable is tapped) */}
      {selectedCable && (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between gap-3 text-xs shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded font-bold text-white text-[11px]"
              style={{ backgroundColor: CABLE_COLORS[selectedCable.type].stroke }}
            >
              {CABLE_COLORS[selectedCable.type].text}
            </span>
            <span className="font-semibold text-slate-200">
              {items.find((i) => i.id === selectedCable.fromId)?.name} →{' '}
              {items.find((i) => i.id === selectedCable.toId)?.name}
            </span>
            <span className="text-slate-400 font-mono">({selectedCable.lengthMeters} m)</span>
            {selectedCable.label && (
              <span className="text-indigo-400 font-semibold">[{selectedCable.label}]</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextLengths = [3, 5, 10, 15, 20];
                const currentIdx = nextLengths.indexOf(selectedCable.lengthMeters);
                const nextLen = nextLengths[(currentIdx + 1) % nextLengths.length];
                onUpdateCables(
                  cables.map((c) => (c.id === selectedCable.id ? { ...c, lengthMeters: nextLen } : c))
                );
              }}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
            >
              Změnit délku
            </button>
            <button
              onClick={() => {
                onUpdateCables(cables.filter((c) => c.id !== selectedCable.id));
                setSelectedCableId(null);
              }}
              className="p-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded"
              title="Smazat kabel"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Item Inspector Modal (when item is clicked/tapped) */}
      {selectedItem && (
        <ItemInspectorModal
          item={selectedItem}
          allItems={items}
          cables={cables}
          channels={channels}
          onUpdateItem={(updated) => {
            onUpdateItems(items.map((i) => (i.id === updated.id ? updated : i)));
          }}
          onDeleteItem={(id) => {
            onUpdateItems(items.filter((i) => i.id !== id));
            onUpdateCables(cables.filter((c) => c.fromId !== id && c.toId !== id));
            setSelectedItemId(null);
          }}
          onAddCable={(newCable) => {
            onUpdateCables([...cables, { ...newCable, id: 'cable-' + Date.now() }]);
          }}
          onDeleteCable={(cableId) => {
            onUpdateCables(cables.filter((c) => c.id !== cableId));
          }}
          onCreateChannelForItem={onCreateChannelForItem}
          onClose={() => setSelectedItemId(null)}
        />
      )}
    </div>
  );
};
