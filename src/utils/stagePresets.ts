import { InteractiveStageItem, InstrumentChannel } from '../types/interactiveStage';

export function getPresetInstrument(
  subType: string,
  existingItems: InteractiveStageItem[]
): Partial<InteractiveStageItem> {
  const count = existingItems.filter((i) => i.subType === subType).length;
  const suffix = count > 0 ? ` ${count + 1}` : '';

  switch (subType) {
    case 'drums':
      return {
        name: `Bicí souprava${suffix}`,
        category: 'instrument',
        subType: 'drums',
        x: 50,
        y: 25,
        rotation: 0,
        needsPower230V: false,
        channels: [
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
      };

    case 'guitar_amp':
      return {
        name: `Kytarové kombo${suffix}`,
        category: 'instrument',
        subType: 'guitar_amp',
        x: 25,
        y: 40,
        rotation: 0,
        needsPower230V: true,
        channels: [
          {
            id: 'ch-g1-' + Date.now(),
            name: 'Kombo mikrofon',
            pickupType: 'mic',
            micModel: 'Sennheiser e906 (Kytarový aparát)',
            stand: 'low_boom',
          },
        ],
      };

    case 'bass_amp':
      return {
        name: `Baskytara${suffix}`,
        category: 'instrument',
        subType: 'bass_amp',
        x: 75,
        y: 40,
        rotation: 0,
        needsPower230V: true,
        channels: [
          {
            id: 'ch-b1-' + Date.now(),
            name: 'Basa XLR DI Out',
            pickupType: 'line_xlr',
            micModel: 'Přímý XLR výstup (Direct Out)',
            stand: 'none',
          },
        ],
      };

    case 'keyboard':
      return {
        name: `Klávesy Stereo${suffix}`,
        category: 'instrument',
        subType: 'keyboard',
        x: 80,
        y: 60,
        rotation: 0,
        needsPower230V: true,
        channels: [
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
      };

    case 'acoustic_guitar':
      return {
        name: `Akustická kytara${suffix}`,
        category: 'instrument',
        subType: 'acoustic_guitar',
        x: 35,
        y: 60,
        rotation: 0,
        needsPower230V: false,
        channels: [
          {
            id: 'ch-a1-' + Date.now(),
            name: 'Akustika linka',
            pickupType: 'line_jack',
            micModel: 'Linka Jack 6.3mm / Piezo',
            stand: 'none',
          },
        ],
      };

    case 'lead_vox':
      return {
        name: `Hlavní zpěv${suffix}`,
        category: 'vocal',
        subType: 'lead_vox',
        x: 50,
        y: 75,
        rotation: 0,
        needsPower230V: false,
        channels: [
          {
            id: 'ch-v1-' + Date.now(),
            name: 'Hlavní zpěv',
            pickupType: 'mic',
            micModel: 'Shure SM58 (Zpěv dynamický)',
            stand: 'high_boom',
          },
        ],
      };

    case 'backing_vox':
      return {
        name: `Doprovodný zpěv${suffix}`,
        category: 'vocal',
        subType: 'backing_vox',
        x: 30,
        y: 70,
        rotation: 0,
        needsPower230V: false,
        channels: [
          {
            id: 'ch-v2-' + Date.now(),
            name: 'Doprovodný zpěv',
            pickupType: 'mic',
            micModel: 'Shure SM58 (Zpěv dynamický)',
            stand: 'high_boom',
          },
        ],
      };

    case 'power_source':
      return {
        name: `Přípojka 230V${suffix}`,
        category: 'power_source',
        subType: 'power_source',
        x: count === 0 ? 12 : 88,
        y: 18,
        needsPower230V: false,
      };

    case 'power_strip':
      return {
        name: `Prodlužka 230V #${count + 1}`,
        category: 'power_strip',
        subType: 'power_strip',
        x: 35 + (count % 3) * 22,
        y: 35 + Math.floor(count / 3) * 25,
        needsPower230V: false,
      };

    case 'iem':
    case 'iem_station': {
      const nextAux = count < 6 ? `Aux ${count + 1}` : 'Aux 1';
      return {
        name: `In-Ear (IEM) ${count + 1}`,
        category: 'iem_station',
        subType: 'iem_station',
        speakerType: 'iem',
        needsPower230V: true,
        x: 35 + (count % 4) * 18,
        y: 75,
        assignedOutputPort: nextAux,
        targetPerformer: `Muzikant ${count + 1}`,
      };
    }

    case 'wedge': {
      const nextAux = count < 6 ? `Aux ${count + 1}` : 'Aux 1';
      return {
        name: `Wedge ${count + 1}`,
        category: 'monitor_wedge',
        subType: 'wedge',
        speakerType: 'active',
        needsPower230V: true,
        x: 30 + (count % 4) * 20,
        y: 80,
        assignedOutputPort: nextAux,
        targetPerformer: `Muzikant ${count + 1}`,
      };
    }

    case 'generic':
    default:
      return {
        name: `Další prvek${suffix}`,
        category: 'instrument',
        subType: 'generic',
        x: 65,
        y: 65,
        rotation: 0,
        needsPower230V: false,
        channels: [
          {
            id: 'ch-c1-' + Date.now(),
            name: 'Vstup 1',
            pickupType: 'mic',
            micModel: 'Shure SM57',
            stand: 'high_boom',
          },
        ],
      };
  }
}
