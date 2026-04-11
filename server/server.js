import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";

dotenv.config();

const userRoles = {}; 
// structure: { roomCode: { uid: role } }

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/board", boardRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const roomUsers = {};
const roomBoards = {};
const roomCreators = {}; // 🔥 IMPORTANT

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ✅ JOIN ROOM
  socket.on("join-room", ({ roomCode, name, uid }) => {
  socket.join(roomCode);

  if (!roomUsers[roomCode]) roomUsers[roomCode] = [];
  if (!roomBoards[roomCode]) roomBoards[roomCode] = [];
  if (!userRoles[roomCode]) userRoles[roomCode] = {};

  // 🔥 REMOVE OLD SOCKET INSTANCE (same uid)
  roomUsers[roomCode] = roomUsers[roomCode].filter(
    (u) => u.uid !== uid
  );

  let role;

  // ✅ IF ROLE ALREADY EXISTS → USE IT
  if (userRoles[roomCode][uid]) {
    role = userRoles[roomCode][uid];
  }
  // ✅ FIRST USER → CREATOR
  else if (Object.keys(userRoles[roomCode]).length === 0) {
    role = "creator";
  }
  // ✅ DEFAULT
  else {
    role = "viewer";
  }

  // 🔥 SAVE ROLE PERMANENTLY
  userRoles[roomCode][uid] = role;

  const user = {
    uid,
    socketId: socket.id,
    name,
    role,
  };

  roomUsers[roomCode].push(user);

  socket.emit("load-board", roomBoards[roomCode]);

  io.to(roomCode).emit("participants", roomUsers[roomCode]);
});

  // ✅ ROLE CHANGE (ONLY CREATOR)
  socket.on("change-role", ({ roomCode, userId, role }) => {
  const users = roomUsers[roomCode];
  if (!users) return;

  const user = users.find((u) => u.uid === userId);
  if (user) user.role = role;

  // ✅ ALSO SAVE IN ROLE STORE
  if (!userRoles[roomCode]) userRoles[roomCode] = {};
  userRoles[roomCode][userId] = role;

  io.to(roomCode).emit("participants", users);
});

  // ✅ DRAW EVENTS
  socket.on("start-draw", (data) => {
    roomBoards[data.roomCode].push({ ...data, type: "start" });
    socket.to(data.roomCode).emit("start-draw", data);
  });

  socket.on("draw", (data) => {
    roomBoards[data.roomCode].push({ ...data, type: "draw" });
    socket.to(data.roomCode).emit("draw", data);
  });

  socket.on("stop-draw", (data) => {
    socket.to(data.roomCode).emit("stop-draw");
  });

  // ✅ CLEAR
  socket.on("clear-board", ({ roomCode }) => {
    roomBoards[roomCode] = [];
    io.to(roomCode).emit("clear-board");
  });

  // ✅ CURSOR
  socket.on("cursor-move", ({ roomCode, x, y, name }) => {
    socket.to(roomCode).emit("cursor-move", {
      id: socket.id,
      x,
      y,
      name,
    });
  });

  socket.on("cursor-leave", ({ roomCode }) => {
  socket.to(roomCode).emit("cursor-remove", socket.id);
});

socket.on("cursor-remove", (id) => {
  setCursors((prev) => {
    const copy = { ...prev };
    delete copy[id];
    return copy;
  });
});

  // ✅ DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const room in roomUsers) {
      roomUsers[room] = roomUsers[room].filter(
        (u) => u.socketId !== socket.id
      );

      io.to(room).emit("participants", roomUsers[room]);
      io.to(room).emit("user-left", socket.id);
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});