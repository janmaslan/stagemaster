import { StageProject, InteractiveStageItem, InvoiceData } from '../types/interactiveStage';

const STORAGE_KEY = 'stagemaster_interactive_v4';

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

export function loadStageProject(): StageProject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STAGE_PROJECT;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.id && Array.isArray(parsed.items)) {
      // Ensure invoice data exists and has items
      if (!parsed.invoice || typeof parsed.invoice !== 'object') {
        parsed.invoice = { ...DEFAULT_INVOICE_DATA };
      } else {
        if (!Array.isArray(parsed.invoice.items)) {
          parsed.invoice.items = [...DEFAULT_INVOICE_DATA.items];
        }
        if (!parsed.invoice.supplierAddress) {
          parsed.invoice.supplierAddress = DEFAULT_INVOICE_DATA.supplierAddress;
        }
        if (!parsed.invoice.variableSymbol) {
          parsed.invoice.variableSymbol = DEFAULT_INVOICE_DATA.variableSymbol;
        }
      }
      // Ensure all items have channels array
      parsed.items = parsed.items.map((it: any) => ({
        ...it,
        channels: Array.isArray(it.channels) ? it.channels : [],
      }));
      return parsed;
    }
    return EMPTY_STAGE_PROJECT;
  } catch (err) {
    console.error('Failed to load stage project:', err);
    return EMPTY_STAGE_PROJECT;
  }
}

export function saveStageProject(project: StageProject): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch (err) {
    console.error('Failed to save stage project:', err);
  }
}
