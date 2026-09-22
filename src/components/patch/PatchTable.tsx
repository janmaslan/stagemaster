import React, { useState } from 'react';
import { 
  Channel, 
  StageItem, 
  StandType 
} from '../../types/audio';
import { COMMON_MICS_AND_DIS } from '../../data/presets';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Copy, 
  Zap, 
  Search, 
  ArrowUpDown, 
  Check, 
  Filter,
  Sparkles
} from 'lucide-react';

interface PatchTableProps {
  channels: Channel[];
  stageItems: StageItem[];
  onUpdateChannels: (channels: Channel[]) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  drums: { bg: 'bg-amber-950/80 border-amber-800 text-amber-300', text: 'text-amber-400', label: 'Bicí' },
  bass: { bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300', text: 'text-emerald-400', label: 'Basa' },
  guitars: { bg: 'bg-blue-950/80 border-blue-800 text-blue-300', text: 'text-blue-400', label: 'Kytary' },
  keys: { bg: 'bg-purple-950/80 border-purple-800 text-purple-300', text: 'text-purple-400', label: 'Klávesy' },
  vocals: { bg: 'bg-rose-950/80 border-rose-800 text-rose-300', text: 'text-rose-400', label: 'Zpěvy' },
  horns: { bg: 'bg-orange-950/80 border-orange-800 text-orange-300', text: 'text-orange-400', label: 'Dechy' },
  playback: { bg: 'bg-cyan-950/80 border-cyan-800 text-cyan-300', text: 'text-cyan-400', label: 'Playback' },
  other: { bg: 'bg-slate-800 border-slate-700 text-slate-300', text: 'text-slate-400', label: 'Jiné' },
};

const STAND_LABELS: Record<StandType, string> = {
  high_boom: 'Vysoká šibenice',
  low_boom: 'Malá šibenice',
  straight: 'Rovný stojan',
  clip_clamp: 'Clamp na ráfek',
  none: 'Bez stojanu',
};

export const PatchTable: React.FC<PatchTableProps> = ({
  channels,
  stageItems,
  onUpdateChannels,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredChannels = channels.filter((ch) => {
    const matchesSearch =
      ch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.micOrDi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.snakePort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ch.channelNumber.toString().includes(searchTerm);
    const matchesCategory =
      selectedCategory === 'all' || ch.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpdateChannel = (id: string, updates: Partial<Channel>) => {
    onUpdateChannels(
      channels.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch))
    );
  };

  const handleDeleteChannel = (id: string) => {
    onUpdateChannels(channels.filter((ch) => ch.id !== id));
  };

  const handleDuplicateChannel = (channel: Channel) => {
    const newCh: Channel = {
      ...channel,
      id: 'ch-' + Date.now(),
      channelNumber: channels.length + 1,
      name: `${channel.name} (Kopie)`,
    };
    onUpdateChannels([...channels, newCh]);
  };

  const handleAddChannel = () => {
    const nextNum = channels.length > 0 ? Math.max(...channels.map((c) => c.channelNumber)) + 1 : 1;
    const newChannel: Channel = {
      id: 'ch-' + Date.now(),
      channelNumber: nextNum,
      name: `Vstup ${nextNum}`,
      category: 'other',
      micOrDi: 'Shure SM58 (Zpěv dynamický)',
      stand: 'high_boom',
      phantom48V: false,
      snakePort: `In ${nextNum}`,
      cableLengthMeters: 10,
    };
    onUpdateChannels([...channels, newChannel]);
  };

  // Bulk presets for quick stage soundcheck prep
  const handleAddDrumKitPreset = () => {
    const baseNum = channels.length > 0 ? Math.max(...channels.map((c) => c.channelNumber)) + 1 : 1;
    const drumChannels: Channel[] = [
      { id: 'ch-' + (Date.now() + 1), channelNumber: baseNum, name: 'Kick In', category: 'drums', micOrDi: 'Shure Beta 91A (Kick In boundary)', stand: 'none', phantom48V: true, snakePort: `In ${baseNum}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 2), channelNumber: baseNum + 1, name: 'Kick Out', category: 'drums', micOrDi: 'Shure Beta 52A (Kick)', stand: 'low_boom', phantom48V: false, snakePort: `In ${baseNum + 1}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 3), channelNumber: baseNum + 2, name: 'Snare Top', category: 'drums', micOrDi: 'Shure SM57 (Snare / Tom)', stand: 'clip_clamp', phantom48V: false, snakePort: `In ${baseNum + 2}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 4), channelNumber: baseNum + 3, name: 'Hi-Hat', category: 'drums', micOrDi: 'Rode NT5 (Overhead / Hi-Hat)', stand: 'high_boom', phantom48V: true, snakePort: `In ${baseNum + 3}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 5), channelNumber: baseNum + 4, name: 'Rack Tom 1', category: 'drums', micOrDi: 'Sennheiser e604 (Tom clip)', stand: 'clip_clamp', phantom48V: false, snakePort: `In ${baseNum + 4}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 6), channelNumber: baseNum + 5, name: 'Floor Tom', category: 'drums', micOrDi: 'Sennheiser e604 (Tom clip)', stand: 'clip_clamp', phantom48V: false, snakePort: `In ${baseNum + 5}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 7), channelNumber: baseNum + 6, name: 'Overhead L', category: 'drums', micOrDi: 'Rode NT5 (Overhead / Hi-Hat)', stand: 'high_boom', phantom48V: true, snakePort: `In ${baseNum + 6}`, cableLengthMeters: 5 },
      { id: 'ch-' + (Date.now() + 8), channelNumber: baseNum + 7, name: 'Overhead R', category: 'drums', micOrDi: 'Rode NT5 (Overhead / Hi-Hat)', stand: 'high_boom', phantom48V: true, snakePort: `In ${baseNum + 7}`, cableLengthMeters: 5 },
    ];
    onUpdateChannels([...channels, ...drumChannels]);
  };

  const handleAddVocalTrioPreset = () => {
    const baseNum = channels.length > 0 ? Math.max(...channels.map((c) => c.channelNumber)) + 1 : 1;
    const voxChannels: Channel[] = [
      { id: 'ch-' + (Date.now() + 1), channelNumber: baseNum, name: 'Lead Zpěv', category: 'vocals', micOrDi: 'Shure Beta 58A (Zpěv superkardioida)', stand: 'high_boom', phantom48V: false, snakePort: `In ${baseNum}`, cableLengthMeters: 15 },
      { id: 'ch-' + (Date.now() + 2), channelNumber: baseNum + 1, name: 'Backing Vox 1', category: 'vocals', micOrDi: 'Shure SM58 (Zpěv dynamický)', stand: 'high_boom', phantom48V: false, snakePort: `In ${baseNum + 1}`, cableLengthMeters: 10 },
      { id: 'ch-' + (Date.now() + 3), channelNumber: baseNum + 2, name: 'Backing Vox 2', category: 'vocals', micOrDi: 'Shure SM58 (Zpěv dynamický)', stand: 'high_boom', phantom48V: false, snakePort: `In ${baseNum + 2}`, cableLengthMeters: 10 },
    ];
    onUpdateChannels([...channels, ...voxChannels]);
  };

  // Re-order channels 1..N
  const handleAutoRenumber = () => {
    const renumbered = [...channels]
      .sort((a, b) => a.channelNumber - b.channelNumber)
      .map((ch, idx) => ({ ...ch, channelNumber: idx + 1, snakePort: `In ${idx + 1}` }));
    onUpdateChannels(renumbered);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hledat kanál, mikrofon, stagebox port..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Vše ({channels.length})
          </button>
          {Object.entries(CATEGORY_COLORS).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === key
                  ? `${meta.bg} font-bold`
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick presets */}
          <button
            onClick={handleAddDrumKitPreset}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            title="Přidat 8 standardních stop pro bicí sadu"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Bicí (8ch)</span>
          </button>

          <button
            onClick={handleAddVocalTrioPreset}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            title="Přidat 3 zpěvové kanály"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ Zpěvy (3ch)</span>
          </button>

          <button
            onClick={handleAutoRenumber}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition"
            title="Přečíslovat kanály 1..N"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Přečíslovat</span>
          </button>

          <button
            onClick={handleAddChannel}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Přidat kanál</span>
          </button>
        </div>
      </div>

      {/* Main Channels Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-14 font-mono font-bold text-center">CH #</th>
                <th className="py-3 px-3 min-w-[140px]">Název zdroje</th>
                <th className="py-3 px-3 w-28">Kategorie</th>
                <th className="py-3 px-3 min-w-[200px]">Mikrofon / DI Box</th>
                <th className="py-3 px-3 w-32">Stojan</th>
                <th className="py-3 px-3 w-16 text-center font-bold text-red-400">+48V</th>
                <th className="py-3 px-3 min-w-[130px]">Stagebox / Snake</th>
                <th className="py-3 px-3 w-24">Kabel</th>
                <th className="py-3 px-3 min-w-[160px]">Poznámka</th>
                <th className="py-3 px-3 w-16 text-center">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredChannels.length > 0 ? (
                filteredChannels.map((ch) => {
                  const catStyle = CATEGORY_COLORS[ch.category] || CATEGORY_COLORS.other;
                  return (
                    <tr
                      key={ch.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* CH # */}
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          value={ch.channelNumber}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, {
                              channelNumber: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-10 bg-slate-800 text-center font-mono font-bold text-indigo-400 rounded py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                      </td>

                      {/* Source Name */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ch.name}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, { name: e.target.value })
                          }
                          className="w-full bg-transparent font-semibold text-white focus:bg-slate-800 px-2 py-1 rounded border border-transparent focus:border-slate-700 transition"
                          placeholder="Např. Kick, Lead Vox..."
                        />
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3">
                        <select
                          value={ch.category}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, {
                              category: e.target.value as any,
                            })
                          }
                          className={`w-full text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none ${catStyle.bg}`}
                        >
                          <option value="drums">Bicí</option>
                          <option value="bass">Basa</option>
                          <option value="guitars">Kytary</option>
                          <option value="keys">Klávesy</option>
                          <option value="vocals">Zpěvy</option>
                          <option value="horns">Dechy</option>
                          <option value="playback">Playback</option>
                          <option value="other">Jiné</option>
                        </select>
                      </td>

                      {/* Mic / DI Selector */}
                      <td className="py-2.5 px-3">
                        <div className="relative">
                          <input
                            list={`mics-list-${ch.id}`}
                            value={ch.micOrDi}
                            onChange={(e) =>
                              handleUpdateChannel(ch.id, {
                                micOrDi: e.target.value,
                              })
                            }
                            className="w-full bg-slate-800/80 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
                            placeholder="Zvolte nebo vepište mikrofon..."
                          />
                          <datalist id={`mics-list-${ch.id}`}>
                            {COMMON_MICS_AND_DIS.map((m) => (
                              <option key={m} value={m} />
                            ))}
                          </datalist>
                        </div>
                      </td>

                      {/* Stand */}
                      <td className="py-2.5 px-3">
                        <select
                          value={ch.stand}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, {
                              stand: e.target.value as StandType,
                            })
                          }
                          className="w-full bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {Object.entries(STAND_LABELS).map(([k, val]) => (
                            <option key={k} value={k}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* +48V Phantom Power Toggle */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateChannel(ch.id, {
                              phantom48V: !ch.phantom48V,
                            })
                          }
                          className={`w-7 h-7 rounded-lg font-bold text-[10px] mx-auto flex items-center justify-center transition border ${
                            ch.phantom48V
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/50 ring-2 ring-red-400/40'
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                          }`}
                          title={ch.phantom48V ? '+48V Phantom zapnut' : '+48V vypnut'}
                        >
                          48V
                        </button>
                      </td>

                      {/* Snake Port */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ch.snakePort}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, {
                              snakePort: e.target.value,
                            })
                          }
                          placeholder="In 1, Drum Box 3..."
                          className="w-full bg-slate-800/80 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </td>

                      {/* Cable Length */}
                      <td className="py-2.5 px-3">
                        <select
                          value={ch.cableLengthMeters}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, {
                              cableLengthMeters: Number(e.target.value),
                            })
                          }
                          className="w-full bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value={3}>XLR 3m</option>
                          <option value={5}>XLR 5m</option>
                          <option value={10}>XLR 10m</option>
                          <option value={15}>XLR 15m</option>
                          <option value={20}>XLR 20m</option>
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={ch.notes || ''}
                          onChange={(e) =>
                            handleUpdateChannel(ch.id, { notes: e.target.value })
                          }
                          placeholder="Poznámky pro mix..."
                          className="w-full bg-transparent text-slate-300 focus:bg-slate-800 px-2 py-1 rounded border border-transparent focus:border-slate-700 text-xs transition"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={() => handleDuplicateChannel(ch)}
                            className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition"
                            title="Duplikovat kanál"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChannel(ch.id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition"
                            title="Smazat kanál"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Nenalezeny žádné kanály odpovídající filtru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="bg-slate-950/90 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Celkem kanálů: <b className="text-white font-mono">{channels.length}</b>
            </span>
            <span>
              Aktivní +48V: <b className="text-red-400 font-mono">{channels.filter((c) => c.phantom48V).length}</b>
            </span>
            <span>
              Stojany celkem: <b className="text-indigo-400 font-mono">{channels.filter((c) => c.stand !== 'none').length}</b>
            </span>
          </div>
          <button
            onClick={handleAddChannel}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Přidat další kanál na konec</span>
          </button>
        </div>
      </div>
    </div>
  );
};
