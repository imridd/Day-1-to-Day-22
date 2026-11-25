package Day_6.generics;
import java.util.*;
public class GenericRepoDemo {
    public static void main(String[] args) {
        InMemoryRepository<Employee, Integer> repo =new InMemoryRepository<>();
        repo.save(new Employee(101, "Ridha", 85000));
        repo.save(new Employee(102, "Janet", 90000));
        repo.save(new Employee(103, "Kavi", 88000));
        repo.save(new Employee(104, "Dharu", 70000));
        System.out.println("----- ALL EMPLOYEES -----");
        repo.findAll().forEach(System.out::println);
        System.out.println("\n----- FIND BY ID -----");
        Optional<Employee> emp = repo.findById(103);
        if (emp.isPresent())  System.out.println(emp.get());
        else System.out.println("Employee Not Found");   
    }
}

