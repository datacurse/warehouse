import { createWorld } from 'koota';
import { Position, Velocity } from './traits';

export const world = createWorld();

export const robot = world.spawn(Position, Velocity({ x: 1, y: 1 }))