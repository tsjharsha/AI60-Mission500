const assert = require("node:assert/strict");
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const body = {
  data: {
    name: "Demo Builder",
    college: "Example College",
    graduationYear: "2027",
    email: "builder@example.invalid",
    skills: ["SQL"],
  },
  projectResult: { project: { name: "AI SQL Debugging Copilot" } },
  referralContext: {},
  consent: true,
};
async function call(path, data, cookie) {
  const res = await fetch(base + path, {
    method: data === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  return {
    status: res.status,
    data: await res.json(),
    cookie: res.headers.get("set-cookie")?.split(";")[0],
  };
}
async function main() {
  for (const route of [
    "/",
    "/register",
    "/diagnostic",
    "/result",
    "/squad",
    "/dashboard",
    "/admin",
    "/submission",
    "/privacy",
  ]) {
    assert.equal((await fetch(base + route)).status, 200, route);
  }
  assert.equal((await call("/api/register", {})).status, 400);
  assert.equal(
    (await call("/api/register", { ...body, consent: false })).status,
    400,
  );
  assert.equal(
    (
      await call("/api/register", {
        ...body,
        data: { ...body.data, email: "bad" },
      })
    ).status,
    400,
  );
  assert.equal(
    (await call("/api/squads", { projectName: "Test" })).status,
    401,
  );
  const owner = await call("/api/register", body);
  assert.equal(owner.status, 201);
  assert.equal(owner.data.mode, "SIMULATION");
  assert.ok(owner.cookie);
  assert.equal(
    (await call("/api/calendar", undefined, owner.cookie)).status,
    409,
  );
  const session = await call("/api/session", undefined, owner.cookie);
  assert.equal(session.data.registered, true);
  const repeated = await call("/api/register", body, owner.cookie);
  assert.equal(repeated.data.userId, owner.data.userId);
  const squad = await call(
    "/api/squads",
    { projectName: "AI SQL Debugging Copilot", role: "BUILDER" },
    owner.cookie,
  );
  assert.equal(squad.status, 200);
  assert.ok(squad.data.code);
  assert.equal((await call("/api/squads/ANOTREAL")).status, 404);
  const members = await Promise.all(
    [1, 2, 3].map(async (n) =>
      call("/api/register", {
        ...body,
        data: {
          ...body.data,
          name: `Friend ${n}`,
          email: `friend${n}@example.invalid`,
        },
      }),
    ),
  );
  const joins = await Promise.all(
    members.map((m) =>
      call(
        `/api/squads/${squad.data.code}/join`,
        { naturalRole: "BUILDER" },
        m.cookie,
      ),
    ),
  );
  assert.equal(joins.filter((j) => j.status === 200).length, 2);
  assert.equal(joins.filter((j) => j.status === 409).length, 1);
  const view = await call(`/api/squads/${squad.data.code}`);
  assert.equal(view.data.members.length, 3);
  assert.equal(new Set(view.data.members.map((m) => m.role)).size, 3);
  const repeat = await call(
    `/api/squads/${squad.data.code}/join`,
    { naturalRole: "BUILDER" },
    owner.cookie,
  );
  assert.equal(repeat.status, 200);
  const badCookie =
    owner.cookie.slice(0, -1) + (owner.cookie.endsWith("a") ? "b" : "a");
  assert.equal(
    (await call("/api/squads", { projectName: "Test" }, badCookie)).status,
    401,
  );
  const csrf = await fetch(base + "/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://wrong.example",
    },
    body: JSON.stringify(body),
  });
  assert.equal(csrf.status, 403);
  const invalidJson = await fetch(base + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad",
  });
  assert.equal(invalidJson.status, 400);
  const oversized = await fetch(base + "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x: "x".repeat(17000) }),
  });
  assert.equal(oversized.status, 413);
  const metrics = await call("/api/growth-metrics");
  assert.equal(metrics.data.mode, "SIMULATION");
  assert.equal(metrics.data.kFactor, 75 / 425);
  const reset = await call("/api/session", {}, owner.cookie);
  assert.equal(reset.status, 200);
  assert.match(reset.cookie, /ai60_builder=/);
  console.log(
    "PASS: 9 routes, input/consent validation, signed session restore, retry idempotence, auth, invite 404, concurrent demo capacity, unique roles, duplicate join, cookie tamper, CSRF, JSON/size rejection, consistent simulation, reset.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
