import Button from "../common/Button";

/**
 * Toolbar — drawing tool selection, color picker, size slider, clear button.
 */
function Toolbar({ tool, color, size, onToolChange, onColorChange, onSizeChange, onClear }) {
  return (
    <div style={styles.container}>
      <div style={styles.toolGroup}>
        <button
          onClick={() => onToolChange("pen")}
          style={{
            ...styles.toolBtn,
            ...(tool === "pen" ? styles.activeTool : {}),
          }}
          title="Pen"
        >
          ✏️
        </button>
        <button
          onClick={() => onToolChange("eraser")}
          style={{
            ...styles.toolBtn,
            ...(tool === "eraser" ? styles.activeTool : {}),
          }}
          title="Eraser"
        >
          🧽
        </button>
      </div>

      <div style={styles.toolGroup}>
        <label style={styles.label}>Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={styles.colorPicker}
        />
      </div>

      <div style={styles.toolGroup}>
        <label style={styles.label}>Size</label>
        <input
          type="range"
          min="1"
          max="10"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          style={styles.slider}
        />
        <span style={styles.sizeValue}>{size}</span>
      </div>

      <Button variant="danger" onClick={onClear} style={{ padding: "6px 14px", fontSize: "13px" }}>
        🗑️ Clear
      </Button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "8px 16px",
    background: "#2c2c2c",
    borderBottom: "1px solid #3a3a3a",
  },
  toolGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  toolBtn: {
    fontSize: "18px",
    padding: "6px 10px",
    background: "#3a3a3a",
    border: "1px solid #555",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  activeTool: {
    background: "#4CAF50",
    borderColor: "#4CAF50",
  },
  label: {
    color: "#aaa",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  colorPicker: {
    width: "32px",
    height: "32px",
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  slider: {
    width: "80px",
    cursor: "pointer",
  },
  sizeValue: {
    color: "#ccc",
    fontSize: "13px",
    minWidth: "16px",
  },
};

export default Toolbar;
