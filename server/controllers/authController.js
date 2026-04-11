import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { jwtDecode } from "jwt-decode";

export const googleAuth = (req, res) => {
  try {
    const { token } = req.body;

    console.log("TOKEN RECEIVED:", token);

    if (!token) {
      return res.status(400).json({ error: "No token received" });
    }

    let user;

    try {
      user = jwtDecode(token);
      console.log("DECODED USER:", user);
    } catch (err) {
      console.error("DECODE ERROR:", err);
      return res.status(500).json({ error: "Token decode failed" });
    }

    const { sub, name, email } = user;

    if (!email) {
      return res.status(400).json({ error: "Email missing from token" });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          console.error("DB SELECT ERROR:", err);
          return res.status(500).json(err);
        }

        if (results.length === 0) {
          db.query(
            "INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)",
            [sub, name, email],
            (err, result) => {
              if (err) {
                console.error("DB INSERT ERROR:", err);
                return res.status(500).json(err);
              }

              generateToken(res, {
                id: result.insertId,
                name,
                email,
              });
            }
          );
        } else {
          generateToken(res, results[0]);
        }
      }
    );
  } catch (error) {
    console.error("FINAL ERROR:", error);
    res.status(500).json({ error: "Auth failed" });
  }
};

const generateToken = (res, user) => {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token, user });
};