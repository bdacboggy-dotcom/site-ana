import client from "./client";

export const createAppointment = (data) => client.post("/appointments", data).then((r) => r.data);

export const getAppointmentByToken = (token) =>
  client.get(`/appointments/manage/${token}`).then((r) => r.data);

export const cancelAppointmentByToken = (token) =>
  client.post(`/appointments/manage/${token}/cancel`).then((r) => r.data);

export const getAllAppointments = (from, to) =>
  client.get("/appointments", { params: { from, to } }).then((r) => r.data);

export const updateAppointmentStatus = (id, status) =>
  client.put(`/appointments/${id}/status`, status, {
    headers: { "Content-Type": "application/json" },
  }).then((r) => r.data);
