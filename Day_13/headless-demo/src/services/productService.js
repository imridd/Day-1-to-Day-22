import axiosClient from "../api/axiosClient";

const PRODUCT_URL = "/products";

export const getProducts = async () => {
  const response =
    await axiosClient.get(PRODUCT_URL);

  return response.data;
};

export const addProduct = async (product) => {
  const response =
    await axiosClient.post(
      PRODUCT_URL,
      product
    );

  return response.data;
};

export const updateProduct = async (
  id,
  product
) => {
  const response =
    await axiosClient.put(
      `${PRODUCT_URL}/${id}`,
      product
    );

  return response.data;
};

export const deleteProduct = async (id) => {
  await axiosClient.delete(
    `${PRODUCT_URL}/${id}`
  );

  return id;
};