export type InstrumentCategory =
  | 'vocals'
  | 'electric_guitar'
  | 'acoustic_guitar'
  | 'bass'
  | 'drums'
  | 'keys'
  | 'horns'
  | 'backing_track';

export type StagePosition = 'left' | 'center' | 'right' | 'back_center' | 'back_left' | 'back_right';

export interface SelectedInstrument {
  id: string;
  category: InstrumentCategory;
  name: string;
  performerName?: string;
  position: StagePosition;
  
  // Audio signal details
  connectionType: 'xlr_mic' | 'jack_di' | 'jack_direct_hiz' | 'jack_stereo_di' | 'drum_kit';
  diType?: 'none' | 'mono_passive' | 'mono_active' | 'stereo_passive';
  micModel?: string;
  drumMicsOption?: 'minimal' | 'basic' | 'full'; // minimal=2, basic=4, full=7
  
  // Power requirement
  needsPower230V: boolean;
  powerDescription?: string;

  // Monitoring requirement
  monitorType: 'wedge' | 'iem' | 'none';
  auxNumber?: number; // 1 to 6
}

export interface XR18ChannelPatch {
  chNumber: number;
  label: string;
  sourceInstrumentId: string;
  sourceInstrumentName: string;
  cableType: 'XLR' | 'Jack 6.3mm' | 'RCA/TRS';
  cableLengthMeters: number;
  needsPhantom48V: boolean;
  isHiZ?: boolean;
  advice: string;
}

export interface XR18OutputPatch {
  type: 'main_pa' | 'aux_monitor';
  portLabel: string; // e.g. "Main L", "Main R", "Aux 1", "Aux 2"
  destination: string; // e.g. "Levý satelit / Subwoofer", "Odposlech Zpěvák"
  cableType: 'XLR';
  advice: string;
}

export interface WizardProject {
  id: string;
  bandName: string;
  eventName: string;
  instruments: SelectedInstrument[];
  notes: string;
  completedTasks: Record<string, boolean>;
  updatedAt: string;
}
