import { Engine, DisplayMode, Color, TileMap, Vector, Rectangle } from 'excalibur'
import { isObstacle } from '@/game/tiledata'

let engine: Engine | null = null

export function startGame(canvasId: string) {
  if (engine) return

  engine = new Engine({
    displayMode: DisplayMode.FillScreen,
    backgroundColor: Color.fromHex('#ECEEF2'),
    canvasElementId: canvasId,
    antialiasing: false
  })

  const tilemap = new TileMap({
    rows: 10,
    columns: 10,
    tileWidth: 32,
    tileHeight: 32
  })

  tilemap.tiles.forEach((tile, idx) => {
    const fill = isObstacle[idx] ? Color.fromHex('#797A80') : Color.fromHex('#ECEEF2')
    tile.addGraphic(
      new Rectangle({
        width: 32,
        height: 32,
        color: fill,
        strokeColor: Color.fromHex('#797A80'),
        lineWidth: 1
      })
    )
    tile.solid = isObstacle[idx]!
  })

  engine.currentScene.add(tilemap)

  // Center camera on the middle of the grid
  engine.currentScene.camera.pos = new Vector(32 * 5, 32 * 5)
  engine.currentScene.camera.zoom = 1

  engine.start().then(() => {
    let tickCount = 0

    // Fires before every update-draw cycle
    engine!.on('preframe', () => {
      ++tickCount
      if (tickCount % 100 !== 0) return;
      console.log(`tick ${++tickCount}`)
    })
  })
}

export function stopGame() {
  if (!engine) return
  engine.stop()
  engine = null
}
