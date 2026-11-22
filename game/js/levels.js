// Vaultbreak — level definitions.
//
// Each level is a tile map (32 x 20) plus the patrols, cameras and loot
// that live on it. Tiles:
//   '#'  wall        blocks movement and sight
//   'C'  crate       blocks movement and sight, the cover you hide behind
//   '.'  floor
//   'S'  thief start (floor)
//   'E'  exit door   (floor; opens once every loot piece is taken)
// Guard patrols are waypoint lists in tile coordinates. Consecutive
// waypoints share a row or a column, so a guard always walks in straight
// lines, and `pause` is how many seconds it stands at each waypoint,
// watching, before it walks on. Cameras sit on a floor tile next to a
// wall and sweep their cone back and forth around a base angle.

export const TILE = 40;
export const COLS = 32;
export const ROWS = 20;

export const LEVELS = [
  {
    name: 'The Lobby',
    brief: 'Grab every loot piece, then reach the green EXIT. Stay out of the cones.',
    map: [
      '################################',
      '#......#..........#............#',
      '#.S....#....C.....#.....C......#',
      '#......#..........#............#',
      '#..C...#....C.....#......C.....#',
      '#......#..........#............#',
      '#..............................#',
      '#....C.......#........C........#',
      '#............#.................#',
      '#......C.....#......C......C...#',
      '#............#.................#',
      '#..C.........#..........C......#',
      '#............#.................#',
      '#......C.....#......C..........#',
      '#............#.................#',
      '#..C.........#...........C...E.#',
      '#............#.................#',
      '#......C.....#......C..........#',
      '#............#.................#',
      '################################',
    ],
    guards: [
      { waypoints: [[2, 6], [21, 6]], pause: 0.9 },
      { waypoints: [[28, 2], [28, 13]], pause: 1.0 },
    ],
    cameras: [
      { tx: 16, ty: 2, base: Math.PI / 2, sweep: 0.7, speed: 0.45 },
    ],
    loot: [
      { tx: 27, ty: 2, kind: 'gold', value: 500 },
      { tx: 10, ty: 9, kind: 'gem', value: 800 },
      { tx: 27, ty: 13, kind: 'cash', value: 300 },
      { tx: 4, ty: 14, kind: 'cash', value: 300 },
    ],
  },
  {
    name: 'The Gallery',
    brief: 'Two cameras now sweep the halls. Smoke pellets (Q) blind a cone for a while.',
    map: [
      '################################',
      '#....#........#........#.......#',
      '#.S..#...C....#...C....#...C...#',
      '#....#........#........#.......#',
      '#..C.....C....#....C.......C...#',
      '#....#........#........#.......#',
      '#....#...C....#...C....#...C...#',
      '#..............................#',
      '#......C........C........C.....#',
      '#..#.........#........#........#',
      '#..#....C....#....C....#...C...#',
      '#..#.........#........#........#',
      '#..#....C....#........#....C...#',
      '#......C........C........C.....#',
      '#..#.........#........#........#',
      '#..#....C....#....C....#...C.E.#',
      '#..#.........#........#........#',
      '#......C........C........C.....#',
      '#..#.........#........#........#',
      '################################',
    ],
    guards: [
      { waypoints: [[2, 7], [29, 7]], pause: 0.8 },
      { waypoints: [[13, 1], [13, 6]], pause: 1.1 },
      { waypoints: [[24, 8], [24, 18]], pause: 1.0 },
    ],
    cameras: [
      { tx: 8, ty: 1, base: Math.PI / 2, sweep: 0.65, speed: 0.55 },
      { tx: 27, ty: 18, base: -Math.PI / 2, sweep: 0.65, speed: 0.5 },
    ],
    loot: [
      { tx: 29, ty: 2, kind: 'gold', value: 500 },
      { tx: 6, ty: 4, kind: 'cash', value: 300 },
      { tx: 17, ty: 9, kind: 'gem', value: 800 },
      { tx: 29, ty: 13, kind: 'gold', value: 500 },
      { tx: 5, ty: 17, kind: 'cash', value: 300 },
    ],
  },
  {
    name: 'The Vault Floor',
    brief: 'Three guards, three cameras, one crown jewel. The vault does not forgive.',
    map: [
      '################################',
      '#....#......#......#......#....#',
      '#.S..#..C...#..C...#..C...#....#',
      '#....#......#......#......#....#',
      '#..C....C...#...C..#...C...#...#',
      '#....#......#......#......#....#',
      '#....#..C...#..C...#..C........#',
      '#..............................#',
      '#......C.......C.......C...#...#',
      '#..#.......#...........#.......#',
      '#..#...C...#....C..#...#...C...#',
      '#..#.......#.......#...........#',
      '#..#...C...#..C....#...#...C...#',
      '#......C.......#...#.......#...#',
      '#..C.......C...#.......#.......#',
      '#..#.......#...#....C..#....E..#',
      '#..#...C...#...#.......#.......#',
      '#......C.......#...C...#...C...#',
      '#..#.......#.......#...........#',
      '################################',
    ],
    guards: [
      { waypoints: [[10, 1], [10, 6]], pause: 0.9 },
      { waypoints: [[4, 7], [19, 7]], pause: 0.6 },
      { waypoints: [[21, 8], [21, 18]], pause: 1.2 },
    ],
    cameras: [
      { tx: 15, ty: 1, base: Math.PI / 2, sweep: 0.7, speed: 0.6 },
      { tx: 28, ty: 7, base: Math.PI, sweep: 0.6, speed: 0.5 },
      { tx: 6, ty: 18, base: -Math.PI / 2, sweep: 0.7, speed: 0.55 },
    ],
    loot: [
      { tx: 27, ty: 2, kind: 'gold', value: 500 },
      { tx: 15, ty: 4, kind: 'gem', value: 800 },
      { tx: 26, ty: 9, kind: 'cash', value: 300 },
      { tx: 8, ty: 14, kind: 'gold', value: 500 },
      { tx: 15, ty: 10, kind: 'jewel', value: 1200 },
    ],
  },
];

// tileAt returns the map character at tile (tx, ty); anything off the map
// is a wall, so the edges of the world are solid by construction.
export function tileAt(level, tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return '#';
  return level.map[ty][tx];
}

export function isSolidChar(ch) {
  return ch === '#' || ch === 'C';
}

export function isSolid(level, tx, ty) {
  return isSolidChar(tileAt(level, tx, ty));
}

// findTile returns the [tx, ty] of the first tile holding `ch`.
export function findTile(level, ch) {
  for (let ty = 0; ty < ROWS; ty++) {
    const tx = level.map[ty].indexOf(ch);
    if (tx !== -1) return [tx, ty];
  }
  return [1, 1];
}

// tileCenter converts tile coordinates to the pixel centre of the tile.
export function tileCenter(tx, ty) {
  return { x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 };
}

// lootTotal is the value of every loot piece on a level.
export function lootTotal(level) {
  return level.loot.reduce((sum, piece) => sum + piece.value, 0);
}
