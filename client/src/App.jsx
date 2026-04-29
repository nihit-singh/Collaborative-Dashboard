import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/auth/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RoomPage from "./pages/RoomPage";

/**
 * App — root component with routing configuration.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/room/:roomCode"
          element={
            <PrivateRoute>
              <RoomPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;