import { StageProject, InteractiveStageItem, InvoiceData } from '../types/interactiveStage';

const STORAGE_KEY_LIST = 'stagemaster_saved_plans_list_v1';
const STORAGE_KEY_ACTIVE_ID = 'stagemaster_active_plan_id_v1';
const STORAGE_KEY_LEGACY = 'stagemaster_interactive_v4';

export const INITIAL_XR18_ITEM: InteractiveStageItem = {
  id: 'mixer-xr18',
  name: 'Mixpult Behringer XR18',
  category: 'mixer',
  subType: 'xr18',
  x: 88,
  y: 22,
  needsPower230V: true,
  channels: [],
  notes: 'Centrální digitální pult s 16 vstupy a 6 auxy',
};

export const DEFAULT_INVOICE_DATA: InvoiceData = {
  invoiceNumber: '2026' + String(Math.floor(100 + Math.random() * 900)),
  variableSymbol: '2026001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  eventDate: new Date().toISOString().split('T')[0],
  supplierName: 'Jan Novák - Zvukař & Ozvučovací technika',
  supplierIco: '12345678',
  supplierDic: 'CZ12345678',
  supplierAddress: 'Zvukařská 12, 110 00 Praha 1',
  supplierAccount: '1234567890/0300',
  supplierEmail: 'zvuk@zvukar.cz',
  supplierPhone: '+420 777 123 456',
  clientName: 'Pořadatel akce / Kapela',
  clientIco: '',
  clientAddress: 'Klub / Festival, Hlavní 123, Praha',
  items: [
    {
      id: 'inv-1',
      description: 'Ozvučení akce / práce zvukového mistra',
      quantity: 1,
      unitPrice: 5000,
    },
    {
      id: 'inv-2',
      description: 'Pronájem PA aparatury, mixpultu XR18 a mikrofonů',
      quantity: 1,
      unitPrice: 3500,
    },
    {
      id: 'inv-3',
      description: 'Doprava ozvučovací techniky',
      quantity: 1,
      unitPrice: 1000,
    },
  ],
  notes: 'Děkujeme za spolupráci. Platba bankovním převodem se splatností 14 dní.',
};

export const EMPTY_STAGE_PROJECT: StageProject = {
  id: 'stage-project-' + Date.now(),
  bandName: 'Moje Kapela',
  eventName: 'Koncert / Zkouška',
  date: new Date().toISOString().split('T')[0],
  venue: 'Pódium / Klub',
  soundEngineer: 'Jan Novák',
  items: [INITIAL_XR18_ITEM],
  cables: [],
  notes: '',
  invoice: DEFAULT_INVOICE_DATA,
  updatedAt: new Date().toISOString(),
};

/**
 * Validates and repairs an arbitrary parsed object into a clean StageProject
 */
export function sanitizeProject(parsed: any): StageProject {
  const base: StageProject = {
    id: typeof parsed?.id === 'string' && parsed.id ? parsed.id : 'stage-' + Date.now() + Math.random().toString(36).slice(2, 6),
    bandName: typeof parsed?.bandName === 'string' && parsed.bandName ? parsed.bandName : 'Nová Kapela',
    eventName: typeof parsed?.eventName === 'string' ? parsed.eventName : 'Koncert / Akce',
    date: typeof parsed?.date === 'string' ? parsed.date : new Date().toISOString().split('T')[0],
    venue: typeof parsed?.venue === 'string' ? parsed.venue : 'Pódium',
    soundEngineer: typeof parsed?.soundEngineer === 'string' ? parsed.soundEngineer : 'Zvukař',
    items: Array.isArray(parsed?.items) ? parsed.items.map((it: any) => ({
      ...it,
      channels: Array.isArray(it.channels) ? it.channels : [],
    })) : [INITIAL_XR18_ITEM],
    cables: Array.isArray(parsed?.cables) ? parsed.cables : [],
    notes: typeof parsed?.notes === 'string' ? parsed.notes : '',
    invoice: {
      ...DEFAULT_INVOICE_DATA,
      ...(parsed?.invoice && typeof parsed.invoice === 'object' ? parsed.invoice : {}),
      items: Array.isArray(parsed?.invoice?.items) ? parsed.invoice.items : [...DEFAULT_INVOICE_DATA.items],
    },
    updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
  };

  // Ensure XR18 exists in items
  if (!base.items.some((it) => it.subType === 'xr18')) {
    base.items.push(INITIAL_XR18_ITEM);
  }

  return base;
}

/**
 * Loads all saved projects from localStorage
 */
export function getAllSavedProjects(): StageProject[] {
  try {
    const rawList = localStorage.getItem(STORAGE_KEY_LIST);
    if (rawList) {
      const parsedList = JSON.parse(rawList);
      if (Array.isArray(parsedList) && parsedList.length > 0) {
        return parsedList.map(sanitizeProject);
      }
    }

    // Check legacy single-project storage key for migration
    const legacyRaw = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (legacyParsed && legacyParsed.id) {
        const migrated = sanitizeProject(legacyParsed);
        const initialList = [migrated];
        saveAllProjects(initialList);
        setActiveProjectId(migrated.id);
        return initialList;
      }
    }

    // No existing projects found: create initial starter project
    const starter: StageProject = {
      ...EMPTY_STAGE_PROJECT,
      id: 'plan-default-1',
      bandName: 'Moje Kapela',
    };
    const initialList = [starter];
    saveAllProjects(initialList);
    setActiveProjectId(starter.id);
    return initialList;
  } catch (err) {
    console.error('Failed to load saved projects from localStorage:', err);
    return [{ ...EMPTY_STAGE_PROJECT }];
  }
}

/**
 * Saves entire list of projects to localStorage
 */
export function saveAllProjects(projects: StageProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save project list to localStorage:', err);
  }
}

/**
 * Gets active project ID
 */
export function getActiveProjectId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  } catch {
    return null;
  }
}

/**
 * Sets active project ID
 */
export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.error('Failed to set active project ID:', err);
  }
}

/**
 * Loads currently active project (with fallback to first in list)
 */
export function loadActiveStageProject(): { active: StageProject; all: StageProject[] } {
  const all = getAllSavedProjects();
  const activeId = getActiveProjectId();
  let active = all.find((p) => p.id === activeId);

  if (!active && all.length > 0) {
    active = all[0];
    setActiveProjectId(active.id);
  }

  if (!active) {
    active = { ...EMPTY_STAGE_PROJECT };
    all.push(active);
    saveAllProjects(all);
    setActiveProjectId(active.id);
  }

  return { active, all };
}

/**
 * Saves or updates a single project in the list and marks it active
 */
export function saveStageProject(project: StageProject): StageProject[] {
  try {
    // Also save legacy key for backward compatibility with older components
    localStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify(project));

    const all = getAllSavedProjects();
    const index = all.findIndex((p) => p.id === project.id);

    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    let newAll: StageProject[];
    if (index >= 0) {
      newAll = [...all];
      newAll[index] = updated;
    } else {
      newAll = [updated, ...all];
    }

    saveAllProjects(newAll);
    setActiveProjectId(updated.id);
    return newAll;
  } catch (err) {
    console.error('Failed to save stage project:', err);
    return [project];
  }
}

/**
 * Backward compatibility load function for existing App.tsx
 */
export function loadStageProject(): StageProject {
  const { active } = loadActiveStageProject();
  return active;
}

/**
 * Creates a brand new project and adds it to the list
 */
export function createNewStageProject(customName?: string): { newProject: StageProject; all: StageProject[] } {
  const newProject: StageProject = {
    ...EMPTY_STAGE_PROJECT,
    id: 'stage-project-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    bandName: customName || 'Nová Kapela',
    eventName: 'Koncert',
    date: new Date().toISOString().split('T')[0],
    items: [INITIAL_XR18_ITEM],
    cables: [],
    notes: '',
    invoice: {
      ...DEFAULT_INVOICE_DATA,
      invoiceNumber: '2026' + String(Math.floor(100 + Math.random() * 900)),
      variableSymbol: '2026' + String(Math.floor(100 + Math.random() * 900)),
    },
    updatedAt: new Date().toISOString(),
  };

  const all = getAllSavedProjects();
  const newAll = [newProject, ...all];
  saveAllProjects(newAll);
  setActiveProjectId(newProject.id);

  return { newProject, all: newAll };
}

/**
 * Duplicates an existing project
 */
export function duplicateStageProject(projectId: string): { duplicated: StageProject; all: StageProject[] } {
  const all = getAllSavedProjects();
  const target = all.find((p) => p.id === projectId) || all[0];

  const duplicated: StageProject = {
    ...JSON.parse(JSON.stringify(target)),
    id: 'stage-project-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    bandName: `${target.bandName} (Kopie)`,
    updatedAt: new Date().toISOString(),
  };

  const newAll = [duplicated, ...all];
  saveAllProjects(newAll);
  setActiveProjectId(duplicated.id);

  return { duplicated, all: newAll };
}

/**
 * Deletes a project from the list. Returns the new list and the newly active project.
 */
export function deleteStageProject(projectId: string): { nextActive: StageProject; all: StageProject[] } {
  const all = getAllSavedProjects();
  const remaining = all.filter((p) => p.id !== projectId);

  let nextActive: StageProject;
  if (remaining.length === 0) {
    const fresh = createNewStageProject('Moje Kapela');
    return { nextActive: fresh.newProject, all: fresh.all };
  } else {
    nextActive = remaining[0];
  }

  saveAllProjects(remaining);
  setActiveProjectId(nextActive.id);

  return { nextActive, all: remaining };
}

/**
 * Triggers a download of a project as a JSON file
 */
export function exportProjectAsJson(project: StageProject): void {
  const cleanName = (project.bandName || 'StagePlan')
    .replace(/[^a-zA-Z0-9_\u00C0-\u017F]/g, '_')
    .replace(/_+/g, '_');
  const filename = `StagePlan_${cleanName}_${project.date || new Date().toISOString().split('T')[0]}.json`;
  
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers a download of ALL projects as a combined JSON backup file
 */
export function exportAllProjectsAsJson(projects: StageProject[]): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `StageMaster_Zaloha_Vsech_Planu_${dateStr}.json`;
  
  const jsonStr = JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: projects.length,
    plans: projects,
  }, null, 2);
  
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses and imports project(s) from a JSON file string
 */
export function importProjectFromJson(jsonString: string): { importedProjects: StageProject[]; all: StageProject[] } {
  try {
    const parsed = JSON.parse(jsonString);
    let toImport: StageProject[] = [];

    if (parsed && Array.isArray(parsed.plans)) {
      // Combined backup format
      toImport = parsed.plans.map(sanitizeProject);
    } else if (Array.isArray(parsed)) {
      toImport = parsed.map(sanitizeProject);
    } else if (parsed && typeof parsed === 'object') {
      toImport = [sanitizeProject(parsed)];
    }

    if (toImport.length === 0) {
      throw new Error('Soubor neobsahuje platný stage plán.');
    }

    // Give each imported project a fresh unique ID to prevent conflicts
    const preparedImport = toImport.map((proj) => ({
      ...proj,
      id: 'imported-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      updatedAt: new Date().toISOString(),
    }));

    const currentAll = getAllSavedProjects();
    const newAll = [...preparedImport, ...currentAll];
    saveAllProjects(newAll);
    setActiveProjectId(preparedImport[0].id);

    return { importedProjects: preparedImport, all: newAll };
  } catch (err: any) {
    throw new Error('Chyba při čtení souboru: ' + (err?.message || 'Neplatný JSON formát'));
  }
}
