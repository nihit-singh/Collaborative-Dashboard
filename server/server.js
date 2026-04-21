import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import roomRoutes from "./routes/roomRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

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
const userRoles = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomCode, name, uid }) => {
    socket.join(roomCode);

    if (!roomUsers[roomCode]) roomUsers[roomCode] = [];
    if (!roomBoards[roomCode]) roomBoards[roomCode] = [];
    if (!userRoles[roomCode]) userRoles[roomCode] = {};

    //unique username check
    const duplicate = roomUsers[roomCode].find(
      (u) => u.name === name && u.uid !== uid
    );

    if (duplicate) {
      socket.emit("name-taken");
      return;
    }

    //refresh 
    roomUsers[roomCode] = roomUsers[roomCode].filter(
      (u) => u.uid !== uid
    );

    let role;

    if (userRoles[roomCode][uid]) {
      role = userRoles[roomCode][uid];
    } else if (roomUsers[roomCode].length === 0) {
      role = "creator";
    } else {
      role = "viewer";
    }

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

  //role permissions
  socket.on("change-role", ({ roomCode, userId, role }) => {
    const users = roomUsers[roomCode];
    if (!users) return;

    const user = users.find((u) => u.uid === userId);
    if (user) user.role = role;


    if (!userRoles[roomCode]) userRoles[roomCode] = {};
    userRoles[roomCode][userId] = role;

    io.to(roomCode).emit("participants", users);
  });

  //whiteboard actions
  socket.on("start-draw", (data) => {
  if (!roomBoards[data.roomCode]) {
    roomBoards[data.roomCode] = [];
  }

  roomBoards[data.roomCode].push({ ...data, type: "start" });

  socket.to(data.roomCode).emit("start-draw", data);
});

socket.on("draw", (data) => {
  if (!roomBoards[data.roomCode]) {
    roomBoards[data.roomCode] = [];
  }

  roomBoards[data.roomCode].push({ ...data, type: "draw" });

  socket.to(data.roomCode).emit("draw", data);
});

  socket.on("stop-draw", (data) => {
    socket.to(data.roomCode).emit("stop-draw");
  });

  
  socket.on("clear-board", ({ roomCode }) => {
  roomBoards[roomCode] = [];
  io.to(roomCode).emit("clear-board");
});

  // cursor tracking
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