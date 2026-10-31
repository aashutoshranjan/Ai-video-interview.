import { useEffect, useRef } from "react";
import { Camera, Check, Mic, Video } from "lucide-react";

import { AudioMeter } from "./AudioMeter";

interface DeviceCheckScreenProps {
  stream: MediaStream;
  title: string;
  candidateName?: string;
  onBegin: () => void;
  onBack: () => void;
}

export function DeviceCheckScreen({
  stream,
  title,
  candidateName,
  onBegin,
  onBack,
}: DeviceCheckScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="mx-auto w-full max-w-2xl animate-rise">
      <section className="glass-panel rounded-4xl p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="badge-violet badge-neon">
            <Video className="h-3.5 w-3.5" />
            {title}
          </span>
          <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
            You're almost ready{candidateName ? `, ${candidateName}` : ""}
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Check your mirror preview and microphone level. When everything looks
            good, begin the interview.
          </p>
        </div>

        <div className="relative mt-8 overflow-hidden rounded-3xl border border-glass-border shadow-[0_0_60px_-20px_color-mix(in_oklab,var(--neon-cyan)_60%,transparent)]">
          <div className="aspect-video w-full bg-glass-strong">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full scale-x-[-1] object-cover"
            />
          </div>
          <span className="glass-chip absolute left-4 top-4">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-emerald animate-blink" />
            Mirror preview
          </span>
        </div>

        <div className="mt-6">
          <AudioMeter stream={stream} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="badge-neon">
            <Camera className="h-3.5 w-3.5" />
            Camera connected
          </span>
          <span className="badge-emerald badge-neon">
            <Mic className="h-3.5 w-3.5" />
            Microphone connected
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={onBegin}>
            Begin Interview
          </button>
          <button type="button" className="btn-ghost w-full sm:w-auto" onClick={onBack}>
            <Check className="h-4 w-4" />
            Not ready — go back
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your video and audio never leave this device. Nothing is recorded.
        </p>
      </section>
    </div>
  );
}
