export type EventRow = {
  anonymous_id: string | null;
  event_name: string;
  metadata?: Record<string, unknown> | null;
};
export type RegistrationRow = {
  id: string;
  source: string | null;
  squad_id: string | null;
  referrer_user_id?: string | null;
};
export type Metrics = {
  mode: "LIVE" | "SIMULATION";
  visitors: number;
  diagnosticsStarted: number;
  diagnosticsCompleted: number;
  registrations: number;
  registrationConversion: number;
  invitesShared: number;
  inviteOpens: number;
  inviteRegistrations: number;
  inviteConversion: number;
  squadsCreated: number;
  squadsCompleted: number;
  averageInvitesPerRegistrant: number;
  kFactor: number;
  campusDistribution: Record<string, number>;
  archetypeDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
};
const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);
export function summarize(
  events: EventRow[],
  registrations: RegistrationRow[],
) {
  const unique = (name: string) =>
    new Set(
      events
        .filter((e) => e.event_name === name && e.anonymous_id)
        .map((e) => e.anonymous_id),
    ).size;
  const visitors = unique("landing_view");
  const inviteOpens = unique("squad_invite_opened");
  const invitesShared = events.filter(
    (e) => e.event_name === "squad_invite_shared",
  ).length;
  const inviteRegistrations = registrations.filter(
    (r) => !!r.squad_id && !!r.referrer_user_id,
  ).length;
  return {
    visitors,
    diagnosticsStarted: unique("diagnostic_started"),
    diagnosticsCompleted: unique("diagnostic_completed"),
    registrations: registrations.length,
    registrationConversion: ratio(registrations.length, visitors) * 100,
    invitesShared,
    inviteOpens,
    inviteRegistrations,
    inviteConversion: ratio(inviteRegistrations, inviteOpens) * 100,
    averageInvitesPerRegistrant: ratio(invitesShared, registrations.length),
    kFactor: ratio(
      inviteRegistrations,
      registrations.length - inviteRegistrations,
    ),
  };
}
export const SIMULATED_METRICS: Metrics = {
  mode: "SIMULATION",
  visitors: 1750,
  diagnosticsStarted: 800,
  diagnosticsCompleted: 640,
  registrations: 500,
  registrationConversion: (500 / 1750) * 100,
  invitesShared: 128,
  inviteOpens: 250,
  inviteRegistrations: 75,
  inviteConversion: 30,
  squadsCreated: 90,
  squadsCompleted: 30,
  averageInvitesPerRegistrant: 128 / 500,
  kFactor: 75 / 425,
  campusDistribution: {
    "Campus channel (illustrative)": 300,
    "Community channel (illustrative)": 125,
    "Peer invitations (illustrative)": 75,
  },
  archetypeDistribution: {},
  sourceDistribution: { campus: 300, community: 125, squad_invite: 75 },
};
