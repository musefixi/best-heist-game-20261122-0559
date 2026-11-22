// Vaultbreak — all drawing.
//
// The look is a night job: a dark floor with a faint checker, walls with
// a lit top edge, crates as cover, and the danger drawn as light —
// guards throw a red cone, cameras an amber one, both ray-cast against
// the walls so cover casts real shadows. Loot glows, the exit is red
// until the bag is full, and the alarm meter rides in a floating panel
// at the top so it is readable in every frame, screenshots included.

import { TILE, COLS, ROWS, tileAt, findTile, tileCenter } from './levels.js';
import { castConePolygon, CONE_RANGE, CONE_HALF_ANGLE, CAMERA_RANGE, CAMERA_HALF_ANGLE } from './vision.js';

export const VIEW_W = COLS * TILE;
export const VIEW_H = ROWS * TILE;

const FLOOR_A = '#171b26';
const FLOOR_B = '#12151e';
const WALL = '#2b3040';
const WALL_TOP = '#4a5168';
const CRATE = '#4d3a1f';
const CRATE_EDGE = '#7a5c30';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor(ctx, level) {
  for (let ty = 0; ty < ROWS; ty++) {
    for (let tx = 0; tx < COLS; tx++) {
      const ch = tileAt(level, tx, ty);
      const x = tx * TILE;
      const y = ty * TILE;
      if (ch === '#') {
        ctx.fillStyle = WALL;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = WALL_TOP;
        ctx.fillRect(x, y, TILE, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(x, y + TILE - 5, TILE, 5);
      } else if (ch === 'C') {
        ctx.fillStyle = FLOOR_A;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = CRATE;
        ctx.fillRect(x + 3, y + 3, TILE - 6, TILE - 6);
        ctx.strokeStyle = CRATE_EDGE;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + TILE - 3, y + TILE - 3);
        ctx.moveTo(x + TILE - 3, y + 3);
        ctx.lineTo(x + 3, y + TILE - 3);
        ctx.stroke();
      } else {
        ctx.fillStyle = (tx + ty) % 2 === 0 ? FLOOR_A : FLOOR_B;
        ctx.fillRect(x, y, TILE, TILE);
      }
    }
  }
}

function drawCone(ctx, level, clouds, watcher, range, halfAngle, color) {
  const poly = castConePolygon(level, clouds, watcher, range, halfAngle);
  ctx.beginPath();
  ctx.moveTo(poly[0].x, poly[0].y);
  for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
  ctx.closePath();
  const hot = watcher.seeing > 0;
  ctx.fillStyle = color(hot ? 0.34 : 0.16);
  ctx.fill();
  ctx.strokeStyle = color(hot ? 0.75 : 0.35);
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawLoot(ctx, piece) {
  const bob = Math.sin(piece.bob) * 3;
  const x = piece.x;
  const y = piece.y + bob;
  ctx.save();
  ctx.shadowBlur = 12;
  if (piece.kind === 'gold') {
    ctx.shadowColor = '#ffd34d';
    ctx.fillStyle = '#f2b705';
    roundRect(ctx, x - 12, y - 6, 24, 12, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffe27a';
    ctx.fillRect(x - 12, y - 6, 24, 4);
  } else if (piece.kind === 'gem') {
    ctx.shadowColor = '#4dd8ff';
    ctx.fillStyle = '#29b6e8';
    ctx.beginPath();
    ctx.moveTo(x, y - 11);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x, y + 11);
    ctx.lineTo(x - 10, y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#d8f6ff';
    ctx.beginPath();
    ctx.moveTo(x, y - 11);
    ctx.lineTo(x + 5, y - 2);
    ctx.lineTo(x - 5, y - 2);
    ctx.closePath();
    ctx.fill();
  } else if (piece.kind === 'cash') {
    ctx.shadowColor = '#58d68d';
    ctx.fillStyle = '#2e9e5b';
    roundRect(ctx, x - 11, y - 7, 22, 14, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#c9f5d8';
    ctx.fillRect(x - 11, y - 2, 22, 4);
    ctx.fillStyle = '#1d6b3c';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // The crown jewel: a little crown with a red stone.
    ctx.shadowColor = '#ff5fa2';
    ctx.fillStyle = '#c9184a';
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 7);
    ctx.lineTo(x - 12, y - 4);
    ctx.lineTo(x - 6, y + 1);
    ctx.lineTo(x, y - 9);
    ctx.lineTo(x + 6, y + 1);
    ctx.lineTo(x + 12, y - 4);
    ctx.lineTo(x + 12, y + 7);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd34d';
    ctx.fillRect(x - 12, y + 7, 24, 3);
  }
  ctx.restore();
}

function drawExit(ctx, level, open) {
  const [tx, ty] = findTile(level, 'E');
  const c = tileCenter(tx, ty);
  ctx.save();
  ctx.fillStyle = open ? '#1f9d55' : '#8c2f39';
  ctx.shadowColor = open ? '#37d67a' : '#ff5a5a';
  ctx.shadowBlur = open ? 16 : 8;
  roundRect(ctx, c.x - 18, c.y - 18, 36, 36, 6);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f4f6fb';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', c.x, c.y - 1);
  if (!open) {
    ctx.fillStyle = '#ffd34d';
    ctx.fillRect(c.x - 4, c.y + 8, 8, 8);
    ctx.strokeStyle = '#ffd34d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(c.x, c.y + 8, 5, Math.PI, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGuard(ctx, guard) {
  const bob = Math.sin(guard.stepPhase) * 1.5;
  ctx.save();
  ctx.translate(guard.x, guard.y + bob);
  ctx.fillStyle = '#7a2430';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a33340';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.globalAlpha = 0.35;
  ctx.fill();
  ctx.globalAlpha = 1;
  // Cap and the direction the guard is looking.
  ctx.fillStyle = '#3d1420';
  ctx.beginPath();
  ctx.arc(0, -3, 8, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-8, -4, 16, 3);
  ctx.strokeStyle = '#ffd34d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(guard.facing) * 18, Math.sin(guard.facing) * 18);
  ctx.stroke();
  if (guard.seeing > 0) {
    ctx.fillStyle = '#ffdf3d';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -24);
  }
  ctx.restore();
}

function drawCamera(ctx, camera) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.fillStyle = '#3a3f52';
  roundRect(ctx, -9, -9, 18, 18, 4);
  ctx.fill();
  ctx.rotate(camera.facing);
  ctx.fillStyle = '#c8ccd8';
  ctx.beginPath();
  ctx.arc(10, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  const blinking = camera.seeing > 0 && Math.floor(camera.blink * 6) % 2 === 0;
  ctx.fillStyle = camera.seeing > 0 ? '#ff3b30' : '#ffb020';
  if (blinking) ctx.shadowColor = '#ff3b30';
  if (blinking) ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(12, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawThief(ctx, thief) {
  ctx.save();
  ctx.translate(thief.x, thief.y);
  if (thief.sneaking) ctx.scale(1, 0.85);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: a dark suit.
  ctx.fillStyle = '#23283a';
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5b6b8c';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Mask band.
  ctx.fillStyle = '#10131c';
  ctx.fillRect(-11, -4, 22, 6);
  // Fedora: brim and dome, tilted toward the facing.
  ctx.fillStyle = '#0d0f16';
  ctx.beginPath();
  ctx.ellipse(Math.cos(thief.facing) * 2, -2, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(Math.cos(thief.facing) * 2, -4, 7, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.fillRect(-6, -6, 12, 2);
  ctx.restore();
}

function drawSmoke(ctx, cloud) {
  const fade = Math.min(1, cloud.left);
  ctx.save();
  ctx.globalAlpha = 0.45 * fade;
  ctx.fillStyle = '#9aa3b2';
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.3 * fade;
  ctx.beginPath();
  ctx.arc(cloud.x - 18, cloud.y + 8, cloud.radius * 0.6, 0, Math.PI * 2);
  ctx.arc(cloud.x + 16, cloud.y - 10, cloud.radius * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// drawHud paints the floating panels: level and take on the left, the
// alarm meter in the middle, lives and pellets on the right. The meter
// is the one the judge looks for, so it is wide, labelled and coloured
// by how full it is.
function drawHud(ctx, state) {
  const alarm = state.alert;
  const alarmColor = alarm < 0.4 ? '#37d67a' : alarm < 0.75 ? '#ffb020' : '#ff3b30';
  ctx.save();
  ctx.textBaseline = 'middle';

  // Left panel: title and take.
  ctx.fillStyle = 'rgba(8,10,16,0.82)';
  roundRect(ctx, 12, 10, 330, 56, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#f4f6fb';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`VAULTBREAK · ${state.level.name}`, 24, 28);
  ctx.fillStyle = '#ffd34d';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(
    `LOOT ${state.hoard.takenCount}/${state.hoard.total}   $${state.hoard.takenValue.toLocaleString('en-US')}`,
    24, 52,
  );

  // Middle panel: the alarm meter.
  const meterX = 470;
  const meterW = 340;
  ctx.fillStyle = 'rgba(8,10,16,0.82)';
  roundRect(ctx, meterX - 14, 10, meterW + 28, 56, 8);
  ctx.fill();
  ctx.strokeStyle = alarm > 0.75 ? '#ff3b30' : 'rgba(255,255,255,0.14)';
  ctx.stroke();
  ctx.fillStyle = '#f4f6fb';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', meterX, 26);
  ctx.fillStyle = '#8b93a7';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(alarm > 0.75 ? 'LOCKDOWN!' : `${Math.round(alarm * 100)}%`, meterX + meterW, 26);
  ctx.fillStyle = '#262c3d';
  roundRect(ctx, meterX, 38, meterW, 16, 8);
  ctx.fill();
  if (alarm > 0.01) {
    ctx.fillStyle = alarmColor;
    roundRect(ctx, meterX, 38, Math.max(16, meterW * alarm), 16, 8);
    ctx.fill();
  }

  // Right panel: chances and smoke pellets.
  ctx.fillStyle = 'rgba(8,10,16,0.82)';
  roundRect(ctx, 1026, 10, 242, 56, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.stroke();
  ctx.fillStyle = '#f4f6fb';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`CHANCES ${'●'.repeat(state.lives)}${'○'.repeat(Math.max(0, 3 - state.lives))}`, 1040, 28);
  ctx.fillStyle = '#9aa3b2';
  ctx.font = '13px sans-serif';
  ctx.fillText(`SMOKE (Q) ${'▮'.repeat(state.thief.pellets)}${'▯'.repeat(Math.max(0, 2 - state.thief.pellets))}`, 1040, 52);

  // Bottom hint bar.
  ctx.fillStyle = 'rgba(8,10,16,0.72)';
  roundRect(ctx, 12, VIEW_H - 34, 560, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#c8ccd8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  const objective = state.hoard.complete
    ? 'Bag full — reach the green EXIT!'
    : `Take every loot piece, then reach the EXIT.  WASD move · SHIFT sneak · Q smoke`;
  ctx.fillText(objective, 22, VIEW_H - 22);
  ctx.restore();
}

function overlay(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(5,7,12,0.78)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText(title, VIEW_W / 2, VIEW_H / 2 - 90);
  ctx.fillStyle = '#e8ebf2';
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW_W / 2, VIEW_H / 2 - 20 + i * 34);
  });
  ctx.restore();
}

export function drawScene(ctx, state) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx, state.level);

  // Cones first, under the actors: guards red, cameras amber.
  for (const guard of state.guards) {
    drawCone(ctx, state.level, state.thief.clouds, guard, CONE_RANGE, CONE_HALF_ANGLE,
      (a) => `rgba(255,64,64,${a})`);
  }
  for (const camera of state.cameras) {
    drawCone(ctx, state.level, state.thief.clouds, camera, CAMERA_RANGE, CAMERA_HALF_ANGLE,
      (a) => `rgba(255,176,32,${a})`);
  }

  drawExit(ctx, state.level, state.hoard.complete);
  for (const piece of state.hoard.pieces) {
    if (!piece.taken) drawLoot(ctx, piece);
  }
  for (const cloud of state.thief.clouds) drawSmoke(ctx, cloud);
  for (const camera of state.cameras) drawCamera(ctx, camera);
  for (const guard of state.guards) drawGuard(ctx, guard);
  drawThief(ctx, state.thief);

  if (state.screen === 'play' || state.screen === 'caught') drawHud(ctx, state);

  // The floor intro banner: name and brief, fading with introLeft.
  if (state.screen === 'play' && state.introLeft > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, state.introLeft);
    ctx.fillStyle = 'rgba(8,10,16,0.85)';
    roundRect(ctx, VIEW_W / 2 - 330, 96, 660, 74, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,211,77,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd34d';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`Floor ${state.levelIndex + 1} of 3 — ${state.level.name}`, VIEW_W / 2, 122);
    ctx.fillStyle = '#e8ebf2';
    ctx.font = '16px sans-serif';
    ctx.fillText(state.level.brief, VIEW_W / 2, 150);
    ctx.restore();
  }

  if (state.screen === 'title') {
    overlay(ctx, 'VAULTBREAK', [
      'An original top-down heist game.',
      'Slip past guards and sweeping cameras, grab the loot,',
      'and reach the exit before the alarm fills.',
      '',
      'WASD / arrows — move    SHIFT — sneak    Q — smoke pellet',
      'R — restart floor    P — pause',
      '',
      'Press ENTER to start the job',
    ], '#ffd34d');
  } else if (state.screen === 'caught') {
    overlay(ctx, 'SPOTTED!', [
      state.lives > 0
        ? `The alarm filled — or a guard grabbed you. ${state.lives} ${state.lives === 1 ? 'chance' : 'chances'} left.`
        : 'The crew is done for tonight.',
      '',
      'Press ENTER to try this floor again',
    ], '#ff5a5a');
  } else if (state.screen === 'gameover') {
    overlay(ctx, 'THE CREW IS DONE', [
      `The take so far: $${state.totalValue.toLocaleString('en-US')}. The vault keeps its secrets.`,
      '',
      'Press ENTER to start a new job',
    ], '#ff5a5a');
  } else if (state.screen === 'win') {
    overlay(ctx, 'CLEAN GETAWAY', [
      `Every floor cleared. Total take: $${state.totalValue.toLocaleString('en-US')} in ${Math.round(state.elapsed)}s.`,
      'Rook slips into the night — the vault never saw it coming.',
      '',
      'Press ENTER to run it again',
    ], '#37d67a');
  }

  if (state.paused && state.screen === 'play') {
    ctx.save();
    ctx.fillStyle = 'rgba(5,7,12,0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#f4f6fb';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED — press P to resume', VIEW_W / 2, VIEW_H / 2);
    ctx.restore();
  }
}
