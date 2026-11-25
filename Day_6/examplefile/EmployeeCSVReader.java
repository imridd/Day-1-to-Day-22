package Day_6.examplefile;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
 
class Employee{
    private final int id;
    private final String name;
    private final String department;
    private final double salary;
 
    Employee(int id,String name, String department, double salary){
        this.id = id;
        this.name = name;
        this.department = department;
        this.salary = salary;
    }
   
    @Override
    public String toString(){
        return id + " - " + name + " - " + department + " - " + salary;
    }
 
}
public class EmployeeCSVReader {
    public static void main(String[] args) {
        Path path = Path.of("emp.csv");
        List<Employee> employees = new ArrayList<>();
 
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while((line = reader.readLine())!= null){
                if(line.isBlank()){
                    continue;
                }
                String[] data = line.split(",");
                if(data.length != 4){
                    System.out.println("Skipping invalid row :" + line);
                    continue;
                }
                try {
                    int id = Integer.parseInt(data[0].trim());
                    String name = data[1].trim();
                    String department = data[2].trim();
                    double salary = Double.parseDouble(data[3].trim());
                    employees.add(new Employee(id, name, department, salary));
                } catch (NumberFormatException ex) {
                    System.out.println("Invalid Numeric data " + line);
                }
            }
        } catch (IOException ex) {
            System.out.println("Unable to read CSV " + ex.getMessage());
        }
        employees.forEach(System.out::println);
    }
}