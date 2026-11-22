# best-heist-game-20261122-0559

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/musefixi/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/musefixi/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

**Vaultbreak** — an original top-down heist game in plain canvas 2D and vanilla JavaScript ES modules. No libraries, no build step, no network: every file the game loads sits under `game/`.

You are Rook, a thief with three floors to clean out — The Lobby, The Gallery, and The Vault Floor. Guards patrol waypoints and pause to watch; their vision cones are drawn as light, ray-cast against the walls and crates, so cover casts real shadows you can hide in. Security cameras sweep their amber cones back and forth and never blink. Being seen by either fills one shared alarm: it fills faster the clearer the view, slower while you sneak, and it cools down again when you break the line of sight, so a near miss is recoverable. A full alarm — or bumping into a guard — costs one of your three chances. Every floor hides gold, gems and cash, and the last floor the crown jewel; the green EXIT only opens once the bag is full, so the job is done when the loot is, not before. Two smoke pellets a floor (Q) blind every cone they cross.

**Controls**

- `WASD` / arrow keys — move
- `SHIFT` — sneak: slower, but cones reach less far and the alarm fills more slowly
- `Q` — throw a smoke pellet (2 per floor)
- `ENTER` — start, retry after being spotted, play again
- `R` — restart the current floor · `P` — pause

**How it is built** — one job per file under `game/js/`: `levels.js` (the three tile maps, patrols, cameras and loot), `vision.js` (cone and line-of-sight maths, ray-cast cone polygons), `guard.js` (patrols, pauses and the stare), `camera.js` (the sweeping wall cameras), `thief.js` (Rook, movement and smoke pellets), `loot.js` (the hoard and the locked exit), `sound.js` (a tiny WebAudio synth — footsteps, the loot chime, the suspicion ping, the caught buzz, the getaway fanfare; no audio files), `render.js` (all drawing, including the ray-cast cones and the alarm meter), and `main.js` (screens, the detection model and the loop). Sound is synthesized in code; the art is drawn in code; the names, levels and idea are this entry's own.

The four files in `screenshots/` are real renders of this code in a browser, taken with the game's own `?shot=` scenes (see `shots.json`): the cover is the Lobby with Rook mid-room, a guard cone reaching for him, a camera cone sweeping down, loot in view and the alarm meter part-filled — all in one frame — then the title screen, a near-catch on the Gallery with the alarm almost full, and the Vault Floor's crown-jewel approach.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser

# hand the entry in the way the bounty asks:
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ad7vmw7e&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
