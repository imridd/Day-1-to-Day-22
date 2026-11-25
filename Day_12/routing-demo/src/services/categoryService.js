import axios from "axios";

const CATEGORY_URL =
  "http://localhost:3002/categories";

export const getCategories =
  async () => {

    const response =
      await axios.get(
        CATEGORY_URL
      );

    return response.data;
  };

export const addCategory =
  async (name) => {

    const categories =
      await getCategories();

    const newId =
      categories.length > 0
        ? Math.max(
            ...categories.map(
              (c) => c.id
            )
          ) + 1
        : 1;

    return axios.post(
      CATEGORY_URL,
      {
        id: newId,
        name,
      }
    );
  };