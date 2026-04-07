# Bouncing Ball Simulation

A browser-based 2D physics simulation with elastic ball-to-ball collisions, gravity, friction, and restitution controls. No dependencies — pure HTML, CSS, and vanilla JavaScript.

## Demo

Open `index.html` in any modern browser.

## Features

- **Elastic collisions** — mass-weighted ball-to-ball collision resolution
- **Gravity** — adjustable strength (or toggle off for zero-G)
- **Bounce (restitution)** — controls energy retained after each bounce
- **Friction** — per-frame velocity damping
- **Click to spawn** — click anywhere on the canvas to drop a new ball
- **Explode** — launches all balls outward from the canvas centre
- **Live stats** — ball count, average speed, collision counter
- Resize-aware (handles window resize / device pixel ratio)

## Files

```
bouncing-balls/
├── index.html      # Markup and layout
├── style.css       # Dark-theme styles
└── simulation.js   # Physics engine and UI wiring
```

## Getting started

```bash
git clone https://github.com/your-username/bouncing-balls.git
cd bouncing-balls
open index.html   # or just double-click it
```

No build step, no npm, no bundler required.

## Physics overview

Each frame:

1. Apply gravity to `vy`
2. Apply friction to `vx` and `vy`
3. Integrate position (`x += vx`, `y += vy`)
4. Resolve wall collisions with coefficient of restitution `e`
5. Broad-phase O(n²) overlap check for ball pairs
6. Narrow-phase collision: separate overlapping balls via mass-weighted positional correction, then exchange impulse using `j = -(1+e) · (Δv · n̂) / (1/mA + 1/mB)`

## Controls

| Control | Description |
|---------|-------------|
| Gravity slider | Downward acceleration strength |
| Bounce slider | Energy retained per bounce (1 = perfectly elastic) |
| Friction slider | Velocity multiplier per frame (1 = frictionless) |
| Ball count slider | Number of balls on reset |
| + Add ball | Spawn one random ball |
| Clear | Remove all balls |
| Reset | Re-initialise with current ball count |
| Pause / Resume | Freeze / unfreeze the simulation |
| Gravity: on/off | Toggle gravitational acceleration |
| Explode! | Blast all balls away from the centre |

## License

MIT
