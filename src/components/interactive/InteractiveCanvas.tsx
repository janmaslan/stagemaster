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
import { Maximize2, Minimize2, Smartphone } from 'lucide-react';

interface InteractiveCanvasProps {
  items: InteractiveStageItem[];
  cables: StageCable[];
  currentPhase: StagePhase;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItems: (items: InteractiveStageItem[]) => void;
  onUpdateCables: (cables: StageCable[]) => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  items,
  cables,
  currentPhase,
  selectedItemId,
  onSelectItem,
  onUpdateItems,
  onUpdateCables,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [modalMode, setModalMode] = useState<'configure' | 'patch_input' | 'patch_output' | null>(null);

  // Fullscreen / Landscape stage mode
  const [isFullscreenStage, setIsFullscreenStage] = useState<boolean>(false);

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

      const newX = Math.round(Math.max(6, Math.min(94, itemStartCoords.current.x + deltaXPercent)));
      const newY = Math.round(Math.max(8, Math.min(92, itemStartCoords.current.y + deltaYPercent)));

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

      // If user tapped without dragging, trigger modal according to phase
      if (!hasMovedSignificantly.current) {
        onSelectItem(id);
        const clickedItem = items.find((i) => i.id === id);
        if (!clickedItem) return;

        if (currentPhase === 1) {
          setModalMode('configure');
        } else if (currentPhase === 2) {
          if (['instrument', 'vocal'].includes(clickedItem.category)) {
            setModalMode('patch_input');
          } else {
            setModalMode('configure');
          }
        } else if (currentPhase === 3) {
          // In Phase 3: Connect to power strip
          if (clickedItem.needsPower230V && clickedItem.category !== 'power_strip') {
            const strips = items.filter((i) => i.category === 'power_strip');
            if (strips.length === 0) {
              alert('Nejprve přidejte na pódium tlačítkem nahoře "+ Prodlužka 230V"!');
            } else {
              // Check if already connected to any power strip
              const existingPowerCable = cables.find(
                (c) => c.type === 'power' && c.toId === clickedItem.id
              );
              if (existingPowerCable) {
                // Toggle off
                onUpdateCables(cables.filter((c) => c.id !== existingPowerCable.id));
                onUpdateItems(
                  items.map((it) => (it.id === clickedItem.id ? { ...it, powerConnectedToId: undefined } : it))
                );
              } else {
                // Find nearest power strip by distance on stage
                let nearestStrip = strips[0];
                let minDistance = Infinity;
                for (const s of strips) {
                  const dist = Math.hypot((s.x ?? 50) - (clickedItem.x ?? 50), (s.y ?? 50) - (clickedItem.y ?? 50));
                  if (dist < minDistance) {
                    minDistance = dist;
                    nearestStrip = s;
                  }
                }

                // Add power cable from nearest strip
                const newCable: StageCable = {
                  id: 'pwr-' + Date.now(),
                  fromId: nearestStrip.id,
                  toId: clickedItem.id,
                  type: 'power',
                  lengthMeters: 5,
                  label: '230V',
                };
                onUpdateCables([...cables, newCable]);
                onUpdateItems(
                  items.map((it) => (it.id === clickedItem.id ? { ...it, powerConnectedToId: nearestStrip.id } : it))
                );
              }
            }
          } else {
            setModalMode('configure');
          }
        } else if (currentPhase === 4) {
          if (['pa_speaker', 'wedge', 'monitor_wedge', 'iem_station'].includes(clickedItem.subType) || clickedItem.category === 'pa_speaker') {
            setModalMode('patch_output');
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
  const handleConfirmInputPatch = (channelId: string, channelNumber: number, needsPhantom: boolean, cableLength: number) => {
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
    const cableType = (subCh?.pickupType === 'line_jack' || subCh?.pickupType === 'line') ? 'jack' : 'xlr';

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
  const handleConfirmOutputPatch = (port: string, performer: string, speakerType: 'active' | 'passive') => {
    if (!selectedItem || !xr18Item) return;

    onUpdateItems(
      items.map((it) =>
        it.id === selectedItem.id
          ? {
              ...it,
              assignedOutputPort: port,
              targetPerformer: performer,
              speakerType,
              needsPower230V: speakerType === 'active', // Active speakers need 230V!
            }
          : it
      )
    );

    const filteredCables = cables.filter(
      (c) => !(c.fromId === xr18Item.id && c.toId === selectedItem.id)
    );

    const newCable: StageCable = {
      id: 'outcable-' + Date.now(),
      fromId: xr18Item.id,
      toId: selectedItem.id,
      type: speakerType === 'passive' ? 'speakon' : 'xlr',
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

  return (
    <div
      className={
        isFullscreenStage
          ? 'fixed inset-0 z-50 bg-slate-950 p-2 sm:p-4 flex flex-col gap-2 select-none overflow-hidden'
          : 'relative w-full flex flex-col gap-2'
      }
    >
      {/* Stage Toolbar with Fullscreen / Landscape toggle */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
            <span>Rozestavení na scéně (Stage Plán)</span>
          </span>
          {isFullscreenStage && (
            <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
              💡 Pro maximální plochu otočte mobil na šířku
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleFullscreenStage}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 shadow transition active:scale-95"
          title="Přepnout zobrazení celé obrazovky na šířku"
        >
          {isFullscreenStage ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Zmenšit</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>📱 Na celou obrazovku / Na šířku</span>
            </>
          )}
        </button>
      </div>

      {/* 2D Stage Canvas Container */}
      <div
        ref={containerRef}
        onClick={() => onSelectItem(null)}
        className={`relative w-full bg-slate-950 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-2xl select-none transition-all ${
          isFullscreenStage
            ? 'flex-1 h-full min-h-[300px]'
            : 'aspect-[4/3] sm:aspect-[16/10]'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Top: Backstage Boundary */}
        <div className="absolute top-0 inset-x-0 bg-slate-950/90 border-b border-slate-800 py-1 px-4 flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase z-20 pointer-events-none">
          <span>◄ BACKSTAGE (ZÁZEMÍ PÓDIA)</span>
          <span className="text-slate-400 font-mono">PÓDIUM</span>
          <span>BACKSTAGE ►</span>
        </div>

        {/* Bottom: Front Stage & Audience FOH Boundary */}
        <div className="absolute bottom-0 inset-x-0 bg-indigo-950/90 border-t border-indigo-700/80 py-1.5 px-4 flex items-center justify-center text-[11px] font-black tracking-widest text-indigo-300 uppercase z-20 pointer-events-none shadow-lg">
          <span>▼ PŘEDEK PÓDIA — PUBLIKUM &amp; ZVUKAŘ (FOH) ▼</span>
        </div>

        {/* Stage Left / Right Side Markers */}
        <div className="absolute top-1/2 left-1.5 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 z-0 pointer-events-none">
          STAGE RIGHT (Z POHLEDU MUZIKANTA)
        </div>
        <div className="absolute top-1/2 right-1.5 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest [writing-mode:vertical-lr] z-0 pointer-events-none">
          STAGE LEFT (Z POHLEDU MUZIKANTA)
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

      {/* Modals */}
      {modalMode === 'configure' && selectedItem && (
        <ConfigureItemModal
          item={selectedItem}
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
          onConfirmOutputPatch={handleConfirmOutputPatch}
          onUnpatch={handleUnpatchOutput}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
};
