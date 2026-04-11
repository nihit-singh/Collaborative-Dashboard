import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          token: credentialResponse.credential,
        }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard"); // ✅ redirect
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Login</h2>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}

export default Login;