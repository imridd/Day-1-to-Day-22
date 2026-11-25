package Day_6.filehandle;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
public class ProductCSVReader {
    public static void main(String[] args) {
        Path csvPath = Path.of("products.csv");
        Path txtPath = Path.of("products.txt");
        List<String> output = new ArrayList<>();
        try (BufferedReader reader=Files.newBufferedReader(csvPath, StandardCharsets.UTF_8)) {
            String line;
            reader.readLine();
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;
                String[] data = line.split(",");
                if (data.length != 5) {
                    System.out.println("Invalid Row : " + line);
                    continue;
                }
                try {
                    Product p = new Product(data[0].trim(), data[1].trim(),Double.parseDouble(data[2].trim()),Integer.parseInt(data[3].trim()), data[4].trim());
                    output.add(p.toString());
                } catch (NumberFormatException e) {
                    System.out.println("Invalid Number Data : " + line);
                }
            }
            Files.write(txtPath,output,StandardCharsets.UTF_16LE);
            System.out.println("CSV file has been read successfully");
            System.out.println("Txt file has been created successfully");
            System.out.println("Charset has been converted successfully");
        } catch (IOException e) {
            System.out.println("Error : " + e.getMessage());
        }
    }
}