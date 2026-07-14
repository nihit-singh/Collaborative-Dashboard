import { useState, useEffect, useCallback, useRef } from "react";
import socket from "../services/socket";

/**
 * useCursors — Hook for tracking and rendering remote user cursors.
 *
 * Rules:
 * 1. Cursors are hidden by default.
 * 2. Cursors show only when the remote user is drawing.
 * 3. After drawing stops, the cursor stays visible for 2 seconds before disappearing.
 */
export function useCursors(canvasRef, roomCode, userName, uid) {
  const [cursors, setCursors] = useState({});
  const timeouts = useRef({});

  useEffect(() => {
    /**
     * Updates the visibility state for a specific user and manages timeout cleanup.
     */
    const setVisibility = (id, visible) => {
      // If we are making it visible, cancel any pending "hide" timeouts
      if (visible && timeouts.current[id]) {
        clearTimeout(timeouts.current[id]);
        delete timeouts.current[id];
      }

      setCursors((prev) => {
        if (!prev[id]) return prev;
        return {
          ...prev,
          [id]: { ...prev[id], isVisible: visible },
        };
      });
    };

    /**
     * Updates cursor position. Initializes new cursors as invisible.
     */
    const onCursorMove = ({ id, x, y, name }) => {
      setCursors((prev) => {
        const existing = prev[id] || { isVisible: false };
        return {
          ...prev,
          [id]: {
            ...existing,
            x,
            y,
            name,
          },
        };
      });
    };

    const onStartDraw = (data) => {
      if (data.uid) setVisibility(data.uid, true);
    };

    const onDraw = (data) => {
      if (data.uid) setVisibility(data.uid, true);
    };

    const onStopDraw = (data) => {
      const id = data.uid;
      if (!id) return;

      // Clear previous timeout if exists
      if (timeouts.current[id]) clearTimeout(timeouts.current[id]);

      // Set 2-second delay before hiding
      timeouts.current[id] = setTimeout(() => {
        setVisibility(id, false);
        delete timeouts.current[id];
      }, 2000);
    };

    const onCursorRemove = (id) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    };

    const onUserLeft = (id) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    };

    // Socket Event Registration
    socket.on("cursor-move", onCursorMove);
    socket.on("start-draw", onStartDraw);
    socket.on("draw", onDraw);
    socket.on("stop-draw", onStopDraw);
    socket.on("cursor-remove", onCursorRemove);
    socket.on("user-left", onUserLeft);

    return () => {
      socket.off("cursor-move", onCursorMove);
      socket.off("start-draw", onStartDraw);
      socket.off("draw", onDraw);
      socket.off("stop-draw", onStopDraw);
      socket.off("cursor-remove", onCursorRemove);
      socket.off("user-left", onUserLeft);
      // Final cleanup of any running timers
      Object.values(timeouts.current).forEach(clearTimeout);
    };
  }, []);

  const [localCursor, setLocalCursor] = useState({ x: 0, y: 0, isInside: false });

  /**
   * Emits local cursor position to the room.
   */
  const handleCursorMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const inside =
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;

      setLocalCursor({ x, y, isInside: inside });

      if (!inside) {
        socket.emit("cursor-leave", { roomCode, uid });
        return;
      }

      socket.emit("cursor-move", {
        roomCode,
        uid,
        x,
        y,
        name: userName,
      });
    },
    [canvasRef, roomCode, userName, uid]
  );

  const handleCursorLeave = useCallback(() => {
    setLocalCursor((prev) => ({ ...prev, isInside: false }));
    socket.emit("cursor-leave", { roomCode, uid });
  }, [roomCode, uid]);

  return { cursors, localCursor, handleCursorMove, handleCursorLeave };
}
