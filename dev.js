const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 [DEVGYA DEV] Starting DEVGYA Development Environment...');

const backendDir = path.join(__dirname, 'backend');
let pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const venvPyWin = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
const venvPyNix = path.join(backendDir, 'venv', 'bin', 'python');

if (process.platform === 'win32' && fs.existsSync(venvPyWin)) {
  pyCmd = venvPyWin;
} else if (process.platform !== 'win32' && fs.existsSync(venvPyNix)) {
  pyCmd = venvPyNix;
}

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

function startBackend() {
  if (isShuttingDown) return;
  console.log(`🐍 [DEVGYA DEV] Spawning FastAPI Backend (${pyCmd}) on http://127.0.0.1:8000 (hot-reload)...`);
  backendProcess = spawn(pyCmd, ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  });

  backendProcess.on('error', (err) => console.error('❌ Backend process error:', err.message));
  backendProcess.on('exit', (code) => {
    console.warn(`⚠️ Backend process exited with code ${code}`);
    backendProcess = null;
    if (!isShuttingDown) {
      console.log('🔄 Auto-restarting backend in 1.5s...');
      setTimeout(startBackend, 1500);
    }
  });
}

function startFrontend() {
  if (isShuttingDown) return;
  console.log('⚡ [DEVGYA DEV] Starting Next.js Frontend on http://localhost:3000...');
  frontendProcess = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
  });

  frontendProcess.on('error', (err) => console.error('❌ Frontend process error:', err.message));
  frontendProcess.on('exit', (code) => {
    console.warn(`⚠️ Frontend process exited with code ${code}`);
    frontendProcess = null;
  });
}

const cleanExit = () => {
  isShuttingDown = true;
  console.log('\n🛑 Stopping DEVGYA dev servers...');
  try { if (backendProcess) backendProcess.kill(); } catch (e) {}
  try { if (frontendProcess) frontendProcess.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

startBackend();
setTimeout(startFrontend, 2000);
