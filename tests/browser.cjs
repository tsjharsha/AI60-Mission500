const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const base = "http://127.0.0.1:3412";
const server = spawn(
  process.execPath,
  [
    path.join(__dirname, "../node_modules/next/dist/bin/next"),
    "start",
    "--hostname",
    "127.0.0.1",
    "-p",
    "3412",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let log = "";
server.stdout.on("data", (v) => (log += v));
server.stderr.on("data", (v) => (log += v));
const shots = path.join(__dirname, "../docs/screenshots");
fs.mkdirSync(shots, { recursive: true });
async function main() {
  let browser;
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
    if (!ready) throw Error("Server did not start: " + log);
    browser = await chromium.launch({
      headless: true,
      ...(process.env.BROWSER_EXECUTABLE_PATH
        ? {
            executablePath: process.env.BROWSER_EXECUTABLE_PATH,
            args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
          }
        : {}),
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      ignoreHTTPSErrors: false,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.getByRole("heading", { name: /Leave with/ }).waitFor();
    await page
      .getByRole("button", { name: "Show example output" })
      .first()
      .click();
    await page.getByText("Example output / checked").first().waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "home-desktop.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(shots, "video-home-desktop.png"),
      animations: "disabled",
    });
    await page
      .getByRole("link", { name: "Find my project", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Software Engineer", exact: true })
      .click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: "SQL", exact: true }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByRole("button", {
        name: "I already have an AI project",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "See my project", exact: true })
      .click();
    await page.getByRole("heading", { name: /Here’s something/ }).waitFor();
    await page.getByText(/You already have AI experience/).waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "project-reveal.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(shots, "video-project-reveal.png"),
      animations: "disabled",
    });
    await page.goto(base + "/register");
    await page.getByLabel("Name", { exact: true }).fill("Demo Builder");
    await page.getByLabel("College", { exact: true }).fill("Example College");
    await page
      .getByLabel("Email", { exact: true })
      .fill("demo@example.invalid");
    await page.getByRole("checkbox").check();
    const registrationResponse = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/register") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Register for the workshop", exact: true })
      .click();
    const response = await registrationResponse;
    const responseData = await response.json();
    assert.equal(response.status(), 201, JSON.stringify(responseData));
    await page
      .getByRole("heading", { name: /Demo Builder, you have/ })
      .waitFor();
    await page
      .getByText("Simulation registration only", { exact: true })
      .waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "workshop-pass.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(shots, "video-workshop-pass.png"),
      animations: "disabled",
    });
    await page.reload();
    await page
      .getByRole("heading", { name: /Demo Builder, you have/ })
      .waitFor();
    await page.goto(base + "/squad");
    await page
      .getByRole("button", { name: "Create my squad", exact: true })
      .click();
    await page
      .getByRole("link", { name: "Preview invite", exact: true })
      .waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "squad.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(shots, "video-squad.png"),
      animations: "disabled",
    });
    await page
      .getByRole("link", { name: "Preview invite", exact: true })
      .click();
    await page.getByText("Invite preview / excluded from tracking").waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "invite.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(shots, "video-invite.png"),
      animations: "disabled",
    });
    await page.goto(base + "/dashboard");
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "video-command-baseline.png"),
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Test the 382-registration downside" })
      .click();
    await page.getByText("118 short of target").waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "command-center.png"),
      fullPage: true,
      animations: "disabled",
    });
    await page.screenshot({
      path: path.join(shots, "video-command-center.png"),
      animations: "disabled",
    });
    await page.goto(base + "/submission");
    await page.getByRole("heading", { name: /The build/ }).waitFor();
    await page.getByRole("heading").first().click();
    await page.keyboard.press("Control+Home");
    await page.screenshot({
      path: path.join(shots, "video-submission.png"),
      animations: "disabled",
    });
    assert.equal(errors.length, 0, errors.join("\n"));
    const mobile = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const m = await mobile.newPage();
    await m.goto(base);
    await m.getByRole("heading", { name: /Leave with/ }).waitFor();
    assert.ok(
      await m.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Mobile home overflow",
    );
    await m.screenshot({
      path: path.join(shots, "home-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
    await m.goto(base + "/register");
    await m.getByLabel("Name", { exact: true }).waitFor();
    assert.ok(
      await m.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Mobile register overflow",
    );
    await m.screenshot({
      path: path.join(shots, "register-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
    await m.goto(base + "/dashboard");
    await m.getByRole("heading", { name: "Challenge the plan." }).waitFor();
    assert.ok(
      await m.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Mobile dashboard overflow",
    );
    await m.screenshot({
      path: path.join(shots, "dashboard-mobile.png"),
      fullPage: true,
      animations: "disabled",
    });
    console.log(
      "PASS: desktop project output, experienced matching, consent registration, pass/session restore, optional squad, invite preview, downside interaction; mobile home, registration, dashboard; no page errors or tested horizontal overflow.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
