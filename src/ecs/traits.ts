import { trait } from 'koota';
import { Vector } from 'excalibur';
import { RobotActor } from '@/game/robot';

// grid-space position (tile coordinates)
export const Position = trait({ x: 0, y: 0 });

// queued tile coordinates for A* path-following
export const Path = trait(() => [] as Vector[]);

// a tag to mark whichever robot is currently highlighted
export const Selected = trait();

// reference to the Excalibur view object for this entity
export const Renderable = trait(() => new RobotActor());
