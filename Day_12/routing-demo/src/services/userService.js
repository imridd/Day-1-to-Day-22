import axios from "axios";

const USER_URL =
  "http://localhost:3002/users";

/* =========================
   GET ALL USERS
========================= */

export const getUsers =
  async () => {

    const response =
      await axios.get(
        USER_URL
      );

    return response.data;
  };

/* =========================
   REGISTER USER
========================= */

export const registerUser =
  async (userData) => {

    const users =
      await getUsers();

    const duplicate =
      users.find(
        (user) =>
          user.username
            .toLowerCase()
            ===
          userData.username
            .toLowerCase()
      );

    if (duplicate) {

      throw new Error(
        "Username already exists"
      );

    }

    const numericIds =
      users
        .map((user) =>
          Number(user.id)
        )
        .filter(
          (id) =>
            !isNaN(id)
        );

    const newId =
      numericIds.length > 0
        ? Math.max(
            ...numericIds
          ) + 1
        : 1;

    const newUser = {

      ...userData,

      id: newId,

      role: "user",

      status: "inactive",
    };

    const response =
      await axios.post(
        USER_URL,
        newUser
      );

    return response.data;
  };

/* =========================
   USER LOGIN
========================= */

export const loginUser =
  async (
    username,
    password
  ) => {

    const users =
      await getUsers();

    return users.find(
      (user) =>
        user.username ===
          username &&
        user.password ===
          password
    );
  };

/* =========================
   UPDATE USER
========================= */

export const updateUser =
  async (
    id,
    data
  ) => {

    const response =
      await axios.put(
        `${USER_URL}/${id}`,
        data
      );

    return response.data;
  };

/* =========================
   DELETE USER
========================= */

export const deleteUser =
  async (id) => {

    await axios.delete(
      `${USER_URL}/${id}`
    );
  };