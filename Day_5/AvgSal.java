public class AvgSal {
    public static void main(String[] args) {
        int[] sal = { 65000, 45000, 70000, 50000 };
        int sum = 0;
        int min = sal[0];
        int max = sal[0];
        for (int s : sal) {
            sum += s;
            if (min < s)
                min = s;
            if (max > s)
                max = s;
        }
        double avg = (double) sum / sal.length;
        System.out.println("Total Salary is " + sum);
        System.out.println("Average salary is " + avg);
        System.out.println("Minimum sal is " + min);
        System.out.println("Maximum salary is " + max);
    }
}
