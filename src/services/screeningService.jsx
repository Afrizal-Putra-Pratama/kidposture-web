import api from "../utils/axios";

// list screening per anak (ChildScreeningsPage)
export async function fetchChildScreenings(childId) {
  const res = await api.get(`/children/${childId}/screenings`);
  return res.data;
}

// detail screening (parent & fisio)
export async function fetchScreeningDetail(screeningId) {
  const res = await api.get(`/screenings/${screeningId}`);
  return res.data;
}

// list screening untuk fisio dashboard
export async function fetchPhysioScreenings() {
  const res = await api.get("/physio/screenings");
  return res.data;
}

// tambah screening (kalau FormData)
export async function createScreening(childId, payload) {
  const res = await api.post(`/children/${childId}/screenings`, payload, {
    headers: {
      "Content-Type": payload instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return res.data;
}

// tambah rekomendasi manual dari fisio
export async function createManualRecommendation(screeningId, payload) {
  const res = await api.post(`/screenings/${screeningId}/recommendations`, payload);
  return res.data;
}
