import Button from "../common/Button";

/**
 * RoomHeader — top bar showing room code, copy button, and logout.
 */
function RoomHeader({ roomCode, username, onLogout }) {
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    alert("Room code copied!");
  };

  return (
    <div style={styles.header}>
      <div style={styles.left}>
        <span style={styles.roomLabel}>Room:</span>
        <span style={styles.roomCode}>{roomCode}</span>
        <button onClick={copyCode} style={styles.copyBtn} title="Copy room code">
          📋
        </button>
      </div>

      <div style={styles.right}>
        <span style={styles.userLabel}>
          Logged in as <strong>{username}</strong>
        </span>
        <Button variant="danger" onClick={onLogout} style={{ padding: "5px 12px", fontSize: "13px" }}>
          Logout
        </Button>
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#2c2c2c",
    padding: "10px 16px",
    color: "#fff",
    borderBottom: "1px solid #3a3a3a",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  roomLabel: {
    fontSize: "13px",
    color: "#aaa",
  },
  roomCode: {
    fontSize: "16px",
    fontWeight: 700,
    fontFamily: "monospace",
    background: "#3a3a3a",
    padding: "2px 10px",
    borderRadius: "4px",
    letterSpacing: "1px",
  },
  copyBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userLabel: {
    fontSize: "13px",
    color: "#aaa",
  },
};

export default RoomHeader;
