import client from "./client";

export const getWorkingHours = () => client.get("/admin/working-hours").then((r) => r.data);

export const updateWorkingHours = (dayOfWeek, data) =>
  client.put(`/admin/working-hours/${dayOfWeek}`, data).then((r) => r.data);

export const getBlockedDates = (from) =>
  client.get("/admin/blocked-dates", { params: { from } }).then((r) => r.data);

export const createBlockedDate = (data) => client.post("/admin/blocked-dates", data).then((r) => r.data);

export const deleteBlockedDate = (id) => client.delete(`/admin/blocked-dates/${id}`).then((r) => r.data);
