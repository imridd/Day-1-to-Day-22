import { useEffect, useState } from "react";
import { getEmployees } from "../services/employeeService";

function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const data =
        await getEmployees();

      setEmployees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    setEmployees,
    loading,
    fetchEmployees
  };
}

export default useEmployees;