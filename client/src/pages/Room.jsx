/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// generate unique id
const getUID = () => {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("uid", uid);
  }
  return uid;
};


function Room() {
  if (!localStorage.getItem("username")) {
    window.location.href = "/";
  }

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

  const user = {
    uid,
    name: localStorage.getItem("username"),
  };

  
  
  useEffect(() => {
    socket.emit("join-room", {
      roomCode,
      name: user.name,
      uid: user.uid,
    });
  }, [roomCode]);



  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineCap = "round";

    socket.on("name-taken", () => {
      alert("Username already taken!");
      window.location.href = "/dashboard";
    });

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

    //pointer tracking
    socket.on("cursor-move", ({ id, x, y, name }) => {
      setCursors((prev) => ({
        ...prev,
        [id]: { x, y, name },
      }));
    });

    socket.on("cursor-remove", (id) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    socket.on("user-left", (id) => {
      setCursors((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    });

    socket.on("participants", (users) => {
      setParticipants(users);

      const me = users.find((u) => u.uid === uid);
      if (me) setMyRole(me.role);
    });

    return () => socket.off();
  }, []);

  //canvas cordinates
  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  //cursor cordinates
  const handleCursor = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();

    const inside =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;

    if (!inside) {
      socket.emit("cursor-leave", { roomCode });
      return;
    }

    socket.emit("cursor-move", {
      roomCode,
      x: e.clientX,
      y: e.clientY,
      name: user.name,
    });
  };


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

  return (
    <div style={{ display: "flex", height: "97.8vh", background: "#1e1e1e" }}>

      {/* LEFT PANEL */}
      <div style={{ width: "240px", background: "#2c2c2c", color: "#fff", padding: "10px" }}>
        <h3>Participants</h3>

        {participants.map((p) => (
          <div key={p.uid}>
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
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", background: "#2c2c2c", padding: "8px", color: "#fff" }}>
          <div>Room: {roomCode}
            <span style={{ marginLeft: "10px" }}>
              <button onClick={() => {
                navigator.clipboard.writeText(roomCode);
                alert("Copied!");
              }}>
                📋 Copy
              </button>
            </span>
          </div>

          <div>

            <button onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }} style={{ background: "#ff4d4d", color: "#ffffff", border: "none", padding: "5px 10px", borderRadius: "4px" }}>
              Logout
            </button>
          </div>
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
          <div key={id} style={{
            position: "fixed",
            left: c.x,
            top: c.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              background: "rgba(0,0,0,0.6)",
              borderRadius: "50%"
            }} />

            <div style={{
              position: "absolute",
              top: "-18px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#000",
              color: "#fff",
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "6px"
            }}>
              {c.name}
            </div>
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