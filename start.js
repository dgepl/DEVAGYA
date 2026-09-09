const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DEVGYA FastAPI Python Backend Engine on port 8000...');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// Detect python executable (prefer local venv if available)
let pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const venvPyWin = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
const venvPyNix = path.join(backendDir, 'venv', 'bin', 'python');

if (process.platform === 'win32' && fs.existsSync(venvPyWin)) {
  pyCmd = venvPyWin;
} else if (process.platform !== 'win32' && fs.existsSync(venvPyNix)) {
  pyCmd = venvPyNix;
} else {
  // Dynamically test which Python command has uvicorn installed
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
    } catch (e) {
      // Try next candidate
    }
  }
}

console.log(`🐍 Detected Python runner: "${pyCmd}"`);

const pyArgs = pyCmd === 'uvicorn'
  ? ['main:app', '--host', '0.0.0.0', '--port', '8000']
  : ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'];

const backend = spawn(pyCmd, pyArgs, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

console.log('⚡ Starting DEVGYA Next.js Frontend Web Server on port ' + (process.env.PORT || '3000') + '...');
const port = process.env.PORT || '3000';
const frontend = spawn('npx', ['next', 'start', '-p', port], {
  cwd: frontendDir,
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
