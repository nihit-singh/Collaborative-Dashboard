/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// ✅ STABLE UID (NO DUPLICATES EVER)
const getUID = () => {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = Math.random().toString(36).substring(2, 9);
    localStorage.setItem("uid", uid);
  }
  return uid;
};

const uid = getUID();


function Room() {
  const { roomCode } = useParams();
  const canvasRef = useRef(null);

  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(3);
  const [tool, setTool] = useState("pen");

  const [participants, setParticipants] = useState([]);
  const [myRole, setMyRole] = useState("viewer");
  const [cursors, setCursors] = useState({});

  const uid = getUID();

  const user = JSON.parse(
    atob(localStorage.getItem("token").split(".")[1])
  );

  // ✅ JOIN ROOM
  useEffect(() => {
  socket.emit("join-room", {
    roomCode,
    name: user.name,
    uid, // ✅ VERY IMPORTANT
  });
}, [roomCode]);

  // ✅ SOCKET EVENTS
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = "round";

    socket.on("start-draw", ({ x, y, color, size, tool }) => {
      ctx.beginPath();
      ctx.moveTo(x, y);

      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";

      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    });

    socket.on("draw", ({ x, y, color, size, tool }) => {
      ctx.globalCompositeOperation =
        tool === "eraser" ? "destination-out" : "source-over";

      ctx.strokeStyle = color;
      ctx.lineWidth = size;

      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, y);
    });

    socket.on("stop-draw", () => {
      ctx.beginPath();
    });

    socket.on("clear-board", () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    });

    socket.on("load-board", (actions) => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      actions.forEach((a) => {
        ctx.globalCompositeOperation =
          a.tool === "eraser" ? "destination-out" : "source-over";

        ctx.strokeStyle = a.color;
        ctx.lineWidth = a.size;

        if (a.type === "start") {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
        } else {
          ctx.lineTo(a.x, a.y);
          ctx.stroke();
        }
      });
    });

    // ✅ PARTICIPANTS + ROLE
    

    // ✅ CURSOR RECEIVE
    socket.on("cursor-move", ({ id, x, y, name }) => {
      setCursors((prev) => ({
        ...prev,
        [id]: { x, y, name },
      }));
    });

    socket.on("user-left", (id) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    return () => socket.off();
  }, []);

  // ✅ FIXED CANVAS COORDS
  const getCoords = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();

  const scaleX = canvasRef.current.width / rect.width;
  const scaleY = canvasRef.current.height / rect.height;

  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
};

  // ✅ CURSOR SEND
  const handleCursor = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();

const x =
  (e.clientX - rect.left) *
  (canvasRef.current.width / rect.width);

const y =
  (e.clientY - rect.top) *
  (canvasRef.current.height / rect.height);

//   console.log(rect.width, canvasRef.current.width);
  const inside =
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom;

  if (!inside) {
    // ❌ OUTSIDE → REMOVE CURSOR
    socket.emit("cursor-leave", { roomCode });
    return;
  }

  // ✅ INSIDE → SEND POSITION
  socket.emit("cursor-move", {
    roomCode,
    x,
    y,
    name: user.name,
  });
};

  // ✅ START DRAW
  const startDrawing = (e) => {
    if (myRole === "viewer") return;

    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext("2d");

    const actualSize = tool === "eraser" ? size * 3 : size;

    ctx.beginPath();
    ctx.moveTo(x, y);

    setDrawing(true);

    socket.emit("start-draw", {
      roomCode,
      x,
      y,
      color,
      size: actualSize,
      tool,
    });
  };

  // ✅ DRAW
  const draw = (e) => {
    if (!drawing || myRole === "viewer") return;

    const { x, y } = getCoords(e);
    const ctx = canvasRef.current.getContext("2d");

    const actualSize = tool === "eraser" ? size * 3 : size;

    ctx.globalCompositeOperation =
      tool === "eraser" ? "destination-out" : "source-over";

    ctx.strokeStyle = color;
    ctx.lineWidth = actualSize;

    ctx.lineTo(x, y);
    ctx.stroke();

    socket.emit("draw", {
      roomCode,
      x,
      y,
      color,
      size: actualSize,
      tool,
    });
  };

  const stopDrawing = () => {
    setDrawing(false);
    socket.emit("stop-draw", { roomCode });
  };

  const clearBoard = () => {
    socket.emit("clear-board", { roomCode });
  };

  const changeRole = (userId, role) => {
    socket.emit("change-role", {
      roomCode,
      userId,
      role,
    });
  };

  socket.on("cursor-remove", (id) => {
  setCursors((prev) => {
    const copy = { ...prev };
    delete copy[id];
    return copy;
  });
});
useEffect(() => {
  socket.on("participants", (users) => {
    setParticipants(users);

    // ✅ SET MY ROLE AFTER REFRESH
    const me = users.find((u) => u.uid === uid);
    if (me) setMyRole(me.role);
  });

  return () => socket.off("participants");
}, []);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1e1e1e" }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: "240px", background: "#2c2c2c", color: "#fff", padding: "10px" }}>
        <h3>Participants</h3>

        {participants.map((p) => (
          <div key={p.uid} style={{ marginBottom: "6px" }}>
            {p.name} {p.uid === uid && "(You)"} ({p.role})

            {myRole === "creator" && p.uid !== uid && (
              <>
                <button onClick={() => changeRole(p.uid, "editor")}>E</button>
                <button onClick={() => changeRole(p.uid, "viewer")}>V</button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        
        {/* TOP BAR */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          background: "#2c2c2c",
          padding: "8px",
          color: "#fff"
        }}>
          <div>Room: {roomCode}</div>

          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(roomCode);
                alert("Copied!");
              } catch {
                const t = document.createElement("textarea");
                t.value = roomCode;
                document.body.appendChild(t);
                t.select();
                document.execCommand("copy");
                document.body.removeChild(t);
                alert("Copied!");
              }
            }}
          >
            📋 Copy
          </button>
        </div>

        {/* TOOLBAR */}
        <div style={{ padding: "10px" }}>
          <button onClick={() => setTool("pen")}>✏️</button>
          <button onClick={() => setTool("eraser")}>🧽</button>

          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input type="range" min="1" max="10" value={size} onChange={(e) => setSize(e.target.value)} />

          <button onClick={clearBoard}>Clear</button>
        </div>

        {/* CURSORS */}
        {Object.entries(cursors).map(([id, c]) => (
          <div
            key={id}
            style={{
              position: "fixed",
              left: c.x,
              top: c.y,
              transform: "translate(-50%, -50%)",
              background: "#000",
              color: "#fff",
              padding: "2px 6px",
              borderRadius: "6px",
              fontSize: "12px",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            {c.name}
          </div>
        ))}

        {/* CANVAS */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <canvas
            ref={canvasRef}
            width={1200}
            height={600}
            style={{
              width: "1200px",
              height: "600px",
              background: "white",
              border: "2px solid #ccc",
              borderRadius: "8px",
            }}
            onMouseDown={startDrawing}
            onMouseMove={(e) => {
              handleCursor(e);
              draw(e);
            }}
            onMouseUp={stopDrawing}
            onMouseLeave={() => {
                stopDrawing();
    socket.emit("cursor-leave", { roomCode }); 
  }}
          />
        </div>
      </div>
    </div>
  );
}

export default Room;