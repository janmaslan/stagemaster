export type StageElementType =
  | 'drums'
  | 'bass_amp'
  | 'guitar_amp'
  | 'acoustic_guitar'
  | 'keyboard'
  | 'vocal'
  | 'horn'
  | 'percussion'
  | 'dj'
  | 'stagebox'
  | 'sub_snake'
  | 'di_box'
  | 'wedge_monitor'
  | 'iem_station'
  | 'power_drop';

export type StandType = 'high_boom' | 'low_boom' | 'straight' | 'clip_clamp' | 'none';

export type CableType = 'xlr' | 'jack' | 'power' | 'speakon' | 'cat5';

export interface StageItem {
  id: string;
  name: string;
  type: StageElementType;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  rotation: number; // 0, 90, 180, 270
  channelIds?: string[];
  outputIds?: string[];
  powerRequired?: boolean;
  notes?: string;
  diType?: 'mono-passive' | 'mono-active' | 'stereo-passive' | 'stereo-active' | 'none';
}

export interface CableConnection {
  id: string;
  fromId: string;
  toId: string;
  type: CableType;
  lengthMeters: number;
  label?: string;
}

export interface Channel {
  id: string;
  channelNumber: number;
  name: string;
  category: 'drums' | 'bass' | 'guitars' | 'keys' | 'vocals' | 'horns' | 'playback' | 'other';
  micOrDi: string;
  stand: StandType;
  phantom48V: boolean;
  snakePort: string;
  cableLengthMeters: number;
  stageItemId?: string;
  notes?: string;
}

export interface OutputRouting {
  id: string;
  outputNumber: number;
  name: string;
  type: 'main_pa' | 'subwoofer' | 'wedge' | 'iem_mono' | 'iem_stereo' | 'sidefill';
  targetMusician?: string;
  stageItemId?: string;
  connector: 'XLR' | 'Jack' | 'Wireless RF';
  snakePort?: string;
  notes?: string;
}

export interface MixerProfile {
  id: string;
  name: string;
  brand: string;
  inputsCount: number;
  auxOutputsCount: number;
  mainOutputsCount: number;
  notes: string;
}

export interface EventProject {
  id: string;
  name: string;
  bandName: string;
  date: string;
  venue: string;
  soundEngineer: string;
  stageDimensions: {
    widthMeters: number;
    depthMeters: number;
  };
  mixerId: string;
  items: StageItem[];
  cables: CableConnection[];
  channels: Channel[];
  outputs: OutputRouting[];
  generalNotes?: string;
  updatedAt: string;
}
