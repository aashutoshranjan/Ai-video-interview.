import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { CompletionModal } from "@/components/interview/CompletionModal";
import { DeviceCheckScreen } from "@/components/interview/DeviceCheckScreen";
import { InterviewScreen } from "@/components/interview/InterviewScreen";
import { OrbsBackground } from "@/components/interview/OrbsBackground";
import { WelcomeScreen } from "@/components/interview/WelcomeScreen";
import {
  DEFAULT_QUESTIONS,
  loadRoleQuestions,
  sanitizeName,
  type RoleQuestions,
} from "@/lib/interview-data";

type Stage = "welcome" | "device" | "interview" | "complete";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { role?: string; name?: string } => ({
    role: typeof search["role"] === "string" ? search["role"] : undefined,
    name: typeof search["name"] === "string" ? search["name"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "AI Video Interview | Candidate Assessment" },
      {
        name: "description",
        content:
          "Self-guided AI video interview for candidates: check your camera and microphone, answer five timed questions, and get instant confirmation — all in your browser.",
      },
      { property: "og:title", content: "AI Video Interview | Candidate Assessment" },
      {
        property: "og:description",
        content:
          "Self-guided AI video interview: check your setup, answer five timed questions, and get instant confirmation — all in your browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { role, name } = Route.useSearch();
  const candidateName = sanitizeName(name);

  const [stage, setStage] = useState<Stage>("welcome");
  const [roleData, setRoleData] = useState<RoleQuestions | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load the interview script for the requested role (falls back to defaults).
  useEffect(() => {
    let alive = true;
    setDataLoading(true);
    loadRoleQuestions(role).then((data) => {
      if (!alive) return;
      setRoleData(data);
      setDataLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [role]);

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const startSetup = useCallback(async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      setStream(media);
      setPermissionBlocked(false);
      setStage("device");
    } catch {
      setPermissionBlocked(true);
    }
  }, []);

  const backToWelcome = useCallback(() => {
    stopMedia();
    setStage("welcome");
  }, [stopMedia]);

  const finishInterview = useCallback(() => {
    // Stop all tracks immediately so the camera indicator light turns off.
    stopMedia();
    setStage("complete");
  }, [stopMedia]);

  useEffect(() => () => stopMedia(), [stopMedia]);

  const title = roleData?.title ?? DEFAULT_QUESTIONS.title;
  const questions = roleData?.questions ?? DEFAULT_QUESTIONS.questions;

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <OrbsBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
        {stage === "welcome" && (
          <WelcomeScreen
            title={title}
            candidateName={candidateName}
            loading={dataLoading}
            permissionBlocked={permissionBlocked}
            onStart={startSetup}
          />
        )}
        {stage === "device" && stream && (
          <DeviceCheckScreen
            stream={stream}
            title={title}
            candidateName={candidateName}
            onBegin={() => setStage("interview")}
            onBack={backToWelcome}
          />
        )}
        {stage === "interview" && stream && (
          <InterviewScreen
            stream={stream}
            questions={questions}
            title={title}
            onFinished={finishInterview}
          />
        )}
        {stage === "complete" && <CompletionModal />}
      </div>
    </main>
  );
}
