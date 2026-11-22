// Vaultbreak — the thief, Rook, and the smoke pellets.
//
// Rook walks with WASD or the arrow keys and sneaks while SHIFT is held:
// slower, but harder to spot. Movement is axis-separated against the
// tile map, so sliding along a wall feels smooth. Q throws a smoke
// pellet at Rook's feet: the cloud hangs for a few seconds and blocks
// every cone that crosses it, guards and cameras alike. Two pellets a
// level, no more — the getaway bag only holds so much.

import { TILE, isSolid } from './levels.js';

export const THIEF_RADIUS = 13;
const WALK_SPEED = TILE * 3.4;
const SNEAK_SPEED = TILE * 1.9;
const SMOKE_DURATION = 4;
const SMOKE_RADIUS = TILE * 1.8;

export class SmokeCloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = SMOKE_RADIUS;
    this.left = SMOKE_DURATION;
  }

  update(dt) {
    this.left -= dt;
    return this.left > 0;
  }
}

export class Thief {
  constructor(level, start) {
    this.level = level;
    this.x = start.x;
    this.y = start.y;
    this.facing = 0;
    this.sneaking = false;
    this.moving = false;
    this.stepPhase = 0;
    this.pellets = 2;
    this.clouds = [];
  }

  // throwPellet drops a smoke cloud at the thief's feet, if any are left.
  throwPellet() {
    if (this.pellets <= 0) return false;
    this.pellets -= 1;
    this.clouds.push(new SmokeCloud(this.x, this.y));
    return true;
  }

  update(dt, keys) {
    let ax = 0;
    let ay = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) ax -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) ax += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) ay -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) ay += 1;
    this.sneaking = keys.has('ShiftLeft') || keys.has('ShiftRight');
    this.moving = ax !== 0 || ay !== 0;
    if (this.moving) {
      const len = Math.hypot(ax, ay);
      ax /= len;
      ay /= len;
      this.facing = Math.atan2(ay, ax);
      const speed = (this.sneaking ? SNEAK_SPEED : WALK_SPEED) * dt;
      this.moveAxis(ax * speed, 0);
      this.moveAxis(0, ay * speed);
      this.stepPhase += (speed / TILE) * Math.PI * 2;
    }
    this.clouds = this.clouds.filter((cloud) => cloud.update(dt));
  }

  // moveAxis moves along one axis and stops at the first solid tile the
  // thief's circle would touch, so a diagonal walk slides along walls.
  moveAxis(dx, dy) {
    const nx = this.x + dx;
    const ny = this.y + dy;
    const r = THIEF_RADIUS;
    const corners = [
      [nx - r, ny - r],
      [nx + r, ny - r],
      [nx - r, ny + r],
      [nx + r, ny + r],
    ];
    for (const [cx, cy] of corners) {
      if (isSolid(this.level, Math.floor(cx / TILE), Math.floor(cy / TILE))) return;
    }
    this.x = nx;
    this.y = ny;
  }
}
