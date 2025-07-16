// Koota – Robot grid on raw <canvas>
// --------------------------------------------------
// Minimal client component that mirrors the “ExcaliburCanvas” pattern
// shown by the user, but runs a Koota‑powered grid robot with plain
// Canvas 2D drawing and no external game engine.

'use client';

import { useEffect, useRef } from 'react';
import { createWorld, trait } from 'koota';

// === Grid & drawing constants ============================================
const GRID_SIZE = 10;           // 10 × 10 logical cells
const CELL_PX = 48;           // each cell rendered as 48 px square

// === Koota traits ========================================================
interface Vec2 { x: number; y: number }
const Position = trait<Vec2>({ x: 0, y: 0 });
const Robot = trait();       // tag‑only

// === Breadth‑first search for Manhattan grids ============================
function bfs(start: Vec2, goal: Vec2): Vec2[] {
  const inBounds = ({ x, y }: Vec2) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
  const dirs: Vec2[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  const key = ({ x, y }: Vec2) => `${x},${y}`;

  const queue: Vec2[] = [start];
  const cameFrom = new Map<string, Vec2>();
  const visited = new Set<string>([key(start)]);

  while (queue.length) {
    const current = queue.shift()!;
    if (current.x === goal.x && current.y === goal.y) {
      // reconstruct path (exclude start position)
      const path: Vec2[] = [];
      let step: Vec2 | undefined = current;
      while (step && key(step) !== key(start)) {
        path.push(step);
        step = cameFrom.get(key(step));
      }
      return path.reverse();
    }
    for (const d of dirs) {
      const next = { x: current.x + d.x, y: current.y + d.y };
      if (inBounds(next) && !visited.has(key(next))) {
        visited.add(key(next));
        cameFrom.set(key(next), current);
        queue.push(next);
      }
    }
  }
  return [];
}

// === React component =====================================================
export function RobotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 1 · Bootstrap world & robot -----------------------------------------
    const world = createWorld();
    const robot = world.spawn(Position({ x: 4, y: 4 }), Robot);

    // 2 · Canvas 2D setup --------------------------------------------------
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGrid = () => {
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
        // vertical
        ctx.beginPath();
        ctx.moveTo(i * CELL_PX + 0.5, 0.5);
        ctx.lineTo(i * CELL_PX + 0.5, GRID_SIZE * CELL_PX + 0.5);
        ctx.stroke();
        // horizontal
        ctx.beginPath();
        ctx.moveTo(0.5, i * CELL_PX + 0.5);
        ctx.lineTo(GRID_SIZE * CELL_PX + 0.5, i * CELL_PX + 0.5);
        ctx.stroke();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, GRID_SIZE * CELL_PX, GRID_SIZE * CELL_PX);
      drawGrid();
      ctx.fillStyle = '#e11d48'; // rose‑600
      const { x, y } = robot.get(Position)!;
      ctx.fillRect(x * CELL_PX + 4, y * CELL_PX + 4, CELL_PX - 8, CELL_PX - 8);
    };

    // 3 · Movement helper --------------------------------------------------
    const moveRobotTo = (target: Vec2) => {
      const start = robot.get(Position)!;
      const path = bfs(start, target);
      let i = 0;
      const step = () => {
        if (i < path.length) {
          robot.set(Position, path[i]);
          i++;
          draw();                 // redraw immediately for snappy feel
          requestAnimationFrame(step);
        }
      };
      step();
    };

    // 4 · Handle clicks -> move robot -------------------------------------
    const handleClick = (ev: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const gx = Math.floor(cx / CELL_PX);
      const gy = Math.floor(cy / CELL_PX);
      moveRobotTo({ x: gx, y: gy });
    };
    canvas.addEventListener('click', handleClick);

    // 5 · Initial paint & frame loop (for free time‑based stuff) ----------
    draw();

    // no continuous loop needed — we redraw on demand

    // 6 · Cleanup ---------------------------------------------------------
    return () => {
      canvas.removeEventListener('click', handleClick);
      world.destroy();
    };
  }, []);

  return (
    <canvas
      id="RobotCanvas"
      ref={canvasRef}
      width={GRID_SIZE * CELL_PX}
      height={GRID_SIZE * CELL_PX}
      style={{ touchAction: 'none', width: GRID_SIZE * CELL_PX, height: GRID_SIZE * CELL_PX }}
    />
  );
}
