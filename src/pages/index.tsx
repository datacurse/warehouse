'use client';

import { useEffect, useRef } from 'react';

export default function GamePage() {
  const engineRef = useRef<any>(null);

  useEffect(() => {
    async function initEngine() {
      const ex = await import('excalibur');
      const { Engine, DisplayMode, Color, TileMap, Vector, Rectangle } = ex;

      const pathfinding = await import('@excaliburjs/plugin-pathfinding');
      const { ExcaliburAStar } = pathfinding;

      const { isObstacle } = await import("@/game/tiledata");
      const { player } = await import('@/game/player');

      const engine = new Engine({
        displayMode: DisplayMode.FillScreen,
        backgroundColor: Color.fromHex("#ECEEF2"),
        canvasElementId: 'game-canvas',
        antialiasing: false,
      });

      await engine.start();

      // Create the tilemap
      const tilemap = new TileMap({
        rows: 10,
        columns: 10,
        tileWidth: 32,
        tileHeight: 32,
      });

      // Loop and assign graphics
      let tileIndex = 0;
      for (let tile of tilemap.tiles) {
        const fillColor = isObstacle[tileIndex] ? Color.fromHex("#797A80") : Color.fromHex("#ECEEF2");
        const tileGraphic = new Rectangle({
          width: 32,
          height: 32,
          color: fillColor,
          strokeColor: Color.fromHex("#797A80"),
          lineWidth: 1,
        });
        tile.addGraphic(tileGraphic);
        if (isObstacle[tileIndex]) {
          tile.solid = true;
        }
        tileIndex++;
      }

      // Add to scene
      engine.currentScene.add(tilemap);

      // Create A* instance
      const astar = new ExcaliburAStar(tilemap);

      engine.currentScene.add(player);

      // Listen for move complete
      engine.events.on("playerMoveComplete", () => {
        player.playerActionStatus = "idle";
      });

      // Setup click event
      engine.input.pointers.primary.on("down", (evt) => {
        if (!evt.worldPos || player.playerActionStatus === "moving") return;
        const tile = engine.currentScene.tileMaps[0]!.getTileByPoint(evt.worldPos);
        if (!tile) return;
        const targetIndex = tile.x + tile.y * 10;
        if (isObstacle[targetIndex]) return;
        const playerTile = engine.currentScene.tileMaps[0]!.getTileByPoint(player.pos);
        const playerIndex = playerTile ? (playerTile.x + playerTile.y * 10) : 0;
        if (playerIndex === targetIndex) return;
        const path = astar.astar(astar.getNodeByIndex(playerIndex), astar.getNodeByIndex(targetIndex), false);
        if (path.length === 0) return;
        path.forEach((n) => player.playerActionBuffer.push(new Vector(n.x, n.y)));
      });

      // Camera setup
      engine.currentScene.camera.pos = new Vector(32 * 5, 32 * 5);
      engine.currentScene.camera.zoom = 1;

      engineRef.current = engine;
    }

    initEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-screen h-screen">
      <canvas id="game-canvas" className="block w-full h-full" />
    </div>
  );
}