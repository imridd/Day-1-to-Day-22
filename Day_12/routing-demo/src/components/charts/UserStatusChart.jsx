import { useEffect, useState } from "react";

import { PieChart } from "@mui/x-charts/PieChart";

import AppCard from "../common/AppCard";

import {
  getUsers,
} from "../../services/userService";

function UserStatusChart() {

  const [
    chartData,
    setChartData,
  ] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers =
    async () => {

      try {

        const users =
          await getUsers();

        const active =
          users.filter(
            (user) =>
              user.status ===
              "active"
          ).length;

        const inactive =
          users.filter(
            (user) =>
              user.status ===
              "inactive"
          ).length;

        setChartData([
          {
            id: 0,
            value: active,
            label: "Active",
          },
          {
            id: 1,
            value: inactive,
            label: "Inactive",
          },
        ]);

      } catch (error) {

        console.log(error);

      }
    };

  return (
    <AppCard>

      <h5 className="chart-title mb-4">
        User Status Distribution
      </h5>

      <div className="chart-wrapper">

        <PieChart
          series={[
            {
              data: chartData,
            },
          ]}
          height={350}
        />

      </div>

    </AppCard>
  );
}

export default UserStatusChart;