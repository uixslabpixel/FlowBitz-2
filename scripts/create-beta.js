#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const betaBuildDir = path.join(distDir, 'beta-build');
const betaDir = path.join(distDir, 'beta');

console.log('🚀 Creating beta version...');

// Create beta directory
if (!fs.existsSync(betaDir)) {
  fs.mkdirSync(betaDir, { recursive: true });
  console.log('📁 Created beta directory');
}

// Copy library files to beta directory
const files = ['flowbitz.umd.js', 'flowbitz.es.js', 'flowbitz.umd.js.map', 'flowbitz.es.js.map'];
let copiedFiles = 0;

files.forEach(file => {
  const source = path.join(betaBuildDir, file);
  const dest = path.join(betaDir, file);
  
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, dest);
    console.log(`✅ Copied ${file} to beta`);
    copiedFiles++;
  } else {
    console.error(`❌ Source file not found: ${source}`);
    process.exit(1);
  }
});

// The ES entry imports ./chunks/*, so the chunks must travel with it.
const chunksSource = path.join(betaBuildDir, 'chunks');
if (fs.existsSync(chunksSource)) {
  fs.cpSync(chunksSource, path.join(betaDir, 'chunks'), { recursive: true });
  console.log('✅ Copied chunks/');
}

// Create beta version info
const betaInfo = {
  version: `beta-${Date.now()}`,
  timestamp: new Date().toISOString(),
  stable: process.env.STABLE_VERSION || '1.0.0',
  files: files.filter(file => fs.existsSync(path.join(betaBuildDir, file)))
};

fs.writeFileSync(
  path.join(betaDir, 'version.json'),
  JSON.stringify(betaInfo, null, 2)
);

console.log(`\n🎉 Beta version created successfully!`);
console.log(`📦 Version: ${betaInfo.version}`);
console.log(`📁 Files copied: ${copiedFiles}/${files.length}`);
console.log(`🌐 Beta URL: https://www.flowbitz.dev/beta/flowbitz.umd.js`);
console.log(`\n💡 To test: <script src="https://www.flowbitz.dev/beta/flowbitz.umd.js"></script>`);
