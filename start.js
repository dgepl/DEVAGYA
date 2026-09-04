const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DEVGYA FastAPI Python Backend Engine on port 8000...');

// Detect python executable (prefer local venv if available)
let pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const venvPyWin = path.join(__dirname, 'backend', 'venv', 'Scripts', 'python.exe');
const venvPyNix = path.join(__dirname, 'backend', 'venv', 'bin', 'python');

if (process.platform === 'win32' && fs.existsSync(venvPyWin)) {
  pyCmd = venvPyWin;
} else if (process.platform !== 'win32' && fs.existsSync(venvPyNix)) {
  pyCmd = venvPyNix;
}

const backend = spawn(pyCmd, ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: './backend',
  stdio: 'inherit',
  shell: true,
});

console.log('⚡ Starting DEVGYA Next.js Frontend Web Server on port ' + (process.env.PORT || '3000') + '...');
const port = process.env.PORT || '3000';
const frontend = spawn('npx', ['next', 'start', '-p', port], {
  cwd: './frontend',
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (err) => console.error('❌ Backend process error:', err));
backend.on('exit', (code) => console.warn(`⚠️ Backend process exited with code ${code}`));
frontend.on('error', (err) => console.error('❌ Frontend process error:', err));
frontend.on('exit', (code) => console.warn(`⚠️ Frontend process exited with code ${code}`));
