import axios from "axios";
const CATEGORY_URL = "http://localhost:3001/categories";
export const getCategories = async () => {
  const response = await axios.get(CATEGORY_URL);
  return response.data;
};
export const addCategory = async (category) => {
  const response = await axios.get(CATEGORY_URL);
  const categories = response.data;
  const numericIds = categories.map((category) => Number(category.id)).filter((id) => !isNaN(id));
  const newId =numericIds.length > 0? Math.max(...numericIds) + 1: 1;
  const newCategory = {...category, id: newId
  };
  const result = await axios.post(
    CATEGORY_URL,
    newCategory
  );

  return result.data;
};
