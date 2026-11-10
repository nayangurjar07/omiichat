const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');
const serverDir = path.join(rootDir, 'server');
const webOut = path.join(webDir, 'out');
const serverPublic = path.join(serverDir, 'public');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('1. Building Next.js Web Application...');
execSync(`${npmCmd} run build`, { cwd: webDir, stdio: 'inherit' });

console.log('2. Syncing built web assets to server/public...');
if (fs.existsSync(webOut)) {
  if (fs.existsSync(serverPublic)) {
    fs.rmSync(serverPublic, { recursive: true, force: true });
  }
  fs.cpSync(webOut, serverPublic, { recursive: true, force: true });

  // Sync Next.js App Router RSC payload aliases (e.g. /chat/__next.chat.__PAGE__.txt)
  function syncRscAliases(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        syncRscAliases(full);
      } else if (entry.name === '__PAGE__.txt') {
        const parentDir = path.basename(dir);
        const grandParentDir = path.dirname(dir);
        const aliasPath = path.join(grandParentDir, parentDir + '.__PAGE__.txt');
        try {
          fs.copyFileSync(full, aliasPath);
        } catch (e) {
          console.warn('Failed to alias RSC file:', aliasPath, e);
        }
      }
    }
  }
  syncRscAliases(serverPublic);
  console.log('Static web application assets and RSC aliases copied successfully.');
} else {
  console.warn('Warning: web/out directory not found.');
}

console.log('3. Building Express & Socket.IO Backend Server...');
execSync(`${npmCmd} run build`, { cwd: serverDir, stdio: 'inherit' });

console.log('Build complete! Ready for deployment.');
