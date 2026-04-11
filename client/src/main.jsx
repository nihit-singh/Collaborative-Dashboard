import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="74792676463-98fk09ca0o415qloo1h40of4i5f6o7cc.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);