import { Navigate } from "react-router-dom";

/**
 * Route guard — redirects to login if no username in localStorage.
 */
function PrivateRoute({ children }) {
  const username = localStorage.getItem("username");
  return username ? children : <Navigate to="/" />;
}

export default PrivateRoute;
