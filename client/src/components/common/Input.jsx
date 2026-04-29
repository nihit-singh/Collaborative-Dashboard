/**
 * Reusable styled text input.
 */
function Input({ style, ...props }) {
  const baseStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box",
    ...style,
  };

  return <input style={baseStyle} {...props} />;
}

export default Input;
