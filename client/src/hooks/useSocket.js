import { useEffect } from "react";
import socket from "../services/socket";

/**
 * Hook to join a room on mount and handle the name-taken rejection.
 */
export function useSocket(roomCode, name, uid) {
  useEffect(() => {
    socket.emit("join-room", { roomCode, name, uid });
  }, [roomCode, name, uid]);

  useEffect(() => {
    const handleNameTaken = () => {
      alert("Username already taken!");
      window.location.href = "/dashboard";
    };

    socket.on("name-taken", handleNameTaken);

    return () => {
      socket.off("name-taken", handleNameTaken);
    };
  }, []);

  return socket;
}
