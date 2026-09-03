import client from "./client";

export const getActiveServices = () => client.get("/services").then((r) => r.data);

export const getAllServices = () => client.get("/services/all").then((r) => r.data);

export const createService = (data) => client.post("/services", data).then((r) => r.data);

export const updateService = (id, data) => client.put(`/services/${id}`, data).then((r) => r.data);

export const deleteService = (id) => client.delete(`/services/${id}`).then((r) => r.data);
