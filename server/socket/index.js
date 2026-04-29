import roomHandler from "./handlers/roomHandler.js";
import drawingHandler from "./handlers/drawingHandler.js";
import cursorHandler from "./handlers/cursorHandler.js";
import roleHandler from "./handlers/roleHandler.js";
import chatHandler from "./handlers/chatHandler.js";

/**
 * Socket dispatcher — registers all handlers on each new connection.
 */
export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    roomHandler(io, socket);
    drawingHandler(io, socket);
    cursorHandler(io, socket);
    roleHandler(io, socket);
    chatHandler(io, socket);
  });
}
