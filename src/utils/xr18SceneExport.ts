import { InteractiveStageItem, StageCable } from '../types/interactiveStage';

export interface XR18ExportOptions {
  items: InteractiveStageItem[];
  cables?: StageCable[];
  bandName: string;
}

/**
 * Remove diacritics / accents for maximum compatibility with Behringer X-AIR hardware scribble strips
 */
function sanitizeScribbleText(text: string, maxLength = 12): string {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return normalized.slice(0, maxLength);
}

/**
 * Determine X-Air color index (1: Red, 2: Green, 3: Yellow, 4: Blue, 5: Magenta, 6: Cyan, 7: White)
 */
function getChannelColor(subType: string, channelName: string): number {
  const lower = (subType + ' ' + channelName).toLowerCase();

  if (lower.includes('kopak') || lower.includes('kick') || lower.includes('snare') || lower.includes('virbl') || lower.includes('drum') || lower.includes('bici') || lower.includes('tom') || lower.includes('hihat') || lower.includes('overhead')) {
    return 3; // Yellow for Drums
  }
  if (lower.includes('basa') || lower.includes('bass')) {
    return 1; // Red for Bass
  }
  if (lower.includes('kytar') || lower.includes('guitar') || lower.includes('guit') || lower.includes('gtr')) {
    return 2; // Green for Guitars
  }
  if (lower.includes('klaves') || lower.includes('keys') || lower.includes('piano') || lower.includes('synth')) {
    return 5; // Magenta for Keys
  }
  if (lower.includes('zpev') || lower.includes('vox') || lower.includes('vocal') || lower.includes('mic')) {
    return 6; // Cyan for Vocals
  }
  return 7; // White for others
}

/**
 * Determine X-Air icon ID
 */
function getChannelIcon(subType: string, channelName: string): number {
  const lower = (subType + ' ' + channelName).toLowerCase();

  if (lower.includes('kopak') || lower.includes('kick')) return 4;
  if (lower.includes('snare') || lower.includes('virbl')) return 5;
  if (lower.includes('tom')) return 6;
  if (lower.includes('hihat') || lower.includes('hat')) return 7;
  if (lower.includes('overhead') || lower.includes('cymbal') || lower.includes('cinel')) return 8;
  if (lower.includes('drum') || lower.includes('bici')) return 4;

  if (lower.includes('basa') || lower.includes('bass')) return 13;
  if (lower.includes('akust') || lower.includes('acoustic')) return 11;
  if (lower.includes('kytar') || lower.includes('guitar') || lower.includes('gtr')) return 12;
  if (lower.includes('klaves') || lower.includes('keys') || lower.includes('piano')) return 14;
  if (lower.includes('sax') || lower.includes('brass') || lower.includes('dech')) return 15;
  if (lower.includes('zpev') || lower.includes('vox') || lower.includes('vocal')) return 16;

  return 1; // Default mic
}

/**
 * Generate native Behringer X-Air / XR18 scene file text content (.scn)
 */
export function generateXR18SceneFileContent({ items, bandName }: XR18ExportOptions): string {
  const safeBandName = sanitizeScribbleText(bandName || 'StageMaster', 24);
  const lines: string[] = [];

  // 1. Header (Standard X-Air Scene 2.1 format)
  lines.push(`#2.1# "${safeBandName}" "" 0 0 0 0 0`);

  // Map instrument channels by assigned channel number (1 to 16)
  const channelMap: Record<number, { name: string; phantom: boolean; subType: string; pickupType?: string }> = {};

  items.forEach((item) => {
    item.channels?.forEach((ch) => {
      if (ch.assignedChannelNumber && ch.assignedChannelNumber >= 1 && ch.assignedChannelNumber <= 16) {
        channelMap[ch.assignedChannelNumber] = {
          name: ch.name || item.name,
          phantom: Boolean(ch.needsPhantom48V),
          subType: item.subType || 'generic',
          pickupType: ch.pickupType,
        };
      }
    });
  });

  // 2. Channel Configurations (1 to 16)
  for (let chNum = 1; chNum <= 16; chNum++) {
    const chStr = chNum.toString().padStart(2, '0');
    const chData = channelMap[chNum];

    if (chData) {
      const scribble = sanitizeScribbleText(chData.name, 12);
      const color = getChannelColor(chData.subType, chData.name);
      const icon = getChannelIcon(chData.subType, chData.name);

      lines.push(`/ch/${chStr}/config/name "${scribble}"`);
      lines.push(`/ch/${chStr}/config/color ${color}`);
      lines.push(`/ch/${chStr}/config/icon ${icon}`);
      lines.push(`/ch/${chStr}/preamp/rtnsw 0`); // 0 = analog input from XLR/Jack preamp
      lines.push(`/ch/${chStr}/preamp/invert 0`);
      lines.push(`/ch/${chStr}/preamp/hpon 1`);  // HPF ON by default for live sound
      lines.push(`/ch/${chStr}/preamp/hpf 80`);  // 80 Hz standard high-pass
      lines.push(`/ch/${chStr}/mix/on 1`);       // Unmuted
      lines.push(`/ch/${chStr}/mix/fader 0.75`); // 0 dB Unity Gain
      lines.push(`/ch/${chStr}/mix/pan 0.0`);
    } else {
      // Empty channel default
      lines.push(`/ch/${chStr}/config/name "CH ${chNum}"`);
      lines.push(`/ch/${chStr}/config/color 0`);
      lines.push(`/ch/${chStr}/config/icon 1`);
      lines.push(`/ch/${chStr}/mix/on 0`);       // Muted
      lines.push(`/ch/${chStr}/mix/fader 0.0`);  // -inf dB
    }
  }

  // 3. HeadAmp Preamp & Phantom +48V configuration (/headamp/00 to /headamp/15)
  for (let chNum = 1; chNum <= 16; chNum++) {
    const headampStr = (chNum - 1).toString().padStart(2, '0');
    const chData = channelMap[chNum];

    if (chData?.phantom) {
      lines.push(`/headamp/${headampStr}/phantom 1`); // +48V ON
      lines.push(`/headamp/${headampStr}/gain 28.0`);  // ~+28dB default condenser/DI gain
    } else if (chData) {
      lines.push(`/headamp/${headampStr}/phantom 0`); // +48V OFF
      lines.push(`/headamp/${headampStr}/gain 25.0`);  // ~+25dB default dynamic gain
    } else {
      lines.push(`/headamp/${headampStr}/phantom 0`);
      lines.push(`/headamp/${headampStr}/gain 0.0`);
    }
  }

  // 4. Output Busses & Monitoring (Aux 1 to Aux 6)
  const busOutputs: Record<number, string> = {};
  items.forEach((item) => {
    if (item.assignedOutputPort) {
      const match = item.assignedOutputPort.match(/aux\s*(\d)/i);
      if (match) {
        const auxIdx = parseInt(match[1], 10);
        if (auxIdx >= 1 && auxIdx <= 6) {
          const performer = item.targetPerformer ? ` - ${item.targetPerformer}` : '';
          busOutputs[auxIdx] = sanitizeScribbleText(`${item.name}${performer}`, 12);
        }
      }
    }
  });

  for (let bus = 1; bus <= 6; bus++) {
    const busName = busOutputs[bus] || `AUX ${bus}`;
    const busColor = busOutputs[bus] ? 4 : 0; // Blue color for active monitors
    lines.push(`/bus/${bus}/config/name "${busName}"`);
    lines.push(`/bus/${bus}/config/color ${busColor}`);
    lines.push(`/bus/${bus}/mix/on 1`);
    lines.push(`/bus/${bus}/mix/fader 0.75`); // Unity 0dB
  }

  // 5. Main LR Stereo Output
  lines.push(`/lr/config/name "MAIN PA"`);
  lines.push(`/lr/config/color 1`); // Red for Main LR
  lines.push(`/lr/mix/on 1`);
  lines.push(`/lr/mix/fader 0.75`); // Unity 0dB

  return lines.join('\n') + '\n';
}

/**
 * Download XR18 scene file directly in the browser
 */
export function exportXR18SceneFile(options: XR18ExportOptions): void {
  const content = generateXR18SceneFileContent(options);
  const cleanName = (options.bandName || 'StageMaster')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}_XR18.scn`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
