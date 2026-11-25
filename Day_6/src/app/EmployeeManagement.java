package Day_6.src.app;

import Day_6.src.Exception.*;

public class EmployeeManagement {
    public static void main(String[] args) {
        Employee[] employees = new Employee[2];
        try {
            employees[0] = new Employee(101, "Ridha", 22, 25000);
            employees[1] = new Employee(102, "Janet", 15, 30000);
        } catch (InvalidAgeException e) {
            System.out.println(
                    "Age Error : " + e.getMessage());
        } catch (InvalidSalaryException e) {
            System.out.println("Salary Error : " + e.getMessage());
        }
        try {
            System.out.println(employees[5]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Invalid Employee Index");
        }
        // try {
        //     int age = Integer.parseInt("ABC");
        // } catch (NumberFormatException e) {
        //     System.out.println("Invalid Numeric Input");
        // }
        // try {
        //     String name = null;
        //     System.out.println(name.length());
        // } catch (NullPointerException e) {
        //     System.out.println("Missing Employee Name");
        // }
        System.out.println("Application Continues Running...");
    }
}
