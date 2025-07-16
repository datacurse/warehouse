'use client';
import { ClientOnly } from '@/components/ClientOnly';
import { GameCanvas } from '@/components/game-canvas';

export function GameCanvasWrapper() {
  return (
    <ClientOnly>
      <GameCanvas />
    </ClientOnly>
  );
}