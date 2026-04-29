import { useState } from "react";
import ParticipantPanel from "./ParticipantPanel";
import ChatPanel from "./ChatPanel";

/**
 * RoomSidebar — merged sidebar that toggles between Participants and Chat.
 */
function RoomSidebar({
  participants,
  currentUid,
  myRole,
  onChangeRole,
  messages,
  onSendMessage,
  username
}) {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("chat")}
          style={{
            ...styles.tab,
            ...(activeTab === "chat" ? styles.activeTab : {})
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          style={{
            ...styles.tab,
            ...(activeTab === "participants" ? styles.activeTab : {})
          }}
        >
          👥 Users ({participants.length})
        </button>
      </div>

      {/* Tab Content */}
      <div style={styles.content}>
        {activeTab === "chat" ? (
          <ChatPanel
            messages={messages}
            onSendMessage={onSendMessage}
            username={username}
            isEmbedded={true}
          />
        ) : (
          <ParticipantPanel
            participants={participants}
            currentUid={currentUid}
            myRole={myRole}
            onChangeRole={onChangeRole}
            isEmbedded={true}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "300px",
    height: "100%",
    background: "#252525",
    borderRight: "1px solid #3a3a3a",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 10,
    flexShrink: 0,
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid #3a3a3a",
    background: "#1e1e1e",
  },
  tab: {
    flex: 1,
    padding: "12px",
    background: "none",
    border: "none",
    color: "#888",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTab: {
    color: "#fff",
    borderBottom: "2px solid #4CAF50",
    background: "#252525",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }
};

export default RoomSidebar;
