import React, { useState } from 'react';
import { 
  Sliders, 
  Map, 
  ListOrdered, 
  Volume2, 
  Boxes, 
  FileDown, 
  Plus, 
  FolderOpen, 
  Save, 
  Download, 
  Upload, 
  Layers
} from 'lucide-react';
import { EventProject } from '../types/audio';
import { MIXER_PROFILES } from '../data/presets';
import { exportProjectToJson, importProjectFromJson } from '../utils/storage';

export type ActiveTab = 'stage' | 'patch' | 'outputs' | 'gear' | 'export';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  project: EventProject;
  projectsList: EventProject[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onUpdateProjectMeta: (updates: Partial<EventProject>) => void;
  onImportProject: (imported: EventProject) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  project,
  projectsList,
  onSelectProject,
  onNewProject,
  onUpdateProjectMeta,
  onImportProject,
}) => {
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showMixerModal, setShowMixerModal] = useState(false);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = importProjectFromJson(content);
        if (imported) {
          onImportProject(imported);
          setShowProjectsModal(false);
        } else {
          alert('Soubor se nepodařilo načíst jako platný projekt StageMaster.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentMixer = MIXER_PROFILES.find((m) => m.id === project.mixerId) || MIXER_PROFILES[0];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none">
      {/* Top Bar: Band & Project Info, Mixer Selector, Actions */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Project Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg">
            <Sliders className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded-full">
                StageMaster Pro
              </span>
              <button
                onClick={() => setShowProjectsModal(true)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline"
                title="Přepnout projekt"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Projekty ({projectsList.length})</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={project.bandName}
                onChange={(e) => onUpdateProjectMeta({ bandName: e.target.value })}
                className="bg-transparent text-slate-100 font-bold text-base sm:text-lg focus:outline-none focus:bg-slate-800/80 px-1 rounded transition max-w-[200px] sm:max-w-xs truncate"
                placeholder="Název kapely"
                title="Kliknutím upravte název kapely"
              />
              <span className="text-slate-600 hidden sm:inline">•</span>
              <input
                type="text"
                value={project.name}
                onChange={(e) => onUpdateProjectMeta({ name: e.target.value })}
                className="bg-transparent text-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-slate-800/80 px-1 rounded transition hidden sm:inline-block max-w-[160px] truncate"
                placeholder="Název akce / festivalu"
                title="Název akce"
              />
            </div>
          </div>
        </div>

        {/* Mixer Quick Badge & Actions */}
        <div className="flex items-center gap-2">
          {/* Mixer Selector Button */}
          <button
            onClick={() => setShowMixerModal(true)}
            className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-indigo-500/50 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition shadow-sm"
            title="Zvolit model mixážního pultu"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{currentMixer.name.split('/')[0]}</span>
            <span className="text-xs text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              {project.channels.length}/{currentMixer.inputsCount} CH
            </span>
          </button>

          {/* Quick Backup / Export JSON */}
          <button
            onClick={() => exportProjectToJson(project)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-700 transition"
            title="Zálohovat projekt do JSON"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Záloha</span>
          </button>

          {/* New Project */}
          <button
            onClick={onNewProject}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition shadow-sm"
            title="Vytvořit novou akci"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Nová akce</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/60 py-1">
        <button
          onClick={() => onSelectTab('stage')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            currentTab === 'stage'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Stage Plán</span>
          <span className="bg-slate-900/60 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            {project.items.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('patch')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            currentTab === 'patch'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Input List (Patch)</span>
          <span className="bg-slate-900/60 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            {project.channels.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('outputs')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            currentTab === 'outputs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Výstupy & Monitory</span>
          <span className="bg-slate-900/60 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
            {project.outputs.length}
          </span>
        </button>

        <button
          onClick={() => onSelectTab('gear')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            currentTab === 'gear'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Materiál & Kabely</span>
        </button>

        <button
          onClick={() => onSelectTab('export')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
            currentTab === 'export'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
          }`}
        >
          <FileDown className="w-4 h-4" />
          <span>Export Rider (PDF)</span>
        </button>
      </nav>

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                Uložené akce a kapely
              </h3>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {projectsList.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    setShowProjectsModal(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    p.id === project.id
                      ? 'bg-indigo-950/60 border-indigo-600'
                      : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-white text-sm sm:text-base">{p.bandName || 'Beze jména'}</div>
                    <div className="text-xs text-slate-400">
                      {p.name} • {p.items.length} prvků • {p.channels.length} kanálů
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{p.date}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <label className="cursor-pointer text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-1.5 transition">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Nahrát ze souboru (JSON)</span>
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>

              <button
                onClick={() => {
                  onNewProject();
                  setShowProjectsModal(false);
                }}
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Založit novou kapelu</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mixer Modal */}
      {showMixerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Výběr mixážního pultu
              </h3>
              <button
                onClick={() => setShowMixerModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Vyberte hardware mixpultu pro správné limity vstupů, stageboxy a routing výstupů.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {MIXER_PROFILES.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onUpdateProjectMeta({ mixerId: m.id });
                    setShowMixerModal(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    m.id === project.mixerId
                      ? 'bg-indigo-950/60 border-indigo-600 ring-1 ring-indigo-500'
                      : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{m.name}</span>
                    <span className="text-xs font-mono bg-slate-900 px-2 py-0.5 rounded text-indigo-400 border border-slate-800">
                      {m.inputsCount} In / {m.auxOutputsCount} Aux
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{m.notes}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowMixerModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
