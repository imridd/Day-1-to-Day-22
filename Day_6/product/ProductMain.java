package Day_6.product;
import java.util.*;
public class ProductMain {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ProductManager pm = new ProductManager();
        pm.addProduct(new Product("P101", "Face Wash", 299, 12, "Skincare"));
        pm.addProduct(new Product("P102", "Moisturizer", 499, 8, "Skincare"));
        pm.addProduct(new Product("P103", "Sunscreen SPF50", 699, 20, "Skincare"));
        pm.addProduct(new Product("P104", "Shampoo", 349, 15, "Haircare"));
        pm.addProduct(new Product("P105", "Hair Serum", 599, 6, "Haircare"));
        pm.addProduct(new Product("P106", "Hair Oil", 249, 25, "Haircare"));
        pm.addProduct(new Product("P107", "Body Lotion", 399, 10, "Skincare"));
        pm.addProduct(new Product("P108", "Notebook", 120, 30, "Stationery"));
        pm.addProduct(new Product("P109", "Pen", 15, 50, "Stationery"));
        pm.addProduct(new Product("P110", "Pencil Box", 180, 18, "Stationery"));
        pm.addProduct(new Product("P111", "Stapler", 250, 7, "Stationery"));
        int choice;
        do {
            System.out.println("\n=================================");
            System.out.println("      PRODUCT MANAGEMENT");
            System.out.println("=================================");
            System.out.println("1. Add Product");
            System.out.println("2. Update Product Qty");
            System.out.println("3. Delete Product");
            System.out.println("4. Display Updated Products");
            System.out.println("5. Display Unique Categories");
            System.out.println("6. Product Analysis");
            System.out.println("7. Total Inventory Value");
            System.out.println("8. Exit");
            System.out.print("Choose : ");
            choice = sc.nextInt();
            sc.nextLine();
            switch (choice) {
                case 1:
                    System.out.print("Enter Product ID : ");
                    String id = sc.nextLine();

                    System.out.print("Enter Product Name : ");
                    String name = sc.nextLine();

                    System.out.print("Enter Price : ");
                    double price = sc.nextDouble();

                    System.out.print("Enter Quantity : ");
                    int qty = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter Category : ");
                    String category = sc.nextLine();

                    pm.addProduct(new Product(id, name, price, qty, category));
                    break;
                case 2:
                    System.out.print("Enter Product ID want to update : ");
                    String updateId = sc.nextLine();

                    System.out.print("Enter New Quantity for " + updateId + " : ");
                    int newQty = sc.nextInt();
                    sc.nextLine();
                    pm.updateProduct(updateId, newQty);
                    break;
                case 3:
                    System.out.print("Enter Product ID : ");
                    String deleteId = sc.nextLine();

                    pm.deleteProduct(deleteId);

                    System.out.println("Product Deleted Successfully");
                    break;
                case 4:
                    pm.displayProducts();
                    break;

                case 5:
                    pm.displayUniqueCategories();
                    break;

                case 6:
                    System.out.print("Enter Product ID : ");
                    String productId = sc.nextLine();
                    pm.displayProductAnalysis(productId);
                    break;

                case 7:
                    pm.totalInventoryValue();
                    break;

                case 8:
                    System.out.println("Thank You...");
                    break;
                default:
                    System.out.println("Invalid Choice");
            }

        } while (choice != 8);
        sc.close();
    }
}
