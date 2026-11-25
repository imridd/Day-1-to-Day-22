package Day_6.enumeg;
public class EnumDemo {
    public static void main(String[] args) {
        System.out.println("-------------------------");
        System.out.println("Employee Status");
        for (EmployeeStatus status : EmployeeStatus.values()) {
            System.out.println(status);
        }
        Employee emp = new Employee(420,"Krishna",EmployeeStatus.ON_LEAVE);
        System.out.println();
        emp.display();
        System.out.println("Status Change");
        emp.changeStatus(EmployeeStatus.ACTIVE);
        emp.display();
        System.out.println("\nDescription : "+ emp.getStatus().getDescription());
    }
}