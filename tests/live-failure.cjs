const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");
const { createHmac } = require("node:crypto");
const key = "test-only-session-secret-32-characters-or-more";
const mock = http.createServer((_req, res) => {
  res.writeHead(503, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Deliberate test database outage" }));
});
let server;
async function main() {
  await new Promise((resolve) => mock.listen(3413, "127.0.0.1", resolve));
  server = spawn(
    process.execPath,
    [
      path.join(__dirname, "../node_modules/next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "-p",
      "3414",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3413",
        SUPABASE_SERVICE_ROLE_KEY: "test-only-key",
        SESSION_SECRET: key,
      },
    },
  );
  let log = "";
  server.stdout.on("data", (v) => (log += v));
  server.stderr.on("data", (v) => (log += v));
  try {
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try {
        if ((await fetch("http://127.0.0.1:3414")).status === 200) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw Error(log);
    const register = await fetch("http://127.0.0.1:3414/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: "Fixture",
          college: "Test",
          email: "fixture@example.invalid",
          graduationYear: "2027",
        },
        consent: true,
        projectResult: { project: { name: "AI SQL Debugging Copilot" } },
      }),
    });
    assert.equal(register.status, 503, "Live write outage must fail closed");
    const metrics = await fetch("http://127.0.0.1:3414/api/growth-metrics");
    assert.equal(
      metrics.status,
      503,
      "Live metrics outage must not return seeded figures",
    );
    const payload = Buffer.from(
      JSON.stringify({
        userId: "00000000-0000-4000-8000-000000000001",
        builderNumber: 1,
        mode: "LIVE",
        expires: Date.now() + 60000,
      }),
    ).toString("base64url");
    const signature = createHmac("sha256", key).update(payload).digest("hex");
    const squad = await fetch("http://127.0.0.1:3414/api/squads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `ai60_builder=${payload}.${signature}`,
      },
      body: JSON.stringify({ projectName: "AI SQL Debugging Copilot" }),
    });
    assert.equal(
      squad.status,
      503,
      "Live squad outage must not fabricate a code",
    );
    console.log(
      "PASS: configured live registration, metrics, and squad outages return 503 without fabricated success or seeded results.",
    );
  } finally {
    server.kill("SIGTERM");
    mock.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
  server?.kill("SIGTERM");
  mock.close();
});
