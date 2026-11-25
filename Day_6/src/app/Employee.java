package Day_6.src.app;

import Day_6.src.Exception.*;

public class Employee {
    private int id;
    private String name;
    private int age;
    private double salary;

    public Employee(int id, String name, int age, double salary)
            throws InvalidAgeException, InvalidSalaryException {
        if (age < 18) {
            throw new InvalidAgeException("Underage");
        }
        if (salary <= 0) {
            throw new InvalidSalaryException("Invalid salary");
        }
        this.id = id;
        this.name = name;
        this.age = age;
        this.salary = salary;
    }

    public void display() {
        System.out.println(id + " " +
                name + " " +
                age + " " +
                salary);
    }
}
