import React, { useRef, useState } from 'react';
import { 
  InteractiveStageItem, 
  StageCable, 
  StagePhase,
  InstrumentChannel,
  StandType,
  InvoiceData,
  InvoiceItem
} from '../../types/interactiveStage';
import { 
  Music, 
  Cable, 
  Zap, 
  Volume2, 
  CheckSquare, 
  Plus, 
  Sliders, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileText,
  DollarSign,
  Trash2,
  Edit2,
  Calendar,
  Building,
  CreditCard,
  Phone,
  Mail,
  Speaker,
  Headphones,
  Camera
} from 'lucide-react';
import { 
  exportInvoiceAndRiderPdf, 
  exportStagePlanOnlyPdf, 
  exportStagePlanImage,
  exportStageCanvasImage 
} from '../../utils/pdfExport';

interface PhaseControlsProps {
  currentPhase: StagePhase;
  onSelectPhase: (phase: StagePhase) => void;
  items: InteractiveStageItem[];
  cables: StageCable[];
  bandName: string;
  onUpdateBandName: (name: string) => void;
  invoice: InvoiceData;
  onUpdateInvoice: (invoice: InvoiceData) => void;
  onAddItem: (item: Partial<InteractiveStageItem>) => void;
  onAutoPatchAll: () => void;
  onAutoPowerWiring?: () => void;
  onResetProject: () => void;
}

const PHASES: { phase: StagePhase; label: string; icon: React.FC<{ className?: string }> }[] = [
  { phase: 1, label: '1. Nástroje & Zpěvy', icon: Music },
  { phase: 2, label: '2. Kabely do XR18', icon: Cable },
  { phase: 3, label: '3. Elektřina 230V', icon: Zap },
  { phase: 4, label: '4. PA & Odposlechy', icon: Volume2 },
  { phase: 5, label: '5. Faktura & Export', icon: CheckSquare },
];

export const PhaseControls: React.FC<PhaseControlsProps> = ({
  currentPhase,
  onSelectPhase,
  items,
  cables,
  bandName,
  onUpdateBandName,
  invoice,
  onUpdateInvoice,
  onAddItem,
  onAutoPatchAll,
  onAutoPowerWiring,
  onResetProject,
}) => {
  const [copiedRider, setCopiedRider] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingStagePlan, setIsExportingStagePlan] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isEditingInvoiceDetails, setIsEditingInvoiceDetails] = useState(false);
  const presentationRef = useRef<HTMLDivElement>(null);

  // 1. INSTRUMENT ADD HANDLERS (with multi-channel presets)
  const handleAddPresetInstrument = (
    subType: string,
    defaultName: string,
    category: 'instrument' | 'vocal',
    channels: InstrumentChannel[],
    needsPower: boolean,
    defX: number,
    defY: number
  ) => {
    const countOfSame = items.filter((i) => i.subType === subType).length;
    const name = countOfSame > 0 ? `${defaultName} ${countOfSame + 1}` : defaultName;

    onAddItem({
      name,
      category,
      subType,
      x: defX,
      y: defY,
      rotation: 0,
      channels,
      needsPower230V: needsPower,
    });
  };

  // Helper for adding specific instruments
  const handleAddDrums = () => {
    handleAddPresetInstrument(
      'drums',
      'Bicí souprava',
      'instrument',
      [
        {
          id: 'ch-d1-' + Date.now(),
          name: 'Kopák (Kick)',
          pickupType: 'mic',
          micModel: 'Shure Beta 52A (Kopák basový)',
          stand: 'low_boom',
        },
        {
          id: 'ch-d2-' + Date.now(),
          name: 'Virbl (Snare)',
          pickupType: 'mic',
          micModel: 'Shure SM57 (Virbl)',
          stand: 'clip_clamp',
        },
        {
          id: 'ch-d3-' + Date.now(),
          name: 'Overhead L',
          pickupType: 'mic',
          micModel: 'Behringer C2 (Kondenzátor tužka)',
          stand: 'high_boom',
          needsPhantom48V: true,
        },
        {
          id: 'ch-d4-' + Date.now(),
          name: 'Overhead R',
          pickupType: 'mic',
          micModel: 'Behringer C2 (Kondenzátor tužka)',
          stand: 'high_boom',
          needsPhantom48V: true,
        },
      ],
      false,
      50,
      25
    );
  };

  const handleAddGuitarAmp = () => {
    handleAddPresetInstrument(
      'guitar_amp',
      'Kytarové kombo',
      'instrument',
      [
        {
          id: 'ch-g1-' + Date.now(),
          name: 'Kombo mikrofon',
          pickupType: 'mic',
          micModel: 'Sennheiser e906 (Kytarový aparát)',
          stand: 'low_boom',
        },
      ],
      true, // needs 230V
      25,
      40
    );
  };

  const handleAddBassAmp = () => {
    handleAddPresetInstrument(
      'bass_amp',
      'Baskytara (Aparát / Preamp)',
      'instrument',
      [
        {
          id: 'ch-b1-' + Date.now(),
          name: 'Basa XLR DI Out',
          pickupType: 'line_xlr',
          micModel: 'Přímý XLR výstup (Direct Out)',
          stand: 'none',
        },
      ],
      true, // needs 230V
      75,
      40
    );
  };

  const handleAddKeyboard = () => {
    handleAddPresetInstrument(
      'keyboard',
      'Klávesy Stereo',
      'instrument',
      [
        {
          id: 'ch-k1-' + Date.now(),
          name: 'Klávesy L (mono)',
          pickupType: 'line_jack',
          micModel: 'Linka Jack 6.3mm',
          stand: 'none',
        },
        {
          id: 'ch-k2-' + Date.now(),
          name: 'Klávesy R',
          pickupType: 'line_jack',
          micModel: 'Linka Jack 6.3mm',
          stand: 'none',
        },
      ],
      true, // needs 230V
      80,
      60
    );
  };

  const handleAddAcousticGuitar = () => {
    handleAddPresetInstrument(
      'acoustic_guitar',
      'Akustická kytara',
      'instrument',
      [
        {
          id: 'ch-a1-' + Date.now(),
          name: 'Akustika linka',
          pickupType: 'line_jack',
          micModel: 'Linka Jack 6.3mm / Piezo',
          stand: 'none',
        },
      ],
      false,
      35,
      60
    );
  };

  const handleAddLeadVox = () => {
    handleAddPresetInstrument(
      'lead_vox',
      'Hlavní zpěv',
      'vocal',
      [
        {
          id: 'ch-v1-' + Date.now(),
          name: 'Hlavní zpěv',
          pickupType: 'mic',
          micModel: 'Shure SM58 (Zpěv dynamický)',
          stand: 'high_boom',
        },
      ],
      false,
      50,
      75
    );
  };

  const handleAddBackingVox = () => {
    handleAddPresetInstrument(
      'backing_vox',
      'Doprovodný zpěv',
      'vocal',
      [
        {
          id: 'ch-v2-' + Date.now(),
          name: 'Doprovodný zpěv',
          pickupType: 'mic',
          micModel: 'Shure SM58 (Zpěv dynamický)',
          stand: 'high_boom',
        },
      ],
      false,
      30,
      70
    );
  };

  const handleAddCustom = () => {
    handleAddPresetInstrument(
      'generic',
      'Další nástroj',
      'instrument',
      [
        {
          id: 'ch-c1-' + Date.now(),
          name: 'Vstup 1',
          pickupType: 'mic',
          micModel: 'Shure SM57',
          stand: 'high_boom',
        },
      ],
      false,
      65,
      65
    );
  };

  // 2. POWER HANDLERS ("Přípojka 230V" a "Prodlužka 230V")
  const handleAddPowerSource = () => {
    const count = items.filter((i) => i.subType === 'power_source').length;
    onAddItem({
      name: `Přípojka 230V #${count + 1}`,
      category: 'power_source',
      subType: 'power_source',
      x: 15 + (count % 3) * 35,
      y: 15,
      needsPower230V: false,
    });
  };

  const handleAddPowerStrip = () => {
    const count = items.filter((i) => i.subType === 'power_strip').length;
    onAddItem({
      name: `Prodlužka 230V #${count + 1}`,
      category: 'power_strip',
      subType: 'power_strip',
      x: 35 + (count % 3) * 22,
      y: 35 + Math.floor(count / 3) * 25,
      needsPower230V: false,
    });
  };

  // 3. PA & MONITOR ADD HANDLERS
  const handleAddPA = () => {
    onAddItem({
      name: 'Main PA Levý',
      category: 'pa_speaker',
      subType: 'pa_speaker',
      speakerType: 'active',
      needsPower230V: true,
      x: 10,
      y: 85,
      assignedOutputPort: 'Main L',
    });
    onAddItem({
      name: 'Main PA Pravý',
      category: 'pa_speaker',
      subType: 'pa_speaker',
      speakerType: 'active',
      needsPower230V: true,
      x: 90,
      y: 85,
      assignedOutputPort: 'Main R',
    });
  };

  const handleAddWedge = () => {
    const wedgeCount = items.filter((i) => i.subType === 'wedge' || i.subType === 'monitor_wedge').length;
    const nextAux = wedgeCount < 6 ? `Aux ${wedgeCount + 1}` : 'Aux 1';
    onAddItem({
      name: `Wedge ${wedgeCount + 1}`,
      category: 'monitor_wedge',
      subType: 'wedge',
      speakerType: 'active',
      needsPower230V: true,
      x: 30 + (wedgeCount % 4) * 20,
      y: 80,
      assignedOutputPort: nextAux,
      targetPerformer: `Muzikant ${wedgeCount + 1}`,
    });
  };

  const handleAddIEM = () => {
    const iemCount = items.filter((i) => i.speakerType === 'iem' || i.subType === 'iem_station').length;
    const nextAux = iemCount < 6 ? `Aux ${iemCount + 1}` : 'Aux 1';
    onAddItem({
      name: `In-Ear (IEM) #${iemCount + 1}`,
      category: 'monitor_wedge',
      subType: 'iem_station',
      speakerType: 'iem',
      needsPower230V: true,
      x: 35 + (iemCount % 4) * 15,
      y: 75,
      assignedOutputPort: nextAux,
      targetPerformer: `Muzikant ${iemCount + 1}`,
    });
  };

  // INVENTORY & GEAR CALCULATIONS
  // Flatten all channels across instruments
  const allInstrumentChannels: { item: InteractiveStageItem; channel: InstrumentChannel }[] = [];
  items.forEach((it) => {
    if (it.channels && it.channels.length > 0) {
      it.channels.forEach((ch) => {
        allInstrumentChannels.push({ item: it, channel: ch });
      });
    }
  });

  const patchedChannels = allInstrumentChannels.filter((c) => c.channel.assignedChannelNumber);
  const patchedCount = patchedChannels.length;

  // Microphone and line models counts
  const micCounts: Record<string, number> = {};
  const lineCounts: Record<string, number> = {};
  const standCounts: Record<string, number> = {};

  allInstrumentChannels.forEach(({ channel }) => {
    if (channel.pickupType === 'mic') {
      const model = channel.micModel || 'Dynamický mikrofon';
      micCounts[model] = (micCounts[model] || 0) + 1;

      if (channel.stand && channel.stand !== 'none') {
        const standLabel =
          channel.stand === 'high_boom' ? 'Vysoký stojan s ramenem' :
          channel.stand === 'low_boom' ? 'Nízký stojan (kopák/kombo)' :
          channel.stand === 'clip_clamp' ? 'Klip na ráfek (Tom/Snare clamp)' :
          'Rovný stojan';
        standCounts[standLabel] = (standCounts[standLabel] || 0) + 1;
      }
    } else if (channel.pickupType === 'line_xlr') {
      const model = channel.micModel || 'Přímá XLR linka (Direct Out)';
      lineCounts[model] = (lineCounts[model] || 0) + 1;
    } else if (channel.pickupType === 'line_di') {
      const model = channel.micModel || 'Jack 6.3mm + DI Box';
      lineCounts[model] = (lineCounts[model] || 0) + 1;
    } else {
      const model = channel.micModel || 'Linkový signál Jack 6.3mm';
      lineCounts[model] = (lineCounts[model] || 0) + 1;
    }
  });

  // Speakers & Monitors counts
  const paSpeakers = items.filter((i) => i.subType === 'pa_speaker');
  const monitorWedges = items.filter((i) => ['wedge', 'monitor_wedge'].includes(i.subType) && i.speakerType !== 'iem' && i.subType !== 'iem_station');

  const isPassiveSpeakon = (s: InteractiveStageItem) => s.speakerType === 'passive_speakon' || s.speakerType === 'passive';
  const isPassiveJack = (s: InteractiveStageItem) => s.speakerType === 'passive_jack';
  const isActive = (s: InteractiveStageItem) => s.speakerType === 'active' || (!s.speakerType && s.needsPower230V);

  const activePaCount = paSpeakers.filter(isActive).length;
  const passiveSpeakonPaCount = paSpeakers.filter(isPassiveSpeakon).length;
  const passiveJackPaCount = paSpeakers.filter(isPassiveJack).length;

  const activeWedgeCount = monitorWedges.filter(isActive).length;
  const passiveSpeakonWedgeCount = monitorWedges.filter(isPassiveSpeakon).length;
  const passiveJackWedgeCount = monitorWedges.filter(isPassiveJack).length;

  // DI boxes, IEM stations, and Power sources counts
  const totalDiBoxes = allInstrumentChannels.filter((c) => c.channel.pickupType === 'line_di').length;
  const totalIemStations = items.filter((i) => i.speakerType === 'iem' || i.subType === 'iem_station').length;
  const totalPowerSources = items.filter((i) => i.subType === 'power_source').length;

  // Accurate Cables Count:
  // XLR: mic channels + direct XLR line channels + DI box outputs + active PA + active wedges + IEM stations (Aux XLR)
  const totalInstrumentXlr = allInstrumentChannels.filter(
    (c) => c.channel.pickupType === 'mic' || c.channel.pickupType === 'line_xlr' || c.channel.pickupType === 'line_di'
  ).length;
  const totalXlrRequired = totalInstrumentXlr + activePaCount + activeWedgeCount + totalIemStations;

  // Speakon: passive PA + passive wedges with speakon
  const totalSpeakonRequired = passiveSpeakonPaCount + passiveSpeakonWedgeCount;

  // Jack 6.3mm: instrument line channels (including instrument to DI box) + passive PA/wedges with jack
  const totalInstrumentJack = allInstrumentChannels.filter(
    (c) => c.channel.pickupType === 'line_jack' || c.channel.pickupType === 'line' || c.channel.pickupType === 'line_di'
  ).length;
  const totalJackRequired = totalInstrumentJack + passiveJackPaCount + passiveJackWedgeCount;

  // 230V power strips and power cords
  const totalPowerStrips = items.filter((i) => i.subType === 'power_strip').length;
  const totalPoweredDevices = items.filter((i) => i.needsPower230V && i.subType !== 'power_strip' && i.subType !== 'power_source').length;

  // SAFE INVOICE FALLBACK
  const curInvoice: InvoiceData = {
    invoiceNumber: invoice?.invoiceNumber || '2026001',
    variableSymbol: invoice?.variableSymbol || invoice?.invoiceNumber || '2026001',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    eventDate: invoice?.eventDate || new Date().toISOString().split('T')[0],
    supplierName: invoice?.supplierName || 'Jan Novák - Zvukař & Ozvučovací technika',
    supplierIco: invoice?.supplierIco || '12345678',
    supplierDic: invoice?.supplierDic || 'CZ12345678',
    supplierAddress: invoice?.supplierAddress || 'Zvukařská 12, 110 00 Praha 1',
    supplierAccount: invoice?.supplierAccount || '1234567890/0300',
    supplierEmail: invoice?.supplierEmail || 'zvuk@zvukar.cz',
    supplierPhone: invoice?.supplierPhone || '+420 777 123 456',
    clientName: invoice?.clientName || bandName || 'Pořadatel akce / Kapela',
    clientIco: invoice?.clientIco || '',
    clientAddress: invoice?.clientAddress || 'Klub / Festival, Hlavní 123, Praha',
    items: Array.isArray(invoice?.items) && invoice.items.length > 0 ? invoice.items : [
      { id: 'inv-1', description: 'Ozvučení akce / práce zvukaře', quantity: 1, unitPrice: 5000 },
      { id: 'inv-2', description: 'Pronájem PA aparatury, mixpultu XR18 a mikrofonů', quantity: 1, unitPrice: 3500 },
      { id: 'inv-3', description: 'Doprava ozvučovací techniky', quantity: 1, unitPrice: 1000 },
    ],
    notes: invoice?.notes || 'Děkujeme za spolupráci. Platba bankovním převodem se splatností 14 dní.',
  };

  // INVOICE TOTAL CALCULATION
  const invoiceTotal = curInvoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleUpdateInvoiceField = (field: keyof InvoiceData, val: any) => {
    onUpdateInvoice({ ...curInvoice, [field]: val });
  };

  const handleAddInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: 'inv-' + Date.now(),
      description: 'Nová položka ozvučení',
      quantity: 1,
      unitPrice: 1500,
    };
    onUpdateInvoice({
      ...curInvoice,
      items: [...curInvoice.items, newItem],
    });
  };

  const handleUpdateInvoiceItem = (id: string, updates: Partial<InvoiceItem>) => {
    onUpdateInvoice({
      ...curInvoice,
      items: curInvoice.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
    });
  };

  const handleDeleteInvoiceItem = (id: string) => {
    onUpdateInvoice({
      ...curInvoice,
      items: curInvoice.items.filter((it) => it.id !== id),
    });
  };

  // Export PDF
  const handleExportPdf = () => {
    setIsExporting(true);
    try {
      exportInvoiceAndRiderPdf({
        bandName,
        invoice: curInvoice,
        items,
        allInstrumentChannels,
        totalXlrRequired,
        totalSpeakonRequired,
        totalJackRequired,
        totalPowerStrips,
        totalPoweredDevices,
        totalDiBoxes,
        totalPowerSources,
        totalIemStations,
        micCounts,
        standCounts,
      });
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Export PDF selhal.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export ONLY Stage Plan (1-page technical rider PDF without invoice)
  const handleExportStagePlanOnlyPdf = () => {
    setIsExportingStagePlan(true);
    try {
      exportStagePlanOnlyPdf({
        bandName,
        invoice: curInvoice,
        items,
        allInstrumentChannels,
        totalXlrRequired,
        totalSpeakonRequired,
        totalJackRequired,
        totalPowerStrips,
        totalPoweredDevices,
        totalDiBoxes,
        totalPowerSources,
        totalIemStations,
        micCounts,
        standCounts,
      });
    } catch (err) {
      console.error('Stage plan export error:', err);
      alert('Export Stage Plánu selhal.');
    } finally {
      setIsExportingStagePlan(false);
    }
  };

  // Export 2D Stage Canvas as PNG Image
  const handleExportStageImage = () => {
    setIsExportingImage(true);
    try {
      exportStagePlanImage({ items, cables, bandName });
    } catch (err) {
      console.error('Stage image export error:', err);
      alert('Nepodařilo se vygenerovat obrázek pódia.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // Copy plain text rider & vyúčtování
  const handleCopyTextRider = () => {
    let t = `FAKTURA / VYÚČTOVÁNÍ & TECHNICKÝ RIDER\n`;
    t += `========================================================================\n`;
    t += `Dodavatel: ${curInvoice.supplierName} (IČO: ${curInvoice.supplierIco})\n`;
    t += `Odběratel: ${curInvoice.clientName}\n`;
    t += `Akce: ${bandName} | Datum: ${curInvoice.eventDate}\n`;
    t += `Číslo účtu: ${curInvoice.supplierAccount} | VS: ${curInvoice.variableSymbol || curInvoice.invoiceNumber}\n`;
    t += `Celkem k úhradě: ${invoiceTotal.toLocaleString('cs-CZ')} Kč\n\n`;

    t += `------------------------------------------------------------------------\n`;
    t += `VSTUPY DO PULTU BEHRINGER XR18 (INPUT LIST):\n`;
    const sorted = [...allInstrumentChannels]
      .filter((c) => c.channel.assignedChannelNumber)
      .sort((a, b) => (a.channel.assignedChannelNumber || 0) - (b.channel.assignedChannelNumber || 0));

    sorted.forEach(({ item, channel }) => {
      const ch = `CH ${channel.assignedChannelNumber}:`.padEnd(8, ' ');
      const name = `${item.name} (${channel.name})`.padEnd(28, ' ');
      const micOrLine =
        channel.pickupType === 'mic'
          ? (channel.micModel || 'Mikrofon XLR')
          : channel.pickupType === 'line_xlr'
          ? (channel.micModel || 'Přímá XLR linka (Direct Out)')
          : channel.pickupType === 'line_di'
          ? (channel.micModel || 'Jack 6.3mm + DI Box')
          : (channel.micModel || 'Linka Jack 6.3mm');
      const phantom = channel.needsPhantom48V ? '[+48V]' : '';
      t += `${ch} ${name} | ${micOrLine} ${phantom}\n`;
    });

    t += `\nVÝSTUPY & MONITORING:\n`;
    items
      .filter((i) => i.assignedOutputPort)
      .forEach((it) => {
        const typeStr =
          it.speakerType === 'iem' || it.subType === 'iem_station'
            ? 'In-Ear Monitor (IEM vysílač)'
            : it.speakerType === 'passive_speakon' || it.speakerType === 'passive'
            ? 'Pasivní (Speakon ze zesilovače)'
            : it.speakerType === 'passive_jack'
            ? 'Pasivní (Jack 6.3mm ze zesilovače)'
            : 'Aktivní (XLR + 230V)';
        t += `${it.assignedOutputPort}: ${it.name} [${typeStr}] - ${it.targetPerformer || ''}\n`;
      });

    t += `\nSEZNAM POTŘEBNÉ TECHNIKY DO AUTA:\n`;
    t += `- XLR kabely celkem: ${totalXlrRequired} ks (mikrofony, přímé XLR linky, DI boxy + aktivní bedny/IEM)\n`;
    if (totalSpeakonRequired > 0) {
      t += `- Speakon kabely: ${totalSpeakonRequired} ks (pasivní bedny ze zesilovače)\n`;
    }
    t += `- Jack 6.3mm kabely: ${totalJackRequired} ks (nástroje, klávesy, vstupy do DI boxů)\n`;
    if (totalDiBoxes > 0) {
      t += `- DI Boxy: ${totalDiBoxes} ks\n`;
    }
    if (totalIemStations > 0) {
      t += `- In-Ear (IEM) bezdrátové stanice: ${totalIemStations} ks\n`;
    }
    t += `- Prodlužky 230V: ${totalPowerStrips} ks\n`;
    if (totalPowerSources > 0) {
      t += `- Přípojky 230V na pódiu: ${totalPowerSources} ks\n`;
    }
    t += `- Připojení 230V (spotřebiče na pódiu): ${totalPoweredDevices} ks\n`;

    navigator.clipboard.writeText(t);
    setCopiedRider(true);
    setTimeout(() => setCopiedRider(false), 2500);
  };

  return (
    <div className="space-y-3">
      {/* Top Phase Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shadow-xl">
        {PHASES.map((p) => {
          const Icon = p.icon;
          const isActive = currentPhase === p.phase;
          return (
            <button
              key={p.phase}
              onClick={() => onSelectPhase(p.phase)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* PHASE 1: NÁSTROJE & ZPĚVY TOOLBAR */}
      {currentPhase === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Music className="w-4 h-4 text-indigo-400" />
              <span>1. Rozestavte kapelu na scéně:</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Přetažením posouvejte • Klepnutím upravíte mikrofony (+)
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={handleAddDrums}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🥁 Bicí (4 mik.)
            </button>
            <button
              onClick={handleAddGuitarAmp}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🎸 Kytara kombo
            </button>
            <button
              onClick={handleAddBassAmp}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🎸 Basa (XLR DI Out)
            </button>
            <button
              onClick={handleAddKeyboard}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🎹 Klávesy (Jack L/R)
            </button>
            <button
              onClick={handleAddAcousticGuitar}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🎸 Akustika (Jack)
            </button>
            <button
              onClick={handleAddLeadVox}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🎙️ Lead Zpěv
            </button>
            <button
              onClick={handleAddBackingVox}
              className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500 rounded-xl text-xs font-semibold text-slate-200 whitespace-nowrap transition active:scale-95"
            >
              + 🎙️ Backing zpěv
            </button>
            <button
              onClick={handleAddCustom}
              className="px-3 py-1.5 bg-slate-850 hover:bg-slate-700 border border-slate-650 rounded-xl text-xs font-semibold text-indigo-300 whitespace-nowrap transition active:scale-95"
            >
              + Vlastní prvek
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2: KABELY DO XR18 TOOLBAR */}
      {currentPhase === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cable className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white">2. Zapojení kanálů do mixu XR18:</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800 font-bold">
              Zapojeno: {patchedCount} z 16 kanálů
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px] text-slate-300 flex items-center justify-between gap-3">
            <span>
              💡 Klepněte na libovolný nástroj a zvolte <b>model mikrofonu</b> (Shure SM58, SM57, e604, Beta 91A, Beta 52A, Behringer C2...), <b>vstup XR18 (CH 1–16)</b> a <b>phantom +48V</b>.
            </span>

            <button
              onClick={onAutoPatchAll}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow"
              title="Automaticky seřadit a zapojit kanály 1..N"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chytré auto-zapojení</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: ELEKTŘINA 230V TOOLBAR */}
      {currentPhase === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>3. Rozvod elektřiny 230V (Přípojky &amp; Prodlužky):</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAddPowerSource}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Přípojka 230V</span>
              </button>
              <button
                onClick={handleAddPowerStrip}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-600/50 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Prodlužka 230V</span>
              </button>
              {onAutoPowerWiring && (
                <button
                  onClick={onAutoPowerWiring}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
                  title="Automaticky vytvořit přívod 230V a zapojit prodlužky i spotřebiče"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-zapojit 230V</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Symbol ⚡ označuje zařízení vyžadující 230V (aparáty, klávesy, aktivní reprobedny, IEM). 
            Klepnutím na prvek propojíte prodlužku s přípojkou nebo spotřebič s prodlužkou.
          </p>
        </div>
      )}

      {/* PHASE 4: PA & ODPOSLECHY TOOLBAR */}
      {currentPhase === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>4. Zapojení PA beden, Odposlechů a In-Ear (IEM):</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAddPA}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/60 rounded-xl text-xs font-semibold transition"
              >
                + Main PA L/R
              </button>
              <button
                onClick={handleAddWedge}
                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition"
              >
                + Odposlech Wedge
              </button>
              <button
                onClick={handleAddIEM}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>+ In-Ear (IEM)</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Klepnutím na bednu či IEM zvolíte typ: <b>⚡ Aktivní bedna</b> (XLR + 230V), <b>🔊 Pasivní + Speakon</b>, <b>🔌 Pasivní + Jack</b> nebo <b>🎧 In-Ear (IEM)</b>, výstup z XR18 a pro koho je.
          </p>
        </div>
      )}

      {/* PHASE 5: FAKTURA, VÝSLEDNÝ STAGE PLÁN & EXPORT */}
      {currentPhase === 5 && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Příprava kompletní
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Faktura &amp; Stage Plán pro kapelu / pořadatele
              </h3>
              <p className="text-xs text-slate-400">
                Oficiální podklad pro kapelu k odsouhlasení i daňový doklad / vyúčtování.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsEditingInvoiceDetails(!isEditingInvoiceDetails)}
                className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isEditingInvoiceDetails
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-700/60'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingInvoiceDetails ? 'Zavřít fakturu' : 'Upravit fakturu'}</span>
              </button>

              <button
                onClick={handleCopyTextRider}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Zkopírovat rider jako text do schránky"
              >
                {copiedRider ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span className="hidden sm:inline">{copiedRider ? 'Zkopírováno!' : 'Kopírovat'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                title="Tisk"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Tisk</span>
              </button>

              <button
                onClick={handleExportStageImage}
                disabled={isExportingImage}
                className="px-2.5 py-2 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-600/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                title="Stáhnout samotné grafické pódium jako obrázek PNG"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{isExportingImage ? 'Ukládám...' : 'Pódium (PNG)'}</span>
                <span className="sm:hidden">PNG</span>
              </button>

              <button
                onClick={handleExportStagePlanOnlyPdf}
                disabled={isExportingStagePlan}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 transition shrink-0 active:scale-95"
                title="Stáhnout pouze technický rider a stage plán bez faktury"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingStagePlan ? 'Generuji...' : 'Jen Stage Plán (PDF)'}</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition shrink-0 active:scale-95"
                title="Stáhnout kompletní 2-stránkové PDF (Faktura + Stage Plán)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Generuji...' : 'Komplet s fakturou (PDF)'}</span>
              </button>
            </div>
          </div>

          {/* EDIT INVOICE DRAWER (IF OPEN) */}
          {isEditingInvoiceDetails && (
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-white text-sm">Úprava fakturačních údajů a položek vyúčtování</h4>
                </div>
                <button
                  onClick={() => setIsEditingInvoiceDetails(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Hotovo
                </button>
              </div>

              {/* Basic metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Číslo faktury / dokladu:</label>
                  <input
                    type="text"
                    value={curInvoice.invoiceNumber}
                    onChange={(e) => handleUpdateInvoiceField('invoiceNumber', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Variabilní symbol:</label>
                  <input
                    type="text"
                    value={curInvoice.variableSymbol || curInvoice.invoiceNumber}
                    onChange={(e) => handleUpdateInvoiceField('variableSymbol', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-amber-400 font-bold block mb-1">Datum plnění (DUZP / akce):</label>
                  <input
                    type="date"
                    value={curInvoice.eventDate || curInvoice.issueDate}
                    onChange={(e) => handleUpdateInvoiceField('eventDate', e.target.value)}
                    className="w-full bg-slate-800 border border-amber-500/70 rounded-xl px-2.5 py-1.5 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Datum vystavení:</label>
                  <input
                    type="date"
                    value={curInvoice.issueDate}
                    onChange={(e) => handleUpdateInvoiceField('issueDate', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Datum splatnosti:</label>
                  <input
                    type="date"
                    value={curInvoice.dueDate}
                    onChange={(e) => handleUpdateInvoiceField('dueDate', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Supplier & Client details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                {/* Supplier */}
                <div className="space-y-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="font-bold text-indigo-300 block">Dodavatel (Zvukař):</span>
                  <input
                    type="text"
                    placeholder="Jméno / Firma zvukaře"
                    value={curInvoice.supplierName}
                    onChange={(e) => handleUpdateInvoiceField('supplierName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="IČO"
                      value={curInvoice.supplierIco}
                      onChange={(e) => handleUpdateInvoiceField('supplierIco', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                    />
                    <input
                      type="text"
                      placeholder="DIČ (pokud je plátce)"
                      value={curInvoice.supplierDic}
                      onChange={(e) => handleUpdateInvoiceField('supplierDic', e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Adresa sídla"
                    value={curInvoice.supplierAddress}
                    onChange={(e) => handleUpdateInvoiceField('supplierAddress', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Číslo bankovního účtu (IBAN)"
                    value={curInvoice.supplierAccount}
                    onChange={(e) => handleUpdateInvoiceField('supplierAccount', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-emerald-400 font-mono font-bold"
                  />
                </div>

                {/* Client */}
                <div className="space-y-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="font-bold text-amber-300 block">Odběratel (Kapela / Pořadatel):</span>
                  <input
                    type="text"
                    placeholder="Název pořadatele / Kapela"
                    value={curInvoice.clientName}
                    onChange={(e) => handleUpdateInvoiceField('clientName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="IČO pořadatele (pokud je známo)"
                    value={curInvoice.clientIco}
                    onChange={(e) => handleUpdateInvoiceField('clientIco', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Adresa / Místo konání"
                    value={curInvoice.clientAddress}
                    onChange={(e) => handleUpdateInvoiceField('clientAddress', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white"
                  />
                </div>
              </div>

              {/* Items editor */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Fakturované položky:</span>
                  <button
                    type="button"
                    onClick={handleAddInvoiceItem}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Přidat položku</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {curInvoice.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                      <input
                        type="text"
                        value={it.description}
                        onChange={(e) => handleUpdateInvoiceItem(it.id, { description: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        placeholder="Popis služby..."
                      />
                      <div className="flex items-center gap-1 w-24">
                        <input
                          type="number"
                          value={it.quantity}
                          min="1"
                          onChange={(e) => handleUpdateInvoiceItem(it.id, { quantity: Number(e.target.value) || 1 })}
                          className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1 text-xs text-center text-white"
                        />
                        <span className="text-[10px] text-slate-400">ks</span>
                      </div>
                      <div className="flex items-center gap-1 w-32">
                        <input
                          type="number"
                          value={it.unitPrice}
                          step="100"
                          onChange={(e) => handleUpdateInvoiceItem(it.id, { unitPrice: Number(e.target.value) || 0 })}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-right text-emerald-400 font-mono font-bold"
                        />
                        <span className="text-[10px] text-slate-400">Kč</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteInvoiceItem(it.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRINTABLE / PRESENTABLE SHEET (SEPARATED INTO 2 DISTINCT PAGES) */}
          <div
            ref={presentationRef}
            className="space-y-6 select-text"
          >
            {/* PAGE 1: FAKTURA / DAŇOVÝ DOKLAD */}
            <div className="print-page print-page-1 bg-white text-slate-900 border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* INVOICE HEADER */}
              <div className="border-b-2 border-slate-900 pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                      FAKTURA — DAŇOVÝ DOKLAD &amp; VYÚČTOVÁNÍ
                    </span>
                    <h1 className="text-3xl font-black text-slate-900 mt-2">
                      Faktura č. {curInvoice.invoiceNumber}
                    </h1>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">
                      Variabilní symbol: <span className="font-mono text-slate-900 font-bold">{curInvoice.variableSymbol || curInvoice.invoiceNumber}</span>
                    </p>
                  </div>

                  <div className="text-right text-xs space-y-1 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <div>Datum vystavení: <b>{new Date(curInvoice.issueDate).toLocaleDateString('cs-CZ')}</b></div>
                    <div>Datum zdan. plnění / Akce: <b>{new Date(curInvoice.eventDate).toLocaleDateString('cs-CZ')}</b></div>
                    <div className="text-indigo-800 font-bold">Datum splatnosti: <b>{new Date(curInvoice.dueDate).toLocaleDateString('cs-CZ')}</b></div>
                  </div>
                </div>

                {/* SUPPLIER & CLIENT DETAILS */}
                <div className="grid grid-cols-2 gap-6 mt-6 text-xs">
                  {/* Dodavatel */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      DODAVATEL (Zvukař / Technika):
                    </span>
                    <div className="text-base font-extrabold text-slate-900">{curInvoice.supplierName}</div>
                    <div className="text-slate-600">{curInvoice.supplierAddress}</div>
                    <div className="text-slate-600">IČO: <b>{curInvoice.supplierIco}</b> {curInvoice.supplierDic ? `| DIČ: ${curInvoice.supplierDic}` : ''}</div>
                    <div className="text-slate-600">Tel: {curInvoice.supplierPhone} | E-mail: {curInvoice.supplierEmail}</div>
                    <div className="pt-2 border-t border-slate-200 mt-2">
                      <span className="text-[10px] font-bold text-slate-500 block">Bankovní účet pro úhradu:</span>
                      <span className="font-mono font-black text-indigo-700 text-sm">{curInvoice.supplierAccount}</span>
                    </div>
                  </div>

                  {/* Odběratel */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                      ODBĚRATEL (Objednatel / Kapela):
                    </span>
                    <div className="text-base font-extrabold text-slate-900">{curInvoice.clientName || bandName}</div>
                    <div className="text-slate-600">{curInvoice.clientAddress}</div>
                    {curInvoice.clientIco && (
                      <div className="text-slate-600">IČO: <b>{curInvoice.clientIco}</b></div>
                    )}
                    <div className="pt-2 border-t border-slate-200 mt-2">
                      <span className="text-[10px] font-bold text-slate-500 block">Účel platby / Název akce:</span>
                      <span className="font-bold text-slate-800">{bandName} • Ozvučení a technický servis</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* INVOICE ITEMS TABLE */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Položky vyúčtování:
                </h3>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-y border-slate-300 text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Popis položky / služby</th>
                      <th className="py-2.5 px-3 text-center w-20">Množství</th>
                      <th className="py-2.5 px-3 text-right w-28">Cena za jedn.</th>
                      <th className="py-2.5 px-3 text-right w-28">Celkem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {curInvoice.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2 px-3 text-slate-900 font-semibold">{it.description}</td>
                        <td className="py-2 px-3 text-center text-slate-600">{it.quantity} ks</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-700">{it.unitPrice.toLocaleString('cs-CZ')} Kč</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {(it.quantity * it.unitPrice).toLocaleString('cs-CZ')} Kč
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 bg-slate-50">
                      <td colSpan={3} className="py-3 px-3 text-right font-black text-sm text-slate-900">
                        Celkem k úhradě:
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-base text-indigo-700">
                        {invoiceTotal.toLocaleString('cs-CZ')} Kč
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <p className="text-[10px] text-slate-500 italic mt-1">
                  {curInvoice.notes}
                </p>
              </div>

              {/* PAYMENT TERMS & SIGNATURE BOX */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">Platební instrukce:</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Platbu poukažte na účet dodavatele s uvedením variabilního symbolu <b>{curInvoice.variableSymbol || curInvoice.invoiceNumber}</b>.
                    Tento doklad slouží současně jako potvrzení o provedení technických a zvukařských prací.
                  </p>
                </div>
                <div className="border border-dashed border-slate-300 rounded-2xl p-4 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-6">Razítko a podpis dodavatele:</span>
                  <div className="border-t border-slate-300 w-2/3 mx-auto text-[11px] font-semibold text-slate-600 pt-1">
                    {curInvoice.supplierName}
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 2: TECHNICKÝ RIDER & STAGE PLÁN */}
            <div className="print-page print-page-2 bg-white text-slate-900 border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* RIDER HEADER */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                      PŘÍLOHA K FAKTUŘE Č. {curInvoice.invoiceNumber} • TECHNICKÁ SPECIFIKACE
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">
                      Stage Plán &amp; Input List — {bandName || 'Akce'}
                    </h2>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <div>Pult: <b>Behringer XR18 Digital</b></div>
                    <div>Zapojeno: <b>{patchedCount} z 16 kanálů</b></div>
                    <div>Datum: <b>{new Date(curInvoice.eventDate).toLocaleDateString('cs-CZ')}</b></div>
                  </div>
                </div>
              </div>

              {/* XR18 INPUT LIST TABLE */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Input List — Obsazení vstupních kanálů pultu Behringer XR18:</span>
                </h3>

                <table className="w-full text-left text-xs border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[10px] uppercase font-bold">
                      <th className="py-2 px-2 text-center w-12 font-mono">CH #</th>
                      <th className="py-2 px-3">Nástroj / Zdroj na scéně</th>
                      <th className="py-2 px-3">Snímání / Model mikrofonu / Linka</th>
                      <th className="py-2 px-2 text-center w-14">48V</th>
                      <th className="py-2 px-3">Kabeláž</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {allInstrumentChannels
                      .filter((c) => c.channel.assignedChannelNumber)
                      .sort((a, b) => (a.channel.assignedChannelNumber || 0) - (b.channel.assignedChannelNumber || 0))
                      .map(({ item, channel }) => (
                        <tr key={channel.id} className="hover:bg-slate-50">
                          <td className="py-2 px-2 text-center font-mono font-black text-indigo-700 bg-indigo-50/50">
                            {channel.assignedChannelNumber}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {item.name} {item.channels.length > 1 ? `(${channel.name})` : ''}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            {channel.pickupType === 'mic'
                              ? (channel.micModel || 'Dynamický mikrofon')
                              : channel.pickupType === 'line_xlr'
                              ? (channel.micModel || 'Přímá XLR linka (Direct Out)')
                              : channel.pickupType === 'line_di'
                              ? (channel.micModel || 'Jack 6.3mm + DI Box')
                              : (channel.micModel || 'Linka Jack 6.3mm')}
                          </td>
                          <td className="py-2 px-2 text-center">
                            {channel.needsPhantom48V ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-red-600 text-white">
                                +48V
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                            {channel.pickupType === 'mic' || channel.pickupType === 'line_xlr'
                              ? `XLR kabel (${channel.cableLengthMeters || 10}m)`
                              : channel.pickupType === 'line_di'
                              ? `Jack do DI + XLR (${channel.cableLengthMeters || 10}m)`
                              : `Jack 6.3mm (${channel.cableLengthMeters || 6}m)`}
                          </td>
                        </tr>
                      ))}
                    {patchedCount === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500 italic">
                          Zatím nebyly přiřazeny žádné kanály do pultu XR18. (Využijte Chytré auto-zapojení ve Fázi 2)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* OUTPUTS & MONITORING */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Výstupy &amp; Monitoring (Main PA, Odposlechy &amp; IEM):</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {items
                    .filter((i) => i.assignedOutputPort)
                    .map((it) => (
                      <div
                        key={it.id}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded font-mono font-black text-white text-[10px] ${
                            it.speakerType === 'iem' || it.subType === 'iem_station' ? 'bg-purple-700' : 'bg-sky-700'
                          }`}>
                            {it.assignedOutputPort}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {it.speakerType === 'iem' || it.subType === 'iem_station'
                              ? 'In-Ear (IEM)'
                              : (it.speakerType === 'passive_speakon' || it.speakerType === 'passive')
                              ? 'Pasivní (Speakon)'
                              : it.speakerType === 'passive_jack'
                              ? 'Pasivní (Jack 6.3mm)'
                              : 'Aktivní (XLR)'}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900">{it.name}</div>
                        {it.targetPerformer && (
                          <div className="text-[10px] text-slate-500">Pro: {it.targetPerformer}</div>
                        )}
                      </div>
                    ))}
                  {items.filter((i) => i.assignedOutputPort).length === 0 && (
                    <div className="col-span-3 text-slate-500 text-xs italic p-2">
                      Žádné výstupy nebyly zatím nakonfigurovány.
                    </div>
                  )}
                </div>
              </div>

              {/* SEZNAM TECHNIKY K NALOŽENÍ (PACKING CHECKLIST) */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  <span>Seznam techniky a kabeláže k naložení do auta:</span>
                </h3>

                {/* Cable summary badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200">
                    <span className="text-[10px] text-sky-800 block font-bold uppercase">XLR kabely:</span>
                    <span className="text-xl font-black text-sky-900 font-mono">{totalXlrRequired} ks</span>
                    <span className="text-[9px] text-sky-700 block mt-0.5">miky + linky + PA/IEM</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
                    <span className="text-[10px] text-orange-800 block font-bold uppercase">Speakon kabely:</span>
                    <span className="text-xl font-black text-orange-900 font-mono">{totalSpeakonRequired} ks</span>
                    <span className="text-[9px] text-orange-700 block mt-0.5">pasivní bedny ze zes.</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-yellow-50 border border-yellow-200">
                    <span className="text-[10px] text-yellow-800 block font-bold uppercase">Jack 6.3mm kabely:</span>
                    <span className="text-xl font-black text-yellow-900 font-mono">{totalJackRequired} ks</span>
                    <span className="text-[9px] text-yellow-700 block mt-0.5">jack linky &amp; DI</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-800 block font-bold uppercase">DI Boxy:</span>
                    <span className="text-xl font-black text-amber-900 font-mono">{totalDiBoxes} ks</span>
                    <span className="text-[9px] text-amber-700 block mt-0.5">galv. oddělení linky</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] text-purple-800 block font-bold uppercase">IEM Stanice:</span>
                    <span className="text-xl font-black text-purple-900 font-mono">{totalIemStations} ks</span>
                    <span className="text-[9px] text-purple-700 block mt-0.5">bezdrát vysílače</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                    <span className="text-[10px] text-red-800 block font-bold uppercase">Prodlužky 230V:</span>
                    <span className="text-xl font-black text-red-900 font-mono">{totalPowerStrips} ks</span>
                    <span className="text-[9px] text-red-700 block mt-0.5">{totalPoweredDevices} spotřebičů</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block font-bold uppercase">Přípojky 230V:</span>
                    <span className="text-xl font-black text-emerald-900 font-mono">{totalPowerSources} ks</span>
                    <span className="text-[9px] text-emerald-700 block mt-0.5">hlavní přívod</span>
                  </div>
                </div>

                {/* Microphones detail list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      Potřebné mikrofony:
                    </span>
                    {Object.entries(micCounts).length > 0 ? (
                      Object.entries(micCounts).map(([mic, count]) => (
                        <div key={mic} className="flex justify-between text-slate-800 border-b border-slate-100 pb-1">
                          <span>{mic}</span>
                          <span className="font-mono font-bold text-indigo-700">{count}×</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Zatím nezvolen žádný mikrofon</span>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-500 block">
                      Mikrofonní stojany a úchyty:
                    </span>
                    {Object.entries(standCounts).length > 0 ? (
                      Object.entries(standCounts).map(([stand, count]) => (
                        <div key={stand} className="flex justify-between text-slate-800 border-b border-slate-100 pb-1">
                          <span>{stand}</span>
                          <span className="font-mono font-bold text-amber-700">{count}×</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Stojany nejsou vyžadovány</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Prev/Next Stepper Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onSelectPhase(Math.max(1, currentPhase - 1) as StagePhase)}
          disabled={currentPhase === 1}
          className={`px-4 py-2 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-800 transition ${
            currentPhase === 1
              ? 'invisible pointer-events-none'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Předchozí krok</span>
        </button>

        <span className="text-[11px] text-slate-500 font-semibold">
          Fáze {currentPhase} z 5
        </span>

        <button
          onClick={() => onSelectPhase(Math.min(5, currentPhase + 1) as StagePhase)}
          disabled={currentPhase === 5}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
        >
          <span>Další krok</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
