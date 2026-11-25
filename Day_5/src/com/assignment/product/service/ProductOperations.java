package src.com.assignment.product.service;
import src.com.assignment.product.model.Grocery;
public interface ProductOperations {
    void addProduct(Grocery product);
    void displayProducts();
    double totalInventoryValue();
    void searchProduct(int id);
    void highestStockProduct();
}
