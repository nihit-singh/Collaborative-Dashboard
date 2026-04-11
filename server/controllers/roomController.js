import { db } from "../config/db.js";

const generateCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createRoom = (req, res) => {
  const { userId } = req.body;

  const roomCode = generateCode();

  db.query(
    "INSERT INTO rooms (room_code, created_by) VALUES (?, ?)",
    [roomCode, userId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ roomCode });
    }
  );
};

export const joinRoom = (req, res) => {
  const { roomCode } = req.body;

  db.query(
    "SELECT * FROM rooms WHERE room_code = ?",
    [roomCode],
    (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json({ room: results[0] });
    }
  );
};