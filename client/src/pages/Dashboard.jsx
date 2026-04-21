import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");

  const username = localStorage.getItem("username");

  if (!username) {
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = "/";
  }

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${code}`);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) return alert("Enter room code");
    navigate(`/room/${roomCode}`);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        <div style={styles.header}>
          <h3>Welcome, {username}</h3>
          <button onClick={logout} style={styles.logout}>
            Logout
          </button>
        </div>

        
        <button onClick={createRoom} style={styles.create}>
          ➕ Create Room
        </button>

        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            style={styles.input}
          />

          <button onClick={joinRoom} style={styles.join}>
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "97.8vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#1e1e1e",
  },
  card: {
    background: "#2c2c2c",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  logout: {
    background: "#ff4d4d",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
  create: {
    width: "100%",
    padding: "12px",
    background: "#4CAF50",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  },
  input: {
    width: "95%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "none",
  },
  join: {
    width: "100%",
    padding: "10px",
    background: "#2196F3",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },
};

export default Dashboard;