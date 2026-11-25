import { useEffect, useState } from "react";

import { BarChart } from "@mui/x-charts/BarChart";

import AppCard from "../common/AppCard";

import {
  getEmployees,
} from "../../services/employeeService";

function EmployeeDepartmentChart() {

  const [
    departments,
    setDepartments,
  ] = useState([]);

  const [
    counts,
    setCounts,
  ] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData =
    async () => {

      try {

        const employees =
          await getEmployees();

        const departmentMap = {};

        employees.forEach(
          (employee) => {

            const department =
              employee.department ||
              "Unknown";

            departmentMap[
              department
            ] =
              (
                departmentMap[
                  department
                ] || 0
              ) + 1;
          }
        );

        setDepartments(
          Object.keys(
            departmentMap
          )
        );

        setCounts(
          Object.values(
            departmentMap
          )
        );

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <AppCard>

      <h5 className="chart-title mb-4">
        Employee Department Distribution
      </h5>

      <div className="chart-wrapper">

        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: departments,
            },
          ]}
          series={[
            {
              data: counts,
              color: "#4facfe",
            },
          ]}
          height={350}
        />

      </div>

    </AppCard>
  );
}

export default EmployeeDepartmentChart;