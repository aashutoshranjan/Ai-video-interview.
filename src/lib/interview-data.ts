export interface RoleQuestions {
  title: string;
  questions: string[];
}

export const DEFAULT_QUESTIONS: RoleQuestions = {
  title: "General Candidate Assessment",
  questions: [
    "Please introduce yourself and walk us through your professional journey.",
    "Tell us about a challenging technical or workplace problem you solved recently.",
    "How do you prioritize competing deadlines and manage high-pressure situations?",
    "Describe a scenario where you collaborated with a team or resolved a workplace conflict.",
    "Why are you interested in this position and what makes you the right fit for our team?",
  ],
};

/**
 * Loads the interview script for a role slug. Reads /questions.json from the
 * server and falls back to the default set when the fetch fails or the role
 * slug is missing/unknown. Runs client-side only; pure read, no secrets.
 */
export async function loadRoleQuestions(role?: string): Promise<RoleQuestions> {
  const slug = role?.trim().toLowerCase();
  if (!slug) return DEFAULT_QUESTIONS;

  try {
    const response = await fetch("/questions.json", { cache: "no-store" });
    if (!response.ok) return DEFAULT_QUESTIONS;
    const data = (await response.json()) as Record<string, unknown>;
    const entry = data[slug] as Partial<RoleQuestions> | undefined;
    if (
      entry &&
      typeof entry.title === "string" &&
      Array.isArray(entry.questions) &&
      entry.questions.length > 0 &&
      entry.questions.every((q) => typeof q === "string")
    ) {
      return { title: entry.title, questions: entry.questions };
    }
  } catch {
    // Network or parse failure — fall through to the default set.
  }
  return DEFAULT_QUESTIONS;
}

export function sanitizeName(name?: string): string | undefined {
  const trimmed = name?.trim();
  return trimmed ? trimmed.slice(0, 40) : undefined;
}
