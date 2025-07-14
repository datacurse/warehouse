import { Actor, Vector, EasingFunctions, Rectangle, Polygon, GraphicsGroup, Color } from "excalibur";

const SIZE = 32;
const HALF = SIZE / 2;
const QUARTER = SIZE / 4;

export class Player extends Actor {
  playerActionBuffer: Vector[] = [];
  playerActionStatus: string = "idle";
  posGrid: Vector = new Vector(0, 0); // Grid position (x,y) of the currently possessed/occupied grid tile, updated when crossing 50% into another tile
  posPixels: Vector = new Vector(0, 0); // Grid position (x,y) corresponding to the actual absolute position (estimated as nearest grid)

  constructor() {
    super({
      pos: new Vector(HALF, HALF),
      width: SIZE,
      height: SIZE,
      rotation: 0,
    });

    // Set up graphics internally
    const playerBody = new Rectangle({
      width: SIZE,
      height: SIZE,
      color: Color.fromHex("#66A7FF"),
    });
    const chevronPoints = [
      new Vector(-QUARTER, -QUARTER),
      new Vector(QUARTER, 0),
      new Vector(-QUARTER, QUARTER),
    ];
    const chevron = new Polygon({
      points: chevronPoints,
      color: Color.fromHex("#ECEEF2"),
    });
    const playerGroup = new GraphicsGroup({
      members: [
        { graphic: playerBody, offset: new Vector(0, 0) },
        { graphic: chevron, offset: new Vector(QUARTER, QUARTER) },
      ],
    });
    this.graphics.use(playerGroup);

    // Initialize grid positions
    this.updateGridPositions();
  }

  _postupdate(_engine: any, delta: number): void {
    if (this.playerActionBuffer.length > 0 && this.playerActionStatus === "idle") {
      this.playerActionStatus = "moving";
      const nextTile = this.playerActionBuffer.shift()!;
      this.moveToTile(nextTile);
    }
    this.updateGridPositions();
  }

  updateGridPositions() {
    // posGrid uses floor (containing tile based on position)
    const gridX = Math.floor(this.pos.x / SIZE);
    const gridY = Math.floor(this.pos.y / SIZE);
    this.posGrid = new Vector(gridX, gridY);

    // posPixels uses round (nearest center)
    const gridXNearest = Math.round((this.pos.x - HALF) / SIZE);
    const gridYNearest = Math.round((this.pos.y - HALF) / SIZE);
    this.posPixels = new Vector(gridXNearest, gridYNearest);
  }

  moveToTile(targetGrid: Vector) {
    console.log(targetGrid, this.posGrid);
    if (targetGrid.equals(this.posGrid)) {
      this.scene!.engine.events.emit("playerMoveComplete", targetGrid.y * 10 + targetGrid.x); // Convert back to id for event if needed
      this.playerActionStatus = "idle";
      return;
    }
    const target = new Vector(targetGrid.x * SIZE + HALF, targetGrid.y * SIZE + HALF);
    const targetAngle = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);

    const deltaAngle = ((targetAngle - this.rotation + Math.PI) % (2 * Math.PI)) - Math.PI;
    const absDelta = Math.abs(deltaAngle);

    if (absDelta > 0.1) {
      // Rotate first
      const rotateDuration = 250; // ms
      const angularSpeed = absDelta / (rotateDuration / 1000); // rad/s
      this.actions.rotateTo(targetAngle, angularSpeed);
      // Then move
      this.actions.moveTo({ pos: target, duration: 250, easing: EasingFunctions.EaseInOutCubic });
    } else {
      // Just move
      this.actions.moveTo({ pos: target, duration: 250, easing: EasingFunctions.EaseInOutCubic });
    }
    // Call method after actions complete
    this.actions.callMethod(() => {
      this.scene!.engine.events.emit("playerMoveComplete", targetGrid.y * 10 + targetGrid.x);
      this.playerActionStatus = "idle";
    });
  }
}

export const player = new Player();