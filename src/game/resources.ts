import { ImageSource, SpriteSheet } from "excalibur";

const plrImage = new ImageSource('/images/dude.png');
const kennyRougeLikePack = new ImageSource('/images/roguelike.png');
export const rlSS = SpriteSheet.fromImageSource({
  image: kennyRougeLikePack,
  grid: { columns: 57, rows: 31, spriteHeight: 16, spriteWidth: 16 },
  spacing: { margin: { x: 1, y: 1 } },
});

export const Resources = {
  plrImage,
  kennyRougeLikePack,
};