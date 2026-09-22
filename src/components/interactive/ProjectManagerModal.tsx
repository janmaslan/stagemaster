import React, { useState, useRef } from 'react';
import { StageProject } from '../../types/interactiveStage';
import { 
  createNewStageProject, 
  duplicateStageProject, 
  deleteStageProject, 
  exportProjectAsJson, 
  exportAllProjectsAsJson, 
  importProjectFromJson 
} from '../../utils/stageProjectStorage';
import { 
  FolderOpen, 
  Plus, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  X, 
  Check, 
  Search, 
  Calendar, 
  Music2, 
  Sliders, 
  Speaker
} from 'lucide-react';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: StageProject;
  savedProjects: StageProject[];
  onSelectProject: (project: StageProject) => void;
  onUpdateProjectsList: (projects: StageProject[]) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  activeProject,
  savedProjects,
  onSelectProject,
  onUpdateProjectsList,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  const handleCreateNew = () => {
    const name = prompt('Zadejte název kapely nebo akce:', 'Nová Kapela');
    if (name === null) return; // user cancelled

    const { newProject, all } = createNewStageProject(name.trim() || 'Nová Kapela');
    onUpdateProjectsList(all);
    onSelectProject(newProject);
    showStatus(`Nový plán „${newProject.bandName}“ byl vytvořen.`);
  };

  const handleDuplicate = (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const { duplicated, all } = duplicateStageProject(projectId);
    onUpdateProjectsList(all);
    onSelectProject(duplicated);
    showStatus(`Plán byl zkopírován jako „${duplicated.bandName}“.`);
  };

  const handleDelete = (projectId: string, bandName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (confirm(`Opravdu chcete smazat uložený plán „${bandName}“? Tato akce je nevratná.`)) {
      const { nextActive, all } = deleteStageProject(projectId);
      onUpdateProjectsList(all);
      if (projectId === activeProject.id) {
        onSelectProject(nextActive);
      }
      showStatus(`Plán „${bandName}“ byl smazán.`);
    }
  };

  const handleExportSingle = (project: StageProject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    exportProjectAsJson(project);
    showStatus(`Plán „${project.bandName}“ byl stažen jako JSON.`);
  };

  const handleExportAll = () => {
    exportAllProjectsAsJson(savedProjects);
    showStatus(`Všech ${savedProjects.length} plánů bylo vyexportováno do zálohy.`);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const { importedProjects, all } = importProjectFromJson(content);
        onUpdateProjectsList(all);
        onSelectProject(importedProjects[0]);
        showStatus(`Úspěšně importováno ${importedProjects.length} plán(ů).`);
      } catch (err: any) {
        showStatus(err?.message || 'Chyba při importu souboru', 'error');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };

  const filteredProjects = savedProjects.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (p.bandName || '').toLowerCase().includes(query) ||
      (p.eventName || '').toLowerCase().includes(query) ||
      (p.venue || '').toLowerCase().includes(query)
    );
  });

  const getStats = (p: StageProject) => {
    const instruments = p.items.filter((i) => ['instrument', 'vocal'].includes(i.category)).length;
    let patchedChannels = 0;
    p.items.forEach((it) => {
      it.channels?.forEach((ch) => {
        if (ch.assignedChannelNumber && ch.assignedChannelNumber >= 1 && ch.assignedChannelNumber <= 16) {
          patchedChannels++;
        }
      });
    });
    const wedges = p.items.filter((i) => i.subType === 'wedge' || i.subType === 'pa_speaker').length;
    return { instruments, patchedChannels, wedges };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Správa stage plánů
                <span className="text-xs bg-slate-800 text-indigo-400 px-2 py-0.5 rounded-full border border-slate-700">
                  {savedProjects.length} {savedProjects.length === 1 ? 'plán' : savedProjects.length < 5 ? 'plány' : 'plánů'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Ukládání pro různé kapely, zálohy a rychlé načítání
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Zavřít"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message Notification */}
        {statusMessage && (
          <div
            className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition ${
              statusMessage.type === 'error'
                ? 'bg-rose-950/80 border-b border-rose-800 text-rose-300'
                : 'bg-emerald-950/80 border-b border-emerald-800 text-emerald-300'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="opacity-70 hover:opacity-100 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Global Toolbar */}
        <div className="p-3 sm:px-5 border-b border-slate-800 bg-slate-850/50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCreateNew}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nový plán</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Nahrát plán ze souboru .json nebo .stagemaster"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Importovat JSON</span>
              <span className="sm:hidden">Import</span>
            </button>

            <button
              onClick={handleExportAll}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Stáhnout všechny plány do jednoho záložního souboru"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Zálohovat vše</span>
              <span className="sm:hidden">Záloha</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat plán..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json,.stagemaster"
            className="hidden"
          />
        </div>

        {/* Scrollable Project Cards List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-2.5">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">Žádný stage plán neodpovídá vyhledávání</p>
              <p className="text-xs text-slate-600 mt-1">Zkuste zadat jiný název nebo vytvořit nový plán.</p>
            </div>
          ) : (
            filteredProjects.map((p) => {
              const isActive = p.id === activeProject.id;
              const stats = getStats(p);
              const formattedDate = p.updatedAt
                ? new Date(p.updatedAt).toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : p.date;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (!isActive) {
                      onSelectProject(p);
                      showStatus(`Plán „${p.bandName}“ byl načten.`);
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-white truncate">
                        {p.bandName || 'Bezejmenný plán'}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          Aktivní
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formattedDate}
                      </span>
                      {p.eventName && (
                        <span className="text-slate-400 truncate">
                          • {p.eventName}
                        </span>
                      )}
                      {p.venue && (
                        <span className="text-slate-500 truncate">
                          ({p.venue})
                        </span>
                      )}
                    </div>

                    {/* Chips */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                      <span className="bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1">
                        <Music2 className="w-3 h-3 text-indigo-400" />
                        {stats.instruments} nástrojů/zpěvů
                      </span>
                      <span className="bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-cyan-400" />
                        {stats.patchedChannels} XR18 kanálů
                      </span>
                      <span className="bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700/80 flex items-center gap-1">
                        <Speaker className="w-3 h-3 text-amber-400" />
                        {stats.wedges} PA / odposlechů
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSelectProject(p);
                          showStatus(`Plán „${p.bandName}“ byl načten.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
                      >
                        Otevřít
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-indigo-300 bg-indigo-900/40 px-2.5 py-1 rounded-lg border border-indigo-700/40 hidden sm:inline">
                        Otevřeno
                      </span>
                    )}

                    <button
                      onClick={(e) => handleDuplicate(p.id, e)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
                      title="Vytvořit kopii tohoto plánu"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleExportSingle(p, e)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
                      title="Stáhnout jako JSON soubor"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(p.id, p.bandName, e)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 text-xs transition"
                      title="Smazat plán"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Všechny plány jsou automaticky ukládány v paměti zařízení.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
};
