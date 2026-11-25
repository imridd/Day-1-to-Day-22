package src.com.assignment.product.model;
public abstract class Product {
    private int productId;
    private String productName;
    private double price;
    private int quantity;
    private String category;
    public Product(int productId, String productName,double price, int quantity,String category) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.category=category;
    }
    public int getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public double getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }
    public String getCategory() {
    return category;
}
    public double totalAmount() {
        return price * quantity;
    }
    public abstract void displayProduct();
}
