import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(atob(token.split(".")[1]));

  const createRoom = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/rooms/create",
        {
          userId: user.id,
        }
      );

      const code = res.data.roomCode;

      alert("Room Created: " + code);

      navigate(`/room/${code}`);
    } catch (err) {
      console.error(err);
    }
  };

  const joinRoom = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/rooms/join",
        {
          roomCode,
        }
      );

      navigate(`/room/${res.data.room.room_code}`);
    } catch (err) {
      alert("Room not found ❌");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Dashboard</h2>

      <p>Welcome, {user.name}</p>

      <button onClick={createRoom}>Create Room</button>

      <div style={{ marginTop: "20px" }}>
        <input
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>
    </div>
  );
}

export default Dashboard;