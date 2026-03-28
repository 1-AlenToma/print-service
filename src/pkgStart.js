const { spawn } = require('child_process');
const path = require('path');

const nodeExe = process.execPath;
const indexPath = path.join(__dirname, 'index.js');

const child = spawn(nodeExe, [indexPath], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code));