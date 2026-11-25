package Day_6.filehandle;
public class Product {
    private String productId;
    private String productName;
    private double price;
    private int quantity;
    private String category;
    public Product(String productId, String productName,double price, int quantity,String category) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.category = category;
    }
      @Override
    public String toString() {
        return String.format("ID=%s, Name=%s, Price=%.2f, Qty=%d, Category=%s",productId,productName,price,quantity,category);
}
}
