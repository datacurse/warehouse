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
import { Robot } from '@/game/robot'; // Changed import path to robot

let engine: Engine | null = null;
let robots: Robot[] = []; // Array to hold multiple robots
let selectedRobot: Robot | null = null; // State for the currently selected robot

export function startGame(canvasId: string) {
  if (engine) return; // already running

  engine = new Engine({
    displayMode: DisplayMode.FillScreen,
    backgroundColor: Color.fromHex('#ECEEF2'),
    canvasElementId: canvasId,
    antialiasing: false,
  });

  const tilemap = new TileMap({
    rows: 10,
    columns: 10,
    tileWidth: 32,
    tileHeight: 32,
  });

  tilemap.tiles.forEach((tile, idx) => {
    const fill = isObstacle[idx] ?
      Color.fromHex('#797A80') :
      Color.fromHex('#ECEEF2');
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

  const astar = new ExcaliburAStar(tilemap);

  // Initialize and add 4 robots to the scene
  robots.push(new Robot(new Vector(0, 0))); // Top-left
  robots.push(new Robot(new Vector(9, 0))); // Top-right
  robots.push(new Robot(new Vector(0, 9))); // Bottom-left
  robots.push(new Robot(new Vector(9, 9))); // Bottom-right

  robots.forEach((robot) => engine!.currentScene.add(robot));

  // Listen for the robotMoveComplete event
  engine.events.on('robotMoveComplete', (evt: { robot: Robot; tileId: number }) => {
    // The event now includes the specific robot that completed its move
    evt.robot.robotActionStatus = 'idle';
  });

  // Handle pointer clicks
  engine.input.pointers.primary.on('down', (evt) => {
    if (!evt.worldPos) return; // No world position means click was likely invalid

    const map = engine!.currentScene.tileMaps[0]!;
    const clickedTile = map.getTileByPoint(evt.worldPos);

    // Check if a robot was clicked
    let clickedOnRobot: Robot | null = null;
    for (const robot of robots) {
      // Check if click position is within the robot's bounding box
      if (robot.body.collider.bounds.contains(evt.worldPos)) {
        clickedOnRobot = robot;
        break;
      }
    }

    if (clickedOnRobot) {
      // A robot was clicked
      if (selectedRobot === clickedOnRobot) {
        // Same robot clicked again, deselect it
        selectedRobot.deselect();
        selectedRobot = null;
      } else {
        // A different robot was clicked or no robot was selected
        if (selectedRobot) {
          selectedRobot.deselect(); // Deselect previously selected robot
        }
        selectedRobot = clickedOnRobot;
        selectedRobot.select(); // Select the new robot
      }
    } else {
      // No robot was clicked, a tile or outside the map was clicked
      if (!clickedTile) {
        // Clicked outside the map, deselect current robot if any
        if (selectedRobot) {
          selectedRobot.deselect();
          selectedRobot = null;
        }
        return; // Do nothing else
      }

      // A tile was clicked, check if a robot is selected to move
      if (selectedRobot) {
        // If a robot is selected, try to move it to the clicked tile
        const targetTileId = clickedTile.x + clickedTile.y * 10;

        if (isObstacle[targetTileId]) {
          // Clicked on an obstacle, deselect robot and do nothing
          selectedRobot.deselect();
          selectedRobot = null;
          return;
        }

        const startTile = map.getTileByPoint(selectedRobot.pos);
        // Convert robot's pixel position to grid ID for A*
        const startTileId = startTile ?
          startTile.x + startTile.y * 10 :
          0; // Fallback, though robot should always be on a tile

        if (startTileId === targetTileId) {
          // Clicked on the same tile the robot is currently on, deselect
          selectedRobot.deselect();
          selectedRobot = null;
          return;
        }

        // Calculate path using A*
        const path = astar.astar(
          astar.getNodeByIndex(startTileId),
          astar.getNodeByIndex(targetTileId),
          false,
        );

        if (!path.length) {
          // No path found, deselect robot
          selectedRobot.deselect();
          selectedRobot = null;
          return;
        }

        // Path found, queue moves for the selected robot
        path.forEach((n) =>
          selectedRobot!.robotActionBuffer.push(new Vector(n.x, n.y)),
        );
        selectedRobot!.robotActionStatus = 'moving'; // Set status to trigger movement in postupdate

        // Deselect the robot after issuing the move command
        selectedRobot.deselect();
        selectedRobot = null;
      }
      // Else: No robot selected and a tile was clicked, do nothing as requested.
    }
  });

  // Center camera and set zoom
  engine.currentScene.camera.pos = new Vector(32 * 5, 32 * 5);
  engine.currentScene.camera.zoom = 1;

  engine.start();
}

export function stopGame() {
  if (!engine) return;
  engine.stop();
  engine = null;
  robots = []; // Clear robots array on stop
  selectedRobot = null; // Clear selected robot on stop
}