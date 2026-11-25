package Day_6.generics;
public class Employee implements Identifiable<Integer> {
    private Integer id;
    private String name;
    private double salary;
    public Employee(Integer id, String name, double salary) {
        this.id = id;
        this.name = name;
        this.salary = salary;
    }
    @Override
    public Integer getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public double getSalary() {
        return salary;
    }
    @Override
    public String toString() {
        return String.format("ID : %d | Name : %s | Salary : %.2f",id,name,salary
        );
    }
}
