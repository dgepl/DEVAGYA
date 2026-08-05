const { spawn } = require('child_process');

console.log('🚀 Starting DEVGYA FastAPI Python Backend Engine on port 8000...');
const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
const backend = spawn(pyCmd, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
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

backend.on('error', (err) => console.error('Backend process error:', err));
frontend.on('error', (err) => console.error('Frontend process error:', err));
