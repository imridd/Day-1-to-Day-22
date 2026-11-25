const PRODUCT_URL = "http://localhost:3001/products";

export const getProducts = async () => {
  const response = await fetch(PRODUCT_URL);
  return await response.json();
};

export const addProduct = async (product) => {
  const response = await fetch(PRODUCT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });

  return await response.json();
};

export const updateProduct = async (id, product) => {
  const response = await fetch(`${PRODUCT_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(product)
  });

  return await response.json();
};

export const deleteProduct = async (id) => {
  await fetch(`${PRODUCT_URL}/${id}`, {
    method: "DELETE"
  });
};