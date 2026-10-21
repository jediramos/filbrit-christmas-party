/** Server-only: reads secret codes from the environment, so never import this from client components. */
const ACCESS_CODE_ENV: Record<string, string> = {
  "committee-family": "COMMITTEE_FAMILY_ACCESS_CODE",
  performers: "PERFORMERS_ACCESS_CODE",
};

const normalise = (code: string) => code.trim().toLowerCase();

/** Ticket ids unlocked by any of `codes`. A stage whose env var is empty stays locked. */
export function unlockedStageIds(codes: string[]): string[] {
  const entered = new Set(codes.map(normalise).filter(Boolean));
  return Object.entries(ACCESS_CODE_ENV)
    .filter(([, envName]) => {
      const expected = normalise(process.env[envName] ?? "");
      return expected !== "" && entered.has(expected);
    })
    .map(([stageId]) => stageId);
}
