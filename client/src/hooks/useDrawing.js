import { useState, useEffect, useCallback, useRef } from "react";
import socket from "../services/socket";

/**
 * Hook that manages all drawing state and canvas operations.
 * Handles local drawing + socket emission + remote draw events.
 */
export function useDrawing(canvasRef, roomCode, myRole, uid) {
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState("pen");

  // Last known point per uid, so concurrent strokes from different users
  // (or the local user vs. a remote one) never draw a segment connecting
  // to a point that belongs to someone else's stroke.
  const localLastPointRef = useRef(null);
  const remoteLastPointsRef = useRef({});

  // Listen for remote drawing events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";

    const onStartDraw = ({ uid: fromUid, x, y }) => {
      if (!fromUid) return;
      remoteLastPointsRef.current[fromUid] = { x, y };
    };

    const onDraw = ({ uid: fromUid, x, y, color, size, tool }) => {
      if (!fromUid) return;
      const last = remoteLastPointsRef.current[fromUid] || { x, y };

      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      remoteLastPointsRef.current[fromUid] = { x, y };
    };

    const onStopDraw = ({ uid: fromUid }) => {
      if (fromUid) delete remoteLastPointsRef.current[fromUid];
    };

    const onClearBoard = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      remoteLastPointsRef.current = {};
      localLastPointRef.current = null;
    };

    const onLoadBoard = (actions) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lastPoints = {};
      actions.forEach((a) => {
        const key = a.uid || a.socketId;
        ctx.globalCompositeOperation =
          a.tool === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.size;

        if (a.type === "start") {
          lastPoints[key] = { x: a.x, y: a.y };
        } else {
          const last = lastPoints[key] || { x: a.x, y: a.y };
          ctx.beginPath();
          ctx.moveTo(last.x, last.y);
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
          lastPoints[key] = { x: a.x, y: a.y };
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
      const actualSize = tool === "eraser" ? size * 5 : size;

      localLastPointRef.current = { x, y };
      setDrawing(true);

      socket.emit("start-draw", {
        roomCode,
        uid,
        x,
        y,
        color,
        size: actualSize,
        tool,
      });
    },
    [myRole, getCoords, tool, size, color, roomCode, uid]
  );

  const draw = useCallback(
    (e) => {
      if (!drawing || myRole === "viewer") return;
      const { x, y } = getCoords(e);
      const ctx = canvasRef.current.getContext("2d");
      const actualSize = tool === "eraser" ? size * 5 : size;
      const last = localLastPointRef.current || { x, y };

      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = actualSize;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      localLastPointRef.current = { x, y };

      socket.emit("draw", {
        roomCode,
        uid,
        x,
        y,
        color,
        size: actualSize,
        tool,
      });
    },
    [drawing, myRole, getCoords, canvasRef, tool, size, color, roomCode, uid]
  );

  const stopDrawing = useCallback(() => {
    setDrawing(false);
    localLastPointRef.current = null;
    socket.emit("stop-draw", { roomCode, uid });
  }, [roomCode, uid]);

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
