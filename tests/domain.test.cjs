require("../scripts/register-ts.cjs");
const test = require("node:test");
const assert = require("node:assert/strict");
const { forecast, BASELINE, BUDGET } = require("../src/lib/campaign.ts");
const {
  summarize,
  SIMULATED_METRICS,
} = require("../src/lib/analytics/metrics.ts");
const {
  runDeterministicEngine,
} = require("../src/lib/project-dna/deterministicEngine.ts");
test("baseline reaches 500 without compounded referrals or overspending", () => {
  const f = forecast(BASELINE);
  assert.equal(f.total, 500);
  assert.equal(f.campus, 300);
  assert.equal(f.community, 125);
  assert.equal(f.referrals, 75);
  assert.equal(
    BUDGET.reduce((s, b) => s + b.amount, 0),
    2000,
  );
  assert.equal(f.remaining, 500);
});
test("downside is explicit and overlap removes duplicated community reach", () => {
  assert.equal(
    forecast({ ...BASELINE, campusConversion: 20, sharingRate: 0 }).total,
    325,
  );
  assert.equal(
    forecast({ ...BASELINE, overlap: 100, sharingRate: 0 }).total,
    300,
  );
  assert.equal(forecast({ ...BASELINE, campusConversion: 20 }).total, 382);
  assert.equal(
    forecast({ ...BASELINE, contacts: 0, communityVisitors: 0 }).gap,
    500,
  );
});
test("malformed assumptions cannot produce negative or NaN forecasts", () => {
  const f = forecast({
    ...BASELINE,
    contacts: NaN,
    communityVisitors: -4,
    sharingRate: Infinity,
    spent: -10,
  });
  assert.equal(f.total, 0);
  assert.equal(f.remaining, 2000);
});
test("duplicate events and null IDs do not inflate unique stages", () => {
  const events = [
    { anonymous_id: "one", event_name: "landing_view" },
    { anonymous_id: "one", event_name: "landing_view" },
    { anonymous_id: "one", event_name: "diagnostic_started" },
    { anonymous_id: "one", event_name: "diagnostic_started" },
    { anonymous_id: null, event_name: "landing_view" },
    { anonymous_id: "two", event_name: "squad_invite_opened" },
  ];
  const m = summarize(events, [
    { id: "a", source: "whatsapp", squad_id: null },
    {
      id: "b",
      source: "squad_invite",
      squad_id: "valid",
      referrer_user_id: "ref",
    },
  ]);
  assert.equal(m.visitors, 1);
  assert.equal(m.diagnosticsStarted, 1);
  assert.equal(m.inviteRegistrations, 1);
  assert.equal(m.kFactor, 1);
});
test("simulated metrics and stated definitions agree", () => {
  assert.equal(SIMULATED_METRICS.kFactor, 75 / 425);
  assert.equal(SIMULATED_METRICS.registrationConversion, (500 / 1750) * 100);
  assert.equal(
    Object.values(SIMULATED_METRICS.sourceDistribution).reduce((a, b) => a + b),
    500,
  );
});
test("experienced students receive guidance without invented gaps or score", () => {
  const r = runDeterministicEngine({
    targetRole: "Data Analyst",
    skills: ["Python"],
    aiExperience: "Advanced",
  });
  assert.equal(r.project.name, "AI Dataset Insight Generator");
  assert.equal(r.aiReadinessScore, 0);
  assert.match(r.gap, /already have AI experience/);
  assert.doesNotMatch(r.gap, /falling behind|lacks evidence/);
  assert.equal(
    runDeterministicEngine({ targetRole: "Product / Tech", skills: [] }).project
      .name,
    "AI User Feedback Synthesizer",
  );
});

const { calendarEvent } = require("../src/lib/server/workshop.ts");
test("calendar uses confirmed UTC time, one hour, and escaped content", () => {
  const event = calendarEvent(
    "2026-10-10T10:00:00Z",
    "test",
    "https://example.invalid/meeting",
  );
  assert.match(event, /DTSTART:20261010T100000Z/);
  assert.match(event, /DTEND:20261010T110000Z/);
  assert.ok(event.endsWith("END:VCALENDAR\r\n"));
});
