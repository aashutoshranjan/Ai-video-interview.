import { Camera, Mic, Sparkles, Volume2, Wifi } from "lucide-react";

interface WelcomeScreenProps {
  title: string;
  candidateName?: string | undefined;
  loading: boolean;
  permissionBlocked: boolean;
  onStart: () => void;
}

const CHECKLIST = [
  { icon: Camera, label: "Webcam", hint: "Your live preview stays on this device" },
  { icon: Mic, label: "Microphone", hint: "Used only for the live level meter" },
  { icon: Volume2, label: "Quiet environment", hint: "Find a calm, well-lit space" },
  { icon: Wifi, label: "Stable connection", hint: "Questions run fully in your browser" },
];

export function WelcomeScreen({
  title,
  candidateName,
  loading,
  permissionBlocked,
  onStart,
}: WelcomeScreenProps) {
  return (
    <div className="mx-auto w-full max-w-xl animate-rise">
      <section className="glass-panel rounded-4xl p-8 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="badge-neon">
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? "Preparing your interview…" : title}
          </span>

          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome{candidateName ? `, ${candidateName}` : ""}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            This is a self-guided AI video interview. Take a moment to check your
            setup — your camera feed never leaves this device and nothing is
            recorded or uploaded.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {CHECKLIST.map(({ icon: Icon, label, hint }) => (
            <li
              key={label}
              className="flex items-start gap-3 rounded-2xl border border-glass-border bg-glass-strong p-4"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neon-cyan/25 bg-neon-cyan/10 text-neon-cyan">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  {hint}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {permissionBlocked && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm"
          >
            <p className="font-semibold text-destructive">
              Camera or microphone access was blocked
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Click the camera icon in your browser's address bar.</li>
              <li>Set both Camera and Microphone to "Allow".</li>
              <li>Refresh this page and press the setup button again.</li>
            </ol>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button type="button" className="btn-primary" onClick={onStart}>
            <Camera className="h-4.5 w-4.5" />
            Check Camera &amp; Start Setup
          </button>
        </div>
      </section>
    </div>
  );
}
