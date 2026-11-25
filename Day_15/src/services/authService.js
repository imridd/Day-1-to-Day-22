import api from "./api";
export const loginRequest = async ({ email, password }) => {
  const { data } = await api.get("/admins", { params: { email, password } });
  if (!data.length) throw new Error("Email or password is incorrect.");
  return { email: data[0].email };
};
