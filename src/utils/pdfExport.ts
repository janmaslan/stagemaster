import jsPDF from 'jspdf';
import { InvoiceData, InteractiveStageItem, InstrumentChannel } from '../types/interactiveStage';

interface ExportPdfParams {
  bandName: string;
  invoice: InvoiceData;
  items: InteractiveStageItem[];
  allInstrumentChannels: { item: InteractiveStageItem; channel: InstrumentChannel }[];
  totalXlrRequired: number;
  totalSpeakonRequired: number;
  totalJackRequired: number;
  totalPowerStrips: number;
  totalPoweredDevices: number;
  micCounts: Record<string, number>;
  standCounts: Record<string, number>;
}

export function exportInvoiceAndRiderPdf({
  bandName,
  invoice,
  items,
  allInstrumentChannels,
  totalXlrRequired,
  totalSpeakonRequired,
  totalJackRequired,
  totalPowerStrips,
  totalPoweredDevices,
  micCounts,
  standCounts,
}: ExportPdfParams): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const A4_W = 1600;
  const A4_H = 2262;

  // -------------------------------------------------------------
  // PAGE 1: FAKTURA / DAŇOVÝ DOKLAD
  // -------------------------------------------------------------
  const canvas1 = document.createElement('canvas');
  canvas1.width = A4_W;
  canvas1.height = A4_H;
  const ctx1 = canvas1.getContext('2d');
  if (!ctx1) return;

  // Background
  ctx1.fillStyle = '#ffffff';
  ctx1.fillRect(0, 0, A4_W, A4_H);

  // Top accent bar
  ctx1.fillStyle = '#4338ca';
  ctx1.fillRect(0, 0, A4_W, 24);

  // Document Title
  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText('FAKTURA — DAŇOVÝ DOKLAD & VYÚČTOVÁNÍ ZA OZVUČENÍ', 80, 80);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 54px sans-serif';
  ctx1.fillText(`Faktura č. ${invoice.invoiceNumber}`, 80, 145);

  ctx1.fillStyle = '#64748b';
  ctx1.font = 'bold 24px sans-serif';
  ctx1.fillText(`Variabilní symbol: ${invoice.variableSymbol || invoice.invoiceNumber}`, 80, 185);

  // Dates Box on right
  const dateBoxX = 1000;
  const dateBoxY = 60;
  ctx1.fillStyle = '#f8fafc';
  ctx1.strokeStyle = '#e2e8f0';
  ctx1.lineWidth = 2;
  roundRect(ctx1, dateBoxX, dateBoxY, 520, 140, 16, true, true);

  ctx1.fillStyle = '#475569';
  ctx1.font = '22px sans-serif';
  ctx1.fillText('Datum vystavení:', dateBoxX + 25, dateBoxY + 40);
  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText(new Date(invoice.issueDate).toLocaleDateString('cs-CZ'), dateBoxX + 320, dateBoxY + 40);

  ctx1.fillStyle = '#475569';
  ctx1.font = '22px sans-serif';
  ctx1.fillText('Datum zdan. plnění:', dateBoxX + 25, dateBoxY + 80);
  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText(new Date(invoice.eventDate).toLocaleDateString('cs-CZ'), dateBoxX + 320, dateBoxY + 80);

  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText('Datum splatnosti:', dateBoxX + 25, dateBoxY + 120);
  ctx1.fillText(new Date(invoice.dueDate).toLocaleDateString('cs-CZ'), dateBoxX + 320, dateBoxY + 120);

  // Divider
  ctx1.strokeStyle = '#cbd5e1';
  ctx1.lineWidth = 2;
  ctx1.beginPath();
  ctx1.moveTo(80, 220);
  ctx1.lineTo(A4_W - 80, 220);
  ctx1.stroke();

  // Supplier & Client Boxes
  const boxY = 245;
  const boxW = 690;
  const boxH = 340;

  // 1. Supplier Box
  ctx1.fillStyle = '#f8fafc';
  ctx1.strokeStyle = '#cbd5e1';
  ctx1.lineWidth = 2;
  roundRect(ctx1, 80, boxY, boxW, boxH, 20, true, true);

  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 20px sans-serif';
  ctx1.fillText('DODAVATEL (Zvukař / Technika):', 110, boxY + 40);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 28px sans-serif';
  ctx1.fillText(invoice.supplierName || 'Jan Novák - Zvukař', 110, boxY + 85);

  ctx1.fillStyle = '#334155';
  ctx1.font = '22px sans-serif';
  ctx1.fillText(invoice.supplierAddress || 'Praha', 110, boxY + 125);
  ctx1.fillText(`IČO: ${invoice.supplierIco || '12345678'} ${invoice.supplierDic ? `  |  DIČ: ${invoice.supplierDic}` : ''}`, 110, boxY + 165);
  ctx1.fillText(`Tel: ${invoice.supplierPhone || ''}  |  E-mail: ${invoice.supplierEmail || ''}`, 110, boxY + 205);

  // Bank Account Highlight inside Supplier Box
  ctx1.fillStyle = '#eef2ff';
  ctx1.strokeStyle = '#c7d2fe';
  ctx1.lineWidth = 1.5;
  roundRect(ctx1, 105, boxY + 235, boxW - 50, 80, 12, true, true);

  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 18px sans-serif';
  ctx1.fillText('BANKOVNÍ ÚČET PRO ÚHRADU:', 125, boxY + 265);
  ctx1.fillStyle = '#1e1b4b';
  ctx1.font = 'bold 26px monospace';
  ctx1.fillText(invoice.supplierAccount || '1234567890/0300', 125, boxY + 298);

  // 2. Client Box
  ctx1.fillStyle = '#f8fafc';
  ctx1.strokeStyle = '#cbd5e1';
  ctx1.lineWidth = 2;
  roundRect(ctx1, 830, boxY, boxW, boxH, 20, true, true);

  ctx1.fillStyle = '#c2410c';
  ctx1.font = 'bold 20px sans-serif';
  ctx1.fillText('ODBĚRATEL (Objednatel / Pořadatel / Kapela):', 860, boxY + 40);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 28px sans-serif';
  ctx1.fillText(invoice.clientName || bandName || 'Pořadatel akce', 860, boxY + 85);

  ctx1.fillStyle = '#334155';
  ctx1.font = '22px sans-serif';
  ctx1.fillText(invoice.clientAddress || 'Místo konání akce', 860, boxY + 125);
  if (invoice.clientIco) {
    ctx1.fillText(`IČO: ${invoice.clientIco}`, 860, boxY + 165);
  }

  // Purpose Highlight inside Client Box
  ctx1.fillStyle = '#fff7ed';
  ctx1.strokeStyle = '#fed7aa';
  ctx1.lineWidth = 1.5;
  roundRect(ctx1, 855, boxY + 235, boxW - 50, 80, 12, true, true);

  ctx1.fillStyle = '#c2410c';
  ctx1.font = 'bold 18px sans-serif';
  ctx1.fillText('ÚČEL PLATBY / NÁZEV PROJEKTU:', 875, boxY + 265);
  ctx1.fillStyle = '#431407';
  ctx1.font = 'bold 24px sans-serif';
  ctx1.fillText(`${bandName} • Ozvučení akce`, 875, boxY + 298);

  // Items Table Header
  const tableY = 630;
  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 24px sans-serif';
  ctx1.fillText('POLOŽKY VYÚČTOVÁNÍ:', 80, tableY);

  const thY = tableY + 20;
  ctx1.fillStyle = '#1e293b';
  ctx1.fillRect(80, thY, A4_W - 160, 50);

  ctx1.fillStyle = '#ffffff';
  ctx1.font = 'bold 20px sans-serif';
  ctx1.fillText('POPIS SLUŽBY / POLOŽKA', 105, thY + 33);
  ctx1.fillText('MNOŽSTVÍ', 950, thY + 33);
  ctx1.fillText('CENA ZA JEDN.', 1170, thY + 33);
  ctx1.fillText('CELKEM', 1420, thY + 33);

  // Items Rows
  let curY = thY + 50;
  let invoiceTotal = 0;

  invoice.items.forEach((item, idx) => {
    const rowTotal = item.quantity * item.unitPrice;
    invoiceTotal += rowTotal;

    ctx1.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    ctx1.fillRect(80, curY, A4_W - 160, 55);

    ctx1.strokeStyle = '#e2e8f0';
    ctx1.lineWidth = 1;
    ctx1.strokeRect(80, curY, A4_W - 160, 55);

    ctx1.fillStyle = '#0f172a';
    ctx1.font = 'bold 22px sans-serif';
    ctx1.fillText(item.description, 105, curY + 36);

    ctx1.fillStyle = '#475569';
    ctx1.font = '22px sans-serif';
    ctx1.fillText(`${item.quantity} ks`, 970, curY + 36);

    ctx1.fillStyle = '#334155';
    ctx1.font = '22px monospace';
    ctx1.fillText(`${item.unitPrice.toLocaleString('cs-CZ')} Kč`, 1170, curY + 36);

    ctx1.fillStyle = '#0f172a';
    ctx1.font = 'bold 23px monospace';
    ctx1.fillText(`${rowTotal.toLocaleString('cs-CZ')} Kč`, 1400, curY + 36);

    curY += 55;
  });

  // Table Total Footer Row
  ctx1.fillStyle = '#eef2ff';
  ctx1.strokeStyle = '#4338ca';
  ctx1.lineWidth = 2.5;
  roundRect(ctx1, 80, curY + 15, A4_W - 160, 80, 16, true, true);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 28px sans-serif';
  ctx1.fillText('CELKEM K ÚHRADĚ:', 110, curY + 65);

  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 38px monospace';
  ctx1.fillText(`${invoiceTotal.toLocaleString('cs-CZ')} Kč`, 1280, curY + 68);

  // Payment Instruction Callout Box
  const calloutY = curY + 125;
  ctx1.fillStyle = '#f1f5f9';
  ctx1.strokeStyle = '#cbd5e1';
  ctx1.lineWidth = 2;
  roundRect(ctx1, 80, calloutY, A4_W - 160, 180, 20, true, true);

  ctx1.fillStyle = '#334155';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText('Platební pokyny pro bezhotovostní převod:', 110, calloutY + 45);

  ctx1.font = '22px sans-serif';
  ctx1.fillText(`Bankovní účet:  ${invoice.supplierAccount || '1234567890/0300'}`, 110, calloutY + 85);
  ctx1.fillText(`Variabilní symbol:  ${invoice.variableSymbol || invoice.invoiceNumber}  |  Splatnost do: ${new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}`, 110, calloutY + 125);
  ctx1.fillStyle = '#64748b';
  ctx1.font = 'italic 20px sans-serif';
  ctx1.fillText(invoice.notes || 'Děkujeme za spolupráci.', 110, calloutY + 160);

  // Bottom Signature area
  const signY = A4_H - 180;
  ctx1.strokeStyle = '#cbd5e1';
  ctx1.lineWidth = 2;
  ctx1.beginPath();
  ctx1.moveTo(80, signY);
  ctx1.lineTo(A4_W - 80, signY);
  ctx1.stroke();

  ctx1.fillStyle = '#64748b';
  ctx1.font = '20px sans-serif';
  ctx1.fillText(`Vystavil: ${invoice.supplierName || 'Zvukový mistr'}`, 80, signY + 50);
  ctx1.fillText('StageMaster Pro • Daňový doklad & Vyúčtování', 80, signY + 90);

  ctx1.fillText('Podpis a razítko vystavitele:', A4_W - 450, signY + 50);
  ctx1.strokeStyle = '#94a3b8';
  ctx1.lineWidth = 1.5;
  ctx1.beginPath();
  ctx1.moveTo(A4_W - 450, signY + 120);
  ctx1.lineTo(A4_W - 80, signY + 120);
  ctx1.stroke();

  // Add Page 1 to PDF
  const page1Data = canvas1.toDataURL('image/jpeg', 0.95);
  pdf.addImage(page1Data, 'JPEG', 0, 0, 210, 297);

  // -------------------------------------------------------------
  // PAGE 2: STAGE PLÁN & INPUT LIST XR18 & CHECKLIST DO AUTA
  // -------------------------------------------------------------
  pdf.addPage();
  const canvas2 = document.createElement('canvas');
  canvas2.width = A4_W;
  canvas2.height = A4_H;
  const ctx2 = canvas2.getContext('2d');
  if (!ctx2) {
    pdf.save(`Faktura_StagePlan_${(bandName || 'Akce').replace(/\s+/g, '_')}.pdf`);
    return;
  }

  // Background
  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(0, 0, A4_W, A4_H);

  // Top accent bar
  ctx2.fillStyle = '#0284c7';
  ctx2.fillRect(0, 0, A4_W, 24);

  // Header Page 2
  ctx2.fillStyle = '#0284c7';
  ctx2.font = 'bold 22px sans-serif';
  ctx2.fillText('PŘÍLOHA K FAKTUŘE • TECHNICKÝ RIDER', 80, 80);

  ctx2.fillStyle = '#0f172a';
  ctx2.font = 'bold 50px sans-serif';
  ctx2.fillText(`Stage Plán & Input List — ${bandName || 'Kapela'}`, 80, 145);

  ctx2.fillStyle = '#475569';
  ctx2.font = 'bold 24px sans-serif';
  ctx2.fillText(`Mixážní pult: Behringer XR18 Digital  |  Datum: ${new Date(invoice.eventDate).toLocaleDateString('cs-CZ')}`, 80, 185);

  // Divider
  ctx2.strokeStyle = '#cbd5e1';
  ctx2.lineWidth = 2;
  ctx2.beginPath();
  ctx2.moveTo(80, 220);
  ctx2.lineTo(A4_W - 80, 220);
  ctx2.stroke();

  // Input List Table (CH 1..16)
  const inputListY = 260;
  ctx2.fillStyle = '#0f172a';
  ctx2.font = 'bold 26px sans-serif';
  ctx2.fillText('INPUT LIST — ZAPOJENÍ VSTUPŮ PULTU BEHRINGER XR18 (CH 1–16):', 80, inputListY);

  const inThY = inputListY + 20;
  ctx2.fillStyle = '#0369a1';
  ctx2.fillRect(80, inThY, A4_W - 160, 48);

  ctx2.fillStyle = '#ffffff';
  ctx2.font = 'bold 20px sans-serif';
  ctx2.fillText('CH #', 105, inThY + 32);
  ctx2.fillText('NÁSTROJ / ZDROJ', 210, inThY + 32);
  ctx2.fillText('SNÍMÁNÍ / MODEL MIKROFONU / PŘÍMÁ LINKA', 620, inThY + 32);
  ctx2.fillText('48V', 1190, inThY + 32);
  ctx2.fillText('KABELÁŽ', 1320, inThY + 32);

  const sortedPatched = [...allInstrumentChannels]
    .filter((c) => c.channel.assignedChannelNumber)
    .sort((a, b) => (a.channel.assignedChannelNumber || 0) - (b.channel.assignedChannelNumber || 0));

  let inRowY = inThY + 48;
  sortedPatched.forEach(({ item, channel }, idx) => {
    ctx2.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    ctx2.fillRect(80, inRowY, A4_W - 160, 44);

    ctx2.strokeStyle = '#e2e8f0';
    ctx2.lineWidth = 1;
    ctx2.strokeRect(80, inRowY, A4_W - 160, 44);

    // Channel badge
    ctx2.fillStyle = '#0369a1';
    ctx2.font = 'bold 22px monospace';
    ctx2.fillText(`CH ${channel.assignedChannelNumber}`, 105, inRowY + 30);

    // Instrument Name
    ctx2.fillStyle = '#0f172a';
    ctx2.font = 'bold 20px sans-serif';
    const fullName = item.name + (item.channels.length > 1 ? ` (${channel.name})` : '');
    ctx2.fillText(fullName.slice(0, 32), 210, inRowY + 30);

    // Pickup Model
    ctx2.fillStyle = '#334155';
    ctx2.font = '20px sans-serif';
    const pickupDesc =
      channel.pickupType === 'line_xlr'
        ? (channel.micModel || 'Přímá XLR linka (DI Out)')
        : channel.pickupType === 'line_jack' || channel.pickupType === 'line'
        ? (channel.micModel || 'Linka Jack 6.3mm')
        : (channel.micModel || 'Mikrofon');
    ctx2.fillText(pickupDesc.slice(0, 42), 620, inRowY + 30);

    // 48V
    if (channel.needsPhantom48V) {
      ctx2.fillStyle = '#dc2626';
      ctx2.font = 'bold 18px sans-serif';
      ctx2.fillText('+48V', 1190, inRowY + 30);
    } else {
      ctx2.fillStyle = '#94a3b8';
      ctx2.font = '20px sans-serif';
      ctx2.fillText('-', 1205, inRowY + 30);
    }

    // Cable
    ctx2.fillStyle = '#475569';
    ctx2.font = '20px monospace';
    const cableTypeStr = (channel.pickupType === 'line_jack' || channel.pickupType === 'line') ? 'Jack 6.3' : 'XLR';
    ctx2.fillText(`${cableTypeStr} (${channel.cableLengthMeters || 10}m)`, 1320, inRowY + 30);

    inRowY += 44;
  });

  if (sortedPatched.length === 0) {
    ctx2.fillStyle = '#64748b';
    ctx2.font = 'italic 22px sans-serif';
    ctx2.fillText('Zatím nebyly přiřazeny žádné kanály do XR18.', 120, inRowY + 35);
    inRowY += 50;
  }

  // Outputs Section
  const outY = inRowY + 40;
  ctx2.fillStyle = '#0f172a';
  ctx2.font = 'bold 26px sans-serif';
  ctx2.fillText('VÝSTUPY & MONITORING (MAIN PA A ODPOSLECHY AUX 1–6):', 80, outY);

  const outputs = items.filter((i) => i.assignedOutputPort);
  let curOutY = outY + 20;

  outputs.forEach((outItem) => {
    ctx2.fillStyle = '#f8fafc';
    ctx2.strokeStyle = '#cbd5e1';
    ctx2.lineWidth = 1.5;
    roundRect(ctx2, 80, curOutY, A4_W - 160, 48, 10, true, true);

    ctx2.fillStyle = '#0284c7';
    ctx2.font = 'bold 20px monospace';
    ctx2.fillText(outItem.assignedOutputPort || '', 105, curOutY + 32);

    ctx2.fillStyle = '#0f172a';
    ctx2.font = 'bold 20px sans-serif';
    ctx2.fillText(outItem.name, 260, curOutY + 32);

    ctx2.fillStyle = outItem.speakerType === 'passive' ? '#c2410c' : '#0284c7';
    ctx2.font = 'bold 19px sans-serif';
    ctx2.fillText(
      outItem.speakerType === 'passive' ? '🔊 Pasivní bedna (Kabel Speakon)' : '⚡ Aktivní bedna (XLR signál + 230V)',
      620,
      curOutY + 32
    );

    if (outItem.targetPerformer) {
      ctx2.fillStyle = '#64748b';
      ctx2.font = 'italic 19px sans-serif';
      ctx2.fillText(`Pro: ${outItem.targetPerformer}`, 1150, curOutY + 32);
    }

    curOutY += 56;
  });

  if (outputs.length === 0) {
    ctx2.fillStyle = '#64748b';
    ctx2.font = 'italic 20px sans-serif';
    ctx2.fillText('Nebyly nastaveny žádné výstupy.', 105, curOutY + 30);
    curOutY += 40;
  }

  // Equipment Checklist Box
  const checkY = curOutY + 30;
  ctx2.fillStyle = '#fefce8';
  ctx2.strokeStyle = '#fef08a';
  ctx2.lineWidth = 2;
  roundRect(ctx2, 80, checkY, A4_W - 160, 320, 20, true, true);

  ctx2.fillStyle = '#854d0e';
  ctx2.font = 'bold 24px sans-serif';
  ctx2.fillText('SEZNAM TECHNIKY K NALOŽENÍ DO AUTA (CHECKLIST):', 110, checkY + 45);

  // 4 Badges in Checklist
  const badgeW = 330;
  const badgeH = 80;
  const badgeY = checkY + 70;

  // 1. XLR
  ctx2.fillStyle = '#e0f2fe';
  ctx2.strokeStyle = '#7dd3fc';
  roundRect(ctx2, 110, badgeY, badgeW, badgeH, 12, true, true);
  ctx2.fillStyle = '#0369a1';
  ctx2.font = 'bold 18px sans-serif';
  ctx2.fillText('XLR KABELY:', 125, badgeY + 32);
  ctx2.font = 'bold 30px monospace';
  ctx2.fillText(`${totalXlrRequired} ks`, 125, badgeY + 68);

  // 2. Speakon
  ctx2.fillStyle = '#ffedd5';
  ctx2.strokeStyle = '#fdba74';
  roundRect(ctx2, 470, badgeY, badgeW, badgeH, 12, true, true);
  ctx2.fillStyle = '#c2410c';
  ctx2.font = 'bold 18px sans-serif';
  ctx2.fillText('SPEAKON KABELY:', 485, badgeY + 32);
  ctx2.font = 'bold 30px monospace';
  ctx2.fillText(`${totalSpeakonRequired} ks`, 485, badgeY + 68);

  // 3. Jack 6.3mm
  ctx2.fillStyle = '#fef9c3';
  ctx2.strokeStyle = '#fde047';
  roundRect(ctx2, 830, badgeY, badgeW, badgeH, 12, true, true);
  ctx2.fillStyle = '#a16207';
  ctx2.font = 'bold 18px sans-serif';
  ctx2.fillText('JACK 6.3MM:', 845, badgeY + 32);
  ctx2.font = 'bold 30px monospace';
  ctx2.fillText(`${totalJackRequired} ks`, 845, badgeY + 68);

  // 4. Prodlužky 230V
  ctx2.fillStyle = '#fee2e2';
  ctx2.strokeStyle = '#fca5a5';
  roundRect(ctx2, 1190, badgeY, badgeW, badgeH, 12, true, true);
  ctx2.fillStyle = '#b91c1c';
  ctx2.font = 'bold 18px sans-serif';
  ctx2.fillText('PRODLUŽKY 230V:', 1205, badgeY + 32);
  ctx2.font = 'bold 30px monospace';
  ctx2.fillText(`${totalPowerStrips} ks`, 1205, badgeY + 68);

  // Detail lines below badges
  ctx2.fillStyle = '#334155';
  ctx2.font = 'bold 20px sans-serif';
  ctx2.fillText('Potřebné mikrofony:', 110, checkY + 195);
  ctx2.font = '19px sans-serif';
  const micListStr = Object.entries(micCounts)
    .map(([m, c]) => `${m}: ${c}×`)
    .join('  •  ') || 'Žádné mikrofony';
  ctx2.fillText(micListStr.slice(0, 110), 110, checkY + 230);

  ctx2.font = 'bold 20px sans-serif';
  ctx2.fillText('Mikrofonní stojany:', 110, checkY + 265);
  ctx2.font = '19px sans-serif';
  const standListStr = Object.entries(standCounts)
    .map(([s, c]) => `${s}: ${c}×`)
    .join('  •  ') || 'Stojany netřeba';
  ctx2.fillText(standListStr.slice(0, 110), 110, checkY + 295);

  // Add Page 2 to PDF
  const page2Data = canvas2.toDataURL('image/jpeg', 0.95);
  pdf.addImage(page2Data, 'JPEG', 0, 0, 210, 297);

  // Download PDF file
  const fileName = `Faktura_StagePlan_${(bandName || 'Akce').replace(/\s+/g, '_')}.pdf`;
  pdf.save(fileName);
}

// Helper for drawing rounded rectangles on Canvas
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
