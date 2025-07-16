'use client';

import { useEffect, useRef } from 'react';

export function ExcaliburCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;

    (async () => {
      const { startGame, stopGame } = await import('@/game/game');
      if (!canvasRef.current) return
      startGame(canvasRef.current.id);
      stop = stopGame;
    })();

    return () => stop?.();
  }, []);

  return <canvas id="ExcaliburCanvas" ref={canvasRef} />
}
