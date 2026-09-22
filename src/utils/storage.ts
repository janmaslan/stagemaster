import { EventProject } from '../types/audio';
import { INITIAL_DEMO_PROJECT } from '../data/presets';

const STORAGE_KEY_PROJECTS = 'stagemaster_projects_v1';
const STORAGE_KEY_ACTIVE_ID = 'stagemaster_active_project_id_v1';

export function loadAllProjects(): EventProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) {
      // First time initialization with demo project
      const initial = [INITIAL_DEMO_PROJECT];
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, INITIAL_DEMO_PROJECT.id);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [INITIAL_DEMO_PROJECT];
  } catch (e) {
    console.error('Failed to load projects from localStorage:', e);
    return [INITIAL_DEMO_PROJECT];
  }
}

export function saveAllProjects(projects: EventProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

export function getActiveProjectId(): string {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || INITIAL_DEMO_PROJECT.id;
}

export function setActiveProjectId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function createNewBlankProject(name = 'Nová akce / Kapela'): EventProject {
  const newId = 'project-' + Date.now();
  return {
    id: newId,
    name,
    bandName: 'Název kapely',
    date: new Date().toISOString().split('T')[0],
    venue: 'Místo konání',
    soundEngineer: 'Zvukař',
    stageDimensions: {
      widthMeters: 8,
      depthMeters: 6,
    },
    mixerId: 'x32',
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'sb-' + Date.now(),
        name: 'Hlavní Stagebox',
        type: 'stagebox',
        x: 85,
        y: 20,
        rotation: 0,
      },
      {
        id: 'pwr-' + Date.now(),
        name: '230V Přívod',
        type: 'power_drop',
        x: 50,
        y: 10,
        rotation: 0,
      },
    ],
    cables: [],
    channels: [
      {
        id: 'ch-' + Date.now(),
        channelNumber: 1,
        name: 'Lead Zpěv',
        category: 'vocals',
        micOrDi: 'Shure SM58 (Zpěv dynamický)',
        stand: 'high_boom',
        phantom48V: false,
        snakePort: 'In 1',
        cableLengthMeters: 10,
      },
    ],
    outputs: [
      {
        id: 'out-1',
        outputNumber: 1,
        name: 'Main PA L',
        type: 'main_pa',
        connector: 'XLR',
        snakePort: 'Out 15',
      },
      {
        id: 'out-2',
        outputNumber: 2,
        name: 'Main PA R',
        type: 'main_pa',
        connector: 'XLR',
        snakePort: 'Out 16',
      },
      {
        id: 'out-3',
        outputNumber: 3,
        name: 'Wedge 1 (Zpěv)',
        type: 'wedge',
        targetMusician: 'Zpěvák',
        connector: 'XLR',
        snakePort: 'Out 1',
      },
    ],
  };
}

export function exportProjectToJson(project: EventProject): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${project.bandName.replace(/\s+/g, '_')}_stage_plan.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importProjectFromJson(jsonString: string): EventProject | null {
  try {
    const data = JSON.parse(jsonString) as EventProject;
    if (data && data.id && data.items && data.channels) {
      data.id = 'imported-' + Date.now();
      data.updatedAt = new Date().toISOString();
      return data;
    }
  } catch (err) {
    console.error('Failed to parse imported project:', err);
  }
  return null;
}
