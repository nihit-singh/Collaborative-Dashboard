import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Hooks
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useDrawing } from "../hooks/useDrawing";
import { useCursors } from "../hooks/useCursors";
import { useChat } from "../hooks/useChat";
import socket from "../services/socket";

// Components
import RoomHeader from "../components/room/RoomHeader";
import Toolbar from "../components/room/Toolbar";
import RoomSidebar from "../components/room/RoomSidebar";
import WhiteboardCanvas from "../components/canvas/WhiteboardCanvas";
import CursorLayer from "../components/canvas/CursorLayer";

/**
 * RoomPage — the main collaborative whiteboard room.
 */
function RoomPage() {
  const { roomCode } = useParams();
  const canvasRef = useRef(null);

  const { username, uid, logout } = useAuth();
  const [participants, setParticipants] = useState([]);
  const [myRole, setMyRole] = useState("viewer");

  // Redirect if not authenticated
  if (!username) {
    window.location.href = "/";
    return null;
  }

  // Connect to room
  useSocket(roomCode, username, uid);

  // Chat
  const { messages, sendMessage } = useChat(roomCode, username);

  // Request chat history after joining
  useEffect(() => {
    socket.emit("chat-history", { roomCode });
  }, [roomCode]);

  // Drawing logic
  const {
    color, size, tool,
    setColor, setSize, setTool,
    startDrawing, draw, stopDrawing, clearBoard,
  } = useDrawing(canvasRef, roomCode, myRole, uid);

  // Cursor tracking
  const { cursors, localCursor, handleCursorMove, handleCursorLeave } = useCursors(
    canvasRef,
    roomCode,
    username,
    uid
  );

  // Listen for participant updates
  useEffect(() => {
    const onParticipants = (users) => {
      setParticipants(users);
      const me = users.find((u) => u.uid === uid);
      if (me) setMyRole(me.role);
    };

    socket.on("participants", onParticipants);
    return () => socket.off("participants", onParticipants);
  }, [uid]);

  // Change another user's role
  const changeRole = (userId, role) => {
    socket.emit("change-role", { roomCode, userId, role });
  };

  return (
    <div style={styles.layout}>
      {/* Unified Sidebar (Participants + Chat) */}
      <RoomSidebar
        participants={participants}
        currentUid={uid}
        myRole={myRole}
        onChangeRole={changeRole}
        messages={messages}
        onSendMessage={sendMessage}
        username={username}
      />

      {/* Main content area */}
      <div style={styles.main}>
        <RoomHeader
          roomCode={roomCode}
          username={username}
          onLogout={logout}
        />

        <Toolbar
          tool={tool}
          color={color}
          size={size}
          myRole={myRole}
          onToolChange={setTool}
          onColorChange={setColor}
          onSizeChange={setSize}
          onClear={clearBoard}
        />

        {/* Cursor overlays */}
        <CursorLayer cursors={cursors} />

        {/* Local Eraser Preview */}
        {tool === "eraser" && localCursor && localCursor.isInside && (
          <div
            style={{
              position: "absolute",
              left: localCursor.x,
              top: localCursor.y,
              width: size * 5,
              height: size * 5,
              border: "1px solid #fff",
              borderRadius: "50%",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              boxShadow: "0 0 4px rgba(0,0,0,0.5)",
              mixBlendMode: "difference",
            }}
          />
        )}

        {/* Canvas */}
        <WhiteboardCanvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={(e) => {
            handleCursorMove(e);
            draw(e);
          }}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            stopDrawing();
            handleCursorLeave();
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    width: "100%",
    background: "#1e1e1e",
    position: "relative",
    overflow: "hidden",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
};

export default RoomPage;
