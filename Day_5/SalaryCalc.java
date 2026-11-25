import java.util.*;
public class SalaryCalc {
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.print("Employee Name ");
        String name=sc.next();
        System.out.print("Annual Salary ");
        double sal=sc.nextDouble();
        sc.nextLine();
        System.out.print("Enter the month of salary u want to know ");
        String mon=sc.nextLine();
        System.out.print("No of leaves taken ");
        int leave=sc.nextInt();
        int days = switch (mon.toLowerCase()) {
       case "jan", "january",
         "mar", "march",
         "may",
         "jul", "july",
         "aug", "august",
         "oct", "october",
         "dec", "december" -> 31;

    case "apr", "april",
         "jun", "june",
         "sep", "september",
         "nov", "november" -> 30;
    case "feb", "february" -> 28;
    default ->0;
};
        double monthlySalary = sal / 12;
        double perDaySalary = monthlySalary / days;
        double finalSalary = monthlySalary - (perDaySalary * leave);
        System.out.println(name + " got the " + mon + " Salary as : " + finalSalary);
        sc.close();
    
    }
    
}
