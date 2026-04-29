import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import roomRoutes from "./routes/roomRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import { registerSocketHandlers } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// --- Express setup ---
const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// --- REST routes ---
app.use("/api/rooms", roomRoutes);
app.use("/api/board", boardRoutes);

// --- HTTP + Socket.IO server ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN },
});

// --- Register socket handlers ---
registerSocketHandlers(io);

// --- Start ---
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});