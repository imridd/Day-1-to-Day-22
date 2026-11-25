package src.com.assignment.product.app;
import java.util.*;
import src.com.assignment.product.model.*;
import src.com.assignment.product.service.*;
import src.com.assignment.product.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("How many products : ");
        int n = sc.nextInt();
        sc.nextLine();
        ProductService service =new ProductService(n);
        for (int i = 1; i <= n; i++) {
            System.out.println( "\nEnter Product "+ i + " Details");
            System.out.print("Product Id : ");
            int id = sc.nextInt();
            sc.nextLine();
            System.out.print("Product Name : ");
            String name = sc.nextLine();
            System.out.print("Price : ");
            double price = sc.nextDouble();
            System.out.print("Quantity : ");
            int quantity = sc.nextInt();
            sc.nextLine();
            System.out.print("Category : ");
            String category = sc.nextLine();
            service.addProduct(new Grocery( id, name,price,quantity,category));
        }
        ProductUtil.companyName();
        System.out.println("\n===================== INVOICE  =======================");
        service.displayProducts();
        System.out.printf( "\nInventory Value : %.2f%n",service.totalInventoryValue());
        service.highestStockProduct();
        System.out.println("Enter Product Id To Search : ");
        int searchId = sc.nextInt();
        service.searchProduct(searchId);
        sc.close();
    }
}