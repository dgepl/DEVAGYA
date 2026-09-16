const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('🛡️  DEVGYA HIGH-AVAILABILITY SYSTEM SUPERVISOR');
console.log('    Self-Healing Watchdog + Auto-Restart Active');
console.log('====================================================');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// 1. Detect python executable (prefer local venv if available)
let pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const venvPyWin = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
const venvPyNix = path.join(backendDir, 'venv', 'bin', 'python');

if (process.platform === 'win32' && fs.existsSync(venvPyWin)) {
  pyCmd = venvPyWin;
} else if (process.platform !== 'win32' && fs.existsSync(venvPyNix)) {
  pyCmd = venvPyNix;
} else {
  const candidates = process.platform === 'win32'
    ? ['python', 'python3', 'py']
    : ['python3', 'python', 'uvicorn'];

  for (const candidate of candidates) {
    try {
      if (candidate === 'uvicorn') {
        execSync('uvicorn --version', { stdio: 'ignore' });
        pyCmd = 'uvicorn';
        break;
      } else {
        execSync(`${candidate} -m uvicorn --version`, { stdio: 'ignore' });
        pyCmd = candidate;
        break;
      }
    } catch (e) {}
  }
}

console.log(`🐍 Detected Python runner: "${pyCmd}"`);

const pyArgs = pyCmd === 'uvicorn'
  ? ['main:app', '--host', '0.0.0.0', '--port', '8000']
  : ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'];

// --- PROCESS SUPERVISOR STATE ---
let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;
let restartCount = 0;
let lastRestartTime = Date.now();
let consecutiveHealthFailures = 0;

// Helper: HTTP GET Ping with timeout
function pingHealth(url, timeoutMs = 4000) {
  return new Promise((resolve) => {
    try {
      const req = http.get(url, { timeout: timeoutMs }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

// 2. Start / Restart Backend Process
function startBackend() {
  if (isShuttingDown) return;

  const now = Date.now();
  if (now - lastRestartTime > 60000) {
    // Reset crash counter if it ran stably for more than 1 minute
    restartCount = 0;
  }
  lastRestartTime = now;
  restartCount++;

  console.log(`\n🚀 [SUPERVISOR] Spawning FastAPI backend on port 8000 (Launch #${restartCount})...`);

  backendProcess = spawn(pyCmd, pyArgs, {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  });

  backendProcess.on('error', (err) => {
    console.error('❌ [SUPERVISOR] Backend spawn error:', err.message);
  });

  backendProcess.on('exit', (code, signal) => {
    console.warn(`⚠️ [SUPERVISOR] Backend exited with code ${code} / signal ${signal}`);
    backendProcess = null;

    if (!isShuttingDown) {
      const delayMs = Math.min(1500 * Math.max(1, restartCount), 10000);
      console.log(`🔄 [SUPERVISOR] Self-healing active: Auto-restarting backend in ${delayMs / 1000}s...`);
      setTimeout(startBackend, delayMs);
    }
  });
}

// 3. Pre-flight wait until backend is responsive before starting frontend
async function waitForBackendReady(maxWaitMs = 30000) {
  const start = Date.now();
  console.log('⏳ [SUPERVISOR] Performing pre-flight health check on http://127.0.0.1:8000/health...');
  
  while (Date.now() - start < maxWaitMs) {
    const ok = await pingHealth('http://127.0.0.1:8000/health', 1500);
    if (ok) {
      console.log('✅ [SUPERVISOR] Backend is HEALTHY and accepting connections!');
      return true;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.warn('⚠️ [SUPERVISOR] Pre-flight timed out. Proceeding with frontend launch while backend initialises...');
  return false;
}

// 4. Start Frontend
function startFrontend() {
  if (isShuttingDown) return;

  const port = process.env.PORT || '3000';
  console.log(`⚡ [SUPERVISOR] Starting DEVGYA Next.js Frontend Web Server on port ${port}...`);

  frontendProcess = spawn('npx', ['next', 'start', '-p', port], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });

  frontendProcess.on('error', (err) => {
    console.error('❌ [SUPERVISOR] Frontend process error:', err.message);
  });

  frontendProcess.on('exit', (code) => {
    console.warn(`⚠️ [SUPERVISOR] Frontend exited with code ${code}`);
    frontendProcess = null;
    if (!isShuttingDown) {
      console.log('🔄 [SUPERVISOR] Restarting frontend in 2s...');
      setTimeout(startFrontend, 2000);
    }
  });
}

// 5. Watchdog: Periodic Health Monitor & Deadlock Terminator
function runWatchdog() {
  setInterval(async () => {
    if (isShuttingDown) return;

    const isAlive = await pingHealth('http://127.0.0.1:8000/health', 4000);
    if (isAlive) {
      consecutiveHealthFailures = 0;
    } else {
      consecutiveHealthFailures++;
      console.warn(`⚠️ [WATCHDOG] Backend health check failed (${consecutiveHealthFailures}/3).`);

      if (consecutiveHealthFailures >= 3) {
        console.error('🚨 [WATCHDOG] Backend hung/deadlocked (3 consecutive failures). Terminating and respawning now...');
        consecutiveHealthFailures = 0;
        if (backendProcess) {
          try {
            if (process.platform === 'win32') {
              execSync(`taskkill /pid ${backendProcess.pid} /T /F`, { stdio: 'ignore' });
            } else {
              backendProcess.kill('SIGKILL');
            }
          } catch (e) {}
        }
        // startBackend will automatically be triggered by the 'exit' handler
      }
    }
  }, 20000); // Check every 20 seconds
}

// 6. Anti-Sleep Keepalive (pings localhost and external URL if defined to prevent cloud spin-down)
function runAntiSleepKeepalive() {
  setInterval(async () => {
    if (isShuttingDown) return;
    try {
      await pingHealth('http://127.0.0.1:8000/health', 3000);
      const ext = process.env.NEXT_PUBLIC_API_URL;
      if (ext && ext.startsWith('http') && !ext.includes('127.0.0.1') && !ext.includes('localhost')) {
        const u = ext.replace(/\/api\/v1\/?$/, '') + '/health';
        http.get(u, { timeout: 5000 }, () => {}).on('error', () => {});
      }
    } catch (e) {}
  }, 8 * 60 * 1000); // Every 8 minutes
}

// 7. Graceful Clean Exit
function cleanExit() {
  isShuttingDown = true;
  console.log('\n🛑 [SUPERVISOR] Shutting down all DEVGYA services...');
  try {
    if (backendProcess) {
      if (process.platform === 'win32') {
        try { execSync(`taskkill /pid ${backendProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
      } else {
        backendProcess.kill();
      }
    }
  } catch (e) {}
  try {
    if (frontendProcess) {
      if (process.platform === 'win32') {
        try { execSync(`taskkill /pid ${frontendProcess.pid} /T /F`, { stdio: 'ignore' }); } catch (e) {}
      } else {
        frontendProcess.kill();
      }
    }
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

// MAIN BOOTSTRAP
(async () => {
  startBackend();
  await waitForBackendReady(25000);
  startFrontend();
  runWatchdog();
  runAntiSleepKeepalive();
})();
