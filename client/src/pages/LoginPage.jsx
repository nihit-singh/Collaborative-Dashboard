import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

/**
 * LoginPage — username entry screen.
 * Composes Card, Input, and Button common components.
 */
function LoginPage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!name.trim()) return alert("Enter username");
    localStorage.setItem("username", name);
    navigate("/dashboard");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="page-center">
      <Card style={{ width: "320px", textAlign: "center", padding: "20px 30px 30px" }}>
        <h2 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: 700 }}>
          CollabBoard
        </h2>

        <Input
          type="text"
          placeholder="Enter username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ marginBottom: "15px" }}
        />

        <Button
          variant="primary"
          onClick={handleLogin}
          style={{ width: "100%", fontSize: "16px" }}
        >
          Enter
        </Button>
      </Card>
    </div>
  );
}

export default LoginPage;
