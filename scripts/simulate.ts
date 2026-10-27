// Balancing harness (#23): plays the three player profiles for N days and writes the reference
// curves to docs/balancing/. Usage: npx tsx scripts/simulate.ts [days=30]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { PROFILES } from './balancing/profiles';
import { milestonesCsv, snapshotsCsv, summaryMarkdown } from './balancing/report';
import { runProfile } from './balancing/run';

const days = Number(process.argv[2] ?? 30);
const outputDir = path.resolve(__dirname, '../docs/balancing');
mkdirSync(outputDir, { recursive: true });

const started = performance.now();
const results = PROFILES.map((profile) => runProfile(profile, days));
const elapsedSeconds = (performance.now() - started) / 1000;

for (const result of results) {
  writeFileSync(path.join(outputDir, `${result.profile.id}.csv`), snapshotsCsv(result));
}
writeFileSync(path.join(outputDir, 'jalons.csv'), milestonesCsv(results));
writeFileSync(path.join(outputDir, 'resume.md'), summaryMarkdown(results, days));
console.log(`${PROFILES.length} profils × ${days} jours simulés en ${elapsedSeconds.toFixed(1)} s`);
