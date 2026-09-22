import React from 'react';
import { StageCable, InteractiveStageItem } from '../../types/interactiveStage';

interface StageCablesLayerProps {
  cables: StageCable[];
  items: InteractiveStageItem[];
  selectedCableId?: string;
  onSelectCable?: (id: string) => void;
  onDeleteCable?: (id: string) => void;
}

const CABLE_CONFIG: Record<
  StageCable['type'],
  { stroke: string; labelBg: string; text: string; dash?: string }
> = {
  xlr: { stroke: '#38bdf8', labelBg: 'rgba(2, 132, 199, 0.95)', text: 'XLR' },
  jack: { stroke: '#facc15', labelBg: 'rgba(202, 138, 4, 0.95)', text: 'Jack' },
  power: { stroke: '#ef4444', labelBg: 'rgba(185, 28, 28, 0.95)', text: '230V', dash: '6 4' },
  speakon: { stroke: '#fb923c', labelBg: 'rgba(194, 65, 12, 0.95)', text: 'Speakon' },
};

export const StageCablesLayer: React.FC<StageCablesLayerProps> = ({
  cables,
  items,
  selectedCableId,
  onSelectCable,
  onDeleteCable,
}) => {
  const itemMap = new Map<string, InteractiveStageItem>();
  items.forEach((item) => {
    if (typeof item.x === 'number' && typeof item.y === 'number' && !isNaN(item.x) && !isNaN(item.y)) {
      itemMap.set(item.id, item);
    }
  });

  const validCablesWithCoords = cables
    .map((cable, idx) => {
      const from = itemMap.get(cable.fromId);
      const to = itemMap.get(cable.toId);
      if (!from || !to) return null;

      // Real stage coordinates (0..1000 in SVG viewBox)
      const fx = from.x * 10;
      const fy = from.y * 10;
      const tx = to.x * 10;
      const ty = to.y * 10;

      const offset = ((idx % 5) - 2) * 25;
      const dx = tx - fx;
      const dy = ty - fy;
      const cx1 = fx + dx * 0.25 + offset;
      const cy1 = fy + dy * 0.75 + (dx > 0 ? 40 : -40) + offset;
      const cx2 = fx + dx * 0.75 - offset;
      const cy2 = fy + dy * 0.25 - (dy > 0 ? 40 : -40) - offset;

      const midX = (from.x + to.x) / 2 + offset * 0.05;
      const midY = (from.y + to.y) / 2 + offset * 0.05;

      const pathData = `M ${fx} ${fy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

      return {
        cable,
        config: CABLE_CONFIG[cable.type] || CABLE_CONFIG.xlr,
        pathData,
        midX: Math.max(8, Math.min(92, midX)),
        midY: Math.max(8, Math.min(92, midY)),
        isSelected: selectedCableId === cable.id,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <>
      {/* SVG Cable Lines Layer with 1000x1000 ViewBox mapping to 100% width/height */}
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
      >
        {validCablesWithCoords.map(({ cable, config, pathData, isSelected }) => (
          <g key={cable.id} className="pointer-events-auto cursor-pointer group">
            {/* Wide transparent hit-area */}
            <path
              d={pathData}
              fill="none"
              stroke="transparent"
              strokeWidth="24"
              vectorEffect="non-scaling-stroke"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCable?.(cable.id);
              }}
            />

            {/* Cable shadow/halo */}
            <path
              d={pathData}
              fill="none"
              stroke="#020617"
              strokeWidth={isSelected ? '5' : '3.5'}
              strokeOpacity="0.8"
              vectorEffect="non-scaling-stroke"
            />

            {/* Visible colored cable line */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : config.stroke}
              strokeWidth={isSelected ? '3.5' : '2'}
              strokeOpacity={isSelected ? 1 : 0.85}
              strokeDasharray={config.dash}
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-150 group-hover:stroke-white group-hover:stroke-[3]"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCable?.(cable.id);
              }}
            />
          </g>
        ))}
      </svg>

      {/* HTML Cable Badges (Centered directly on the cable lines in percentage coordinates) */}
      {validCablesWithCoords.map(({ cable, config, midX, midY, isSelected }) => (
        <div
          key={`badge-${cable.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectCable?.(cable.id);
          }}
          style={{
            left: `${midX}%`,
            top: `${midY}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute pointer-events-auto cursor-pointer z-20 select-none transition-transform hover:scale-110 active:scale-95"
          title={`${config.text} kabel: ${cable.label || ''} (${cable.lengthMeters}m). Klepnutím vyberte.`}
        >
          <div
            style={{ backgroundColor: isSelected ? '#4338ca' : config.labelBg }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border shadow-md transition ${
              isSelected
                ? 'ring-2 ring-white border-white scale-110 shadow-indigo-500/50'
                : 'border-white/40 hover:border-white'
            }`}
          >
            <span className="text-[8.5px] font-mono font-black text-white whitespace-nowrap leading-none">
              {cable.label ? cable.label : `${cable.lengthMeters}m`}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};
