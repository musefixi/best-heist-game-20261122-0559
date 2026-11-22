// Vaultbreak — the hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/: plain files a desktop
// browser opens offline. This program delivers it the way the bounty
// asks: it copies game/ and screenshots/ into the output directory and
// writes dossier.json there with buildDossier from the vendored
// make.fun library, so the judge reads exactly the files that were
// handed in. Outside the grader, MAKEFUN_OUTPUT_DIR names the output
// directory; inside, it is /output.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps are the gate's own, passed through so the dossier this
// program writes is the dossier the gate rebuilds and compares.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
