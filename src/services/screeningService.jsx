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

// list rujukan untuk fisio (dashboard)
export async function fetchPhysioReferrals() {
  const res = await api.get("/physio/referrals");
  return res.data;
}

// tambah screening
export async function createScreening(childId, payload) {
  const res = await api.post(`/children/${childId}/screenings`, payload, {
    headers: {
      "Content-Type":
        payload instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
  return res.data;
}

// tambah rekomendasi manual dari fisio
export async function createManualRecommendation(screeningId, payload) {
  const res = await api.post(
    `/screenings/${screeningId}/recommendations`,
    payload
  );
  return res.data;
}

// rujuk screening ke fisioterapis (parent)
export async function referScreeningToPhysio(screeningId, physiotherapistId) {
  const res = await api.post(`/screenings/${screeningId}/refer`, {
    physiotherapist_id: physiotherapistId,
  });
  return res.data;
}

// update status rujukan oleh fisio
export const updateReferralStatusByPhysio = (screeningId, status) =>
  api.patch(`/physio/referrals/${screeningId}/status`, { status });

// helper khusus tombol
export const acceptReferralByPhysio = (screeningId) =>
  updateReferralStatusByPhysio(screeningId, "accepted");

export const completeReferralByPhysio = (screeningId) =>
  updateReferralStatusByPhysio(screeningId, "completed");
