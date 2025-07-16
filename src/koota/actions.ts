import { createActions } from 'koota'
import { Position } from '@/koota/traits'      // <-- adjust import paths to your project
import { robot } from '@/koota/world'         // the entity you exported earlier

export const actions = createActions((world) => ({
  /** Move our robot one tile to the right */
  moveRobotRight: () => {
    // Grab the current snapshot of the Position trait
    const pos = robot.get(Position)               // returns { x, y } or undefined :contentReference[oaicite:0]{index=0}
    if (!pos) return                              // robot might have been destroyed

    // Write the updated Position back to the trait store
    robot.set(Position, { ...pos, x: pos.x + 1 }) // safe, event-driven mutation :contentReference[oaicite:1]{index=1}
  }
}))
