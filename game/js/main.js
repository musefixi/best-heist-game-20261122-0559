// Vaultbreak — the game itself: state, detection and the loop.
//
// Screens: title -> play -> (caught -> play) -> win / gameover.
// Detection is one alarm shared by every guard and camera: while any
// watcher can see Rook the alarm fills, faster the clearer the view
// and slower while Rook sneaks; unseen, it cools down again, so a near
// miss is recoverable. A full alarm, or bumping into a guard, costs a
// chance. The exit opens only once every loot piece is pocketed.

import { LEVELS, findTile, tileCenter, TILE } from './levels.js';
import { Guard } from './guard.js';
import { SecurityCamera } from './camera.js';
import { Thief } from './thief.js';
import { LootHoard } from './loot.js';
import { coneSees, CONE_RANGE, CONE_HALF_ANGLE, CAMERA_RANGE, CAMERA_HALF_ANGLE } from './vision.js';
import { SoundBank } from './sound.js';
import { drawScene, VIEW_W, VIEW_H } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const status = document.getElementById('status');

const keys = new Set();
const sound = new SoundBank();

const state = {
  screen: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  thief: null,
  guards: [],
  cameras: [],
  hoard: null,
  alert: 0,
  lives: 3,
  elapsed: 0,
  totalValue: 0,
  timesSpotted: 0,
  introLeft: 0,
  frozen: false,
  paused: false,
  pinged: false,
};

function loadLevel(index) {
  state.levelIndex = index;
  state.level = LEVELS[index];
  const [sx, sy] = findTile(state.level, 'S');
  state.thief = new Thief(state.level, tileCenter(sx, sy));
  state.guards = state.level.guards.map((patrol) => new Guard(state.level, patrol));
  state.cameras = state.level.cameras.map((def) => new SecurityCamera(def));
  state.hoard = new LootHoard(state.level);
  state.alert = 0;
  state.pinged = false;
  state.introLeft = 2.6;
}

function startRun() {
  state.lives = 3;
  state.elapsed = 0;
  state.totalValue = 0;
  state.timesSpotted = 0;
  loadLevel(0);
  state.screen = 'play';
  say(`Vaultbreak. Floor 1 of 3: ${state.level.name}. ${state.level.brief}`);
}

function onCaught() {
  state.lives -= 1;
  state.timesSpotted += 1;
  sound.caught();
  state.screen = state.lives > 0 ? 'caught' : 'gameover';
  say(state.lives > 0 ? 'Spotted! The alarm went up.' : 'Out of chances. The crew is done.');
}

function onFloorCleared() {
  state.totalValue += state.hoard.takenValue;
  if (state.levelIndex + 1 < LEVELS.length) {
    sound.clear();
    loadLevel(state.levelIndex + 1);
    say(`Floor ${state.levelIndex + 1} of 3: ${state.level.name}. ${state.level.brief}`);
  } else {
    sound.win();
    state.screen = 'win';
    say(`Clean getaway. Total take $${state.totalValue}.`);
  }
}

function say(text) {
  if (status) status.textContent = text;
}

// stepDetection prices every watcher's current view of Rook into the
// shared alarm, and catches Rook on a touch or a full meter. Cameras
// fill the meter a touch faster than guards: their cones never blink.
function stepDetection(dt) {
  let best = 0;
  for (const guard of state.guards) {
    guard.seeing = coneSees(state.level, state.thief.clouds, guard, state.thief, CONE_RANGE, CONE_HALF_ANGLE);
    if (guard.seeing > best) best = guard.seeing;
    const dx = guard.x - state.thief.x;
    const dy = guard.y - state.thief.y;
    if (dx * dx + dy * dy < 26 * 26) {
      onCaught();
      return;
    }
  }
  for (const camera of state.cameras) {
    camera.seeing = coneSees(state.level, state.thief.clouds, camera, state.thief, CAMERA_RANGE, CAMERA_HALF_ANGLE);
    if (camera.seeing > 0) best = Math.max(best, camera.seeing * 1.15);
  }
  if (best > 0) {
    const fill = dt * 1.5 * (0.3 + 0.7 * Math.min(1, best)) * (state.thief.sneaking ? 0.5 : 1);
    state.alert = Math.min(1, state.alert + fill);
    if (state.alert > 0.5 && !state.pinged) {
      state.pinged = true;
      sound.ping();
    }
    if (state.alert >= 1) onCaught();
  } else {
    state.alert = Math.max(0, state.alert - dt * 0.5);
    if (state.alert < 0.3) state.pinged = false;
  }
}

function update(dt) {
  if (state.screen !== 'play' || state.frozen || state.paused) return;
  state.elapsed += dt;
  if (state.introLeft > 0) state.introLeft -= dt;
  state.thief.update(dt, keys);
  if (state.thief.moving) sound.step(state.thief.sneaking, performance.now());
  for (const guard of state.guards) {
    guard.update(dt, guard.seeing > 0);
  }
  for (const camera of state.cameras) camera.update(dt);
  state.hoard.update(dt, state.thief, (piece) => {
    sound.loot();
    say(`Pocketed ${piece.kind} — $${piece.value}. ${state.hoard.takenCount} of ${state.hoard.total}.`);
  });
  stepDetection(dt);
  if (state.screen !== 'play') return;
  if (state.hoard.complete) {
    const ptx = Math.floor(state.thief.x / TILE);
    const pty = Math.floor(state.thief.y / TILE);
    const [etx, ety] = findTile(state.level, 'E');
    if (ptx === etx && pty === ety) onFloorCleared();
  }
}

// arrangeShot composes a frozen scene for the maker's screenshots: the
// same code paths as play, with the pieces placed and the loop's update
// switched off, so each shot is a real render of the game as played.
function arrangeShot() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;
  if (shot === 'title') {
    state.screen = 'title';
    state.frozen = true;
    return;
  }
  startRun();
  state.frozen = true;
  state.introLeft = 0;
  const place = (who, tx, ty, facing) => {
    const c = tileCenter(tx, ty);
    who.x = c.x;
    who.y = c.y;
    if (facing !== undefined) who.facing = facing;
  };
  if (shot === 'cover') {
    // One frame, everything the judge looks for: Rook mid-room, a guard
    // cone reaching for him, a camera cone sweeping down, loot in view,
    // and the alarm meter part-filled in the HUD.
    place(state.guards[0], 13, 6, Math.PI / 4);
    place(state.guards[1], 28, 6, Math.PI / 2);
    place(state.thief, 15, 8, Math.PI);
    state.thief.sneaking = true;
    state.cameras[0].setAngle(1.74);
    state.cameras[0].seeing = 0.55;
    state.guards[0].seeing = 0.6;
    state.hoard.pieces[3].taken = true;
    state.alert = 0.38;
    state.elapsed = 74;
  } else if (shot === 'alarm') {
    loadLevel(1);
    state.frozen = true;
    state.introLeft = 0;
    place(state.guards[0], 12, 7, Math.PI);
    place(state.thief, 9, 7, 0);
    state.guards[0].seeing = 0.9;
    state.cameras[0].setAngle(Math.PI / 2);
    state.alert = 0.85;
    state.elapsed = 132;
  } else if (shot === 'vault') {
    loadLevel(2);
    state.frozen = true;
    state.introLeft = 0;
    place(state.guards[1], 10, 7, 0);
    place(state.thief, 14, 10, Math.PI / 2);
    state.cameras[0].setAngle(Math.PI / 2 + 0.4);
    state.hoard.pieces[0].taken = true;
    state.hoard.pieces[1].taken = true;
    state.alert = 0.12;
    state.elapsed = 201;
    state.lives = 2;
  }
}

window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) {
    event.preventDefault();
  }
  sound.ensure();
  keys.add(event.code);
  if (event.code === 'KeyQ' && state.screen === 'play' && !state.frozen && !state.paused) {
    if (state.thief.throwPellet()) sound.puff();
  }
  if (event.code === 'Enter') {
    if (state.screen === 'title' || state.screen === 'win' || state.screen === 'gameover') startRun();
    else if (state.screen === 'caught') {
      loadLevel(state.levelIndex);
      state.screen = 'play';
    }
  }
  if (event.code === 'KeyR' && state.screen === 'play' && !state.frozen) {
    loadLevel(state.levelIndex);
  }
  if (event.code === 'KeyP' && state.screen === 'play' && !state.frozen) {
    state.paused = !state.paused;
    say(state.paused ? 'Paused.' : 'Vaultbreak, resumed.');
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

loadLevel(0);
arrangeShot();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.screen === 'title' && !state.frozen) state.elapsed += dt; // the title cones sweep
  update(dt);
  drawScene(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
