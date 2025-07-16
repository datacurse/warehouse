import {
  Actor,
  Vector,
  EasingFunctions,
  Rectangle,
  Polygon,
  GraphicsGroup,
  Color,
} from 'excalibur';

const SIZE = 32;
const HALF = SIZE / 2;
const QUARTER = SIZE / 4;

export class Robot extends Actor {
  // Action queue + state
  robotActionBuffer: Vector[] = [];
  robotActionStatus = 'idle';

  // Convenience positions
  posGrid = Vector.Zero.clone();
  posPixels = Vector.Zero.clone();

  /** Yellow border shown when this robot is selected */
  private selectionGraphic!: Rectangle;

  constructor(startGridPos: Vector) {
    super({
      pos: new Vector(startGridPos.x * SIZE + HALF, startGridPos.y * SIZE + HALF),
      width: SIZE,
      height: SIZE,
      rotation: 0,
    });

    /* ----- graphics ------------------------------------------------------ */
    const body = new Rectangle({
      width: SIZE,
      height: SIZE,
      color: Color.fromHex('#66A7FF'),
    });

    const chevron = new Polygon({
      points: [
        new Vector(-QUARTER, -QUARTER),
        new Vector(QUARTER, 0),
        new Vector(-QUARTER, QUARTER),
      ],
      color: Color.fromHex('#ECEEF2'),
    });

    this.selectionGraphic = new Rectangle({
      width: SIZE + 4,
      height: SIZE + 4,
      color: Color.Transparent,
      strokeColor: Color.Yellow,
      lineWidth: 3,
    });
    this.selectionGraphic.opacity = 0;      // hidden by default ✔

    this.graphics.use(new GraphicsGroup({
      members: [
        { graphic: body, offset: Vector.Zero },
        { graphic: chevron, offset: new Vector(QUARTER, QUARTER) },
        { graphic: this.selectionGraphic, offset: Vector.Zero },
      ],
    }));

    this.updateGridPositions();
  }

  /* ---------- actor life-cycle ----------------------------------------- */
  override _postupdate(_engine: unknown, _delta: number) {
    if (this.robotActionBuffer.length && this.robotActionStatus === 'idle') {
      this.robotActionStatus = 'moving';
      this.moveToTile(this.robotActionBuffer.shift()!);
    }
    this.updateGridPositions();
  }

  /* ---------- helpers --------------------------------------------------- */
  private updateGridPositions() {
    this.posGrid = new Vector(Math.floor(this.pos.x / SIZE),
      Math.floor(this.pos.y / SIZE));

    this.posPixels = new Vector(
      Math.round((this.pos.x - HALF) / SIZE),
      Math.round((this.pos.y - HALF) / SIZE),
    );
  }

  private moveToTile(targetGrid: Vector) {
    if (targetGrid.equals(this.posGrid)) {
      this.scene!.engine.events.emit('robotMoveComplete', {
        robot: this,
        tileId: targetGrid.y * 10 + targetGrid.x,
      });
      this.robotActionStatus = 'idle';
      return;
    }

    const target = new Vector(targetGrid.x * SIZE + HALF,
      targetGrid.y * SIZE + HALF);

    const targetAngle = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);
    const deltaAngle = ((targetAngle - this.rotation + Math.PI) % (2 * Math.PI)) - Math.PI;

    if (Math.abs(deltaAngle) > 0.1) {
      this.actions.rotateTo(targetAngle, Math.abs(deltaAngle) / 0.25);
      this.actions.moveTo({ pos: target, duration: 250, easing: EasingFunctions.EaseInOutCubic });
    } else {
      this.actions.moveTo({ pos: target, duration: 250, easing: EasingFunctions.EaseInOutCubic });
    }

    this.actions.callMethod(() => {
      this.scene!.engine.events.emit('robotMoveComplete', {
        robot: this,
        tileId: targetGrid.y * 10 + targetGrid.x,
      });
      this.robotActionStatus = 'idle';
    });
  }

  /* ---------- selection API -------------------------------------------- */
  select() { this.selectionGraphic.opacity = 1; }  // show
  deselect() { this.selectionGraphic.opacity = 0; }  // hide
}
