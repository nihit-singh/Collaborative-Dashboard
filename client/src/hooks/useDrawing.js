import { useState, useEffect, useCallback } from "react";
import socket from "../services/socket";

/**
 * Hook that manages all drawing state and canvas operations.
 * Handles local drawing + socket emission + remote draw events.
 */
export function useDrawing(canvasRef, roomCode, myRole) {
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState("pen");

  // Listen for remote drawing events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";

    const onStartDraw = ({ x, y, color, size, tool }) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    };

    const onDraw = ({ x, y, color, size, tool }) => {
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onStopDraw = () => {
      ctx.beginPath();
    };

    const onClearBoard = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onLoadBoard = (actions) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      actions.forEach((a) => {
        ctx.globalCompositeOperation =
          a.tool === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.size;
        if (a.type === "start") {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
        } else {
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
        }
      });
    };

    socket.on("start-draw", onStartDraw);
    socket.on("draw", onDraw);
    socket.on("stop-draw", onStopDraw);
    socket.on("clear-board", onClearBoard);
    socket.on("load-board", onLoadBoard);

    return () => {
      socket.off("start-draw", onStartDraw);
      socket.off("draw", onDraw);
      socket.off("stop-draw", onStopDraw);
      socket.off("clear-board", onClearBoard);
      socket.off("load-board", onLoadBoard);
    };
  }, [canvasRef]);

  // Canvas coordinate helper
  const getCoords = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [canvasRef]
  );

  const startDrawing = useCallback(
    (e) => {
      if (myRole === "viewer") return;
      const { x, y } = getCoords(e);
      const ctx = canvasRef.current.getContext("2d");
      const actualSize = tool === "eraser" ? size * 5 : size;

      ctx.beginPath();
      ctx.moveTo(x, y);
      setDrawing(true);

      socket.emit("start-draw", {
        roomCode,
        x,
        y,
        color,
        size: actualSize,
        tool,
      });
    },
    [myRole, getCoords, canvasRef, tool, size, color, roomCode]
  );

  const draw = useCallback(
    (e) => {
      if (!drawing || myRole === "viewer") return;
      const { x, y } = getCoords(e);
      const ctx = canvasRef.current.getContext("2d");
      const actualSize = tool === "eraser" ? size * 5 : size;

      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = actualSize;
      ctx.lineTo(x, y);
      ctx.stroke();

      socket.emit("draw", {
        roomCode,
        x,
        y,
        color,
        size: actualSize,
        tool,
      });
    },
    [drawing, myRole, getCoords, canvasRef, tool, size, color, roomCode]
  );

  const stopDrawing = useCallback(() => {
    setDrawing(false);
    socket.emit("stop-draw", { roomCode });
  }, [roomCode]);

  const clearBoard = useCallback(() => {
    socket.emit("clear-board", { roomCode });
  }, [roomCode]);

  return {
    // State
    color,
    size,
    tool,
    drawing,
    // Setters
    setColor,
    setSize,
    setTool,
    // Actions
    startDrawing,
    draw,
    stopDrawing,
    clearBoard,
  };
}
