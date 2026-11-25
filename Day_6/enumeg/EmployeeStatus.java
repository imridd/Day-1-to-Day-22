package Day_6.enumeg;
public enum EmployeeStatus {
    ACTIVE("Employee is Active"),
    ON_LEAVE("Employee is on Leave"),
    RESIGNED("Employee has Resigned"),
    TERMINATED("Employee is Terminated");
    private String description;
    EmployeeStatus(String description) {
        this.description = description;
    }
    public String getDescription() {
        return description;
    }
}
