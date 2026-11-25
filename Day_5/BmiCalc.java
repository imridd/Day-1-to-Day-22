import java.util.*;
public class BmiCalc{
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.println("Weight in kgs ");
        double w=sc.nextDouble();
        System.out.println("Height in m ");
        double h=sc.nextDouble();
        double bmi=w/(h*h);
        String category=switch((int)bmi){
            case 0->"Invalid";
            case 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17->"Underweight";
            case 18,19,20,21,22,23,24->"Normal";
            case 25,26,27,28,29->"Overweight";
            default->"Obese";
        };
        System.out.println("BMI is "+bmi);
        System.out.println("You are "+category);
        sc.close();
    }
}