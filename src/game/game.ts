// No “use client” here; this file is never imported during SSR
import {
  Engine,
  DisplayMode,
  Color,
  TileMap,
  Vector,
  Rectangle,
} from 'excalibur';
import { ExcaliburAStar } from '@excaliburjs/plugin-pathfinding';

import { isObstacle } from '@/game/tiledata';
import { player } from '@/game/player';

let engine: Engine | null = null;

/**
 * Boot Excalibur and wire up the scene.
 * Call this once from a React effect.
 */
export function startGame(canvasId: string) {
  if (engine) return; // already running

  // ---------------------------------------------------------------- Engine ---
  engine = new Engine({
    displayMode: DisplayMode.FillScreen,
    backgroundColor: Color.fromHex('#ECEEF2'),
    canvasElementId: canvasId,
    antialiasing: false,
  });

  // ------------------------------------------------------------- Tile-map ---
  const tilemap = new TileMap({
    rows: 10,
    columns: 10,
    tileWidth: 32,
    tileHeight: 32,
  });

  tilemap.tiles.forEach((tile, idx) => {
    const fill = isObstacle[idx] ? Color.fromHex('#797A80') : Color.fromHex('#ECEEF2');
    tile.addGraphic(
      new Rectangle({
        width: 32,
        height: 32,
        color: fill,
        strokeColor: Color.fromHex('#797A80'),
        lineWidth: 1,
      }),
    );
    if (isObstacle[idx]) tile.solid = true;
  });

  engine.currentScene.add(tilemap);

  // ----------------------------------------------------------- Path-finding ---
  const astar = new ExcaliburAStar(tilemap);

  // ---------------------------------------------------------------- Player ---
  engine.currentScene.add(player);

  engine.events.on('playerMoveComplete', () => {
    player.playerActionStatus = 'idle';
  });

  engine.input.pointers.primary.on('down', (evt) => {
    if (!evt.worldPos || player.playerActionStatus === 'moving') return;

    const map = engine!.currentScene.tileMaps[0]!;
    const tile = map.getTileByPoint(evt.worldPos);
    if (!tile) return;

    const target = tile.x + tile.y * 10;
    if (isObstacle[target]) return;

    const startTile = map.getTileByPoint(player.pos);
    const start = startTile ? startTile.x + startTile.y * 10 : 0;
    if (start === target) return;

    const path = astar.astar(
      astar.getNodeByIndex(start),
      astar.getNodeByIndex(target),
      false,
    );
    if (!path.length) return;

    path.forEach((n) => player.playerActionBuffer.push(new Vector(n.x, n.y)));
  });

  // --------------------------------------------------------------- Camera ---
  engine.currentScene.camera.pos = new Vector(32 * 5, 32 * 5);
  engine.currentScene.camera.zoom = 1;

  // ---------------------------------------------------------------- Start ---
  engine.start();
}

/** Stop the engine and free references */
export function stopGame() {
  if (!engine) return;
  engine.stop();
  engine = null;
}
