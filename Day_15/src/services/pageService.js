import api from "./api";

export const fetchPages = async () =>
  (await api.get("/pages")).data;

export const savePageRequest = async (page) => {
  const existing = page.id
    ? await api.get(`/pages/${page.id}`).catch(() => null)
    : null;

  if (existing) {
    return (await api.put(`/pages/${page.id}`, page)).data;
  }

  return (await api.post("/pages", page)).data;
};

export const deletePageRequest = async (id) => {
  await api.delete(`/pages/${id}`);
  return id;
};
export const fetchNavigation = async () =>
  (await api.get("/navigation")).data;

export const saveNavigationRequest = async (position) =>
  (await api.patch("/navigation", { position })).data;
