import { useCallback, useEffect, useRef, useState } from "react";
import { Repeat2, Send, Sparkles } from "lucide-react";

import { CountdownRing } from "./CountdownRing";

const ANSWER_SECONDS = 90;

type AiState = "speaking" | "listening";

interface InterviewScreenProps {
  stream: MediaStream;
  questions: string[];
  title: string;
  onFinished: () => void;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

export function InterviewScreen({ stream, questions, title, onFinished }: InterviewScreenProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [aiState, setAiState] = useState<AiState>("speaking");
  const [secondsLeft, setSecondsLeft] = useState(ANSWER_SECONDS);
  const [lastAdvance, setLastAdvance] = useState<"manual" | "auto" | null>(null);

  const timerRef = useRef<number | null>(null);
  const speakingRef = useRef(false);
  const finishedRef = useRef(false);
  const advanceRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    speakingRef.current = false;
  }, []);

  const startListening = useCallback(() => {
    if (advanceRef.current) return;
    advanceRef.current = true;
    speakingRef.current = false;
    clearTimer();
    setAiState("listening");
    setSecondsLeft(ANSWER_SECONDS);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
  }, [clearTimer]);

  const speakQuestion = useCallback(
    (text: string) => {
      advanceRef.current = false;
      clearTimer();
      stopSpeaking();
      setAiState("speaking");
      setSecondsLeft(ANSWER_SECONDS);
      setLastAdvance(null);

      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        // No speech support — go straight to the answer window.
        startListening();
        return;
      }

      speakingRef.current = true;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      utterance.onend = () => {
        if (speakingRef.current) startListening();
      };
      utterance.onerror = () => {
        if (speakingRef.current) startListening();
      };
      window.speechSynthesis.speak(utterance);

      // Safety net: some engines never fire onend (e.g. no voices available).
      const estimatedMs = Math.max(6000, text.split(/\s+/).length * 420 + 2500);
      window.setTimeout(() => {
        if (speakingRef.current) startListening();
      }, estimatedMs);
    },
    [clearTimer, stopSpeaking, startListening],
  );

  const advance = useCallback(
    (mode: "manual" | "auto") => {
      if (finishedRef.current) return;
      clearTimer();
      stopSpeaking();
      if (questionIndex >= questions.length - 1) {
        finishedRef.current = true;
        onFinished();
        return;
      }
      setLastAdvance(mode);
      setQuestionIndex((i) => i + 1);
    },
    [clearTimer, stopSpeaking, questionIndex, questions.length, onFinished],
  );

  // Speak each question as it appears.
  useEffect(() => {
    speakQuestion(questions[questionIndex] ?? "");
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex]);

  // Auto-advance when the answer window runs out.
  useEffect(() => {
    if (aiState === "listening" && secondsLeft === 0) {
      advance("auto");
    }
  }, [aiState, secondsLeft, advance]);

  // Final cleanup on unmount.
  useEffect(
    () => () => {
      clearTimer();
      stopSpeaking();
    },
    [clearTimer, stopSpeaking],
  );

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const question = questions[questionIndex] ?? "";
  const speaking = aiState === "speaking";

  return (
    <div className="animate-rise">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <span className="badge-neon">
          <Sparkles className="h-3.5 w-3.5" />
          {title}
        </span>
        <div className="flex items-center gap-2" aria-label={`Question ${questionIndex + 1} of ${questions.length}`}>
          {questions.map((_, i) => (
            <span
              key={i}
              className={
                i < questionIndex
                  ? "h-2 w-2 rounded-full bg-neon-emerald"
                  : i === questionIndex
                    ? "h-2.5 w-2.5 rounded-full bg-neon-cyan glow-cyan"
                    : "h-2 w-2 rounded-full border border-glass-border bg-glass-strong"
              }
            />
          ))}
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            Question {questionIndex + 1} of {questions.length}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main panel: live camera feed (local only) */}
        <section className="glass-panel relative overflow-hidden rounded-4xl">
          <div className="aspect-video w-full bg-glass-strong">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>
          <span className="glass-chip absolute left-4 top-4">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-blink" />
            Live camera
          </span>
          {aiState === "listening" && (
            <span className="glass-chip absolute right-4 top-4 text-neon-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-emerald animate-blink" />
              {lastAdvance === "auto" ? "Auto-submitted" : "Recording response…"}
            </span>
          )}
        </section>

        {/* AI panel */}
        <aside className="flex flex-col gap-6">
          <section className="glass-panel rounded-4xl p-6">
            <div className="flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0">
                <div
                  className={`ai-orb-glow-${speaking ? "speaking" : "listening"} absolute inset-0 rounded-full animate-pulse-glow blur-md`}
                />
                <div
                  className={`absolute inset-2 rounded-full border ${
                    speaking ? "border-neon-cyan/50" : "border-neon-emerald/50"
                  } bg-glass-strong`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles
                    className={`h-6 w-6 ${speaking ? "text-neon-cyan" : "text-neon-emerald"}`}
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${speaking ? "text-neon-cyan" : "text-neon-emerald"}`}
                >
                  {speaking ? "AI is speaking" : "Recording response…"}
                </p>
                <div className="mt-2 flex h-6 items-end gap-1" aria-hidden>
                  {[0.9, 0.5, 1.1, 0.7, 1.3, 0.6, 1.0].map((scale, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full ${speaking ? "bg-neon-cyan/70 animate-wave" : "bg-neon-emerald/40"}`}
                      style={{
                        height: `${scale * 100}%`,
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel flex-1 rounded-4xl p-6">
            <span className="badge-neon">
              Question {questionIndex + 1} of {questions.length}
            </span>
            <h2 className="mt-4 text-lg font-semibold leading-relaxed" aria-live="polite">
              {question}
            </h2>
            <button
              type="button"
              className="btn-ghost mt-5 w-full text-sm"
              onClick={() => speakQuestion(question)}
            >
              <Repeat2 className="h-4 w-4" />
              Replay Question Audio
            </button>
          </section>

          <section className="glass-panel flex items-center gap-5 rounded-4xl p-6">
            <CountdownRing remaining={secondsLeft} total={ANSWER_SECONDS} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Answer time</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Your answer auto-submits when the ring empties, or submit early
                whenever you finish speaking.
              </p>
            </div>
          </section>

          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => advance("manual")}
            disabled={speaking}
          >
            <Send className="h-4.5 w-4.5" />
            Submit Answer &amp; Next Question
          </button>
        </aside>
      </div>
    </div>
  );
}
