// src/services/api.js
import api from '../utils/axios';

// ─── Subscription ────────────────────────────────────────────────────────────
export const createPaymentTransaction = (physiotherapistId) =>
  api.post('/payments/create-transaction', {
    physiotherapist_id: physiotherapistId,
  }).then((r) => r.data);

export const verifyPayment = (orderId, transactionStatus) =>
  api.post('/payments/verify', {
    order_id:           orderId,
    transaction_status: transactionStatus,
  }).then((r) => r.data);
  export const checkSubscriptionStatus = () =>
  api.get('/subscription/status').then((r) => r.data);

// ─── Chat ────────────────────────────────────────────────────────────────────
export const getConversations = () =>
  api.get('/conversations').then((r) => r.data);

export const getOrCreateConversation = (physiotherapist_id) =>
  api.post('/conversations', { physiotherapist_id }).then((r) => r.data);

export const getMessages = (conversationId) =>
  api.get(`/conversations/${conversationId}/messages`).then((r) => r.data);

export const sendMessage = (conversationId, message) =>
  api.post(`/conversations/${conversationId}/messages`, { message }).then((r) => r.data);

// ─── Children ────────────────────────────────────────────────────────────────
export const getChildren = () =>
  api.get('/children').then((r) => r.data);

export const createChild = (data) =>
  api.post('/children', data).then((r) => r.data);

export const updateChild = (id, data) =>
  api.put(`/children/${id}`, data).then((r) => r.data);

export const deleteChild = (id) =>
  api.delete(`/children/${id}`).then((r) => r.data);

// ─── Physiotherapists ────────────────────────────────────────────────────────
export const getPhysiotherapists = () =>
  api.get('/physiotherapists').then((r) => r.data);

export const getPhysiotherapist = (id) =>
  api.get(`/physiotherapists/${id}`).then((r) => r.data);

export default api;