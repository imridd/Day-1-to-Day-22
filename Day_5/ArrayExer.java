import java.util.*;
public class ArrayExer {
    public static void main(String[] args) {
         Scanner sc = new Scanner(System.in);
        String[] emp = {"Rid", "Janet", "Dharu", "Kavi", "Anu"};
        String[] dept = {"HR", "IT", "Finance", "Admin"};
        // 1
        System.out.println("Employee Names:");
        System.out.println(Arrays.toString(emp));
        // 2
        System.out.println("Name Lengths:");
        System.out.println(Arrays.toString(dept));
        // 3
        System.out.print("\nEnter Department: ");
        String search = sc.nextLine();
        boolean found = false;
        for (String d : dept)
            if (d.equalsIgnoreCase(search)) {
                found = true;
                break;
            }
        System.out.println(found ? "Department Found" : "Department Not Found");
        // 4
        Arrays.sort(emp);
        System.out.println("Sorted Employee Names:");
        System.out.println(Arrays.toString(emp));
        // 5
        int count = 0;
        for (String e : emp)
            if (e.toLowerCase().contains("a"))
                count++;
        System.out.println("\nNames containing 'a' : " + count);
        sc.close();
    }
} 
