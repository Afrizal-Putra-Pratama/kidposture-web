import api from "../utils/axios";

/**
 * Login user (parent / physio / admin)
 * @param {Object} credentials - { email, password }
 * @returns {Object} - { token, user }
 */
export async function login(credentials) {
  const res = await api.post("/login", credentials);
  const { token, user } = res.data;

  // Simpan ke localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));

  return { token, user };
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await api.post("/logout");
  } catch (err) {
    console.error("Logout API error:", err);
  } finally {
    // Hapus token & user dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

/**
 * Get current user dari localStorage
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}
