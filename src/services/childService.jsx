import api from "../utils/axios";

export async function fetchChildren() {
  const res = await api.get("/children");
  return res.data;
}

export async function createChild(payload) {
  const res = await api.post("/children", payload);
  return res.data;
}

export async function updateChild(childId, payload) {
  const res = await api.put(`/children/${childId}`, payload);
  return res.data;
}

export async function deleteChild(childId) {
  const res = await api.delete(`/children/${childId}`);
  return res.data;
}