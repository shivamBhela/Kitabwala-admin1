// Runs automatically before `npm run dev` (npm's `predev` lifecycle hook).
//
// Turbopack's dev-server process has repeatedly been observed surviving normal
// termination (its child process outlives the parent shell that started it — see
// AUDIT_BACKLOG.md P0-1). An orphaned-but-still-alive process either squats on
// port 3000 directly, or leaves kitabwalah-admin/.next/dev/lock pointing at a PID
// that's still technically alive (so Next's own duplicate-instance check treats it
// as a real running server) even though it's no longer listening on anything.
// Either way, the next `next dev` self-terminates within milliseconds with
// "Another next dev server is already running" — cascading into a full
// `npm run dev` failure via concurrently's --kill-others-on-fail.
//
// This script clears both failure modes before every dev run: kill whatever's
// listening on 3000/3001, then delete the lock file if it's still there.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORTS = [3000, 3001];

function freeWindowsPort(port) {
  let output;
  try {
    output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  } catch {
    return; // nothing on this port
  }
  const pids = new Set();
  for (const line of output.split('\n')) {
    const match = line.trim().match(/LISTENING\s+(\d+)$/);
    if (match) pids.add(match[1]);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      console.log(`[free-dev-ports] Killed stale process ${pid} on port ${port}`);
    } catch {
      // already gone, or couldn't be killed — not fatal, next dev will report clearly if the port is still stuck
    }
  }
}

function freeUnixPort(port) {
  let pidOutput;
  try {
    pidOutput = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim();
  } catch {
    return; // nothing on this port
  }
  for (const pid of pidOutput.split('\n').filter(Boolean)) {
    try {
      execSync(`kill -9 ${pid}`);
      console.log(`[free-dev-ports] Killed stale process ${pid} on port ${port}`);
    } catch {
      // already gone
    }
  }
}

for (const port of PORTS) {
  if (process.platform === 'win32') freeWindowsPort(port);
  else freeUnixPort(port);
}

const lockFile = path.join(__dirname, '..', 'frontend', '.next', 'dev', 'lock');
if (fs.existsSync(lockFile)) {
  fs.unlinkSync(lockFile);
  console.log('[free-dev-ports] Removed stale Next.js dev-server lock file');
}
