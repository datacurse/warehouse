// src/utils/bfs.ts
import { Vec2 } from '../koota/traits'; // Re-use Vec2 interface


export function bfs(start: Vec2, goal: Vec2, gridSize: number): Vec2[] {
  const inBounds = ({ x, y }: Vec2) =>
    x >= 0 && x < gridSize && y >= 0 && y < gridSize;
  const dirs: Vec2[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  const key = ({ x, y }: Vec2) => `${x},${y}`;

  const queue: Vec2[] = [start];
  const cameFrom = new Map<string, Vec2>();
  const visited = new Set<string>([key(start)]);

  while (queue.length) {
    const current = queue.shift()!;
    if (current.x === goal.x && current.y === goal.y) {
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