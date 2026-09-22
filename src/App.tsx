import React, { useState, useEffect } from 'react';
import { 
  StageProject, 
  InteractiveStageItem, 
  StageCable, 
  StagePhase 
} from './types/interactiveStage';
import { 
  loadActiveStageProject, 
  getAllSavedProjects, 
  saveStageProject, 
  EMPTY_STAGE_PROJECT, 
  INITIAL_XR18_ITEM 
} from './utils/stageProjectStorage';
import { InteractiveCanvas } from './components/interactive/InteractiveCanvas';
import { PhaseControls } from './components/interactive/PhaseControls';
import { ProjectManagerModal } from './components/interactive/ProjectManagerModal';
import { InstallAppModal } from './components/interactive/InstallAppModal';
import { RotateCcw, FolderOpen, Smartphone } from 'lucide-react';

export function App() {
  const [savedProjects, setSavedProjects] = useState<StageProject[]>(() => getAllSavedProjects());
  const [project, setProject] = useState<StageProject>(() => {
    const { active } = loadActiveStageProject();
    return active;
  });
  const [currentPhase, setCurrentPhase] = useState<StagePhase>(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canDirectInstall, setCanDirectInstall] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Catch PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanDirectInstall(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setCanDirectInstall(false);
      console.log('StageMaster PWA was successfully installed.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setCanDirectInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Auto-save changes to localStorage and update project list
  useEffect(() => {
    const updatedList = saveStageProject(project);
    setSavedProjects(updatedList);
  }, [project]);

  const handleUpdateItems = (items: InteractiveStageItem[]) => {
    setProject((prev) => ({
      ...prev,
      items,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateCables = (cables: StageCable[]) => {
    setProject((prev) => ({
      ...prev,
      cables,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateBandName = (bandName: string) => {
    setProject((prev) => ({ ...prev, bandName, updatedAt: new Date().toISOString() }));
  };

  const handleUpdateInvoice = (invoice: StageProject['invoice']) => {
    setProject((prev) => ({
      ...prev,
      invoice,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddItem = (itemPartial: Partial<InteractiveStageItem>) => {
    const newItem: InteractiveStageItem = {
      id: 'item-' + Date.now() + Math.random().toString(36).slice(2, 6),
      name: itemPartial.name || 'Prvek',
      category: itemPartial.category || 'instrument',
      subType: itemPartial.subType || 'generic',
      x: itemPartial.x ?? 50,
      y: itemPartial.y ?? 50,
      rotation: itemPartial.rotation ?? 0,
      channels: itemPartial.channels || [],
      needsPower230V: itemPartial.needsPower230V,
      speakerType: itemPartial.speakerType,
      assignedOutputPort: itemPartial.assignedOutputPort,
      targetPerformer: itemPartial.targetPerformer,
      notes: itemPartial.notes,
    };

    handleUpdateItems([...project.items, newItem]);
    setSelectedItemId(newItem.id);
  };

  // Smart Auto-patch all instruments to XR18
  const handleAutoPatchAll = () => {
    const xr18 = project.items.find((i) => i.subType === 'xr18');
    if (!xr18) return;

    let nextCh = 1;
    const newCables: StageCable[] = project.cables.filter((c) => c.toId !== xr18.id);

    // Order: Drums, Bass, Guitars, Keys, Vocals
    const sortOrder: Record<string, number> = {
      drums: 1,
      bass_amp: 2,
      guitar_amp: 3,
      acoustic_guitar: 4,
      keyboard: 5,
      lead_vox: 6,
      backing_vox: 7,
      vocal: 8,
    };

    const newItems = project.items.map((it) => ({
      ...it,
      channels: it.channels ? it.channels.map((ch) => ({ ...ch })) : [],
    }));

    const patchableItems = newItems
      .filter((i) => ['instrument', 'vocal'].includes(i.category))
      .sort((a, b) => (sortOrder[a.subType] || 99) - (sortOrder[b.subType] || 99));

    let totalPatched = 0;

    patchableItems.forEach((it) => {
      it.channels.forEach((ch) => {
        if (nextCh <= 16) {
          ch.assignedChannelNumber = nextCh;
          const isCondenser =
            ch.micModel?.toLowerCase().includes('overhead') ||
            ch.micModel?.toLowerCase().includes('kondenz') ||
            ch.micModel?.toLowerCase().includes('c2') ||
            ch.micModel?.toLowerCase().includes('nt5') ||
            ch.micModel?.toLowerCase().includes('beta 91') ||
            ch.micModel?.toLowerCase().includes('c414');
          ch.needsPhantom48V = isCondenser;
          ch.cableLengthMeters = 10;

          newCables.push({
            id: 'cable-' + Date.now() + '-' + nextCh,
            fromId: it.id,
            toId: xr18.id,
            channelId: ch.id,
            type: (ch.pickupType === 'line_jack' || ch.pickupType === 'line') ? 'jack' : 'xlr',
            lengthMeters: 10,
            label: `CH ${nextCh}`,
          });

          nextCh++;
          totalPatched++;
        }
      });
    });

    handleUpdateItems(newItems);
    handleUpdateCables(newCables);
    alert(`Úspěšně zapojeno ${totalPatched} kanálů do mixpultu Behringer XR18 (vstupy CH 1–${Math.min(16, totalPatched)})!`);
  };

  // Smart Auto-wire 230V electricity
  const handleAutoPowerWiring = () => {
    let powerSources = project.items.filter((i) => i.category === 'power_source' || i.subType === 'power_source');
    let workingItems = [...project.items];

    // If no power source exists, create one in backstage
    if (powerSources.length === 0) {
      const newSource: InteractiveStageItem = {
        id: 'ps-' + Date.now(),
        name: 'Přípojka 230V',
        category: 'power_source',
        subType: 'power_source',
        x: 12,
        y: 18,
        channels: [],
        needsPower230V: false,
      };
      workingItems.push(newSource);
      powerSources = [newSource];
    }

    // If no power strip exists, create at least 2 strips for left and right stage
    let powerStrips = workingItems.filter((i) => i.category === 'power_strip' || i.subType === 'power_strip');
    if (powerStrips.length === 0) {
      const strip1: InteractiveStageItem = {
        id: 'strip-1-' + Date.now(),
        name: 'Prodlužka 230V #1',
        category: 'power_strip',
        subType: 'power_strip',
        x: 30,
        y: 45,
        channels: [],
        needsPower230V: false,
      };
      const strip2: InteractiveStageItem = {
        id: 'strip-2-' + Date.now(),
        name: 'Prodlužka 230V #2',
        category: 'power_strip',
        subType: 'power_strip',
        x: 70,
        y: 45,
        channels: [],
        needsPower230V: false,
      };
      workingItems.push(strip1, strip2);
      powerStrips = [strip1, strip2];
    }

    const defaultSource = powerSources[0];
    let newCables: StageCable[] = project.cables.filter((c) => c.type !== 'power');

    // 1. Connect each power strip to the nearest power source
    const itemsWithStripsConnected = workingItems.map((it) => {
      if (it.category === 'power_strip' || it.subType === 'power_strip') {
        let nearestSource = defaultSource;
        let minD = Infinity;
        for (const ps of powerSources) {
          const d = Math.hypot((ps.x ?? 50) - (it.x ?? 50), (ps.y ?? 50) - (it.y ?? 50));
          if (d < minD) { minD = d; nearestSource = ps; }
        }
        newCables.push({
          id: 'pwr-strip-' + it.id,
          fromId: nearestSource.id,
          toId: it.id,
          type: 'power',
          lengthMeters: 10,
          label: '230V',
        });
        return { ...it, powerConnectedToId: nearestSource.id };
      }
      return it;
    });

    // 2. Connect each appliance needing 230V to nearest power strip (or power source)
    const distributionPoints = powerStrips.length > 0 ? powerStrips : powerSources;
    let wiredCount = 0;

    const finalItems = itemsWithStripsConnected.map((it) => {
      if (it.needsPower230V && it.category !== 'power_strip' && it.category !== 'power_source') {
        let nearestPt = distributionPoints[0];
        let minD = Infinity;
        for (const dp of distributionPoints) {
          const d = Math.hypot((dp.x ?? 50) - (it.x ?? 50), (dp.y ?? 50) - (it.y ?? 50));
          if (d < minD) { minD = d; nearestPt = dp; }
        }
        newCables.push({
          id: 'pwr-dev-' + it.id,
          fromId: nearestPt.id,
          toId: it.id,
          type: 'power',
          lengthMeters: 5,
          label: '230V',
        });
        wiredCount++;
        return { ...it, powerConnectedToId: nearestPt.id };
      }
      return it;
    });

    handleUpdateItems(finalItems);
    handleUpdateCables(newCables);
    alert(`Úspěšně zapojeno ${wiredCount} spotřebičů do rozvodu 230V!`);
  };

  const handleResetProject = () => {
    if (confirm('Opravdu chcete vyčistit celé pódium a začít znovu od nuly?')) {
      setProject({
        ...EMPTY_STAGE_PROJECT,
        id: 'stage-project-' + Date.now(),
        items: [INITIAL_XR18_ITEM],
        cables: [],
      });
      setSelectedItemId(null);
      setCurrentPhase(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-3 py-2.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-lg shadow-indigo-600/30">
              XR
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-extrabold text-indigo-400 block leading-tight tracking-wider">
                StageMaster • XR18 Stage Plán &amp; Vyúčtování
              </span>
              <input
                type="text"
                value={project.bandName}
                onChange={(e) => handleUpdateBandName(e.target.value)}
                placeholder="Název kapely"
                className="bg-transparent font-black text-white text-sm sm:text-base focus:outline-none focus:bg-slate-800 px-1 py-0.5 rounded transition truncate w-full max-w-xs"
                title="Klepnutím upravíte název kapely"
              />
            </div>
          </div>

          {/* Action buttons: Install, Plans & Reset */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className={`text-xs px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-bold shadow-md active:scale-95 ${
                canDirectInstall
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/60 shadow-emerald-600/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 text-emerald-400 border-slate-700'
              }`}
              title="Nainstalovat aplikaci do mobilu nebo PC"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Instalovat</span>
            </button>

            <button
              onClick={() => setIsProjectManagerOpen(true)}
              className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 px-3 py-1.5 rounded-xl border border-indigo-500/40 flex items-center gap-1.5 transition font-bold shadow-md shadow-indigo-600/30"
              title="Otevřít správce stage plánů"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Moje plány</span>
              <span className="bg-indigo-900/90 text-indigo-200 text-[10px] px-1.5 py-0.2 rounded-full font-black border border-indigo-700/60">
                {savedProjects.length}
              </span>
            </button>

            {/* Reset button */}
            <button
              onClick={handleResetProject}
              className="text-xs text-slate-400 hover:text-red-400 bg-slate-800 hover:bg-slate-750 px-2.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 transition shrink-0"
              title="Vyčistit aktuální pódium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vyčistit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Stage & Phase Work Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-2 sm:p-4 space-y-3">
        {/* Phase Navigator & Specific Phase Toolbar */}
        <PhaseControls
          currentPhase={currentPhase}
          onSelectPhase={setCurrentPhase}
          items={project.items}
          cables={project.cables}
          bandName={project.bandName}
          onUpdateBandName={handleUpdateBandName}
          invoice={project.invoice}
          onUpdateInvoice={handleUpdateInvoice}
          onAddItem={handleAddItem}
          onAutoPatchAll={handleAutoPatchAll}
          onAutoPowerWiring={handleAutoPowerWiring}
          onResetProject={handleResetProject}
        />

        {/* 2D Interactive Stage Canvas (Center of the action) */}
        <InteractiveCanvas
          items={project.items}
          cables={project.cables}
          currentPhase={currentPhase}
          selectedItemId={selectedItemId}
          bandName={project.bandName}
          onSelectItem={setSelectedItemId}
          onUpdateItems={handleUpdateItems}
          onUpdateCables={handleUpdateCables}
          onSelectPhase={setCurrentPhase}
          onAddItem={handleAddItem}
          onAutoPatchAll={handleAutoPatchAll}
          onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        />
      </main>

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        activeProject={project}
        savedProjects={savedProjects}
        onSelectProject={(newProj) => {
          setProject(newProj);
          setSelectedItemId(null);
          setCurrentPhase(1);
        }}
        onUpdateProjectsList={(newList) => {
          setSavedProjects(newList);
        }}
      />

      {/* Install App Modal */}
      {isInstallModalOpen && (
        <InstallAppModal
          onClose={() => setIsInstallModalOpen(false)}
          onTriggerInstall={() => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
            }
          }}
          canDirectInstall={canDirectInstall}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-2.5 text-center text-[10px] text-slate-500">
        StageMaster Pro • Interaktivní příprava ozvučení kapely a stage plán pro Behringer XR18
      </footer>
    </div>
  );
}

export default App;
