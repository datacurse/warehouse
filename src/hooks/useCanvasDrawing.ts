// src/hooks/useCanvasDrawing.ts
import { useRef, useEffect } from 'react';
import { Vec2 } from '../koota/traits'; // Re-use Vec2 interface

interface DrawingAPI {
  drawGrid: (gridSize: number, cellSizePx: number) => void;
  drawRobot: (position: Vec2, cellSizePx: number, color: string) => void;
  clearCanvas: (width: number, height: number) => void;
  getContext: () => CanvasRenderingContext2D | null;
}

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number
): DrawingAPI => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (context) {
      ctxRef.current = context;
    }
    return () => {
      ctxRef.current = null;
    };
  }, [canvasRef]);

  const getContext = () => ctxRef.current;

  const drawGrid = (gridSize: number, cellSizePx: number) => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSizePx + 0.5, 0.5);
      ctx.lineTo(i * cellSizePx + 0.5, gridSize * cellSizePx + 0.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0.5, i * cellSizePx + 0.5);
      ctx.lineTo(gridSize * cellSizePx + 0.5, i * cellSizePx + 0.5);
      ctx.stroke();
    }
  };

  const drawRobot = (position: Vec2, cellSizePx: number, color: string) => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(
      position.x * cellSizePx + 4,
      position.y * cellSizePx + 4,
      cellSizePx - 8,
      cellSizePx - 8
    );
  };

  const clearCanvas = (w: number, h: number) => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
  };

  return { drawGrid, drawRobot, clearCanvas, getContext };
};