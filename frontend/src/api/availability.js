import client from "./client";

export const getSlotsForDay = (serviceId, date) =>
  client.get("/availability", { params: { serviceId, date } }).then((r) => r.data);

export const getAvailableDaysInMonth = (serviceId, year, month) =>
  client
    .get("/availability/month", { params: { serviceId, year, month } })
    .then((r) => r.data);
