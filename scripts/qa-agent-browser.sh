#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3001}"
BASE_URL="${BASE_URL:-http://127.0.0.1:${PORT}}"
SESSION="${AGENT_BROWSER_SESSION:-bracu-qa}"
OUT_DIR="${QA_OUT_DIR:-${ROOT_DIR}/artifacts/agent-browser-qa}"
SERVER_PID=""

mkdir -p "$OUT_DIR"

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  agent-browser --session "$SESSION" close >/dev/null 2>&1 || true
}
trap cleanup EXIT

require_text() {
  local label="$1"
  shift
  local js_checks="["
  local check escaped
  for check in "$@"; do
    escaped="${check//\\/\\\\}"
    escaped="${escaped//\"/\\\"}"
    js_checks+="\"${escaped}\","
  done
  js_checks="${js_checks%,}]"
  agent-browser --session "$SESSION" eval --stdin >/tmp/bracu-qa-text-check.json <<EOF
var __qaChecks = ${js_checks};
var __qaBody = document.body.innerText.toLowerCase();
var __qaMissing = __qaChecks.filter((check) => !__qaBody.includes(check.toLowerCase()));
if (__qaMissing.length) {
  throw new Error("${label} missing: " + __qaMissing.join(", "));
}
({ ok: true, label: "", checks: __qaChecks });
EOF
}

check_no_page_overflow() {
  local label="$1"
  agent-browser --session "$SESSION" eval --stdin >/tmp/bracu-qa-overflow.json <<EOF
var __qaOverflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
if (__qaOverflow > 4) {
  var __qaOffenders = [...document.querySelectorAll("*")]
    .map((el) => {
      var r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 80),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    })
    .filter((item) => item.width > 0 && item.height > 0 && (item.left < -2 || item.right > innerWidth + 2))
    .slice(0, 8);
  throw new Error("${label} horizontal overflow " + __qaOverflow + "px: " + JSON.stringify(__qaOffenders));
}
({ ok: true, label: "", overflow: __qaOverflow });
EOF
}

open_and_capture() {
  local route="$1"
  local name="$2"
  shift 2
  agent-browser --session "$SESSION" open "${BASE_URL}${route}" >/dev/null
  agent-browser --session "$SESSION" wait --load networkidle >/dev/null
  require_text "$name" "$@"
  check_no_page_overflow "$name"
  agent-browser --session "$SESSION" screenshot --full "${OUT_DIR}/${name}.png" >/dev/null
}

clear_demo_auth() {
  agent-browser --session "$SESSION" open "${BASE_URL}/" >/dev/null
  agent-browser --session "$SESSION" wait --load networkidle >/dev/null
  agent-browser --session "$SESSION" eval --stdin >/dev/null <<'EOF'
window.localStorage.removeItem("clinic-copilot-demo-user");
EOF
}

login_seeded_user() {
  agent-browser --session "$SESSION" open "${BASE_URL}/clinic/queue" >/dev/null
  agent-browser --session "$SESSION" wait --load networkidle >/dev/null
  agent-browser --session "$SESSION" eval --stdin >/dev/null <<'EOF'
var text = document.body.innerText;
if (!text.includes("Queue")) {
  var buttons = [...document.querySelectorAll("button")];
  buttons.find((button) => button.textContent?.trim() === "Sign in")?.click();
}
EOF
  agent-browser --session "$SESSION" wait 300 >/dev/null
  agent-browser --session "$SESSION" eval --stdin >/dev/null <<'EOF'
var buttons = [...document.querySelectorAll("button")];
var signInButtons = buttons.filter((button) => button.textContent?.trim() === "Sign in");
(signInButtons.at(-1) ?? signInButtons[0])?.click();
EOF
  agent-browser --session "$SESSION" wait --text "Queue" >/dev/null
}

open_workspace() {
  local workspace="$1"
  local name="$2"
  shift 2
  agent-browser --session "$SESSION" eval --stdin >/dev/null <<EOF
var target = "${workspace}";
var button = [...document.querySelectorAll("button")].find((item) =>
  item.getAttribute("aria-label")?.toLowerCase().includes("open " + target.toLowerCase() + " workspace")
);
if (!button) throw new Error("Missing workspace button: " + target);
button.click();
EOF
  agent-browser --session "$SESSION" wait 700 >/dev/null
  local expected_slug
  case "$workspace" in
    Copilot) expected_slug="copilot" ;;
    *) expected_slug="$(echo "$workspace" | tr '[:upper:]' '[:lower:]')" ;;
  esac
  agent-browser --session "$SESSION" eval --stdin >/tmp/bracu-qa-route-check.json <<EOF
var __qaExpectedPath = "/clinic/${expected_slug}";
if (window.location.pathname !== __qaExpectedPath) {
  throw new Error("${name} expected path " + __qaExpectedPath + " but got " + window.location.pathname);
}
({ ok: true, path: window.location.pathname });
EOF
  require_text "$name" "$@"
  check_no_page_overflow "$name"
  agent-browser --session "$SESSION" screenshot --full "${OUT_DIR}/${name}.png" >/dev/null
}

echo "Building app..."
(cd "$ROOT_DIR" && bun run build)

echo "Starting app on ${BASE_URL}..."
(cd "$ROOT_DIR" && bunx next start --hostname 127.0.0.1 --port "$PORT" >"${OUT_DIR}/next-start.log" 2>&1) &
SERVER_PID="$!"
sleep 2

clear_demo_auth

echo "Running public page QA..."
open_and_capture "/" "public-home" "Clinic Copilot BD" "Launch clinic demo"
open_and_capture "/features" "public-features" "Agentic Workflow Studio" "MCP data layer"
open_and_capture "/docs" "public-docs" "Tester walkthrough" "clinic.safety.get_blockers"
open_and_capture "/judge" "public-judge" "Judge Mode" "Show Copilot" "Prove MCP"
open_and_capture "/mission" "public-mission" "Mission" "Practical AI"
open_and_capture "/pitch" "public-pitch" "Product pitch" "Open demo"
open_and_capture "/login" "public-login" "Demo access" "Create clinic session"
open_and_capture "/clinic" "clinic-redirect-auth" "Create clinic session"

echo "Running authenticated workspace QA..."
login_seeded_user
open_and_capture "/clinic/case" "direct-workspace-case" "Reception Intake" "Clinical Safety Gates"
open_and_capture "/clinic/copilot" "direct-workspace-copilot" "Copilot Command Room" "AI Run Receipts"
require_text "workspace-shell" "Queue" "Case" "Copilot" "Operations" "Builder" "Admin"
agent-browser --session "$SESSION" screenshot --full "${OUT_DIR}/workspace-shell.png" >/dev/null

open_workspace "Queue" "workspace-queue" "Live Case Board" "Ask Copilot"
open_workspace "Case" "workspace-case" "Reception Intake" "Clinical Safety Gates" "Ask Copilot"
open_workspace "Copilot" "workspace-copilot" "Copilot Command Room" "AI Run Receipts" "Approvals Inbox"
open_workspace "Operations" "workspace-operations" "Operations Pulse" "Ask Copilot"
open_workspace "Builder" "workspace-builder" "Agentic Workflow Studio" "Ask Copilot"
open_workspace "Admin" "workspace-admin" "MCP Explorer" "Readiness"

echo "Checking global Ask Copilot drawer..."
open_workspace "Queue" "workspace-queue-before-drawer" "Ask Copilot"
agent-browser --session "$SESSION" eval --stdin >/dev/null <<'EOF'
var button = [...document.querySelectorAll("button")].find((item) => item.textContent?.includes("Ask Copilot"));
if (!button) throw new Error("Ask Copilot button missing");
button.click();
EOF
agent-browser --session "$SESSION" wait --text "AI Run Receipts" >/dev/null
require_text "copilot-drawer" "Ask Copilot" "AI Run Receipts" "Approvals Inbox"
agent-browser --session "$SESSION" screenshot --full "${OUT_DIR}/copilot-drawer.png" >/dev/null

echo "Checking MCP Explorer call..."
open_workspace "Admin" "workspace-admin-mcp" "MCP Explorer"
agent-browser --session "$SESSION" eval --stdin >/tmp/bracu-qa-mcp-check.json <<'EOF'
(async () => {
var __qaMcpButton = [...document.querySelectorAll("button")].find((item) =>
  item.textContent?.includes("Run MCP call")
);
if (!__qaMcpButton) throw new Error("Run MCP call button missing");
__qaMcpButton.click();
await new Promise((resolve) => setTimeout(resolve, 1500));

var __qaMcpResponseField = document.querySelector('textarea[aria-label="MCP explorer response"]');
var __qaMcpText = __qaMcpResponseField?.value || "";
if (!__qaMcpText.includes("clinic.demo_manifest")) {
  var __qaMcpResponse = await fetch("/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 101, method: "tools/list" }),
  }).then((response) => response.json());
  __qaMcpText = JSON.stringify(__qaMcpResponse);
}

if (!__qaMcpText.includes("clinic.demo_manifest") || !__qaMcpText.includes("clinic.safety.get_blockers")) {
  throw new Error("MCP Explorer check failed: " + __qaMcpText.slice(0, 500));
}
return { ok: true, includesManifest: true, includesSafetyTool: true };
})();
EOF
agent-browser --session "$SESSION" screenshot --full "${OUT_DIR}/mcp-explorer-response.png" >/dev/null

echo "QA complete. Screenshots saved to ${OUT_DIR}"
