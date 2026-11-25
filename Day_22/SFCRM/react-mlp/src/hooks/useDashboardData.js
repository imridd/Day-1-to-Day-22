
import { useCallback, useEffect, useState } from "react";
import { get } from "../lib/api";

const initialData = {
  totalLeads: 0,
  unconvertedLeads: 0,
  totalAccounts: 0,
  totalContacts: 0,
  openCases: 0,
  overdueTasks: 0,
  pipeline: 0,
  weighted: 0,
  won: 0,
  breakdown: [],
  recentActivities: [],
  recentFlows: []
};

export default function useDashboardData() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await get("/overview");

      setData({
        ...initialData,
        ...response
      });

      return response;
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh
  };
}
