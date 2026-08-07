import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import "./DashboardPage.css";

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
      <div className="dashboard-card-wrapper">
        <Card style={{ width: "380px" }}>
          {/* Header */}
          <div className="dashboard-header">
            <h3>Welcome, {username}</h3>
            <div className="btn-hover-effect">
              <Button variant="danger" onClick={logout} style={{ padding: "6px 12px", fontSize: "13px" }}>
                Logout
              </Button>
            </div>
          </div>

          {/* Create Room */}
          <div className="btn-hover-effect">
            <Button
              variant="primary"
              onClick={createRoom}
              style={{ width: "100%", fontSize: "16px", padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Room
            </Button>
          </div>

          <div className="action-divider">or</div>

          {/* Join Room */}
          <div>
            <div className="input-focus-effect">
              <Input
                type="text"
                placeholder="Enter Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ marginBottom: "12px" }}
              />
            </div>

            <div className="btn-hover-effect">
              <Button
                variant="secondary"
                onClick={joinRoom}
                style={{ width: "100%", padding: "12px", fontSize: "15px" }}
              >
                Join Room
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DashboardPage;
