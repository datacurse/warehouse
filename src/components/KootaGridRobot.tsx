'use client';

import { useEffect, useRef } from 'react';
import { createWorld } from 'koota';


const GRID_SIZE = 10;
const CELL_PX = 48;

export function RobotCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    const world = createWorld();
    const robot = world.spawn(Position({ x: 4, y: 4 }), Robot);

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
