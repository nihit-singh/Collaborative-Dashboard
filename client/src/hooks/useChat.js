import { useState, useEffect, useCallback } from "react";
import socket from "../services/socket";

/**
 * Hook to manage chat messages — sends and receives via socket.
 */
export function useChat(roomCode, username) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const onChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onChatHistory = (history) => {
      setMessages(history);
    };

    socket.on("chat-message", onChatMessage);
    socket.on("chat-history", onChatHistory);

    return () => {
      socket.off("chat-message", onChatMessage);
      socket.off("chat-history", onChatHistory);
    };
  }, []);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim()) return;
      socket.emit("chat-message", {
        roomCode,
        name: username,
        text: text.trim(),
        timestamp: Date.now(),
      });
    },
    [roomCode, username]
  );

  return { messages, sendMessage };
}
