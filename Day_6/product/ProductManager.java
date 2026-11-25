package Day_6.product;

import java.util.*;

public class ProductManager {

    private List<Product> products = new ArrayList<>();

    public void addProduct(Product product) {
        products.add(product);
        System.out.println("Product Added Successfully...");
    }

    public void displayProducts() {

        Collections.sort(products,
                (p1, p2) -> p1.getProductName()
                        .compareToIgnoreCase(p2.getProductName()));

        System.out.println("\n--------------- ALL PRODUCTS (SORTED) ---------------");

        System.out.printf("%-8s %-20s %-10s %-8s %-15s%n",
                "ID", "PRODUCT", "PRICE", "QTY", "CATEGORY");

        for (Product p : products) {
            System.out.printf("%-8s %-20s %-10.2f %-8d %-15s%n",
                    p.getProductId(),
                    p.getProductName(),
                    p.getPrice(),
                    p.getQty(),
                    p.getCategory());
        }
    }

    public void displayUniqueCategories() {

        System.out.println("\n---------- UNIQUE CATEGORIES ----------");

        Set<String> categories = new TreeSet<>();

        for (Product p : products) {
            categories.add(p.getCategory());
        }

        for (String category : categories) {
            System.out.println(category);
        }
    }

    public void displayProductAnalysis(String productId) {

        System.out.println("\n---------- PRODUCT ANALYSIS ----------");

        for (Product p : products) {

            if (p.getProductId().equalsIgnoreCase(productId)) {

                System.out.println("Product ID      : " + p.getProductId());
                System.out.println("Product Name    : " + p.getProductName());
                System.out.println("Price           : " + p.getPrice());
                System.out.println("Quantity        : " + p.getQty());
                System.out.println("Category        : " + p.getCategory());
                System.out.println("Total Value     : " + p.getTotalPrice());
                System.out.println("Stock Status    : " + p.getStockStatus());

                return;
            }
        }

        System.out.println("Product Not Found");
    }

    public void totalInventoryValue() {

        double total = 0;

        for (Product p : products) {
            total += p.getTotalPrice();
        }

        System.out.println("\nTotal Inventory Value : " + total);
    }

    public void updateProduct(String productId, int newQty) {

        for (Product p : products) {

            if (p.getProductId().equalsIgnoreCase(productId)) {

                p.setQty(newQty);

                System.out.println("Product Updated Successfully...");
                return;
            }
        }

        System.out.println("Product Not Found");
    }

    public void deleteProduct(String productId) {

        Iterator<Product> iterator = products.iterator();

        while (iterator.hasNext()) {

            Product p = iterator.next();

            if (p.getProductId().equalsIgnoreCase(productId)) {

                iterator.remove();

                System.out.println("Product Deleted Successfully...");
                return;
            }
        }

        System.out.println("Product Not Found");
    }
}
