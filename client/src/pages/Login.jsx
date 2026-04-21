import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!name.trim()) return alert("Enter username");

    localStorage.setItem("username", name);
    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px" }}>CollabBoard</h2>

        <input
          type="text"
          placeholder="Enter username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Enter
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "97.8vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#1e1e1e",
  },
  card: {
    background: "#2c2c2c",
    padding: "10px 30px 30px 30px",
    borderRadius: "10px",
    textAlign: "center",
    color: "white",
    width: "300px",
  },
  input: {
    width: "93%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "none",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Login;



