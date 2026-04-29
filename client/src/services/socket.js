import { io } from "socket.io-client";

/**
 * Singleton socket instance.
 * Automatically connects to the current host in production, or localhost in development.
 */
const SOCKET_URL = import.meta.env.PROD 
  ? window.location.origin 
  : "http://localhost:5000";

const socket = io(SOCKET_URL);

export default socket;
