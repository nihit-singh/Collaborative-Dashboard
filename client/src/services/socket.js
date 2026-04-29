import { io } from "socket.io-client";

/**
 * Singleton socket instance.
 * URL is configurable via VITE_SOCKET_URL env variable.
 */
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = io(SOCKET_URL);

export default socket;
