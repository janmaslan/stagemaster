import { WizardProject } from '../types/wizard';

const STORAGE_KEY_WIZARD = 'stagemaster_xr18_wizard_v2';

export const EMPTY_WIZARD_PROJECT: WizardProject = {
  id: 'xr18-my-band',
  bandName: 'Moje Kapela',
  eventName: 'Koncert / Zkouška',
  instruments: [], // Completely blank by default!
  notes: '',
  completedTasks: {},
  updatedAt: new Date().toISOString(),
};

export function loadWizardProject(): WizardProject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WIZARD);
    if (!raw) {
      return EMPTY_WIZARD_PROJECT;
    }
    const parsed = JSON.parse(raw);
    return parsed && parsed.id ? parsed : EMPTY_WIZARD_PROJECT;
  } catch (err) {
    console.error('Failed to load wizard project from storage:', err);
    return EMPTY_WIZARD_PROJECT;
  }
}

export function saveWizardProject(project: WizardProject): void {
  try {
    localStorage.setItem(STORAGE_KEY_WIZARD, JSON.stringify(project));
  } catch (err) {
    console.error('Failed to save wizard project:', err);
  }
}
