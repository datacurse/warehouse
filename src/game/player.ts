import { Actor, Vector, EasingFunctions, Rectangle, Polygon, GraphicsGroup, Color } from "excalibur";

const SIZE = 32

export class Player extends Actor {
  playerActionBuffer: number[] = [];
  playerActionStatus: string = "idle";

  constructor() {
    super({
      pos: new Vector(SIZE / 2, SIZE / 2),
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
    // playerBody.origin = new Vector(0, 0);
    const chevronPoints = [
      new Vector(-SIZE / 4, -SIZE / 4),
      new Vector(SIZE / 4, 0),
      new Vector(-SIZE / 4, SIZE / 4),
    ];
    const chevron = new Polygon({
      points: chevronPoints,
      color: Color.fromHex("#ECEEF2"),
    });
    // chevron.origin = new Vector(0.5, 0.5);
    const playerGroup = new GraphicsGroup({
      members: [
        { graphic: playerBody, offset: new Vector(0, 0) },
        { graphic: chevron, offset: new Vector(SIZE / 4, SIZE / 4) },
      ],
    });
    this.graphics.use(playerGroup);
  }

  _postupdate(_engine: any, delta: number): void {
    if (this.playerActionBuffer.length > 0 && this.playerActionStatus === "idle") {
      this.playerActionStatus = "moving";
      const nextTile = this.playerActionBuffer.shift()!;
      this.moveToTile(nextTile);
    }
  }

  moveToTile(node: number) {
    const x = node % 10;
    const y = Math.floor(node / 10);
    const target = new Vector(x * SIZE + SIZE / 2, y * SIZE + SIZE / 2);
    const targetAngle = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);

    const deltaAngle = Math.atan2(
      Math.sin(targetAngle - this.rotation),
      Math.cos(targetAngle - this.rotation)
    );
    const absDelta = Math.abs(deltaAngle);

    if (absDelta > 0.1) {
      // Rotate first
      const rotateDuration = 250; // ms
      const angularSpeed = absDelta / (rotateDuration / 1000); // rad/s
      this.actions.rotateTo(targetAngle, angularSpeed);
      // Then move
      this.actions.easeTo(target, 250, EasingFunctions.EaseInOutCubic);
    } else {
      // Just move
      this.actions.easeTo(target, 250, EasingFunctions.EaseInOutCubic);
    }
    // Call method after actions complete
    this.actions.callMethod(() => {
      this.scene.engine.events.emit("playerMoveComplete", node);
    });
  }
}

export const player = new Player();