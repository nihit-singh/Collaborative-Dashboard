import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import roomRoutes from "./routes/roomRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";
import { registerSocketHandlers } from "./socket/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// ✅ Health check (optional)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API running ✅" });
});

// ✅ REST routes
app.use("/api/rooms", roomRoutes);
app.use("/api/board", boardRoutes);

// --- HTTP + Socket.IO ---
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, methods: ["GET", "POST"] },
});

registerSocketHandlers(io);

// ===============================
// 🔥 SERVE FRONTEND (FIXED PART)
// ===============================

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct path to React build
const clientPath = path.join(__dirname, "../client/dist");

// Serve static files
app.use(express.static(clientPath));

// Fallback route for React
app.get("/*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// ===============================
// 🚀 START SERVER
// ===============================
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});