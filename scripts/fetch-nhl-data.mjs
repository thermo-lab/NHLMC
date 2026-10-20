/**
 * Live NHL Data Ingestion Script (Alias / Proxy to Comprehensive 32-Team Ingestion)
 * Always maintains full 32-team roster coverage with canonical NHL IDs.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fullScript = path.join(__dirname, 'fetch-all-nhl-data.mjs');

console.log('Running comprehensive 32-team NHL data ingestion...');
const child = spawn(process.execPath, [fullScript], { stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
