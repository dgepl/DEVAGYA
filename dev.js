const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 [DEVGYA DEV] Starting FastAPI Python Backend on http://127.0.0.1:8000 (with hot-reload)...');

let pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const venvPyWin = path.join(__dirname, 'backend', 'venv', 'Scripts', 'python.exe');
const venvPyNix = path.join(__dirname, 'backend', 'venv', 'bin', 'python');

if (process.platform === 'win32' && fs.existsSync(venvPyWin)) {
  pyCmd = venvPyWin;
} else if (process.platform !== 'win32' && fs.existsSync(venvPyNix)) {
  pyCmd = venvPyNix;
}

const backend = spawn(pyCmd, ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true,
});

console.log('⚡ [DEVGYA DEV] Starting Next.js Frontend on http://localhost:3000...');
const frontend = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => console.error('❌ Backend process error:', err));
backend.on('exit', (code) => console.warn(`⚠️ Backend process exited with code ${code}`));
frontend.on('error', (err) => console.error('❌ Frontend process error:', err));
frontend.on('exit', (code) => console.warn(`⚠️ Frontend process exited with code ${code}`));

const cleanExit = () => {
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
