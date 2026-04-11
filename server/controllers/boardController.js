import { db } from "../config/db.js";

// SAVE BOARD
export const saveBoard = (req, res) => {
  const { roomCode, boardData } = req.body;

  const safeData = JSON.stringify(boardData); // ✅ ALWAYS stringify

  db.query(
    "SELECT id FROM rooms WHERE room_code = ?",
    [roomCode],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(404).json({ error: "Room not found" });
      }

      const roomId = result[0].id;

      db.query(
        "SELECT * FROM boards WHERE room_id = ?",
        [roomId],
        (err, rows) => {
          if (err) return res.status(500).json(err);

          if (rows.length === 0) {
            db.query(
              "INSERT INTO boards (room_id, board_data) VALUES (?, ?)",
              [roomId, safeData],
              (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Board saved" });
              }
            );
          } else {
            db.query(
              "UPDATE boards SET board_data = ? WHERE room_id = ?",
              [safeData, roomId],
              (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Board updated" });
              }
            );
          }
        }
      );
    }
  );
};

// LOAD BOARD
export const loadBoard = (req, res) => {
  const { roomCode } = req.params;

  db.query(
    `SELECT b.board_data 
     FROM boards b
     JOIN rooms r ON b.room_id = r.id
     WHERE r.room_code = ?`,
    [roomCode],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0 || !result[0].board_data) {
        return res.json({ boardData: [] });
      }

      let data = [];

      try {
        if (typeof result[0].board_data === "string") {
          data = JSON.parse(result[0].board_data);
        } else {
          data = result[0].board_data;
        }
      } catch (e) {
        console.error("PARSE FAILED, RESETTING:", e);
        data = [];
      }

      res.json({ boardData: data });
    }
  );
};