package Day_6.examplefile;
import java.io.*;
import java.util.*;
public class ProductFileDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        File file = null;
        while (true) {
            System.out.println("\n===== PRODUCT MENU =====");
            System.out.println("1. Create File");
            System.out.println("2. Write Data");
            System.out.println("3. Append Data");
            System.out.println("4. Read Data");
            System.out.println("5. Exit");
            System.out.print("Enter choice : ");
            int choice = sc.nextInt();
            try {
                switch (choice) {
                    case 1:
                        sc.nextLine(); 
                        System.out.print("File Name : ");
                        String fileName = sc.nextLine();

                        file = new File(fileName);

                        if (file.createNewFile()) {
                            System.out.println("File Created Successfully");
                        } else {
                            System.out.println("File Already Exists");
                        }

                        System.out.println("Path : " + file.getAbsolutePath());

                        break;

                    case 2: {

                        if (file == null) {
                            System.out.println("Please Create the File First");
                            break;
                        }

                        FileWriter fw = new FileWriter(file);
                        BufferedWriter bw = new BufferedWriter(fw);
                        System.out.print("How many items you wanna add : ");
                        int n = sc.nextInt();
                        sc.nextLine();
                        for (int i = 1; i <= n; i++) {
                            System.out.println("\nEnter Product " + i + " Details");
                            System.out.print("Product Id : ");
                            String id = sc.nextLine();

                            System.out.print("Product Name : ");
                            String name = sc.nextLine();

                            System.out.print("Price : ");
                            double price = sc.nextDouble();

                            System.out.print("Quantity : ");
                            int qty = sc.nextInt();
                            sc.nextLine();

                            System.out.print("Category : ");
                            String category = sc.nextLine();

                            bw.write(id + "," + name + ","+ price + "," + qty + "," + category);

                            bw.newLine();
                        }

                        bw.close();

                        System.out.println("Data Written Successfully");
                        break;
                    }

                    case 3: {

                        if (file == null) {
                            System.out.println("Please Create File First");
                            break;
                        }
                        FileWriter appendFW =new FileWriter(file, true);
                        BufferedWriter appendBW =new BufferedWriter(appendFW);
                        System.out.print("How many products to append : ");
                        int count = sc.nextInt();
                        sc.nextLine();
                        for (int i = 1; i <= count; i++) {
                            System.out.println("\nEnter Product " + i + " Details");
                            System.out.print("Product Id : ");
                            String id = sc.nextLine();
                            System.out.print("Product Name : ");
                            String name = sc.nextLine();

                            System.out.print("Price : ");
                            double price = sc.nextDouble();

                            System.out.print("Quantity : ");
                            int qty = sc.nextInt();
                            sc.nextLine();

                            System.out.print("Category : ");
                            String category = sc.nextLine();

                            appendBW.write(id + "," + name + "," + price + "," + qty+ "," + category);

                            appendBW.newLine();
                        }

                        appendBW.close();

                        System.out.println("Data Appended Successfully");
                        break;
                    }

                    case 4: {

                        if (file == null) {
                            System.out.println("Please Create File First");
                            break;
                        }

                        FileReader fr = new FileReader(file);
                        BufferedReader br = new BufferedReader(fr);

                        String line;

                        System.out.println("\n===== PRODUCTS =====");

                        while ((line = br.readLine()) != null) {
                            System.out.println(line);
                        }

                        br.close();
                        break;
                    }
                    case 5:
                        System.out.println("Thank You...");
                        sc.close();
                        System.exit(0);
                        break;

                    default:
                        System.out.println("Invalid Choice");
                }

            } catch (Exception e) {
                System.out.println("Error : " + e.getMessage());
            }
        }
    }
}