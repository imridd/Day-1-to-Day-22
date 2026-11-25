package src.com.assignment.product.model;
public class Grocery extends Product{
    public Grocery(int productId,String productName,double price,int quantity,String category) {
        super(productId, productName,price, quantity,category);
    }
    @Override
    public void displayProduct() {
        System.out.printf("%d %s %.2f %d %s%n",getProductId(),getProductName(),getPrice(),getQuantity(),getCategory());
    }
}
