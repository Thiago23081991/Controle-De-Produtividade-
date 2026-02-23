import { useRef, useCallback } from 'react';

export const useAudio = () => {
    const audioCtxRef = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioCtxRef.current = new AudioContextClass();
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    const playTone = useCallback((freq: number, start: number, duration: number, vol: number = 0.05, type: OscillatorType = 'sine') => {
        const ctx = initAudio();
        if (!ctx) return;

        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

            // Envelope
            gain.gain.setValueAtTime(0, ctx.currentTime + start);
            gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.01);
            gain.gain.setValueAtTime(vol, ctx.currentTime + start + duration - 0.01);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);

            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
        } catch (e) {
            console.error("Audio error:", e);
        }
    }, [initAudio]);

    const playUrnaBeep = useCallback(() => {
        const t = 0.12;
        playTone(1000, 0, t);
        playTone(1250, t, t);
        playTone(1500, t * 2, t * 2.5, 0.07);
    }, [playTone]);

    const playGoalReachedBeep = useCallback(() => {
        const t = 0.15;
        playTone(523.25, 0, 0.4, 0.06, 'triangle');   // C5
        playTone(659.25, t, 0.4, 0.06, 'triangle');   // E5
        playTone(783.99, t * 2, 0.4, 0.06, 'triangle'); // G5
        playTone(1046.50, t * 3, 0.8, 0.06, 'triangle'); // C6
    }, [playTone]);

    const playSuccessBeep = useCallback(() => {
        const ctx = initAudio();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1800, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { console.error(e); }
    }, [initAudio]);

    return { initAudio, playUrnaBeep, playGoalReachedBeep, playSuccessBeep };
};
