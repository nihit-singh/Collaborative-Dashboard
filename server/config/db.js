import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool(
  process.env.DATABASE_URL || {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "collabboard",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : null,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
);

// Verify connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database Connection Failed ❌", err.message);
  } else {
    console.log("Database Connected Successfully ✅");
    connection.release();
  }
});

// Export the promise-based pool for modern async/await usage
export const db = pool.promise();