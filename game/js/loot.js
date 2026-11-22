// Vaultbreak — the loot.
//
// Every level hides a few pieces: gold bars, gems, cash stacks and, on
// the last floor, the crown jewel. Walking over a piece pockets it with
// a chime and adds its value to the take. The exit stays locked until
// the last piece is taken, so there is no running out early — the job
// is only done when the bag is full.

import { TILE, tileCenter } from './levels.js';

const PICKUP_RADIUS = 26;

export class LootPiece {
  constructor(def) {
    const at = tileCenter(def.tx, def.ty);
    this.x = at.x;
    this.y = at.y;
    this.kind = def.kind;
    this.value = def.value;
    this.taken = false;
    this.bob = Math.random() * Math.PI * 2;
  }
}

export class LootHoard {
  constructor(level) {
    this.pieces = level.loot.map((def) => new LootPiece(def));
  }

  get total() {
    return this.pieces.length;
  }

  get takenCount() {
    return this.pieces.filter((piece) => piece.taken).length;
  }

  get takenValue() {
    return this.pieces
      .filter((piece) => piece.taken)
      .reduce((sum, piece) => sum + piece.value, 0);
  }

  get complete() {
    return this.takenCount === this.total;
  }

  update(dt, thief, onTake) {
    for (const piece of this.pieces) {
      piece.bob += dt * 3;
      if (piece.taken) continue;
      const dx = piece.x - thief.x;
      const dy = piece.y - thief.y;
      if (dx * dx + dy * dy < PICKUP_RADIUS * PICKUP_RADIUS) {
        piece.taken = true;
        onTake(piece);
      }
    }
  }
}
