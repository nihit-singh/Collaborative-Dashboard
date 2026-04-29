import { getUserColor } from "../../utils/colors";

/**
 * CursorLayer — renders remote user cursors as overlays relative to the canvas.
 */
function CursorLayer({ cursors }) {
  return (
    <>
      {Object.entries(cursors)
        .filter(([_, c]) => c.isVisible !== false) // Default to visible if not specified
        .map(([id, c]) => {
          const color = getUserColor(id);
          return (
            <div
              key={id}
              style={{
                position: "absolute",
                left: c.x,
                top: c.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
                zIndex: 9999,
              }}
            >
              {/* Cursor dot */}
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  background: color,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 0 8px rgba(0,0,0,0.5)",
                }}
              />

              {/* Name label */}
              <div
                style={{
                  position: "absolute",
                  top: "-24px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: color,
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {c.name}
              </div>
            </div>
          );
        })}
    </>
  );
}

export default CursorLayer;
