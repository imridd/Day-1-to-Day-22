import java.util.Scanner;

public class MethodExercises {
    public static void evenOdd(int n) {
        System.out.println(n % 2 == 0 ? "Even" : "Odd");
    }

    public static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static long factorial(int n) {
        long fact = 1;
        for (int i = 1; i <= n; i++)
            fact *= i;
        return fact;
    }

    public static void employeeDetails(int id, String name, double salary) {
        System.out.printf(
                "ID: %d%nName: %s%nSalary: %.2f%n",
                id, name, salary);
    }

    public static int area(int l, int b) {
        return l * b;
    }

    public static double area(double l, double b) {
        return l * b;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Odd or Even");
        System.out.print("Enter a number: ");
        int num = sc.nextInt();
        evenOdd(num);
        System.out.println("Max of 2 nos");
        System.out.print("Enter two numbers: ");
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println("Maximum = " + max(a, b));
        System.out.println("Factorial");
        System.out.print("Enter number for factorial: ");
        int n = sc.nextInt();
        System.out.println("Factorial = " + factorial(n));
        System.out.println("---Employee Details---");
        System.out.print("Employee ID : ");
        int id = sc.nextInt();
        sc.nextLine();
        System.out.print("Name : ");
        String name = sc.nextLine();
        System.out.print("Salary : ");
        double salary = sc.nextDouble();
        employeeDetails(id, name, salary);
        System.out.println("Area");
        System.out.println("Rectangle Area (int) = " + area(10, 20));
        System.out.println("Rectangle Area (double) = " + area(10.5, 20.5));
        sc.close();
    }
}
