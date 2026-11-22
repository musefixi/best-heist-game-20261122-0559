// Vaultbreak — the sweeping security camera.
//
// A camera is bolted to the wall and sweeps its cone back and forth
// around a base angle, like a lighthouse that never sleeps. Its lens
// blinks red while it can see the thief, and the sweep never stops —
// the thief reads the rhythm and moves between the passes.

import { TILE, tileCenter } from './levels.js';

export class SecurityCamera {
  constructor(def) {
    const at = tileCenter(def.tx, def.ty);
    this.x = at.x;
    this.y = at.y;
    this.base = def.base;
    this.sweep = def.sweep;
    this.speed = def.speed;
    this.phase = Math.random() * Math.PI * 2;
    this.facing = this.base;
    this.seeing = 0;
    this.blink = 0;
  }

  update(dt) {
    this.phase += dt * this.speed;
    this.facing = this.base + Math.sin(this.phase) * this.sweep;
    this.blink += dt;
  }

  // setAngle pins the sweep for a staged screenshot scene.
  setAngle(angle) {
    this.facing = angle;
  }
}
