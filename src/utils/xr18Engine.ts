import { SelectedInstrument, XR18ChannelPatch, XR18OutputPatch } from '../types/wizard';

export function calculateXR18Patch(instruments: SelectedInstrument[]): {
  channels: XR18ChannelPatch[];
  outputs: XR18OutputPatch[];
  powerDrops: { location: string; reason: string; items: string[] }[];
} {
  const channels: XR18ChannelPatch[] = [];
  let currentCh = 1;

  // 1. Separate instruments by category for logical mixer layout
  const bassList = instruments.filter((i) => i.category === 'bass');
  const drumsList = instruments.filter((i) => i.category === 'drums');
  const guitarsList = instruments.filter((i) => i.category === 'electric_guitar' || i.category === 'acoustic_guitar');
  const keysList = instruments.filter((i) => i.category === 'keys');
  const hornsList = instruments.filter((i) => i.category === 'horns');
  const vocalsList = instruments.filter((i) => i.category === 'vocals');
  const backingList = instruments.filter((i) => i.category === 'backing_track');

  // Check if someone can use Hi-Z on Channel 1 or 2 (Bass or Acoustic Guitar without DI)
  const hizCandidates = [...bassList, ...guitarsList.filter((g) => g.category === 'acoustic_guitar')];
  const useHiZForBass = bassList.length > 0 && bassList[0].connectionType === 'jack_direct_hiz';

  // DRUMS PATCH (Usually Channels 1-8 or 3-10)
  if (drumsList.length > 0) {
    const drum = drumsList[0];
    const option = drum.drumMicsOption || 'basic';

    if (option === 'minimal') {
      channels.push({
        chNumber: currentCh++,
        label: 'Kopák (Kick)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Dynamický mikrofon (např. Beta 52A / D112) položený u otvoru v bláně kopáku.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Snare / Celá souprava',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Mikrofon Shure SM57 na stojánku u malého bubínku, který zachytí i činely.',
      });
    } else if (option === 'basic') {
      channels.push({
        chNumber: currentCh++,
        label: 'Kopák (Kick)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Mikrofon na kopák (Beta 52A, D112). Pevný nízký stojan.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Snare (Malý buben)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Shure SM57 nebo Audix i5 namířený shora na blánu virblu.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Overhead L (Činely vlevo)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: true,
        advice: 'Kondenzátorový mikrofon (Rode NT5, C451). POZOR: Zapni +48V Phantom v aplikaci X-AIR!',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Overhead R (Činely vpravo)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: true,
        advice: 'Kondenzátorový mikrofon. POZOR: Zapni +48V Phantom v aplikaci X-AIR!',
      });
    } else {
      // Full drum kit
      channels.push({
        chNumber: currentCh++,
        label: 'Kopák (Kick)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Mikrofon na kopák (Shure Beta 52A / Audix D6).',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Snare Top (Virbl)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Shure SM57 na ráfku virblu.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Hi-Hat',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: true,
        advice: 'Kondenzátorový mikrofon (tužka). Zapni +48V Phantom v X-AIR.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Tom 1 (Přechod 1)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Sennheiser e604 s klipem přímo na ráfek.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Floor Tom (Kotel)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        advice: 'Sennheiser e604 s klipem přímo na ráfek.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Overhead L (Činely L)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: true,
        advice: 'Kondenzátorový mikrofon. Zapni +48V Phantom.',
      });
      channels.push({
        chNumber: currentCh++,
        label: 'Overhead R (Činely R)',
        sourceInstrumentId: drum.id,
        sourceInstrumentName: drum.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: true,
        advice: 'Kondenzátorový mikrofon. Zapni +48V Phantom.',
      });
    }
  }

  // BASS PATCH
  bassList.forEach((bass) => {
    if (bass.connectionType === 'jack_direct_hiz' && currentCh <= 2) {
      channels.push({
        chNumber: currentCh++,
        label: 'Basa (Hi-Z přímý vstup)',
        sourceInstrumentId: bass.id,
        sourceInstrumentName: bass.name,
        cableType: 'Jack 6.3mm',
        cableLengthMeters: 5,
        needsPhantom48V: false,
        isHiZ: true,
        advice: 'Zapojeno Jack kabelem přímo do vstupu 1 nebo 2 na XR18. Žádný DI box není potřeba!',
      });
    } else {
      channels.push({
        chNumber: currentCh++,
        label: 'Baskytara (DI)',
        sourceInstrumentId: bass.id,
        sourceInstrumentName: bass.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: bass.diType === 'mono_active',
        advice: bass.diType === 'mono_active'
          ? 'Z baskytary vede Jack do aktivního DI boxu, z DI boxu XLR do XR18. Zapni +48V v X-AIR pro napájení DI boxu.'
          : 'Z baskytary/aparátu vede Jack do DI boxu, z DI boxu XLR kabel do XR18.',
      });
    }
  });

  // GUITARS PATCH
  guitarsList.forEach((gtr) => {
    if (gtr.category === 'electric_guitar') {
      channels.push({
        chNumber: currentCh++,
        label: gtr.name || 'Kytarové kombo',
        sourceInstrumentId: gtr.id,
        sourceInstrumentName: gtr.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: false,
        advice: 'Mikrofon (e906 zavěšený na madlu komba nebo SM57 na malém stojanu) propojený XLR kabelem.',
      });
    } else {
      // Acoustic guitar
      channels.push({
        chNumber: currentCh++,
        label: gtr.name || 'Akustická kytara',
        sourceInstrumentId: gtr.id,
        sourceInstrumentName: gtr.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: false,
        advice: 'Z kytary vede Jack do DI boxu, z DI boxu XLR kabel do mixu XR18.',
      });
    }
  });

  // KEYBOARDS PATCH (Stereo or Mono)
  keysList.forEach((keys) => {
    if (keys.connectionType === 'jack_stereo_di') {
      channels.push({
        chNumber: currentCh++,
        label: `${keys.name} (L - Levý kanál)`,
        sourceInstrumentId: keys.id,
        sourceInstrumentName: keys.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: false,
        advice: 'Z výstupu L na klávesách Jackem do Stereo DI boxu, z něj XLR do XR18.',
      });
      channels.push({
        chNumber: currentCh++,
        label: `${keys.name} (R - Pravý kanál)`,
        sourceInstrumentId: keys.id,
        sourceInstrumentName: keys.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: false,
        advice: 'Z výstupu R na klávesách Jackem do Stereo DI boxu, z něj XLR do XR18. V aplikaci X-AIR můžete kanály svázat do sterea.',
      });
    } else {
      channels.push({
        chNumber: currentCh++,
        label: keys.name || 'Klávesy Mono',
        sourceInstrumentId: keys.id,
        sourceInstrumentName: keys.name,
        cableType: 'XLR',
        cableLengthMeters: 10,
        needsPhantom48V: false,
        advice: 'Z výstupu L/Mono na klávesách Jackem do DI boxu, z DI boxu XLR do XR18.',
      });
    }
  });

  // HORNS & OTHERS
  hornsList.forEach((horn) => {
    channels.push({
      chNumber: currentCh++,
      label: horn.name || 'Dechový nástroj',
      sourceInstrumentId: horn.id,
      sourceInstrumentName: horn.name,
      cableType: 'XLR',
      cableLengthMeters: 10,
      needsPhantom48V: false,
      advice: 'Mikrofon (klip na korpus nebo stojan) propojený XLR kabelem.',
    });
  });

  // VOCALS PATCH
  vocalsList.forEach((vox, idx) => {
    channels.push({
      chNumber: currentCh++,
      label: vox.name || (idx === 0 ? 'Hlavní zpěv (Lead)' : `Doprovodný zpěv ${idx}`),
      sourceInstrumentId: vox.id,
      sourceInstrumentName: vox.name,
      cableType: 'XLR',
      cableLengthMeters: 10,
      needsPhantom48V: false,
      advice: 'Zpěvový mikrofon (Shure SM58 / Beta 58A) na vysoké šibenici. Přímo XLR kabel do XR18.',
    });
  });

  // BACKING TRACK / PHONE (Inputs 17/18)
  if (backingList.length > 0) {
    channels.push({
      chNumber: 17,
      label: 'Podkres / Mobil (CH 17/18)',
      sourceInstrumentId: backingList[0].id,
      sourceInstrumentName: backingList[0].name,
      cableType: 'RCA/TRS',
      cableLengthMeters: 3,
      needsPhantom48V: false,
      advice: 'Kabel z mobilu (3.5mm jack -> 2x Jack 6.3mm) zapojený do zdířek LINE IN 17/18 na pravé straně XR18.',
    });
  }

  // OUTPUTS & MONITORING (Main PA + Aux 1-6)
  const outputs: XR18OutputPatch[] = [
    {
      type: 'main_pa',
      portLabel: 'MAIN L',
      destination: 'Hlavní PA repro (Levá strana pódia)',
      cableType: 'XLR',
      advice: 'Z výstupu MAIN L na XR18 natáhni XLR kabel do levé aktivní PA bedny nebo subwooferu.',
    },
    {
      type: 'main_pa',
      portLabel: 'MAIN R',
      destination: 'Hlavní PA repro (Pravá strana pódia)',
      cableType: 'XLR',
      advice: 'Z výstupu MAIN R na XR18 natáhni XLR kabel do pravé aktivní PA bedny nebo subwooferu.',
    },
  ];

  // Assign monitors to Aux 1..6
  let currentAux = 1;
  instruments.forEach((inst) => {
    if (inst.monitorType !== 'none' && currentAux <= 6) {
      outputs.push({
        type: 'aux_monitor',
        portLabel: `AUX ${currentAux}`,
        destination: `Odposlech pro: ${inst.name} (${inst.monitorType === 'wedge' ? 'Podlahový klín' : 'In-Ear sluchátka'})`,
        cableType: 'XLR',
        advice: `Z konektoru AUX ${currentAux} na XR18 natáhni XLR kabel do ${
          inst.monitorType === 'wedge' ? 'aktivního pódiového monitoru (Wedge)' : 'In-Ear vysílače nebo sluchátkového zesilovače'
        }. V aplikaci X-AIR nastavíš pro AUX ${currentAux} poměry nástrojů podle přání muzikanta.`,
      });
      inst.auxNumber = currentAux;
      currentAux++;
    }
  });

  // POWER 230V DISTRIBUTION LOGIC
  const powerDrops: { location: string; reason: string; items: string[] }[] = [];

  // Group power consumers by position
  const leftConsumers = instruments.filter((i) => i.needsPower230V && (i.position === 'left' || i.position === 'back_left'));
  const rightConsumers = instruments.filter((i) => i.needsPower230V && (i.position === 'right' || i.position === 'back_right'));
  const centerConsumers = instruments.filter((i) => i.needsPower230V && (i.position === 'center' || i.position === 'back_center'));

  // Stagebox / XR18 power drop (Always needed!)
  powerDrops.push({
    location: 'U mixpultu Behringer XR18 (obvykle vzadu na pódiu)',
    reason: 'Napájení pro samotný mix XR18 a případný externí Wi-Fi router',
    items: ['Behringer XR18 (síťový kabel)', 'Wi-Fi Router (adaptér)'],
  });

  if (leftConsumers.length > 0) {
    powerDrops.push({
      location: 'Levá strana pódia (Stage Right)',
      reason: 'Prodlužovací pes se zásuvkami pro aparáty a efekty',
      items: leftConsumers.map((c) => c.name),
    });
  }

  if (rightConsumers.length > 0) {
    powerDrops.push({
      location: 'Pravá strana pódia (Stage Left)',
      reason: 'Prodlužovací pes se zásuvkami pro aparáty a klávesy',
      items: rightConsumers.map((c) => c.name),
    });
  }

  if (centerConsumers.length > 0) {
    powerDrops.push({
      location: 'Střed pódia / U bicích',
      reason: 'Zásuvka pro bubeníka nebo efekty uprostřed',
      items: centerConsumers.map((c) => c.name),
    });
  }

  return { channels, outputs, powerDrops };
}
