import axios from "axios";

const ADMIN_URL =
  "http://localhost:3002/admins";

const USER_URL =
  "http://localhost:3002/users";

export const getAdmin = async () => {
  const response =
    await axios.get(ADMIN_URL);

  return response.data;
};

export const loginAdmin =
  async (username, password) => {
    const admins =
      await getAdmin();

    return admins.find(
      (admin) =>
        admin.username === username &&
        admin.password === password
    );
  };

export const getAllUsers =
  async () => {
    const response =
      await axios.get(USER_URL);

    return response.data;
  };

export const activateUser =
  async (id) => {
    const user =
      await axios.get(
        `${USER_URL}/${id}`
      );

    return axios.put(
      `${USER_URL}/${id}`,
      {
        ...user.data,
        status: "active",
      }
    );
  };

export const deactivateUser =
  async (id) => {
    const user =
      await axios.get(
        `${USER_URL}/${id}`
      );

    return axios.put(
      `${USER_URL}/${id}`,
      {
        ...user.data,
        status: "inactive",
      }
    );
  };