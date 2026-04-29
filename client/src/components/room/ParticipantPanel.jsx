/**
 * ParticipantPanel — list of connected users and role controls.
 * Optimized for embedding in the Sidebar.
 */
function ParticipantPanel({ participants, currentUid, myRole, onChangeRole }) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>👥 Participants</h3>
      <div style={styles.count}>{participants.length} online</div>

      <div style={styles.list}>
        {participants.map((p) => (
          <div key={p.uid} style={styles.userCard}>
            <div style={styles.userInfo}>
              <div
                style={{
                  ...styles.avatar,
                  background: p.uid === currentUid ? "#4CAF50" : "#2196F3",
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div style={styles.userName}>
                  {p.name} {p.uid === currentUid && <span style={styles.youBadge}>You</span>}
                </div>
                <div style={styles.roleBadge}>{p.role}</div>
              </div>
            </div>

            {myRole === "creator" && p.uid !== currentUid && (
              <div style={styles.roleControls}>
                <button
                  onClick={() => onChangeRole(p.uid, "editor")}
                  style={{
                    ...styles.roleBtn,
                    ...(p.role === "editor" ? styles.roleBtnActive : {}),
                  }}
                  title="Make Editor"
                >
                  Editor
                </button>
                <button
                  onClick={() => onChangeRole(p.uid, "viewer")}
                  style={{
                    ...styles.roleBtn,
                    ...(p.role === "viewer" ? styles.roleBtnActiveViewer : {}),
                  }}
                  title="Make Viewer"
                >
                  Viewer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    color: "#fff",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "16px",
    fontWeight: 600,
  },
  count: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "16px",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  userCard: {
    background: "#2c2c2c",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  userName: {
    fontSize: "14px",
    fontWeight: 500,
  },
  youBadge: {
    fontSize: "10px",
    background: "#4CAF50",
    padding: "1px 6px",
    borderRadius: "4px",
    marginLeft: "4px",
  },
  roleBadge: {
    fontSize: "11px",
    color: "#aaa",
    textTransform: "capitalize",
  },
  roleControls: {
    display: "flex",
    gap: "4px",
    marginLeft: "42px",
  },
  roleBtn: {
    fontSize: "13px",
    padding: "4px 8px",
    background: "#3a3a3a",
    border: "1px solid #555",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  roleBtnActive: {
    background: "#4CAF50",
    borderColor: "#4CAF50",
  },
  roleBtnActiveViewer: {
    background: "#ff9800",
    borderColor: "#ff9800",
  },
};

export default ParticipantPanel;
