package src.com.assignment.product.service;
import src.com.assignment.product.model.*;
public class ProductService implements ProductOperations {
    private Grocery[] products;
    private int count;
    public ProductService(int size) {
        products = new Grocery[size];
    }
    @Override
    public void addProduct(Grocery product) {
        boolean exists = false;
        for (int i = 0; i < count; i++) {
            if (products[i].getProductId()==product.getProductId()) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            products[count++] = product;
        }
    }
    @Override
    public void displayProducts() {
    System.out.printf(
            "%-8s %-15s %-10s %-8s %-15s%n",
            "ID",
            "NAME",
            "PRICE",
            "QTY",
            "CATEGORY");
    for(int i = 0; i < count; i++) {
        System.out.printf(
                "%-8d %-15s %-10.2f %-8d %-15s%n",
                products[i].getProductId(),
                products[i].getProductName(),
                products[i].getPrice(),
                products[i].getQuantity(),
                products[i].getCategory());
    }
}
    @Override
    public double totalInventoryValue() {
        double total = 0;
        for (int i = 0; i < count; i++) {
            total += products[i].totalAmount();
        }
        return total;
    }
    @Override
    public void searchProduct(int id) {
        boolean found = false;
        for (int i = 0; i < count; i++) {
            if (products[i].getProductId() == id) {
                System.out.println("\nProduct is there");
                products[i].getProductName();
                found = true;
                break;
            }
        }
        if (!found) {
            System.out.println("\nProduct is Out of Stock:(");
        }
    }
    public void highestStockProduct() {
    Grocery highest = products[0];
    for(int i = 1; i < count; i++) {
        if(products[i].getQuantity() >highest.getQuantity()) {
            highest = products[i];
        }
    }

    System.out.println("Highest Bought Product");
    System.out.printf(
        "%-5s %-15s %-10s %-10s %-15s%n",
        "ID",
        "NAME",
        "PRICE",
        "QTY",
        "CATEGORY"
    );
    System.out.printf(
        "%-5d %-15s %-10.2f %-10d %-15s%n",
        highest.getProductId(),
        highest.getProductName(),
        highest.getPrice(),
        highest.getQuantity(),
        highest.getCategory()
    );
}
}