package Day_6.product;
public class Product {

    private String productId;
    private String productName;
    private double price;
    private int qty;
    private String category;

    public Product(String productId, String productName,double price, int qty, String category) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.qty = qty;
        this.category = category;
    }

    public String getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public double getPrice() {
        return price;
    }

    public int getQty() {
        return qty;
    }
    public void setQty(int qty) {
    this.qty = qty;
}

    public String getCategory() {
        return category;
    }

    public double getTotalPrice() {
        return price * qty;
    }

    public String getStockStatus() {
        return qty < 10 ? "Low Stock" : "Stock Available";
    }

    @Override
    public String toString() {
        return String.format("%-8s %-15s %-10.2f %-8d %-15s",
                productId, productName, price, qty, category);
    }
}
