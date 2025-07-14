import { Actor, Engine, Loader, ImageSource } from "excalibur";

export function initialize(canvasElement: HTMLCanvasElement) {
  return new Engine({ canvasElement });
}

export async function start(game: Engine) {
  const resources = {
    sword: new ImageSource("/sword.png")
  };
  const loader = new Loader([resources.sword]);

  await game.start(loader);

  const swordSprite = resources.sword.toSprite();
  const sword = new Actor({
    x: game.halfCanvasWidth,
    y: game.halfCanvasHeight
  });
  sword.graphics.add(swordSprite);
  game.add(sword);
}
