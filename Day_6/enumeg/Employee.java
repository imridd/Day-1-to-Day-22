package Day_6.enumeg;
public class Employee {
    private int id;
    private String name;
    private EmployeeStatus status;

    public Employee(int id, String name, EmployeeStatus status) {
        this.id = id;
        this.name = name;
        this.status = status;
    }

    public void changeStatus(EmployeeStatus status) {
        this.status = status;
    }

    public void display() {
        System.out.println(id + " - " + name + " - " + status);
    }

    public EmployeeStatus getStatus() {
        return status;
    }
}
