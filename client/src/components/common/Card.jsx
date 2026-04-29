/**
 * Dark card container — used in Login and Dashboard pages.
 */
function Card({ children, style, ...props }) {
  const baseStyle = {
    background: "#2c2c2c",
    padding: "30px",
    borderRadius: "10px",
    color: "#fff",
    ...style,
  };

  return (
    <div style={baseStyle} {...props}>
      {children}
    </div>
  );
}

export default Card;
