const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../web/out');
const dest = path.resolve(__dirname, '../server/public');

function syncRscAliases(dir) {
  if (!fs.existsSync(dir)) return;
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === '__PAGE__.txt') {
        const parentDir = path.basename(current);
        const grandParentDir = path.dirname(current);
        const aliasPath = path.join(grandParentDir, parentDir + '.__PAGE__.txt');
        try {
          fs.copyFileSync(full, aliasPath);
        } catch (e) {
          console.warn('Failed to alias RSC file:', aliasPath, e);
        }
      }
    }
  }
  walk(dir);
}

if (fs.existsSync(src)) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.cpSync(src, dest, { recursive: true, force: true });
  syncRscAliases(dest);
  console.log(`Copied web build from ${src} to ${dest} and synchronized RSC aliases`);
} else {
  console.warn(`Source build directory does not exist: ${src}`);
}

