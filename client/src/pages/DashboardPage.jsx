import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

/**
 * DashboardPage — room creation & join screen.
 * Composes Card, Input, Button components and uses useAuth hook.
 */
function DashboardPage() {
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const [roomCode, setRoomCode] = useState("");

  if (!username) {
    window.location.href = "/";
    return null;
  }

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    navigate(`/room/${code}`);
  };

  const joinRoom = () => {
    if (!roomCode.trim()) return alert("Enter room code");
    navigate(`/room/${roomCode}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") joinRoom();
  };

  return (
    <div className="page-center">
      <Card style={{ width: "380px" }}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Welcome, {username}</h3>
          <Button variant="danger" onClick={logout} style={{ padding: "6px 12px", fontSize: "13px" }}>
            Logout
          </Button>
        </div>

        {/* Create Room */}
        <Button
          variant="primary"
          onClick={createRoom}
          style={{ width: "100%", fontSize: "16px", padding: "12px" }}
        >
          ➕ Create Room
        </Button>

        {/* Join Room */}
        <div style={{ marginTop: "20px" }}>
          <Input
            type="text"
            placeholder="Enter Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ marginBottom: "10px" }}
          />

          <Button
            variant="secondary"
            onClick={joinRoom}
            style={{ width: "100%", padding: "10px" }}
          >
            Join Room
          </Button>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
};

export default DashboardPage;
