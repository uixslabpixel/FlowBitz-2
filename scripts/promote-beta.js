#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const betaDir = path.join(distDir, 'beta');
const latestDir = path.join(distDir, 'latest');

console.log('🚀 Promoting beta to stable...');

// Check if beta exists
if (!fs.existsSync(betaDir)) {
  console.error('❌ No beta version found. Run "npm run build:beta" first.');
  process.exit(1);
}

// Read beta version info
let betaInfo;
try {
  betaInfo = JSON.parse(fs.readFileSync(path.join(betaDir, 'version.json'), 'utf8'));
  console.log(`📦 Beta version: ${betaInfo.version}`);
} catch (error) {
  console.error('❌ Failed to read beta version info:', error.message);
  process.exit(1);
}

// Get new stable version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const newVersion = packageJson.version;
const versionDir = path.join(distDir, `v${newVersion}`);

console.log(`📦 New stable version: v${newVersion}`);

// Create new stable version directory
if (!fs.existsSync(versionDir)) {
  fs.mkdirSync(versionDir, { recursive: true });
  console.log(`📁 Created version directory: v${newVersion}`);
}

// Copy beta files to new stable version
const files = ['flowbitz.umd.js', 'flowbitz.es.js', 'flowbitz.umd.js.map', 'flowbitz.es.js.map'];
let copiedFiles = 0;

files.forEach(file => {
  const source = path.join(betaDir, file);
  const dest = path.join(versionDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Promoted ${file} to v${newVersion}`);
    copiedFiles++;
  } else {
    console.error(`❌ Source file not found: ${source}`);
    process.exit(1);
  }
});

// The ES entry imports ./chunks/*, so the chunks must travel with it.
const chunksSource = path.join(betaDir, 'chunks');
if (fs.existsSync(chunksSource)) {
  fs.cpSync(chunksSource, path.join(versionDir, 'chunks'), { recursive: true });
  console.log('✅ Copied chunks/');
}

// Update latest to point to new version
if (fs.existsSync(latestDir)) {
  fs.rmSync(latestDir, { recursive: true });
  console.log('🔄 Removed old latest symlink');
}

// Create new latest symlink
try {
  fs.symlinkSync(`v${newVersion}`, latestDir);
  console.log(`🔗 Updated latest symlink → v${newVersion}`);
} catch (error) {
  console.error('❌ Failed to create latest symlink:', error.message);
  process.exit(1);
}

// Create stable version info
const versionInfo = {
  version: newVersion,
  timestamp: new Date().toISOString(),
  promotedFrom: betaInfo.version,
  files: files.filter(file => fs.existsSync(path.join(versionDir, file)))
};

fs.writeFileSync(
  path.join(versionDir, 'version.json'),
  JSON.stringify(versionInfo, null, 2)
);

// Clean up beta
fs.rmSync(betaDir, { recursive: true });
console.log('🧹 Cleaned up beta directory');

console.log(`\n🎉 Beta successfully promoted to stable version v${newVersion}!`);
console.log(`📦 Files promoted: ${copiedFiles}/${files.length}`);
console.log(`🌐 Stable URL: https://www.flowbitz.dev/v${newVersion}/flowbitz.umd.js`);
console.log(`🌐 Latest URL: https://www.flowbitz.dev/latest/flowbitz.umd.js`);
console.log(`\n💡 Users will now get the new version automatically!`);
