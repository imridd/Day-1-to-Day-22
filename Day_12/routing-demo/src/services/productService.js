import axios from "axios";
const PRODUCT_URL ="http://localhost:3002/products";

export const getProducts = async () => {
  const response = await axios.get(PRODUCT_URL);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(
    `${PRODUCT_URL}/${id}`
  );

  return response.data;
};

export const addProduct = async (product) => {
  const products = await getProducts();

  const newId =
    products.length > 0
      ? Math.max(
          ...products.map((p) => Number(p.id))
        ) + 1
      : 1;

  const response = await axios.post(
    PRODUCT_URL,
    {
      ...product,
      id: newId,
    }
  );

  return response.data;
};

export const updateProduct = async (
  id,
  data
) => {
  const response = await axios.put(
    `${PRODUCT_URL}/${id}`,
    data
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  await axios.delete(`${PRODUCT_URL}/${id}`);
};
