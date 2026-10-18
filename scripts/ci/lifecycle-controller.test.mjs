import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const source = readFileSync(".github/workflows/trusted-pr-lifecycle.yml", "utf8").replace(/\r\n/g, "\n");
const ai = source.includes("process_pr()");
const smart = source.includes("deploy.yml/dispatches");
const script = source.split("        run: |\n")[1].split("\n").map((line) => line.replace(/^ {10}/, "")).join("\n");
const bash = process.platform === "win32" ? "C:/Program Files/Git/bin/bash.exe" : "bash";
assert.equal(spawnSync(bash, ["-n"], { input: script, encoding: "utf8" }).status, 0);
assert.doesNotMatch(source, /actions\/checkout@|pull_request_target:/);
assert.match(source, /--match-head-commit/);
if (ai) {
  assert.match(source, /select\(\.name == \$name and \.app\.id == 15368\)/);
  assert.match(source, /sort_by\(\.id\)/);
} else {
  assert.match(source, /workflow_dispatch:[\s\S]*pr_number:/);
  assert.match(source, /--required --json state/);
}
const mock = [
  "gh() {",
  ' if [[ "$1" == "api" ]]; then',
  '  if [[ "$*" == *"check-runs?"* ]]; then printf \'{}\\n\';',
  '  elif [[ "$*" == *"pulls?state=open"* ]]; then printf \'999\\tcurrent\\n\';',
  '  elif [[ "$*" == *"/commits/"* && "$*" == *"/pulls"* ]]; then printf \'%s\\n\' "$MOCK_NUMBER";',
  '  elif [[ "$*" == *".head.sha"* && "$*" != *"@tsv"* ]]; then printf \'%s\\n\' "$MOCK_LATEST_SHA";',
  '  elif [[ "$*" == *".auto_merge != null"* && "$*" != *"@tsv"* ]]; then printf \'%s\\n\' "$MOCK_AUTO";',
  '  elif [[ "$*" == *".merged"* ]]; then printf \'true\\n\';',
  '  elif [[ "$*" == *"dispatches"* ]]; then printf \'CALL deploy\\n\';',
  '  else printf \'%s\\n\' "$MOCK_PR"; fi',
  ' elif [[ "$1 $2" == "pr checks" ]]; then',
  '  printf \'%s\\n\' "$MOCK_CHECKS"; return "$MOCK_CHECK_EXIT";',
  ' else printf \'CALL \'; printf \'%s \' "$@"; printf \'\\n\'; fi',
  "}",
  'jq() { cat >/dev/null; printf \'%s\\t%s\\n\' "$MOCK_CHECK_STATUS" "$MOCK_CHECK_CONCLUSION"; }',
  ""
].join("\n");
const repository = "Iron-Mark/example";
const cases = [
  { name: "trusted current PR", method: "--squash" },
  { name: "stale event SHA", sha: "stale" },
  { name: "head moves during checks", latest: "moved" },
  { name: "untrusted fork", owner: "outsider", association: "NONE" },
  { name: "closed PR", state: "closed" },
  { name: "already queued method is preserved", auto: "true" },
  { name: "running required check", check: "false", checkExit: "8", status: "in_progress", conclusion: "" },
  { name: "failed required check", check: "false", checkExit: "1", status: "completed", conclusion: "failure" },
  { name: "missing required checks", check: "false", checkExit: "1", status: "", conclusion: "" },
  { name: "cancelled required check", check: "false", checkExit: "1", status: "completed", conclusion: "cancelled" },
  { name: "skipped required check", check: "false", checkExit: "0", status: "completed", conclusion: "skipped" },
  { name: "missing event association recovered", number: "", method: "--squash" },
  { name: "ambiguous event association", number: "", resolvedNumber: "" },
  { name: "manual recovery requires checks", trigger: "workflow_dispatch", method: "--squash" },
  { name: "invalid recovery number", number: "bad", trigger: "workflow_dispatch" }
];
if (ai || smart) {
  cases.push(
    { name: "same repository sync", head: "sync/main-to-dev-test", method: "--merge" },
    { name: "trusted fork mimics sync prefix", head: "sync/main-to-dev-test", headRepo: "Iron-Mark/fork", method: "--squash" },
    { name: "dev promotion", base: "main", head: "dev", method: "--merge" }
  );
}
for (const c of cases) {
  // AIssistLab's manual catch-up enumerates PRs instead of accepting a PR input.
  if (ai && ["invalid recovery number", "ambiguous event association"].includes(c.name)) continue;
  const base = c.base ?? ((ai || smart) ? "dev" : "main");
  const fields = [c.state ?? "open", "true", c.owner ?? "Iron-Mark", c.association ?? "OWNER", c.owner ?? "Iron-Mark", c.sha ?? "current"];
  if (ai || smart) fields.push(base, c.head ?? "feature/test");
  if (ai) fields.push(c.auto ?? "false", c.headRepo ?? repository);
  else if (smart) fields.push(c.headRepo ?? repository);
  const result = spawnSync(bash, ["-s"], {
    input: mock + script, encoding: "utf8",
    env: { ...process.env, REPOSITORY: repository, REPOSITORY_OWNER: "Iron-Mark", PR_NUMBER: c.number ?? "999",
      RUN_HEAD_SHA: "current", TRIGGER_EVENT: c.trigger ?? "workflow_run",
      MOCK_PR: fields.join("\t"), MOCK_LATEST_SHA: c.latest ?? "current", MOCK_AUTO: c.auto ?? "false",
      MOCK_NUMBER: c.resolvedNumber ?? "999", MOCK_CHECKS: c.check ?? "true", MOCK_CHECK_EXIT: c.checkExit ?? "0",
      MOCK_CHECK_STATUS: c.status ?? "completed", MOCK_CHECK_CONCLUSION: c.conclusion ?? "success" }
  });
  assert.equal(result.status, 0, c.name + ": " + result.stderr);
  const calls = result.stdout.split("\n").filter((line) => line.startsWith("CALL "));
  const merges = calls.filter((line) => line.includes("pr merge"));
  if (c.method) {
    assert.equal(merges.length, 1, c.name + ": " + result.stdout);
    assert.ok(merges[0].includes(c.method), c.name + ": " + result.stdout);
    assert.ok(merges[0].includes("--match-head-commit current"), c.name + ": " + result.stdout);
  } else assert.equal(calls.length, 0, c.name + ": " + result.stdout);
  if (smart && c.base === "main" && c.method) assert.ok(calls.includes("CALL deploy"), result.stdout);
  console.log("PASS " + c.name);
}
console.log("Lifecycle behavior checks passed (mocked GitHub responses; no network or remote writes).");
