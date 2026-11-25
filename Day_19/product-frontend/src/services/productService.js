const API = `${import.meta.env.VITE_API_URL}/api/products`;
class ProductService {
  async request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }
  // GET ALL PRODUCTS
  async getProducts() {
    return this.request(API);
  }

  // GET PRODUCT BY ID
  async getProduct(id) {
    return this.request(`${API}/${id}`);
  }

  // CREATE PRODUCT
  async createProduct(product) {
    return this.request(API, {
      method: "POST",
      body: JSON.stringify({
        ...product,
        price: String(product.price),
        stock: Number(product.stock)
      })
    });
  }
  // UPDATE PRODUCT
  async updateProduct(id, product) {
    return this.request(`${API}/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...product,
        price: String(product.price),
        stock: Number(product.stock)
      })
    });
  }

  // DELETE PRODUCT
  async deleteProduct(id) {
    return this.request(`${API}/${id}`, {
      method: "DELETE"
    });
  }
}
const productService = new ProductService();
export const getProducts = () => productService.getProducts();
export const getProduct = (id) => productService.getProduct(id);
export const createProduct = (product) => productService.createProduct(product);
export const updateProduct = (id, product) => productService.updateProduct(id, product);
export const deleteProduct = (id) => productService.deleteProduct(id);
