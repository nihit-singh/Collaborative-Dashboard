import { forwardRef } from "react";

/**
 * WhiteboardCanvas — the core drawing surface.
 * Uses forwardRef to expose the canvas element to parent for hooks.
 */
const WhiteboardCanvas = forwardRef(function WhiteboardCanvas(
  { onMouseDown, onMouseMove, onMouseUp, onMouseLeave },
  ref
) {
  return (
    <div style={styles.wrapper}>
      <canvas
        ref={ref}
        width={960}
        height={480}
        style={styles.canvas}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
});

const styles = {
  wrapper: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px",
  },
  canvas: {
    width: "960px",
    height: "480px",
    background: "#ffffff",
    border: "2px solid #444",
    borderRadius: "8px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
};

export default WhiteboardCanvas;
