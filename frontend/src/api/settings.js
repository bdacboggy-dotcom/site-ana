import client from "./client";

export const getSettings = () => client.get("/admin/settings").then((r) => r.data);

export const updateSettings = (data) => client.put("/admin/settings", data).then((r) => r.data);
