import java.time.*;
import java.util.*;

class Person {
    String firstName, lastName;
    int age;

    Person(String firstName, String lastName, int age) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
    }

    String fullName() {
        return firstName + " " + lastName;
    }
}

class Employee extends Person {
    String designation, department;

    Employee(String firstName, String lastName, int age, String designation, String department) {
        super(firstName, lastName, age);
        this.designation = designation;
        this.department = department;
    }
}

class Salary {
    double annualSalary, bonus;
    int leave;

    Salary(double annualSalary, double bonus, int leave) {
        this.annualSalary = annualSalary;
        this.bonus = bonus;
        this.leave = leave;
    }

    double getMonthlySalary() {
        double monthlySalary = (annualSalary + bonus) / 12;
        double leaveDeduction = leave * 100;
        return monthlySalary - leaveDeduction;
    }
}

public class Joinee extends Employee {
    Salary salary;

    Joinee(String firstName, String lastName, int age, String designation, String department, double annualSalary,
            double bonus, int leave) {
        super(firstName, lastName, age, designation, department);
        salary = new Salary(annualSalary, bonus, leave);
    }

    void display(int month) {
        LocalDate date = LocalDate.of(LocalDate.now().getYear(), month, 1);
        Month previousMonth = date.minusMonths(1).getMonth();
        System.out.printf(
                "%s working as %s at %s with Salary %.2f for %s%n",
                fullName(),
                designation,
                department,
                salary.getMonthlySalary(),
                previousMonth);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("First Name : ");
        String firstName = sc.nextLine();
        System.out.print("Last Name : ");
        String lastName = sc.nextLine();
        System.out.print("Age : ");
        int age = sc.nextInt();
        sc.nextLine();
        System.out.print("Designation : ");
        String designation = sc.nextLine();
        System.out.print("Department : ");
        String department = sc.nextLine();
        System.out.print("Annual Salary : ");
        double annualSalary = sc.nextDouble();
        System.out.print("Bonus : ");
        double bonus = sc.nextDouble();
        System.out.print("Leave Days : ");
        int leave = sc.nextInt();
        System.out.print("Month for salary display: ");
        int month = sc.nextInt();
        Joinee j = new Joinee(firstName, lastName, age, designation, department, annualSalary, bonus, leave);
        j.display(month);
        sc.close();
    }
}
