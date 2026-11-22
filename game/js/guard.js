// Vaultbreak — the patrolling guard.
//
// A guard walks its waypoint list in straight lines, stands at each
// waypoint for `pause` seconds while it scans, then walks on. When it
// can see the thief it stops walking and stares: the alarm is the
// game's business, the guard's is to hold the stare until the thief
// breaks the line of sight.

import { TILE, tileCenter } from './levels.js';
import { angleDifference } from './vision.js';

const WALK_SPEED = TILE * 2.1; // pixels per second on patrol
const TURN_SPEED = 5.2; // radians per second while turning to face a waypoint

export class Guard {
  constructor(level, patrol) {
    this.level = level;
    this.waypoints = patrol.waypoints;
    this.pause = patrol.pause ?? 1;
    this.leg = 0;
    this.waiting = 0;
    const start = tileCenter(this.waypoints[0][0], this.waypoints[0][1]);
    this.x = start.x;
    this.y = start.y;
    this.facing = this.faceNextLeg();
    this.seeing = 0;
    this.stepPhase = Math.random() * Math.PI * 2;
  }

  faceNextLeg() {
    const [tx, ty] = this.waypoints[(this.leg + 1) % this.waypoints.length];
    const target = tileCenter(tx, ty);
    return Math.atan2(target.y - this.y, target.x - this.x);
  }

  update(dt, spotted) {
    if (spotted) {
      // Hold the stare: the guard plants its feet while it watches.
      return;
    }
    if (this.waiting > 0) {
      this.waiting -= dt;
      if (this.waiting <= 0) {
        this.leg = (this.leg + 1) % this.waypoints.length;
        this.facing = this.faceNextLeg();
      }
      return;
    }
    const [tx, ty] = this.waypoints[(this.leg + 1) % this.waypoints.length];
    const target = tileCenter(tx, ty);
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);
    const want = Math.atan2(dy, dx);
    const turn = angleDifference(want, this.facing);
    const maxTurn = TURN_SPEED * dt;
    this.facing += Math.max(-maxTurn, Math.min(maxTurn, turn));
    const step = Math.min(dist, WALK_SPEED * dt);
    this.x += Math.cos(this.facing) * step;
    this.y += Math.sin(this.facing) * step;
    this.stepPhase += (step / TILE) * Math.PI * 2;
    if (dist - step < 2) {
      this.x = target.x;
      this.y = target.y;
      this.waiting = this.pause;
      // At the end of a patrol leg the guard looks around before moving on.
      this.facing = want + (Math.random() - 0.5) * 0.8;
    }
  }
}
