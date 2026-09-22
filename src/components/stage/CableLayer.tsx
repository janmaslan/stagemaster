import React from 'react';
import { CableConnection, StageItem, CableType } from '../../types/audio';

interface CableLayerProps {
  cables: CableConnection[];
  items: StageItem[];
  filterType: 'all' | CableType | 'none';
  selectedCableId?: string;
  onSelectCable?: (cableId: string) => void;
  onDeleteCable?: (cableId: string) => void;
}

export const CABLE_COLORS: Record<CableType, { stroke: string; labelBg: string; text: string }> = {
  xlr: { stroke: '#38bdf8', labelBg: 'rgba(2, 132, 199, 0.85)', text: 'XLR' },
  jack: { stroke: '#facc15', labelBg: 'rgba(202, 138, 4, 0.85)', text: 'Jack' },
  power: { stroke: '#ef4444', labelBg: 'rgba(185, 28, 28, 0.85)', text: '230V' },
  speakon: { stroke: '#fb923c', labelBg: 'rgba(194, 65, 12, 0.85)', text: 'Speakon' },
  cat5: { stroke: '#4ade80', labelBg: 'rgba(21, 128, 61, 0.85)', text: 'Ethernet' },
};

export const CableLayer: React.FC<CableLayerProps> = ({
  cables,
  items,
  filterType,
  selectedCableId,
  onSelectCable,
  onDeleteCable,
}) => {
  if (filterType === 'none') return null;

  const itemMap = new Map<string, StageItem>();
  items.forEach((item) => itemMap.set(item.id, item));

  const filteredCables = cables.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {filteredCables.map((cable) => {
        const from = itemMap.get(cable.fromId);
        const to = itemMap.get(cable.toId);
        if (!from || !to) return null;

        const isSelected = selectedCableId === cable.id;
        const color = CABLE_COLORS[cable.type] || CABLE_COLORS.xlr;

        // Calculate control points for smooth natural stage cable routing curve
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cx1 = from.x + dx * 0.25;
        const cy1 = from.y + dy * 0.75 + (dx > 0 ? 5 : -5);
        const cx2 = from.x + dx * 0.75;
        const cy2 = from.y + dy * 0.25 - (dy > 0 ? 5 : -5);

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;

        const pathData = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;

        return (
          <g key={cable.id} className="pointer-events-auto cursor-pointer group">
            {/* Wider transparent hit-area for easy clicking/touching on mobile */}
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

            {/* Glowing background on hover/selection */}
            <path
              d={pathData}
              fill="none"
              stroke={isSelected ? '#ffffff' : color.stroke}
              strokeWidth={isSelected ? '4' : '2'}
              strokeOpacity={isSelected ? 0.9 : 0.65}
              strokeDasharray={cable.type === 'power' ? '6 3' : undefined}
              filter={isSelected ? 'url(#glow)' : undefined}
              vectorEffect="non-scaling-stroke"
              className="transition-all duration-150 group-hover:stroke-white group-hover:stroke-[3]"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCable?.(cable.id);
              }}
            />

            {/* Cable Label Badge in Middle */}
            {(cable.label || cable.lengthMeters) && (
              <g
                transform={`translate(${midX}, ${midY})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCable?.(cable.id);
                }}
              >
                <rect
                  x="-28"
                  y="-10"
                  width="56"
                  height="20"
                  rx="6"
                  fill={isSelected ? '#4338ca' : color.labelBg}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? '1.5' : '0.5'}
                  strokeOpacity="0.4"
                  className="transition"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="7.5"
                  fontWeight="bold"
                  className="select-none font-mono"
                >
                  {cable.label ? cable.label.slice(0, 11) : `${cable.lengthMeters}m`}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
