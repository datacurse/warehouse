'use client';

import { useEffect } from 'react';
import { startGame, stopGame } from '@/game/game';

export function GameCanvas() {
  useEffect(() => {
    startGame('ExcaliburCanvas');
    return () => stopGame();
  }, []);

  return (
    <div className="w-screen h-screen">
      <canvas id="ExcaliburCanvas" className="block w-full h-full" />
    </div >
  );
}