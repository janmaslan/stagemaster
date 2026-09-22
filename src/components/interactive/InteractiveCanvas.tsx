import React, { useRef, useState, useEffect } from 'react';
import { 
  InteractiveStageItem, 
  StageCable, 
  StagePhase 
} from '../../types/interactiveStage';
import { StageItemVisual } from './StageItemVisual';
import { StageCablesLayer } from './StageCablesLayer';
import { ConfigureItemModal } from './ConfigureItemModal';
import { XR18PatchModal } from './XR18PatchModal';
import { OutputPatchModal } from './OutputPatchModal';
import { 
  Maximize2, 
  Minimize2, 
  Smartphone,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Music,
  Cable,
  Zap,
  Volume2,
  CheckSquare,
  FolderOpen,
  Camera
} from 'lucide-react';
import { getPresetInstrument } from '../../utils/stagePresets';
import { exportStageCanvasImage } from '../../utils/pdfExport';

interface InteractiveCanvasProps {
  items: InteractiveStageItem[];
  cables: StageCable[];
  currentPhase: StagePhase;
  selectedItemId: string | null;
  bandName?: string;
  onSelectItem: (id: string | null) => void;
  onUpdateItems: (items: InteractiveStageItem[]) => void;
  onUpdateCables: (cables: StageCable[]) => void;
  onSelectPhase?: (phase: StagePhase) => void;
  onAddItem?: (item: Partial<InteractiveStageItem>) => void;
  onAutoPatchAll?: () => void;
  onOpenProjectManager?: () => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  items,
  cables,
  currentPhase,
  selectedItemId,
  bandName = 'Kapela',
  onSelectItem,
  onUpdateItems,
  onUpdateCables,
  onSelectPhase,
  onAddItem,
  onAutoPatchAll,
  onOpenProjectManager,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const handleDownloadStageImage = async () => {
    if (!containerRef.current) return;
    setIsExportingImage(true);
    try {
      await exportStageCanvasImage(containerRef.current, bandName);
    } catch (err) {
      console.error('Export stage image failed:', err);
      alert('Nepodařilo se vygenerovat obrázek pódia.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Modal states
  const [modalMode, setModalMode] = useState<'configure' | 'patch_input' | 'patch_output' | null>(null);

  // Fullscreen / Landscape stage mode
  const [isFullscreenStage, setIsFullscreenStage] = useState<boolean>(false);

  // Component scale mode (sm = Mini for mobile, md = Medium, lg = Large)
  const [itemScale, setItemScale] = useState<'sm' | 'md' | 'lg'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stagemaster_scale');
      if (saved === 'sm' || saved === 'md' || saved === 'lg') return saved;
      if (window.innerWidth < 768) return 'sm'; // Default to Mini on mobile!
    }
    return 'md';
  });

  const handleSetScale = (newScale: 'sm' | 'md' | 'lg') => {
    setItemScale(newScale);
    try {
      localStorage.setItem('stagemaster_scale', newScale);
    } catch {}
  };

  const toggleFullscreenStage = () => {
    if (!isFullscreenStage) {
      setIsFullscreenStage(true);
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        if (window.screen?.orientation && 'lock' in window.screen.orientation) {
          (window.screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch {}
    } else {
      setIsFullscreenStage(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        if (window.screen?.orientation && 'unlock' in window.screen.orientation) {
          (window.screen.orientation as any).unlock();
        }
      } catch {}
    }
  };

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const itemStartCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedSignificantly = useRef<boolean>(false);

  // Clean up any orphaned cables whose fromId or toId does not exist in items
  useEffect(() => {
    const validIds = new Set(items.map((i) => i.id));
    const validCables = cables.filter(
      (c) => validIds.has(c.fromId) && validIds.has(c.toId)
    );
    if (validCables.length !== cables.length) {
      onUpdateCables(validCables);
    }
  }, [items]);

  const getEventXY = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if ('clientX' in e) {
      return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    }
    return { x: 0, y: 0 };
  };

  const handlePointerDown = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setDraggingId(id);
    dragStartCoords.current = getEventXY(e);
    itemStartCoords.current = { x: item.x || 50, y: item.y || 50 };
    hasMovedSignificantly.current = false;

    const handlePointerMove = (moveEv: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const cur = getEventXY(moveEv);
      const dx = cur.x - dragStartCoords.current.x;
      const dy = cur.y - dragStartCoords.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedSignificantly.current = true;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = (dx / rect.width) * 100;
      const deltaYPercent = (dy / rect.height) * 100;

      const newX = Math.round(Math.max(4, Math.min(96, itemStartCoords.current.x + deltaXPercent)));
      const newY = Math.round(Math.max(5, Math.min(93, itemStartCoords.current.y + deltaYPercent)));

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

      // If user tapped without dragging, trigger modal according to item type & phase
      if (!hasMovedSignificantly.current) {
        onSelectItem(id);
        const clickedItem = items.find((i) => i.id === id);
        if (!clickedItem) return;

        // If clicked item is a speaker or wedge, ALWAYS open patch_output!
        if (
          ['pa_speaker', 'wedge', 'monitor_wedge', 'iem_station'].includes(clickedItem.subType) ||
          clickedItem.category === 'pa_speaker' ||
          clickedItem.category === 'monitor_wedge'
        ) {
          setModalMode('patch_output');
        } else if (currentPhase === 2 && ['instrument', 'vocal'].includes(clickedItem.category)) {
          // In Phase 2: open XR18PatchModal with channel picker + mic picker
          setModalMode('patch_input');
        } else if (currentPhase === 3) {
          // In Phase 3:
          // 1. If clicked a power strip -> connect to nearest power source (or toggle disconnect)
          if (clickedItem.category === 'power_strip' || clickedItem.subType === 'power_strip') {
            const existingSourceCable = cables.find(
              (c) => c.type === 'power' && c.toId === clickedItem.id
            );
            if (existingSourceCable) {
              onUpdateCables(cables.filter((c) => c.id !== existingSourceCable.id));
              onUpdateItems(
                items.map((it) => (it.id === clickedItem.id ? { ...it, powerConnectedToId: undefined } : it))
              );
            } else {
              const powerSources = items.filter((i) => i.category === 'power_source' || i.subType === 'power_source');
              if (powerSources.length === 0) {
                alert('Nejprve přidejte tlačítkem nahoře "+ ⚡ Přípojka 230V" hlavní přívod elektřiny na pódium!');
              } else {
                let nearestSource = powerSources[0];
                let minDistance = Infinity;
                for (const ps of powerSources) {
                  const dist = Math.hypot((ps.x ?? 50) - (clickedItem.x ?? 50), (ps.y ?? 50) - (clickedItem.y ?? 50));
                  if (dist < minDistance) {
                    minDistance = dist;
                    nearestSource = ps;
                  }
                }
                const newCable: StageCable = {
                  id: 'pwr-strip-' + Date.now(),
                  fromId: nearestSource.id,
                  toId: clickedItem.id,
                  type: 'power',
                  lengthMeters: 10,
                  label: '230V',
                };
                onUpdateCables([...cables, newCable]);
                onUpdateItems(
                  items.map((it) => (it.id === clickedItem.id ? { ...it, powerConnectedToId: nearestSource.id } : it))
                );
              }
            }
          } else if (clickedItem.needsPower230V) {
            // 2. If clicked an appliance needing 230V -> connect to nearest strip or source (or disconnect)
            const powerPoints = items.filter(
              (i) => i.category === 'power_strip' || i.category === 'power_source' || i.subType === 'power_strip' || i.subType === 'power_source'
            );
            if (powerPoints.length === 0) {
              alert('Nejprve přidejte na pódium "+ ⚡ Přípojka 230V" nebo "+ 🔌 Prodlužka 230V"!');
            } else {
              const existingPowerCable = cables.find(
                (c) => c.type === 'power' && c.toId === clickedItem.id
              );
              if (existingPowerCable) {
                onUpdateCables(cables.filter((c) => c.id !== existingPowerCable.id));
                onUpdateItems(
                  items.map((it) => (it.id === clickedItem.id ? { ...it, powerConnectedToId: undefined } : it))
                );
              } else {
                // Prefer power_strip if available, otherwise power_source
                const strips = powerPoints.filter((i) => i.category === 'power_strip' || i.subType === 'power_strip');
                const candidatePoints = strips.length > 0 ? strips : powerPoints;

                let nearestPoint = candidatePoints[0];
                let minDistance = Infinity;
                for (const pt of candidatePoints) {
                  const dist = Math.hypot((pt.x ?? 50) - (clickedItem.x ?? 50), (pt.y ?? 50) - (clickedItem.y ?? 50));
                  if (dist < minDistance) {
                    minDistance = dist;
                    nearestPoint = pt;
                  }
                }
                const newCable: StageCable = {
                  id: 'pwr-' + Date.now(),
                  fromId: nearestPoint.id,
                  toId: clickedItem.id,
                  type: 'power',
                  lengthMeters: 5,
                  label: '230V',
                };
                onUpdateCables([...cables, newCable]);
                onUpdateItems(
                  items.map((it) => (it.id === clickedItem.id ? { ...it, powerConnectedToId: nearestPoint.id } : it))
                );
              }
            }
          } else {
            setModalMode('configure');
          }
        } else {
          setModalMode('configure');
        }
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);
  const xr18Item = items.find((i) => i.subType === 'xr18');

  // Handle XR18 Input patch confirmation for specific channel
  const handleConfirmInputPatch = (
    channelId: string, 
    channelNumber: number, 
    needsPhantom: boolean, 
    cableLength: number,
    micModel?: string,
    pickupType?: 'mic' | 'line_xlr' | 'line_jack' | 'line_di' | 'line'
  ) => {
    if (!selectedItem || !xr18Item) return;

    // Disconnect any other channel across all items that was using this channelNumber
    const updatedItems = items.map((it) => {
      const updatedChannels = it.channels.map((ch) => {
        if (ch.assignedChannelNumber === channelNumber && ch.id !== channelId) {
          return { ...ch, assignedChannelNumber: undefined, needsPhantom48V: undefined };
        }
        if (ch.id === channelId) {
          return {
            ...ch,
            assignedChannelNumber: channelNumber,
            needsPhantom48V: needsPhantom,
            cableLengthMeters: cableLength,
            ...(micModel ? { micModel } : {}),
            ...(pickupType ? { pickupType } : {}),
          };
        }
        return ch;
      });
      return { ...it, channels: updatedChannels };
    });

    // Remove existing cable for this sub-channel and add new
    const filteredCables = cables.filter(
      (c) => !(c.fromId === selectedItem.id && c.channelId === channelId)
    );

    const subCh = selectedItem.channels.find((c) => c.id === channelId);
    const effectivePickup = pickupType || subCh?.pickupType;
    const cableType = (effectivePickup === 'line_jack' || effectivePickup === 'line') ? 'jack' : 'xlr';

    const newCable: StageCable = {
      id: 'cable-' + Date.now() + Math.random().toString(36).slice(2, 5),
      fromId: selectedItem.id,
      toId: xr18Item.id,
      channelId,
      type: cableType,
      lengthMeters: cableLength,
      label: `CH ${channelNumber}`,
    };

    onUpdateItems(updatedItems);
    onUpdateCables([...filteredCables, newCable]);
  };

  const handleUnpatchInput = (channelId: string) => {
    if (!selectedItem || !xr18Item) return;
    onUpdateItems(
      items.map((it) => {
        if (it.id === selectedItem.id) {
          return {
            ...it,
            channels: it.channels.map((ch) =>
              ch.id === channelId
                ? { ...ch, assignedChannelNumber: undefined, needsPhantom48V: undefined }
                : ch
            ),
          };
        }
        return it;
      })
    );
    onUpdateCables(
      cables.filter((c) => !(c.fromId === selectedItem.id && c.channelId === channelId))
    );
  };

  // Handle PA / Monitor Output patch confirmation
  const handleConfirmOutputPatch = (
    port: string, 
    performer: string, 
    speakerType: 'active' | 'passive_speakon' | 'passive_jack' | 'iem'
  ) => {
    if (!selectedItem || !xr18Item) return;

    onUpdateItems(
      items.map((it) =>
        it.id === selectedItem.id
          ? {
              ...it,
              assignedOutputPort: port,
              targetPerformer: performer,
              speakerType,
              needsPower230V: speakerType === 'active' || speakerType === 'iem', // Active speakers and IEM transmitters need 230V!
            }
          : it
      )
    );

    const filteredCables = cables.filter(
      (c) => !(c.fromId === xr18Item.id && c.toId === selectedItem.id)
    );

    const cableType: 'speakon' | 'jack' | 'xlr' =
      speakerType === 'passive_speakon'
        ? 'speakon'
        : speakerType === 'passive_jack'
        ? 'jack'
        : 'xlr';

    const newCable: StageCable = {
      id: 'outcable-' + Date.now(),
      fromId: xr18Item.id,
      toId: selectedItem.id,
      type: cableType,
      lengthMeters: 10,
      label: port,
    };

    onUpdateCables([...filteredCables, newCable]);
  };

  const handleUnpatchOutput = () => {
    if (!selectedItem || !xr18Item) return;
    onUpdateItems(
      items.map((it) =>
        it.id === selectedItem.id
          ? { ...it, assignedOutputPort: undefined, targetPerformer: undefined }
          : it
      )
    );
    onUpdateCables(
      cables.filter((c) => !(c.fromId === xr18Item.id && c.toId === selectedItem.id))
    );
  };

  const patchedCount = items.reduce((sum, item) => {
    return sum + (item.channels?.filter((c) => c.assignedChannelNumber).length || 0);
  }, 0);

  return (
    <div
      className={
        isFullscreenStage
          ? 'fixed inset-0 z-50 bg-slate-950 p-1 sm:p-2 flex flex-col gap-1 overflow-hidden'
          : 'relative w-full flex flex-col gap-2'
      }
    >
      {/* FULLSCREEN HEADER & ACTION CONTROLS */}
      {isFullscreenStage ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 flex flex-nowrap items-center justify-between gap-1.5 shadow-xl shrink-0 h-9 sm:h-10">
          {/* Phase Stepper Pills */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onSelectPhase?.(Math.max(1, currentPhase - 1) as StagePhase)}
              disabled={currentPhase === 1}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 rounded-lg text-xs font-bold flex items-center gap-0.5 border border-slate-700 transition"
              title="Předchozí krok"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-2 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-[11px] font-black whitespace-nowrap">
              Fáze {currentPhase}/5: {
                currentPhase === 1 ? 'Nástroje' :
                currentPhase === 2 ? 'Zapojení XR18' :
                currentPhase === 3 ? '230V' :
                currentPhase === 4 ? 'PA & Odposlechy' :
                'Faktura'
              }
            </span>

            <button
              onClick={() => onSelectPhase?.(Math.min(5, currentPhase + 1) as StagePhase)}
              disabled={currentPhase === 5}
              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-bold flex items-center gap-0.5 transition shadow"
              title="Další krok"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Phase-specific Add and Action Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0 px-1 py-0.5">
            {currentPhase === 1 && (
              <>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('drums', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🥁 Bicí
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('guitar_amp', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🎸 Kombo
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('bass_amp', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🎸 Basa
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('keyboard', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🎹 Klávesy
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('acoustic_guitar', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🎸 Akustika
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('lead_vox', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🎙️ Lead
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('backing_vox', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 whitespace-nowrap transition active:scale-95"
                >
                  + 🎙️ Backing
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('generic', items))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-650 rounded-lg text-[10px] font-bold text-indigo-300 whitespace-nowrap transition active:scale-95"
                >
                  + Vlastní
                </button>
              </>
            )}

            {currentPhase === 2 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 font-bold whitespace-nowrap">
                  Zapojeno: {patchedCount}/16
                </span>
                <button
                  onClick={onAutoPatchAll}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition active:scale-95 whitespace-nowrap"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-zapojení</span>
                </button>
              </div>
            )}

            {currentPhase === 3 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('power_source', items))}
                  className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ ⚡ Přípojka 230V</span>
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('power_strip', items))}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow transition active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ 🔌 Prodlužka 230V</span>
                </button>
              </div>
            )}

            {currentPhase === 4 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    onAddItem?.({
                      name: 'Main PA Levý',
                      category: 'pa_speaker',
                      subType: 'pa_speaker',
                      speakerType: 'active',
                      needsPower230V: true,
                      x: 10,
                      y: 85,
                      assignedOutputPort: 'Main L',
                    });
                    onAddItem?.({
                      name: 'Main PA Pravý',
                      category: 'pa_speaker',
                      subType: 'pa_speaker',
                      speakerType: 'active',
                      needsPower230V: true,
                      x: 90,
                      y: 85,
                      assignedOutputPort: 'Main R',
                    });
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/60 rounded-lg text-[10px] font-semibold whitespace-nowrap transition active:scale-95"
                >
                  + Main PA L/R
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('wedge', items))}
                  className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[10px] font-bold whitespace-nowrap transition active:scale-95"
                >
                  + 🔊 Wedge
                </button>
                <button
                  onClick={() => onAddItem?.(getPresetInstrument('iem', items))}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold whitespace-nowrap transition active:scale-95"
                >
                  + 🎧 In-Ear (IEM)
                </button>
              </div>
            )}

            {currentPhase === 5 && (
              <button
                onClick={toggleFullscreenStage}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow whitespace-nowrap transition"
              >
                <span>📄 Otevřít fakturu &amp; PDF</span>
              </button>
            )}
          </div>

          {/* Scale & Exit Fullscreen Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => handleSetScale('sm')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  itemScale === 'sm' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Mini
              </button>
              <button
                type="button"
                onClick={() => handleSetScale('md')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  itemScale === 'md' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Stř
              </button>
              <button
                type="button"
                onClick={() => handleSetScale('lg')}
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  itemScale === 'lg' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
              >
                Vel
              </button>
            </div>

            {onOpenProjectManager && (
              <button
                type="button"
                onClick={onOpenProjectManager}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-200 flex items-center gap-1 transition active:scale-95"
                title="Správa stage plánů"
              >
                <FolderOpen className="w-3 h-3 text-indigo-400" />
                <span className="hidden sm:inline">Plány</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadStageImage}
              disabled={isExportingImage}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center gap-1 transition active:scale-95"
              title="Stáhnout samotné grafické pódium jako obrázek PNG"
            >
              <Camera className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">{isExportingImage ? 'Ukládám...' : 'Pódium PNG'}</span>
              <span className="sm:hidden">PNG</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreenStage}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 flex items-center gap-1 transition"
              title="Zmenšit zobrazení"
            >
              <Minimize2 className="w-3 h-3 text-indigo-400" />
              <span className="hidden sm:inline">Zmenšit</span>
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD (NON-FULLSCREEN) TOOLBAR */
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>Stage Plán:</span>
            </span>

            {/* Component size switcher */}
            <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-700/80 p-0.5 rounded-xl shadow-inner">
              <span className="text-[9px] text-slate-400 pl-1.5 pr-0.5 font-semibold">Prvky:</span>
              <button
                type="button"
                onClick={() => handleSetScale('sm')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  itemScale === 'sm'
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mini kompaktní velikost pro přehlednost na mobilu"
              >
                Mini
              </button>
              <button
                type="button"
                onClick={() => handleSetScale('md')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  itemScale === 'md'
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Střední velikost"
              >
                Střední
              </button>
              <button
                type="button"
                onClick={() => handleSetScale('lg')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                  itemScale === 'lg'
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Velké ikony"
              >
                Velká
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDownloadStageImage}
              disabled={isExportingImage}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-[11px] font-bold text-emerald-400 hover:text-white flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
              title="Stáhnout samotné grafické pódium jako obrázek PNG"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isExportingImage ? 'Ukládám...' : 'Stáhnout pódium (PNG)'}</span>
              <span className="sm:hidden">PNG</span>
            </button>

            {onOpenProjectManager && (
              <button
                type="button"
                onClick={onOpenProjectManager}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-[11px] font-bold text-slate-200 flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
                title="Otevřít správce stage plánů"
              >
                <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Moje plány</span>
                <span className="sm:hidden">Plány</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleFullscreenStage}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
              title="Přepnout zobrazení celé obrazovky na šířku"
            >
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>📱 Na celou obrazovku</span>
            </button>
          </div>
        </div>
      )}

      {/* 2D Stage Canvas Container */}
      <div
        id="stage-canvas-capture"
        ref={containerRef}
        onClick={() => onSelectItem(null)}
        className={`relative w-full bg-slate-950 border-2 border-slate-800 rounded-2xl overflow-hidden shadow-2xl transition-all ${
          isFullscreenStage
            ? 'flex-1 h-full min-h-0'
            : 'min-h-[390px] sm:min-h-[460px] aspect-[4/3] sm:aspect-[16/10]'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Top: Backstage Boundary */}
        <div className="absolute top-0 inset-x-0 bg-slate-950/90 border-b border-slate-800 py-0.5 sm:py-1 px-3 sm:px-4 flex items-center justify-between text-[9px] sm:text-[10px] font-black tracking-widest text-slate-400 uppercase z-20 pointer-events-none">
          <span>◄ BACKSTAGE</span>
          <span className="text-slate-400 font-mono">PÓDIUM</span>
          <span>BACKSTAGE ►</span>
        </div>

        {/* Bottom: Front Stage & Audience FOH Boundary */}
        <div className="absolute bottom-0 inset-x-0 bg-indigo-950/90 border-t border-indigo-700/80 py-1 sm:py-1.5 px-3 sm:px-4 flex items-center justify-center text-[9px] sm:text-[11px] font-black tracking-widest text-indigo-300 uppercase z-20 pointer-events-none shadow-lg">
          <span>▼ PŘEDEK PÓDIA — PUBLIKUM &amp; FOH ▼</span>
        </div>

        {/* Stage Left / Right Side Markers (hidden on mobile to free up space) */}
        <div className="hidden sm:block absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] font-bold text-slate-500 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 z-0 pointer-events-none">
          STAGE RIGHT
        </div>
        <div className="hidden sm:block absolute top-1/2 right-1.5 -translate-y-1/2 text-[9px] font-bold text-slate-500 uppercase tracking-widest [writing-mode:vertical-lr] z-0 pointer-events-none">
          STAGE LEFT
        </div>

        {/* Cables Layer */}
        <StageCablesLayer
          cables={cables}
          items={items}
          onDeleteCable={(id) => onUpdateCables(cables.filter((c) => c.id !== id))}
        />

        {/* Stage Items */}
        {items.map((item) => (
          <StageItemVisual
            key={item.id}
            item={item}
            isSelected={selectedItemId === item.id}
            onSelect={() => onSelectItem(item.id)}
            onPointerDown={(e) => handlePointerDown(item.id, e)}
            scale={itemScale}
          />
        ))}

        {/* Empty Stage Helper Notice if no instruments */}
        {items.length <= 1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-10">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-2xl max-w-sm shadow-xl">
              <span className="text-2xl block mb-1">🎸</span>
              <p className="text-xs font-bold text-white">
                Pódium je připravené
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Klepnutím na tlačítka nahoře přidejte bicí, kytary, basu, klávesy nebo zpěv a tažením prstu je rozestavte na scéně.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Bottom Stepper Footer */}
      {isFullscreenStage && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 flex items-center justify-between text-xs shrink-0 shadow-lg gap-2 h-8 sm:h-9">
          <button
            onClick={() => onSelectPhase?.(Math.max(1, currentPhase - 1) as StagePhase)}
            disabled={currentPhase === 1}
            className={`text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 transition ${
              currentPhase === 1 ? 'invisible pointer-events-none' : 'visible'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Předchozí krok</span>
          </button>

          <span className="text-[10px] text-slate-400 text-center truncate px-2">
            {currentPhase === 1 && '💡 Klepnutím na nástroj vyberte mikrofony a linky'}
            {currentPhase === 2 && '💡 Klepnutím na nástroj zvolte mikrofon, vstup XR18 a phantom'}
            {currentPhase === 3 && '💡 Klepnutím propojíte spotřebič se zásuvkou 230V'}
            {currentPhase === 4 && '💡 Klepnutím na bednu nastavíte typ (aktivní/pasivní) a Aux/Main'}
            {currentPhase === 5 && '✅ Vše připraveno pro tisk faktury a stažení PDF'}
          </span>

          <button
            onClick={() => {
              if (currentPhase < 5) {
                onSelectPhase?.((currentPhase + 1) as StagePhase);
              } else {
                toggleFullscreenStage();
              }
            }}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition shadow shrink-0 active:scale-95"
          >
            <span>{currentPhase < 5 ? 'Další krok' : 'Zobrazit fakturu'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Modals */}
      {modalMode === 'configure' && selectedItem && (
        <ConfigureItemModal
          item={selectedItem}
          allItems={items}
          onUpdate={(updated) => {
            onUpdateItems(items.map((i) => (i.id === updated.id ? updated : i)));
          }}
          onDelete={(id) => {
            onUpdateItems(items.filter((i) => i.id !== id));
            onUpdateCables(cables.filter((c) => c.fromId !== id && c.toId !== id));
            onSelectItem(null);
          }}
          onClose={() => setModalMode(null)}
        />
      )}

      {modalMode === 'patch_input' && selectedItem && (
        <XR18PatchModal
          item={selectedItem}
          allItems={items}
          cables={cables}
          onConfirmPatch={handleConfirmInputPatch}
          onUnpatch={handleUnpatchInput}
          onClose={() => setModalMode(null)}
        />
      )}

      {modalMode === 'patch_output' && selectedItem && (
        <OutputPatchModal
          item={selectedItem}
          allItems={items}
          onConfirmOutputPatch={handleConfirmOutputPatch}
          onUnpatch={handleUnpatchOutput}
          onDelete={(id) => {
            onUpdateItems(items.filter((i) => i.id !== id));
            onUpdateCables(cables.filter((c) => c.fromId !== id && c.toId !== id));
            onSelectItem(null);
          }}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
};
