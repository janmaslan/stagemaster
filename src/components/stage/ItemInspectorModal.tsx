import React, { useState } from 'react';
import { 
  StageItem, 
  CableConnection, 
  CableType, 
  Channel 
} from '../../types/audio';
import { 
  getStageIconComponent 
} from './StageIcons';
import { CABLE_COLORS } from './CableLayer';
import { 
  RotateCw, 
  Trash2, 
  Link, 
  Zap, 
  Plus, 
  Sliders, 
  Check, 
  X,
  FileText
} from 'lucide-react';

interface ItemInspectorModalProps {
  item: StageItem;
  allItems: StageItem[];
  cables: CableConnection[];
  channels: Channel[];
  onUpdateItem: (updated: StageItem) => void;
  onDeleteItem: (id: string) => void;
  onAddCable: (cable: Omit<CableConnection, 'id'>) => void;
  onDeleteCable: (cableId: string) => void;
  onCreateChannelForItem: (item: StageItem) => void;
  onClose: () => void;
}

export const ItemInspectorModal: React.FC<ItemInspectorModalProps> = ({
  item,
  allItems,
  cables,
  channels,
  onUpdateItem,
  onDeleteItem,
  onAddCable,
  onDeleteCable,
  onCreateChannelForItem,
  onClose,
}) => {
  const [name, setName] = useState(item.name);
  const [notes, setNotes] = useState(item.notes || '');
  const [powerRequired, setPowerRequired] = useState(!!item.powerRequired);
  const [diType, setDiType] = useState(item.diType || 'none');
  const [rotation, setRotation] = useState(item.rotation || 0);

  // New cable creation state
  const [targetItemId, setTargetItemId] = useState<string>('');
  const [cableType, setCableType] = useState<CableType>('xlr');
  const [cableLength, setCableLength] = useState<number>(10);
  const [cableLabel, setCableLabel] = useState<string>('');

  const Icon = getStageIconComponent(item.type);

  // Find all cables connected to this item
  const connectedCables = cables.filter(
    (c) => c.fromId === item.id || c.toId === item.id
  );

  // Find other items for cable connection
  const potentialTargets = allItems.filter((i) => i.id !== item.id);

  // Find linked channels
  const linkedChannels = channels.filter(
    (ch) => ch.stageItemId === item.id || ch.name.toLowerCase().includes(item.name.toLowerCase())
  );

  const handleSave = () => {
    onUpdateItem({
      ...item,
      name,
      notes,
      powerRequired,
      diType: diType as any,
      rotation,
    });
    onClose();
  };

  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    onUpdateItem({ ...item, rotation: nextRotation });
  };

  const handleCreateCable = () => {
    if (!targetItemId) return;
    onAddCable({
      fromId: item.id,
      toId: targetItemId,
      type: cableType,
      lengthMeters: cableLength,
      label: cableLabel || undefined,
    });
    setTargetItemId('');
    setCableLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Nastavení prvku na pódiu
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Basic Info & Rotation */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Název / Popis</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Např. Kytara Lead, Zpěvák Jan"
              />
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                title="Otočit o 90°"
              >
                <RotateCw className="w-4 h-4 text-indigo-400" />
                <span>{rotation}°</span>
              </button>
            </div>
          </div>

          {/* Power & DI box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/80 cursor-pointer hover:bg-slate-800 transition">
              <input
                type="checkbox"
                checked={powerRequired}
                onChange={(e) => setPowerRequired(e.target.checked)}
                className="w-4 h-4 rounded text-red-500 focus:ring-0 bg-slate-900 border-slate-600"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                <Zap className="w-4 h-4 text-red-400" />
                <span>Vyžaduje 230V zásuvku</span>
              </div>
            </label>

            {['guitar_amp', 'bass_amp', 'keyboard', 'acoustic_guitar'].includes(item.type) && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">DI Box</label>
                <select
                  value={diType}
                  onChange={(e) => setDiType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="none">Bez DI boxu</option>
                  <option value="mono-active">Aktivní DI (BSS AR-133 / J48)</option>
                  <option value="mono-passive">Pasivní DI (Radial ProDI)</option>
                  <option value="stereo-passive">Stereo DI (Radial ProD2)</option>
                  <option value="stereo-active">Stereo aktivní DI</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Poznámky pro techniky</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Např. Má vlastní bezdrát, požadavek na 2 linky..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Cables Section */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-indigo-400" />
              Kabelová propojení ({connectedCables.length})
            </h4>
          </div>

          {/* List of existing cables */}
          {connectedCables.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {connectedCables.map((c) => {
                const otherItemId = c.fromId === item.id ? c.toId : c.fromId;
                const otherItem = allItems.find((i) => i.id === otherItemId);
                const color = CABLE_COLORS[c.type];
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                        style={{ backgroundColor: color.stroke }}
                      >
                        {color.text}
                      </span>
                      <span className="text-slate-300 font-medium">
                        → {otherItem?.name || 'Neznámý cíl'}
                      </span>
                      <span className="text-slate-500 font-mono">({c.lengthMeters}m)</span>
                      {c.label && <span className="text-indigo-300 text-[10px]">[{c.label}]</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteCable(c.id)}
                      className="p-1 text-slate-400 hover:text-red-400 transition"
                      title="Odstranit kabel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Zatím nevede žádný kabel.</p>
          )}

          {/* Add Cable Form */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3 space-y-2">
            <span className="text-xs font-semibold text-indigo-300 block">
              + Zapojit nový kabel odsud do:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={targetItemId}
                onChange={(e) => setTargetItemId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">Vyberte cíl (stagebox, DI...)</option>
                {potentialTargets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.type})
                  </option>
                ))}
              </select>

              <select
                value={cableType}
                onChange={(e) => setCableType(e.target.value as CableType)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="xlr">XLR kabel (signál)</option>
                <option value="jack">Jack 6.3mm (nástroj)</option>
                <option value="power">230V napájení (AC)</option>
                <option value="speakon">Speakon (repro)</option>
                <option value="cat5">Ethernet (Cat5/6)</option>
              </select>

              <select
                value={cableLength}
                onChange={(e) => setCableLength(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>Délka 3 m</option>
                <option value={5}>Délka 5 m</option>
                <option value={10}>Délka 10 m</option>
                <option value={15}>Délka 15 m</option>
                <option value={20}>Délka 20 m</option>
              </select>
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={cableLabel}
                onChange={(e) => setCableLabel(e.target.value)}
                placeholder="Popisek (např. CH 12, Aux 2)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                disabled={!targetItemId}
                onClick={handleCreateCable}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Přidat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Input List Quick Connect */}
        <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block">Kanály v Input listu:</span>
            {linkedChannels.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {linkedChannels.map((ch) => (
                  <span
                    key={ch.id}
                    className="text-[11px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded"
                  >
                    CH {ch.channelNumber}: {ch.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">Zatím nepřiřazen kanál v mixu</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onCreateChannelForItem(item)}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>+ Vytvořit kanál do mixu</span>
          </button>
        </div>

        {/* Actions Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Opravdu chcete odstranit prvek "${item.name}" z pódia?`)) {
                onDeleteItem(item.id);
                onClose();
              }
            }}
            className="px-3 py-2 bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Smazat prvek</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
            >
              Zrušit
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30"
            >
              <Check className="w-4 h-4" />
              <span>Uložit změny</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
