"use client";

import { useEffect, useRef } from "react";

export function WaveformVisualizer({ isRecording }: { isRecording: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isRecording ? "#4F46E5" : "#94A3B8";

      for (let x = 0; x < width; x++) {
        const amplitude = isRecording ? Math.sin(phase + x * 0.05) * 18 + Math.cos(phase * 1.5 + x * 0.02) * 8 : Math.sin(x * 0.05) * 3;
        const y = centerY + amplitude;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      phase += isRecording ? 0.15 : 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording]);

  return (
    <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center shadow-inner">
      <canvas ref={canvasRef} width={400} height={70} className="w-full max-w-md h-16" />
    </div>
  );
}
