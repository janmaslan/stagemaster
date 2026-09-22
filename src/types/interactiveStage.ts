export type StageItemCategory =
  | 'instrument'
  | 'vocal'
  | 'power_strip'
  | 'mixer'
  | 'pa_speaker'
  | 'monitor_wedge'
  | 'iem_station';

export type StandType = 'high_boom' | 'low_boom' | 'clip_clamp' | 'straight' | 'none';

export interface InstrumentChannel {
  id: string;
  name: string; // e.g. "Kopák", "Virbl", "Overhead L", "Overhead R", "Kombo mic", "Kombo linka"
  pickupType: 'mic' | 'line_jack' | 'line_xlr' | 'line';
  micModel: string; // free text or preset (e.g. "Shure SM57", "DI Out", etc.)
  stand: StandType;
  assignedChannelNumber?: number; // XR18 input 1..16
  needsPhantom48V?: boolean;
  cableLengthMeters?: number;
}

export interface InteractiveStageItem {
  id: string;
  name: string;
  category: StageItemCategory;
  subType: string; // 'drums', 'guitar_amp', 'bass_amp', 'keyboard', 'acoustic_guitar', 'lead_vox', 'power_strip', 'xr18', 'pa_speaker', 'wedge'
  x: number; // 0 to 100 percentage of stage
  y: number; // 0 to 100 percentage of stage
  rotation?: number; // 0, 90, 180, 270

  // Multiple microphones/channels for this instrument
  channels: InstrumentChannel[];

  // Power 230V
  needsPower230V?: boolean;
  powerConnectedToId?: string; // id of power_strip

  // PA & Monitor properties: Active (XLR + 230V) vs Passive Speakon vs Passive Jack 6.3mm
  speakerType?: 'active' | 'passive_speakon' | 'passive_jack' | 'passive';
  assignedOutputPort?: string; // e.g. "Main L", "Main R", "Aux 1", "Aux 2"
  targetPerformer?: string;

  notes?: string;
}

export interface StageCable {
  id: string;
  fromId: string;
  toId: string;
  type: 'xlr' | 'jack' | 'power' | 'speakon';
  lengthMeters: number;
  label?: string;
  channelId?: string; // which instrument channel this cable belongs to
}

export type StagePhase = 1 | 2 | 3 | 4 | 5;

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  variableSymbol?: string;
  issueDate: string;
  dueDate: string;
  eventDate: string;
  supplierName: string;
  supplierIco: string;
  supplierDic: string;
  supplierAddress: string;
  supplierAccount: string;
  supplierEmail: string;
  supplierPhone: string;
  clientName: string;
  clientIco: string;
  clientAddress: string;
  items: InvoiceItem[];
  notes: string;
}

export interface StageProject {
  id: string;
  bandName: string;
  eventName: string;
  date: string;
  venue: string;
  soundEngineer: string;
  items: InteractiveStageItem[];
  cables: StageCable[];
  notes: string;
  invoice: InvoiceData;
  updatedAt: string;
}
