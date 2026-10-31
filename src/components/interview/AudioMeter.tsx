import { useEffect, useRef } from "react";

/**
 * Live microphone level meter driven by the Web Audio API. Renders a smooth
 * gradient bar whose width follows the input peak level. Client-only.
 */
export function AudioMeter({ stream }: { stream: MediaStream | null }) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) return;

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (let i = 0; i < data.length; i++) {
        peak = Math.max(peak, Math.abs(data[i] - 128) / 128);
      }
      if (fillRef.current) {
        fillRef.current.style.width = `${Math.min(100, peak * 260)}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      void context.close();
    };
  }, [stream]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium">
        <span className="text-muted-foreground">Microphone level</span>
        <span className="text-neon-cyan">Live</span>
      </div>
      <div className="meter-track h-2.5 w-full overflow-hidden rounded-full">
        <div ref={fillRef} className="meter-fill h-full w-0 rounded-full" />
      </div>
    </div>
  );
}
