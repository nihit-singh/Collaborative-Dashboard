import { getUID } from "../utils/uid";

/**
 * Auth helper hook — provides username, uid, auth checks, and logout.
 */
export function useAuth() {
  const username = localStorage.getItem("username");
  const uid = getUID();

  const isAuthenticated = () => !!localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return { username, uid, isAuthenticated, logout };
}
