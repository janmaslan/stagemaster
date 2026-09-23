import { useState, useRef, useEffect, useCallback } from 'react';

// 31 Standard ISO 1/3 Octave Graphic EQ Frequencies
export const ISO_FREQUENCIES = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
  1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000
];

export interface FeedbackEvent {
  id: string;
  frequency: number;
  nearestIsoBand: string;
  dbLevel: number;
  timestamp: string;
  suggestedCut: string;
}

export type SensitivityLevel = 'low' | 'medium' | 'high';

export interface UseFeedbackDetectorReturn {
  isListening: boolean;
  isFrozen: boolean;
  setIsFrozen: (frozen: boolean) => void;
  sensitivity: SensitivityLevel;
  setSensitivity: (level: SensitivityLevel) => void;
  activeFeedback: FeedbackEvent | null;
  feedbackHistory: FeedbackEvent[];
  clearHistory: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  audioError: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isoBandsData: { freq: number; label: string; level: number; isFeedback: boolean }[];
  playTestWhistle: (freq: number) => void;
  isTestTonePlaying: boolean;
}

export function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    const k = hz / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(2)} kHz`;
  }
  return `${Math.round(hz)} Hz`;
}

export function findNearestIsoBand(hz: number): { freq: number; label: string } {
  let closest = ISO_FREQUENCIES[0];
  let minDiff = Math.abs(Math.log10(hz) - Math.log10(closest));

  for (const f of ISO_FREQUENCIES) {
    const diff = Math.abs(Math.log10(hz) - Math.log10(f));
    if (diff < minDiff) {
      minDiff = diff;
      closest = f;
    }
  }

  return {
    freq: closest,
    label: formatFrequency(closest),
  };
}

export function useFeedbackDetector(): UseFeedbackDetectorReturn {
  const [isListening, setIsListening] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');
  const [activeFeedback, setActiveFeedback] = useState<FeedbackEvent | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackEvent[]>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isoBandsData, setIsoBandsData] = useState<{ freq: number; label: string; level: number; isFeedback: boolean }[]>(() =>
    ISO_FREQUENCIES.map((f) => ({ freq: f, label: formatFrequency(f), level: 0, isFeedback: false }))
  );
  const [isTestTonePlaying, setIsTestTonePlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Persistence tracking for feedback confirmation
  const peakPersistenceRef = useRef<{ freq: number; frames: number }>({ freq: 0, frames: 0 });
  const lastActiveFeedbackTimeRef = useRef<number>(0);
  const testOscillatorRef = useRef<OscillatorNode | null>(null);

  const clearHistory = useCallback(() => {
    setFeedbackHistory([]);
  }, []);

  const stopListening = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    setIsListening(false);
    setActiveFeedback(null);
  }, []);

  const playTestWhistle = useCallback((freq: number) => {
    try {
      if (testOscillatorRef.current) {
        testOscillatorRef.current.stop();
        testOscillatorRef.current.disconnect();
        testOscillatorRef.current = null;
        setIsTestTonePlaying(false);
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime); // Gentle volume

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      testOscillatorRef.current = osc;
      setIsTestTonePlaying(true);

      // Auto-stop after 3 seconds
      setTimeout(() => {
        if (testOscillatorRef.current === osc) {
          osc.stop();
          osc.disconnect();
          testOscillatorRef.current = null;
          setIsTestTonePlaying(false);
        }
      }, 3000);
    } catch (e) {
      console.error('Test whistle error:', e);
    }
  }, []);

  const startListening = useCallback(async () => {
    try {
      setAudioError(null);

      // Web Audio Context initialization
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // Request raw microphone input without automatic echo-cancellation or AGC
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      mediaStreamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096; // ~10.7 Hz per bin resolution at 44.1kHz
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setAudioError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Přístup k mikrofonu byl zamítnut. Povolte prosím mikrofon v nastavení prohlížeče.'
          : 'Nepodařilo se spustit mikrofon: ' + (err.message || 'Neznámá chyba')
      );
      setIsListening(false);
    }
  }, []);

  // Main FFT analysis and feedback detection loop
  useEffect(() => {
    if (!isListening) return;

    const analyser = analyserRef.current;
    const audioCtx = audioCtxRef.current;
    if (!analyser || !audioCtx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const floatFreqData = new Float32Array(bufferLength);

    const sampleRate = audioCtx.sampleRate || 44100;
    const nyquist = sampleRate / 2;
    const binWidth = nyquist / bufferLength;

    // Threshold sensitivity config (Prominence above median spectrum floor in dB)
    const thresholdDb = sensitivity === 'high' ? 14 : sensitivity === 'medium' ? 18 : 24;

    const renderLoop = () => {
      if (isFrozen) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      analyser.getFloatFrequencyData(floatFreqData);

      // 1. Calculate 31 ISO bands energy levels
      const newBands = ISO_FREQUENCIES.map((isoFreq) => {
        // 1/3 octave band limits: fl = f0 / 2^(1/6), fh = f0 * 2^(1/6)
        const fLow = isoFreq / 1.122462;
        const fHigh = isoFreq * 1.122462;

        const startBin = Math.max(1, Math.floor(fLow / binWidth));
        const endBin = Math.min(bufferLength - 1, Math.ceil(fHigh / binWidth));

        let maxVal = 0;
        for (let b = startBin; b <= endBin; b++) {
          if (dataArray[b] > maxVal) {
            maxVal = dataArray[b];
          }
        }
        // Normalize 0..100%
        const levelPct = Math.round((maxVal / 255) * 100);
        return {
          freq: isoFreq,
          label: formatFrequency(isoFreq),
          level: levelPct,
          isFeedback: false,
        };
      });

      // 2. Feedback Peak Detection Algorithm
      // Search for dominant tonal resonance between 80 Hz and 14 kHz
      const minBin = Math.floor(80 / binWidth);
      const maxBin = Math.floor(14000 / binWidth);

      let peakVal = -Infinity;
      let peakBin = -1;
      let sumEnergy = 0;
      let countEnergy = 0;

      for (let i = minBin; i <= maxBin; i++) {
        const val = floatFreqData[i];
        if (val > -100) {
          sumEnergy += val;
          countEnergy++;
        }
        if (val > peakVal) {
          peakVal = val;
          peakBin = i;
        }
      }

      const avgEnergy = countEnergy > 0 ? sumEnergy / countEnergy : -80;
      const peakProminence = peakVal - avgEnergy;

      // Check if peak is prominent and loud enough (absolute dBFS > -42 dBFS)
      const isCandidateFeedback = peakVal > -42 && peakProminence > thresholdDb && peakBin > 0;

      let detectedFreq = 0;
      if (isCandidateFeedback) {
        // Parabolic interpolation for sub-bin precision
        const y1 = floatFreqData[peakBin - 1];
        const y2 = floatFreqData[peakBin];
        const y3 = floatFreqData[peakBin + 1];
        const delta = (y3 - y1) / (2 * (2 * y2 - y1 - y3) || 1);
        detectedFreq = (peakBin + delta) * binWidth;

        // Check frequency stability across consecutive frames
        if (Math.abs(detectedFreq - peakPersistenceRef.current.freq) < 60) {
          peakPersistenceRef.current.frames += 1;
        } else {
          peakPersistenceRef.current = { freq: detectedFreq, frames: 1 };
        }
      } else {
        peakPersistenceRef.current.frames = Math.max(0, peakPersistenceRef.current.frames - 1);
      }

      // If peak is sustained for >= 4 frames (~70ms), declare FEEDBACK
      if (peakPersistenceRef.current.frames >= 4 && isCandidateFeedback) {
        const nearest = findNearestIsoBand(detectedFreq);
        const now = Date.now();

        // Mark offending band
        const bandIdx = newBands.findIndex((b) => b.freq === nearest.freq);
        if (bandIdx !== -1) {
          newBands[bandIdx].isFeedback = true;
        }

        // Suggested cut based on prominence
        const cut = peakProminence > 25 ? '-6 dB' : '-3 dB';

        const fbEvent: FeedbackEvent = {
          id: 'fb-' + now,
          frequency: Math.round(detectedFreq),
          nearestIsoBand: nearest.label,
          dbLevel: Math.round(peakVal),
          timestamp: new Date().toLocaleTimeString('cs-CZ'),
          suggestedCut: cut,
        };

        setActiveFeedback(fbEvent);
        lastActiveFeedbackTimeRef.current = now;

        // Add to history if not recently added (< 4 seconds cooldown for same frequency)
        setFeedbackHistory((prev) => {
          const lastSame = prev.find(
            (e) => Math.abs(e.frequency - detectedFreq) < 50 && now - parseInt(e.id.replace('fb-', ''), 10) < 4000
          );
          if (lastSame) return prev;
          return [fbEvent, ...prev.slice(0, 7)];
        });
      } else {
        // Clear active feedback after 1.5 seconds of silence
        if (Date.now() - lastActiveFeedbackTimeRef.current > 1500) {
          setActiveFeedback(null);
        }
      }

      setIsoBandsData(newBands);

      // 3. Render Canvas Spectrum Curve
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          ctx.clearRect(0, 0, w, h);

          // Dark grid lines
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = 1;
          for (let y = 0; y < h; y += h / 5) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // Spectrum curve with gradient
          const gradient = ctx.createLinearGradient(0, 0, 0, h);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.85)');   // Red (high)
          gradient.addColorStop(0.3, 'rgba(245, 158, 11, 0.7)'); // Amber
          gradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.6)'); // Indigo
          gradient.addColorStop(1, 'rgba(30, 27, 75, 0.2)');

          ctx.beginPath();
          ctx.moveTo(0, h);

          // Logarithmic frequency scale mapping
          const minFreqLog = Math.log10(40);
          const maxFreqLog = Math.log10(16000);

          for (let x = 0; x < w; x++) {
            const freqAtX = Math.pow(10, minFreqLog + (x / w) * (maxFreqLog - minFreqLog));
            const bin = Math.min(bufferLength - 1, Math.round(freqAtX / binWidth));
            const val = dataArray[bin]; // 0..255
            const y = h - (val / 255) * h;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          ctx.lineTo(w, h);
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Highlight feedback peak on canvas if active
          if (peakPersistenceRef.current.frames >= 4 && detectedFreq > 0) {
            const peakFreqLog = Math.log10(detectedFreq);
            const peakX = ((peakFreqLog - minFreqLog) / (maxFreqLog - minFreqLog)) * w;

            if (peakX >= 0 && peakX <= w) {
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 3]);
              ctx.beginPath();
              ctx.moveTo(peakX, 0);
              ctx.lineTo(peakX, h);
              ctx.stroke();
              ctx.setLineDash([]);

              // Draw beacon dot
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(peakX, 15, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isListening, isFrozen, sensitivity]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (testOscillatorRef.current) {
        testOscillatorRef.current.stop();
        testOscillatorRef.current.disconnect();
      }
    };
  }, [stopListening]);

  return {
    isListening,
    isFrozen,
    setIsFrozen,
    sensitivity,
    setSensitivity,
    activeFeedback,
    feedbackHistory,
    clearHistory,
    startListening,
    stopListening,
    audioError,
    canvasRef,
    isoBandsData,
    playTestWhistle,
    isTestTonePlaying,
  };
}
