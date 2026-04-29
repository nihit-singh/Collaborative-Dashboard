/**
 * Generate or retrieve a unique user ID.
 * Persisted in localStorage so it survives page refreshes.
 */
export const getUID = () => {
  let uid = localStorage.getItem("uid");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("uid", uid);
  }
  return uid;
};
