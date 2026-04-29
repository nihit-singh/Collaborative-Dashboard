/**
 * Reusable Button component with variant support.
 *
 * Variants: "primary" (green), "danger" (red), "secondary" (blue), "ghost" (transparent)
 */
function Button({ children, variant = "primary", style, ...props }) {
  const baseStyle = {
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "opacity 0.2s, transform 0.1s",
    ...variantStyles[variant],
    ...style,
  };

  return (
    <button
      style={baseStyle}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      {...props}
    >
      {children}
    </button>
  );
}

const variantStyles = {
  primary: {
    background: "#4CAF50",
  },
  danger: {
    background: "#ff4d4d",
  },
  secondary: {
    background: "#2196F3",
  },
  ghost: {
    background: "transparent",
    border: "1px solid #555",
    color: "#ccc",
  },
};

export default Button;
