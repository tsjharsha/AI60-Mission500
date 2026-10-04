export type Assumptions = {
  contacts: number;
  visitsPerContact: number;
  campusConversion: number;
  communityVisitors: number;
  communityConversion: number;
  sharingRate: number;
  deliveredInvites: number;
  referralConversion: number;
  overlap: number;
  spent: number;
};
export const BASELINE: Assumptions = {
  contacts: 20,
  visitsPerContact: 50,
  campusConversion: 30,
  communityVisitors: 500,
  communityConversion: 25,
  sharingRate: 30,
  deliveredInvites: 2,
  referralConversion: 29.42,
  overlap: 0,
  spent: 1500,
};
export const BUDGET = [
  {
    label: "Capped campus distribution support",
    amount: 800,
    detail:
      "20 contacts × ₹40; agreed distribution deliverables, not raw signup counts.",
  },
  {
    label: "Reusable creative production",
    amount: 400,
    detail: "Project preview cards and campus-ready copy.",
  },
  {
    label: "Tooling allowance",
    amount: 300,
    detail: "Hosting / AI usage cap. Matching works without paid AI.",
  },
  {
    label: "Recovery reserve",
    amount: 500,
    detail: "Release only after identifying the actual bottleneck.",
  },
];
export const DAYS = [
  [
    "01",
    "Prepare",
    "Recruit campus contacts through clubs and class representatives; prepare project cards and tagged links. No confirmed partners assumed.",
  ],
  [
    "02",
    "Pilot",
    "Try two campus placements of the asset. Measure unique visits and registration conversion before expanding.",
  ],
  [
    "03–04",
    "Distribute",
    "Expand the two prioritized partner channels. Deduplicate audiences and stop weak placements.",
  ],
  [
    "05",
    "Invite",
    "Offer optional project-specific invitations after registration. Track unique invite opens and resulting registrations.",
  ],
  [
    "06",
    "Recover",
    "Compare actual funnel stages with assumptions. Use the reserve only for a specific, measurable recovery action.",
  ],
  [
    "07",
    "Reconcile",
    "Use the genuine registration deadline, check duplicate registrations, and report forecast versus actual.",
  ],
];
const clamp = (n: number, max: number) =>
  Math.min(max, Math.max(0, Number.isFinite(n) ? n : 0));
export function forecast(input: Assumptions) {
  const campusVisitors = Math.round(
    clamp(input.contacts, 100) * clamp(input.visitsPerContact, 500),
  );
  const communityVisitors = Math.round(
    clamp(input.communityVisitors, 10000) *
      (1 - clamp(input.overlap, 100) / 100),
  );
  const campus = Math.round(
    (campusVisitors * clamp(input.campusConversion, 100)) / 100,
  );
  const community = Math.round(
    (communityVisitors * clamp(input.communityConversion, 100)) / 100,
  );
  const seed = campus + community;
  const invitations =
    ((seed * clamp(input.sharingRate, 100)) / 100) *
    clamp(input.deliveredInvites, 10);
  const referrals = Math.round(
    (invitations * clamp(input.referralConversion, 100)) / 100,
  );
  const total = seed + referrals;
  const gap = Math.max(0, 500 - total);
  const additionalContacts =
    campus > 0 ? Math.ceil(gap / (campus / Math.max(input.contacts, 1))) : null;
  return {
    campusVisitors,
    communityVisitors,
    campus,
    community,
    seed,
    invitations: Math.round(invitations),
    referrals,
    total,
    gap,
    remaining: 2000 - clamp(input.spent, 10000),
    referralContribution:
      ((clamp(input.sharingRate, 100) / 100) *
        clamp(input.deliveredInvites, 10) *
        clamp(input.referralConversion, 100)) /
      100,
    additionalContacts,
  };
}
