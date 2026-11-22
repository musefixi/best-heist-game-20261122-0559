// Vaultbreak — vision: cones, line of sight and smoke.
//
// A watcher (a guard or a camera) sees inside a cone: a range and a
// half-angle around the way it faces. Walls and crates block sight, and
// so does a smoke cloud. The check walks the straight line from the
// watcher's eyes to the thief in small steps and stops at the first
// solid tile or smoke cloud, which is exact enough at this tile size
// and cheap. The same marching walk, fanned across the cone, builds the
// lit polygon the renderer draws.

import { TILE, tileAt, isSolidChar } from './levels.js';

export const CONE_RANGE = TILE * 4.4; // how far a guard can see
export const CAMERA_RANGE = TILE * 7.5; // cameras watch further
export const CONE_HALF_ANGLE = 0.56; // radians either side of facing (~32 deg)
export const CAMERA_HALF_ANGLE = 0.48;

// angleDifference wraps an angle to [-PI, PI] so cone tests compare the
// short way around the circle.
export function angleDifference(a, b) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// pointInSmoke reports whether (x, y) sits inside any live smoke cloud.
export function pointInSmoke(clouds, x, y) {
  for (const cloud of clouds) {
    const dx = x - cloud.x;
    const dy = y - cloud.y;
    if (dx * dx + dy * dy < cloud.radius * cloud.radius) return true;
  }
  return false;
}

// lineOfSightClear walks from (x0, y0) to (x1, y1); it returns false as
// soon as a step lands inside a wall or crate tile, or inside smoke.
// The last step onto the target's own tile never counts, so standing
// against a crate does not hide the tile behind it by itself.
export function lineOfSightClear(level, clouds, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / (TILE / 4)));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    if (isSolidChar(tileAt(level, Math.floor(x / TILE), Math.floor(y / TILE)))) return false;
    if (pointInSmoke(clouds, x, y)) return false;
  }
  return true;
}

// coneSees tests one watcher against the thief. It returns 0 when the
// thief is not seen, else a clarity from 0..1: 1 at the centre of the
// cone at close range, fading toward the cone's edge and far end.
// Sneaking shrinks the thief's profile, which shortens the range a
// watcher can make them out at.
export function coneSees(level, clouds, watcher, thief, range, halfAngle) {
  const dx = thief.x - watcher.x;
  const dy = thief.y - watcher.y;
  const dist = Math.hypot(dx, dy);
  const reach = range * (thief.sneaking ? 0.78 : 1);
  if (dist > reach) return 0;
  const bearing = Math.atan2(dy, dx);
  const offAxis = Math.abs(angleDifference(bearing, watcher.facing));
  if (offAxis > halfAngle) return 0;
  if (!lineOfSightClear(level, clouds, watcher.x, watcher.y, thief.x, thief.y)) return 0;
  const axisClarity = 1 - (offAxis / halfAngle) * 0.55;
  const rangeClarity = 1 - (dist / reach) * 0.45;
  return Math.max(0.05, axisClarity * rangeClarity);
}

// castConePolygon marches rays across the cone and returns the lit
// polygon: the watcher's position followed by the hit point of each ray.
// A ray stops at the first solid tile, at the edge of a smoke cloud, or
// at the cone's range, whichever comes first.
export function castConePolygon(level, clouds, watcher, range, halfAngle) {
  const rays = 26;
  const points = [{ x: watcher.x, y: watcher.y }];
  for (let i = 0; i <= rays; i++) {
    const angle = watcher.facing - halfAngle + (2 * halfAngle * i) / rays;
    const stepX = Math.cos(angle) * (TILE / 4);
    const stepY = Math.sin(angle) * (TILE / 4);
    let x = watcher.x;
    let y = watcher.y;
    let travelled = 0;
    while (travelled < range) {
      x += stepX;
      y += stepY;
      travelled += TILE / 4;
      if (isSolidChar(tileAt(level, Math.floor(x / TILE), Math.floor(y / TILE)))) break;
      if (pointInSmoke(clouds, x, y)) break;
    }
    points.push({ x, y });
  }
  return points;
}
