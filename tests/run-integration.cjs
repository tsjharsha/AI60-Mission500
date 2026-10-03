const { spawn } = require("node:child_process");
const path = require("node:path");
const base = "http://127.0.0.1:3411";
const server = spawn(
  process.execPath,
  [
    path.join(__dirname, "../node_modules/next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "-p",
    "3411",
  ],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  },
);
let log = "";
server.stdout.on("data", (v) => {
  log += v;
});
server.stderr.on("data", (v) => {
  log += v;
});
async function main() {
  try {
    let ready = false;
    for (let i = 0; i < 50; i++) {
      try {
        if ((await fetch(base)).status === 200) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw Error("Server failed to start: " + log);
    const child = spawn(
      process.execPath,
      [path.join(__dirname, "integration.cjs")],
      { stdio: "inherit", env: { ...process.env, TEST_BASE_URL: base } },
    );
    const result = await new Promise((resolve) => child.on("exit", resolve));
    process.exitCode = result;
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    server.kill("SIGTERM");
  }
}
main();
