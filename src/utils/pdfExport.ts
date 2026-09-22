import jsPDF from 'jspdf';
import { 
  InvoiceData, 
  InteractiveStageItem, 
  InstrumentChannel,
  StageCable 
} from '../types/interactiveStage';

export interface ExportPdfParams {
  bandName: string;
  invoice: InvoiceData;
  items: InteractiveStageItem[];
  allInstrumentChannels: { item: InteractiveStageItem; channel: InstrumentChannel }[];
  totalXlrRequired: number;
  totalSpeakonRequired: number;
  totalJackRequired: number;
  totalPowerStrips: number;
  totalPoweredDevices: number;
  totalDiBoxes?: number;
  totalPowerSources?: number;
  totalIemStations?: number;
  micCounts: Record<string, number>;
  standCounts: Record<string, number>;
}

export interface ExportStagePlanImageParams {
  items: InteractiveStageItem[];
  cables?: StageCable[];
  bandName?: string;
  eventName?: string;
}

const A4_W = 1600;
const A4_H = 2262;

/**
 * High-definition Canvas 2D Stage Layout Exporter
 * Generates an ultra-crisp 1920x1200 PNG diagram of the stage with all instruments,
 * monitors, 230V power points, cables, orientation markers, and legend.
 * 100% immune to CSS parsing bugs (like Tailwind v4 oklch).
 */
export function exportStagePlanImage({
  items,
  cables = [],
  bandName = 'Kapela',
  eventName,
}: ExportStagePlanImageParams): void {
  const W = 1920;
  const H = 1200;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('Nepodařilo se vytvořit canvas pro export obrázku.');
    return;
  }

  // 1. Overall Dark Background
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, W, H);

  // 2. Top Title Bar & Meta
  ctx.save();
  // Pill badge
  ctx.fillStyle = '#4338ca';
  roundRect(ctx, 80, 34, 200, 26, 8, true, false);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('STAGEMASTER PRO', 180, 47);

  // Band Title
  ctx.textAlign = 'left';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillStyle = '#ffffff';
  const titleStr = bandName || 'Koncertní Stage Plán';
  ctx.fillText(titleStr, 80, 96);

  // Subtitle
  const titleW = ctx.measureText(titleStr).width;
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    eventName ? `•  ${eventName}` : '•  Grafické rozmístění pódia, monitoring & kabeláž XR18',
    80 + titleW + 18,
    94
  );

  // Right-aligned meta
  ctx.textAlign = 'right';
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Vygenerováno: ${new Date().toLocaleDateString('cs-CZ')}`, W - 80, 52);
  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('Digitální mixážní pult: Behringer XR18', W - 80, 88);
  ctx.restore();

  // 3. Stage Boundaries & Dimensions
  const stageX = 80;
  const stageY = 125;
  const stageW = W - 160; // 1760px
  const stageH = 880;

  // Stage Floor with Radial Gradient
  ctx.save();
  const grad = ctx.createRadialGradient(
    stageX + stageW / 2,
    stageY + stageH / 2,
    40,
    stageX + stageW / 2,
    stageY + stageH / 2,
    850
  );
  grad.addColorStop(0, '#0d1527');
  grad.addColorStop(1, '#020617');
  ctx.fillStyle = grad;
  roundRect(ctx, stageX, stageY, stageW, stageH, 18, true, false);

  // Subtle Dot Grid
  ctx.fillStyle = '#1e293b';
  for (let gx = stageX + 36; gx < stageX + stageW - 20; gx += 32) {
    for (let gy = stageY + 54; gy < stageY + stageH - 54; gy += 32) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stage Outer Border
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  roundRect(ctx, stageX, stageY, stageW, stageH, 18, false, true);
  ctx.restore();

  // 4. Backstage Header (Top of stage)
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  roundRect(ctx, stageX + 2, stageY + 2, stageW - 4, 38, 16, true, false);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(stageX + 2, stageY + 40);
  ctx.lineTo(stageX + stageW - 2, stageY + 40);
  ctx.stroke();

  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('◄◄ BACKSTAGE (ZÁKULISÍ)', stageX + 25, stageY + 20);

  ctx.textAlign = 'right';
  ctx.fillText('BACKSTAGE (ZÁKULISÍ) ►►', stageX + stageW - 25, stageY + 20);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ZADNÍ ČÁST PÓDIA', stageX + stageW / 2, stageY + 20);
  ctx.restore();

  // 5. Front Stage / Audience Banner (Bottom of stage)
  ctx.save();
  const btmY = stageY + stageH - 44;
  ctx.fillStyle = 'rgba(30, 27, 75, 0.92)';
  roundRect(ctx, stageX + 2, btmY, stageW - 4, 42, 16, true, false);
  ctx.strokeStyle = '#4338ca';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(stageX + 2, btmY);
  ctx.lineTo(stageX + stageW - 2, btmY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#c7d2fe';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('▼▼ PŘEDEK PÓDIA — PUBLIKUM & REŽIE ZVUKU (FOH) ▼▼', stageX + stageW / 2, btmY + 21);
  ctx.restore();

  // Stage Left & Right Side Markers
  ctx.save();
  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('◄ STAGE RIGHT (VLEVO Z POHLEDU PUBLIKA)', stageX + 20, stageY + stageH / 2);
  ctx.textAlign = 'right';
  ctx.fillText('STAGE LEFT (VPRAVO Z POHLEDU PUBLIKA) ►', stageX + stageW - 20, stageY + stageH / 2);
  ctx.restore();

  // 6. Coordinates Helper
  const getItemPos = (item: InteractiveStageItem) => {
    const clampedX = Math.max(5, Math.min(95, item.x ?? 50));
    const clampedY = Math.max(8, Math.min(88, item.y ?? 50));
    const px = stageX + (clampedX / 100) * stageW;
    const py = stageY + (clampedY / 100) * stageH;
    return { px, py };
  };

  // 7. Cables Layer
  const itemMap = new Map<string, InteractiveStageItem>();
  items.forEach((it) => itemMap.set(it.id, it));

  (cables || []).forEach((cable, idx) => {
    const from = itemMap.get(cable.fromId);
    const to = itemMap.get(cable.toId);
    if (!from || !to) return;

    const { px: fx, py: fy } = getItemPos(from);
    const { px: tx, py: ty } = getItemPos(to);

    const dx = tx - fx;
    const dy = ty - fy;
    const offset = ((idx % 5) - 2) * 22;
    const cx1 = fx + dx * 0.25 + offset;
    const cy1 = fy + dy * 0.75 + (dx > 0 ? 35 : -35) + offset;
    const cx2 = fx + dx * 0.75 - offset;
    const cy2 = fy + dy * 0.25 - (dy > 0 ? 35 : -35) - offset;

    // Dark under-halo
    ctx.save();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
    ctx.stroke();

    // Colored cable stroke
    let cableColor = '#38bdf8'; // XLR default
    let pillBg = '#0284c7';
    if (cable.type === 'jack') {
      cableColor = '#facc15';
      pillBg = '#ca8a04';
      ctx.setLineDash([]);
    } else if (cable.type === 'power') {
      cableColor = '#ef4444';
      pillBg = '#b91c1c';
      ctx.setLineDash([8, 6]);
    } else if (cable.type === 'speakon') {
      cableColor = '#fb923c';
      pillBg = '#c2410c';
      ctx.setLineDash([]);
    } else {
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = cableColor;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, tx, ty);
    ctx.stroke();
    ctx.restore();

    // Cable label pill in middle
    const midX = (fx + tx) / 2 + offset * 0.5;
    const midY = (fy + ty) / 2 + offset * 0.5;
    const labelText = cable.label || (cable.type === 'power' ? '230V' : cable.type.toUpperCase());

    ctx.save();
    ctx.font = 'bold 11px sans-serif';
    const textW = ctx.measureText(labelText).width;
    const pillW = textW + 14;
    const pillH = 18;

    ctx.fillStyle = pillBg;
    roundRect(ctx, midX - pillW / 2, midY - pillH / 2, pillW, pillH, 6, true, false);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, midX, midY);
    ctx.restore();
  });

  // 8. Items Layer
  const getSymbol = (item: InteractiveStageItem): string => {
    if (item.speakerType === 'iem' || item.subType === 'iem_station') return '🎧';
    switch (item.subType) {
      case 'drums': return '🥁';
      case 'guitar_amp': return '🎸';
      case 'bass_amp': return '🎸';
      case 'keyboard': return '🎹';
      case 'acoustic_guitar': return '🎸';
      case 'lead_vox':
      case 'backing_vox':
      case 'vocal': return '🎙️';
      case 'pa_speaker': return '🔊';
      case 'wedge':
      case 'monitor_wedge': return '🔊';
      case 'xr18':
      case 'mixer': return '🎛️';
      default: return '🎵';
    }
  };

  items.forEach((item) => {
    const { px, py } = getItemPos(item);

    // Case A: 230V Power Source (Hlavní přípojka)
    if (item.subType === 'power_source' || item.category === 'power_source') {
      ctx.save();
      const pw = 114;
      const ph = 34;
      ctx.fillStyle = '#451a03';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      roundRect(ctx, px - pw / 2, py - ph / 2, pw, ph, 10, true, true);
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⚡ ${item.name}`, px, py);
      ctx.restore();
      return;
    }

    // Case B: 230V Power Strip (Prodlužka)
    if (item.subType === 'power_strip') {
      ctx.save();
      const pw = 84;
      const ph = 28;
      ctx.fillStyle = '#450a0a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      roundRect(ctx, px - pw / 2, py - ph / 2, pw, ph, 10, true, true);
      ctx.fillStyle = '#fee2e2';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = item.name.replace('Prodlužka 230V', '230V').replace('Prodlužka', '230V');
      ctx.fillText(`🔌 ${shortName}`, px, py);
      ctx.restore();
      return;
    }

    // Case C: Standard Instrument / Vocal / Speaker / Mixer Card
    const cardW = 100;
    const cardH = 76;
    const cardX = px - cardW / 2;
    const cardY = py - cardH / 2;

    ctx.save();
    const isMixer = item.subType === 'xr18' || item.subType === 'mixer';
    const isIem = item.speakerType === 'iem' || item.subType === 'iem_station';

    ctx.fillStyle = isMixer ? '#1e1b4b' : isIem ? '#2e1065' : '#0f172a';
    ctx.strokeStyle = isMixer ? '#6366f1' : isIem ? '#a855f7' : '#334155';
    ctx.lineWidth = 2;
    roundRect(ctx, cardX, cardY, cardW, cardH, 12, true, true);

    // Emoji Symbol
    const symbol = getSymbol(item);
    ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, px, py - 9);

    // Label pill at bottom of card
    const labelH = 18;
    const labelW = cardW - 12;
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    roundRect(ctx, px - labelW / 2, cardY + cardH - labelH - 5, labelW, labelH, 5, true, true);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let displayName = item.name;
    if (ctx.measureText(displayName).width > labelW - 6) {
      while (displayName.length > 2 && ctx.measureText(displayName + '…').width > labelW - 6) {
        displayName = displayName.slice(0, -1);
      }
      displayName += '…';
    }
    ctx.fillText(displayName, px, cardY + cardH - labelH / 2 - 5);

    // Channel badge (Top-Left)
    const chNums = item.channels?.map((c) => c.assignedChannelNumber).filter((n): n is number => typeof n === 'number') || [];
    if (chNums.length > 0) {
      const hasPhantom = item.channels?.some((c) => c.needsPhantom48V);
      const chText = `CH ${chNums.join(',')}${hasPhantom ? ' +48V' : ''}`;
      ctx.font = 'bold 9.5px monospace';
      const chW = ctx.measureText(chText).width + 8;
      ctx.fillStyle = '#4338ca';
      roundRect(ctx, cardX - 4, cardY - 8, chW, 16, 4, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(chText, cardX, cardY);
    }

    // Output port badge (Top-Right)
    if (item.assignedOutputPort) {
      const outText = item.assignedOutputPort;
      ctx.font = 'bold 9.5px monospace';
      const outW = ctx.measureText(outText).width + 8;
      ctx.fillStyle = '#0284c7';
      roundRect(ctx, cardX + cardW - outW + 4, cardY - 8, outW, 16, 4, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(outText, cardX + cardW - outW / 2 + 4, cardY);
    } else if (item.needsPower230V) {
      // 230V power required circle indicator
      const pX = cardX + cardW - 3;
      const pY = cardY + 3;
      ctx.fillStyle = item.powerConnectedToId ? '#16a34a' : '#dc2626';
      ctx.beginPath();
      ctx.arc(pX, pY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', pX, pY);
    }

    // Multi-channel badge (Bottom-Right)
    if (item.channels && item.channels.length > 1) {
      const cntText = `${item.channels.length}×`;
      ctx.font = 'bold 9px sans-serif';
      const cntW = ctx.measureText(cntText).width + 6;
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, cardX + cardW - cntW + 4, cardY + cardH - 12, cntW, 14, 4, true, false);
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cntText, cardX + cardW - cntW / 2 + 4, cardY + cardH - 5);
    }

    ctx.restore();
  });

  // 9. Bottom Legend Bar
  ctx.save();
  const legX = 80;
  const legY = 1030;
  const legW = stageW;
  const legH = 135;

  ctx.fillStyle = 'rgba(9, 13, 22, 0.95)';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  roundRect(ctx, legX, legY, legW, legH, 14, true, true);

  // Legend Title
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEGENDA KABELÁŽE & SYMBOLŮ:', legX + 24, legY + 28);

  // Cable samples (Row 1)
  const drawCableSample = (
    color: string,
    dash: number[],
    text: string,
    x: number,
    y: number
  ) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 36, y);
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + 44, y);
    ctx.restore();
  };

  drawCableSample('#38bdf8', [], 'XLR Mikrofonní / Linkový kabel (XR18 In / Out)', legX + 24, legY + 62);
  drawCableSample('#facc15', [], 'Jack 6.3mm Nástrojový kabel (Klávesy, Linky)', legX + 460, legY + 62);
  drawCableSample('#fb923c', [], 'Speakon Reproduktorový kabel (Pasivní PA)', legX + 890, legY + 62);
  drawCableSample('#ef4444', [8, 5], '230V Síťové napájení & prodlužky', legX + 1300, legY + 62);

  // Stats / Counters (Row 2)
  const soundSources = items.filter((i) => ['instrument', 'vocal'].includes(i.category)).length;
  const monitorsCount = items.filter((i) =>
    ['pa_speaker', 'monitor_wedge', 'iem_station'].includes(i.category)
  ).length;
  const pwrCount = items.filter((i) =>
    i.category === 'power_source' || i.category === 'power_strip' || i.subType === 'power_strip' || i.subType === 'power_source'
  ).length;

  ctx.fillStyle = '#64748b';
  ctx.font = '13px sans-serif';
  ctx.fillText(
    `Nástroje & Zpěvy: ${soundSources}   |   Monitoring & PA: ${monitorsCount}   |   Přípojky 230V: ${pwrCount}   |   Kabelové trasy: ${(cables || []).length} ks`,
    legX + 24,
    legY + 98
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('StageMaster Pro • Profesionální ozvučení & technický stage plán', legX + legW - 24, legY + 98);
  ctx.restore();

  // 10. Trigger PNG Download
  const cleanName = (bandName || 'Kapela').trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
  const link = document.createElement('a');
  link.download = `StagePlan_Podium_${cleanName}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Capture 2D Stage Canvas layout and download as high-res PNG image
 * Retained for backward-compatibility; now powered by native Canvas 2D engine
 */
export async function exportStageCanvasImage(
  target?: any,
  bandName = 'Kapela'
): Promise<void> {
  // If called directly with items/cables
  if (target && typeof target === 'object' && Array.isArray(target.items)) {
    exportStagePlanImage({
      items: target.items,
      cables: target.cables,
      bandName: target.bandName || bandName,
      eventName: target.eventName,
    });
    return;
  }

  // Fallback: check window.__STAGE_STATE__
  const winState = typeof window !== 'undefined' ? (window as any).__STAGE_STATE__ : null;
  if (winState && Array.isArray(winState.items)) {
    exportStagePlanImage({
      items: winState.items,
      cables: winState.cables,
      bandName: winState.bandName || bandName,
      eventName: winState.eventName,
    });
    return;
  }

  // Fallback empty stage
  exportStagePlanImage({
    items: [],
    cables: [],
    bandName,
  });
}

/**
 * Render Technical Rider & Input list canvas for PDF
 */
function createRiderCanvas(params: ExportPdfParams, isStandalone = false): HTMLCanvasElement | null {
  const {
    bandName,
    invoice,
    items,
    allInstrumentChannels,
    totalXlrRequired,
    totalSpeakonRequired,
    totalJackRequired,
    totalPowerStrips,
    totalPoweredDevices,
    totalDiBoxes = 0,
    totalPowerSources = 0,
    totalIemStations = 0,
    micCounts,
    standCounts,
  } = params;

  const canvas2 = document.createElement('canvas');
  canvas2.width = A4_W;
  canvas2.height = A4_H;
  const ctx2 = canvas2.getContext('2d');
  if (!ctx2) return null;

  // Background
  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(0, 0, A4_W, A4_H);

  // Top accent bar
  ctx2.fillStyle = isStandalone ? '#4338ca' : '#0284c7';
  ctx2.fillRect(0, 0, A4_W, 24);

  // Header
  ctx2.fillStyle = isStandalone ? '#4338ca' : '#0284c7';
  ctx2.font = 'bold 22px sans-serif';
  ctx2.fillText(
    isStandalone
      ? 'OFICIÁLNÍ TECHNICKÝ RIDER • STAGE PLÁN & INPUT LIST'
      : 'PŘÍLOHA K FAKTUŘE • TECHNICKÝ RIDER',
    80,
    80
  );

  ctx2.fillStyle = '#0f172a';
  ctx2.font = 'bold 50px sans-serif';
  ctx2.fillText(`Stage Plán & Input List — ${bandName || 'Kapela'}`, 80, 145);

  ctx2.fillStyle = '#475569';
  ctx2.font = 'bold 24px sans-serif';
  ctx2.fillText(
    `Mixážní pult: Behringer XR18 Digital  |  Datum akce: ${new Date(invoice.eventDate).toLocaleDateString('cs-CZ')}`,
    80,
    185
  );

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
  ctx2.fillStyle = isStandalone ? '#4338ca' : '#0369a1';
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
        : channel.pickupType === 'line_di'
        ? (channel.micModel || 'Jack 6.3mm + DI Box')
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
    const cableTypeStr = (channel.pickupType === 'line_jack' || channel.pickupType === 'line') ? 'Jack 6.3' : (channel.pickupType === 'line_di' ? 'DI+XLR' : 'XLR');
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

    const isSpeakon = outItem.speakerType === 'passive_speakon' || outItem.speakerType === 'passive';
    const isJack = outItem.speakerType === 'passive_jack';
    const isIem = outItem.speakerType === 'iem' || outItem.category === 'iem_station';
    ctx2.fillStyle = isIem ? '#7e22ce' : isSpeakon ? '#c2410c' : isJack ? '#a16207' : '#0284c7';
    ctx2.font = 'bold 19px sans-serif';
    ctx2.fillText(
      isIem
        ? '🎧 In-Ear Monitor (Aux XLR + 230V vysílač)'
        : isSpeakon
        ? '🔊 Pasivní bedna (Kabel Speakon ze zes.)'
        : isJack
        ? '🔌 Pasivní bedna (Kabel Jack 6.3mm ze zes.)'
        : '⚡ Aktivní bedna (XLR signál + 230V)',
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
    ctx2.font = 'italic 22px sans-serif';
    ctx2.fillText('Žádné výstupy nebyly zatím nakonfigurovány.', 120, curOutY + 30);
    curOutY += 45;
  }

  // Equipment packing checklist
  const checkY = curOutY + 30;
  ctx2.fillStyle = '#0f172a';
  ctx2.font = 'bold 26px sans-serif';
  ctx2.fillText('SEZNAM TECHNIKY & KABELÁŽE K NALOŽENÍ (PACKING CHECKLIST):', 80, checkY);

  const badgeY = checkY + 25;
  const badgeW = 320;
  const badgeH = 88;

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
  ctx2.fillText('Pódiové přípojky, DI Boxy & In-Ear:', 110, checkY + 185);
  ctx2.font = '19px sans-serif';
  ctx2.fillText(
    `Přípojky 230V: ${totalPowerSources} ks  •  DI Boxy: ${totalDiBoxes} ks  •  In-Ear stanice: ${totalIemStations} ks  •  Spotřebiče 230V: ${totalPoweredDevices} ks`,
    110,
    checkY + 215
  );

  ctx2.font = 'bold 20px sans-serif';
  ctx2.fillText('Potřebné mikrofony:', 110, checkY + 245);
  ctx2.font = '19px sans-serif';
  const micListStr = Object.entries(micCounts)
    .map(([m, c]) => `${m}: ${c}×`)
    .join('  •  ') || 'Žádné mikrofony';
  ctx2.fillText(micListStr.slice(0, 110), 110, checkY + 270);

  ctx2.font = 'bold 20px sans-serif';
  ctx2.fillText('Mikrofonní stojany:', 110, checkY + 295);
  ctx2.font = '19px sans-serif';
  const standListStr = Object.entries(standCounts)
    .map(([s, c]) => `${s}: ${c}×`)
    .join('  •  ') || 'Stojany netřeba';
  ctx2.fillText(standListStr.slice(0, 110), 110, checkY + 318);

  return canvas2;
}

/**
 * Export ONLY Stage Plan & Technical Rider (1-page PDF without invoice)
 */
export function exportStagePlanOnlyPdf(params: ExportPdfParams): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const canvas = createRiderCanvas(params, true);
  if (!canvas) {
    alert('Nepodařilo se vygenerovat PDF.');
    return;
  }

  const pageData = canvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(pageData, 'JPEG', 0, 0, 210, 297);

  const cleanName = (params.bandName || 'Kapela').trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
  pdf.save(`StagePlan_Rider_${cleanName}.pdf`);
}

/**
 * Export Full 2-page document: Page 1 Invoice + Page 2 Technical Rider & Stage Plan
 */
export function exportInvoiceAndRiderPdf(params: ExportPdfParams): void {
  const { bandName, invoice } = params;
  const pdf = new jsPDF('p', 'mm', 'a4');

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
  const suppBoxY = 250;
  const boxW = 690;
  const boxH = 260;

  // Supplier Box (Dodavatel)
  ctx1.fillStyle = '#f8fafc';
  ctx1.strokeStyle = '#e2e8f0';
  ctx1.lineWidth = 2;
  roundRect(ctx1, 80, suppBoxY, boxW, boxH, 16, true, true);

  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 20px sans-serif';
  ctx1.fillText('DODAVATEL / POSKYTOVATEL ZVUKU:', 110, suppBoxY + 40);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 26px sans-serif';
  ctx1.fillText(invoice.supplierName || 'Jan Novák - Zvukař', 110, suppBoxY + 78);

  ctx1.fillStyle = '#334155';
  ctx1.font = '22px sans-serif';
  ctx1.fillText(`IČO: ${invoice.supplierIco || '-'}   |   DIČ: ${invoice.supplierDic || 'Neplátce DPH'}`, 110, suppBoxY + 118);
  ctx1.fillText(invoice.supplierAddress || 'Praha', 110, suppBoxY + 155);

  ctx1.fillStyle = '#64748b';
  ctx1.font = '20px sans-serif';
  ctx1.fillText(`E-mail: ${invoice.supplierEmail || '-'}  •  Tel: ${invoice.supplierPhone || '-'}`, 110, suppBoxY + 195);
  ctx1.fillText(`Bankovní účet: ${invoice.supplierAccount || '1234567890/0300'}`, 110, suppBoxY + 230);

  // Client Box (Odběratel)
  const clientX = 830;
  ctx1.fillStyle = '#f8fafc';
  ctx1.strokeStyle = '#e2e8f0';
  ctx1.lineWidth = 2;
  roundRect(ctx1, clientX, suppBoxY, boxW, boxH, 16, true, true);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 20px sans-serif';
  ctx1.fillText('ODBĚRATEL / POŘADATEL / KAPELA:', clientX + 30, suppBoxY + 40);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 26px sans-serif';
  ctx1.fillText(invoice.clientName || bandName || 'Pořadatel akce', clientX + 30, suppBoxY + 78);

  ctx1.fillStyle = '#334155';
  ctx1.font = '22px sans-serif';
  if (invoice.clientIco) {
    ctx1.fillText(`IČO: ${invoice.clientIco}`, clientX + 30, suppBoxY + 118);
  } else {
    ctx1.fillText('Koncertní vystoupení & ozvučení', clientX + 30, suppBoxY + 118);
  }
  ctx1.fillText(invoice.clientAddress || 'Místo konání akce', clientX + 30, suppBoxY + 155);

  ctx1.fillStyle = '#4338ca';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText(`Název akce / kapela: ${bandName || 'Koncert'}`, clientX + 30, suppBoxY + 205);

  // Invoice Items Table
  const tableY = suppBoxY + boxH + 40;
  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 26px sans-serif';
  ctx1.fillText('FAKTUROVANÉ POLOŽKY & TECHNICKÉ SLUŽBY:', 80, tableY);

  const thY = tableY + 20;
  ctx1.fillStyle = '#1e1b4b';
  ctx1.fillRect(80, thY, A4_W - 160, 52);

  ctx1.fillStyle = '#ffffff';
  ctx1.font = 'bold 20px sans-serif';
  ctx1.fillText('POPIS SLUŽBY / PRONÁJMU APARATURY', 110, thY + 34);
  ctx1.fillText('POČET', 960, thY + 34);
  ctx1.fillText('CENA / JEDN.', 1120, thY + 34);
  ctx1.fillText('CELKEM', 1370, thY + 34);

  let rowY = thY + 52;
  let totalAmount = 0;

  invoice.items.forEach((item, idx) => {
    const itemTotal = item.quantity * item.unitPrice;
    totalAmount += itemTotal;

    ctx1.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    ctx1.fillRect(80, rowY, A4_W - 160, 56);

    ctx1.strokeStyle = '#e2e8f0';
    ctx1.lineWidth = 1;
    ctx1.strokeRect(80, rowY, A4_W - 160, 56);

    ctx1.fillStyle = '#0f172a';
    ctx1.font = 'bold 22px sans-serif';
    ctx1.fillText(item.description, 110, rowY + 36);

    ctx1.fillStyle = '#475569';
    ctx1.font = '22px sans-serif';
    ctx1.fillText(`${item.quantity} ks`, 975, rowY + 36);
    ctx1.fillText(`${item.unitPrice.toLocaleString('cs-CZ')} Kč`, 1120, rowY + 36);

    ctx1.fillStyle = '#0f172a';
    ctx1.font = 'bold 24px monospace';
    ctx1.fillText(`${itemTotal.toLocaleString('cs-CZ')} Kč`, 1370, rowY + 36);

    rowY += 56;
  });

  // Total Summary Box
  const summaryY = rowY + 30;
  ctx1.fillStyle = '#1e1b4b';
  roundRect(ctx1, A4_W - 650, summaryY, 570, 110, 16, true, false);

  ctx1.fillStyle = '#c7d2fe';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText('CELKEM K ÚHRADĚ:', A4_W - 610, summaryY + 45);

  ctx1.fillStyle = '#ffffff';
  ctx1.font = 'bold 44px monospace';
  ctx1.fillText(`${totalAmount.toLocaleString('cs-CZ')} Kč`, A4_W - 610, summaryY + 92);

  // Bank Info Callout Box
  const calloutY = summaryY + 140;
  ctx1.fillStyle = '#eef2ff';
  ctx1.strokeStyle = '#c7d2fe';
  ctx1.lineWidth = 2;
  roundRect(ctx1, 80, calloutY, A4_W - 160, 180, 16, true, true);

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
  const canvas2 = createRiderCanvas(params, false);
  if (canvas2) {
    pdf.addPage();
    const page2Data = canvas2.toDataURL('image/jpeg', 0.95);
    pdf.addImage(page2Data, 'JPEG', 0, 0, 210, 297);
  }

  // Download PDF file
  const cleanName = (bandName || 'Akce').trim().replace(/[\s/\\?%*:|"<>]+/g, '_');
  const fileName = `Faktura_StagePlan_${cleanName}.pdf`;
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
