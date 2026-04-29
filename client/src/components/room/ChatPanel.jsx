import { useState, useRef, useEffect } from "react";

/**
 * ChatPanel — chat component for room communication.
 * Optimized for embedding in the Sidebar.
 */
function ChatPanel({ messages, onSendMessage, username }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={styles.container}>
      {/* Messages area */}
      <div style={styles.messageList}>
        {messages.length === 0 && (
          <div style={styles.empty}>No messages yet. Say hi! 👋</div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.name === username;
          return (
            <div
              key={i}
              style={{
                ...styles.messageBubble,
                alignSelf: isMe ? "flex-end" : "flex-start",
                background: isMe ? "#4CAF50" : "#3a3a3a",
              }}
            >
              {!isMe && <div style={styles.senderName}>{msg.name}</div>}
              <div style={styles.messageText}>{msg.text}</div>
              <div style={styles.timestamp}>{formatTime(msg.timestamp)}</div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={handleSend} style={styles.sendBtn} title="Send">
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    background: "transparent",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  empty: {
    textAlign: "center",
    color: "#666",
    fontSize: "13px",
    marginTop: "40px",
  },
  messageBubble: {
    maxWidth: "85%",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#fff",
    wordBreak: "break-word",
  },
  senderName: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#aad4ff",
    marginBottom: "2px",
  },
  messageText: {
    lineHeight: "1.4",
  },
  timestamp: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.5)",
    textAlign: "right",
    marginTop: "4px",
  },
  inputArea: {
    display: "flex",
    gap: "6px",
    padding: "10px",
    borderTop: "1px solid #3a3a3a",
    background: "#252525",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
    fontSize: "13px",
    background: "#1e1e1e",
    color: "#fff",
  },
  sendBtn: {
    background: "#4CAF50",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "opacity 0.2s",
  },
};

export default ChatPanel;
