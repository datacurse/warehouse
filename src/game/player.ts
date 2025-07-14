import { Actor, Vector, EasingFunctions, Rectangle, Polygon, GraphicsGroup, Color } from "excalibur";

export class Player extends Actor {
  playerActionBuffer: number[] = [];
  playerActionStatus: string = "idle";

  constructor() {
    super({
      pos: new Vector(8, 8),
      width: 16,
      height: 16,
      rotation: 0, // Initial facing right
    });

    // Set up graphics internally
    const playerBody = new Rectangle({
      width: 12,
      height: 12,
      color: Color.Blue,
    });
    playerBody.anchor = new Vector(0.5, 0.5);
    const chevronPoints = [
      new Vector(-3, -4),
      new Vector(3, 0),
      new Vector(-3, 4),
    ];
    const chevron = new Polygon({
      points: chevronPoints,
      color: Color.White,
    });
    chevron.anchor = new Vector(0.5, 0.5);
    const playerGroup = new GraphicsGroup({
      members: [
        { graphic: playerBody, offset: new Vector(0, 0) },
        { graphic: chevron, offset: new Vector(0, 0) },
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
    const target = new Vector(x * 16 + 8, y * 16 + 8);
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
      this.actions.easeTo(target, 500, EasingFunctions.EaseInOutCubic);
    }
    // Call method after actions complete
    this.actions.callMethod(() => {
      this.scene.engine.events.emit("playerMoveComplete", node);
    });
  }
}

export const player = new Player();