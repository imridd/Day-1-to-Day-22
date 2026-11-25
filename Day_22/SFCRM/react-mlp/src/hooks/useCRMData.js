
import { useCallback, useEffect, useState } from "react";

import {
  get,
  post,
  patch,
  del
} from "../lib/api";

function extractRecords(response, dataKey) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.value)) {
    return response.value;
  }

  if (Array.isArray(response?.[dataKey])) {
    return response[dataKey];
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

export default function useCRMData(
  endpoint,
  dataKey = "records"
) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await get(endpoint);

      const result = extractRecords(response, dataKey);

      setRecords(result);
      setLastUpdated(new Date());

      return result;
    } catch (err) {
      setError(err.message || "Unable to load records.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, dataKey]);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  const createRecord = async (payload) => {
    setSaving(true);
    setError("");

    try {
      const result = await post(endpoint, payload);
      await loadData();
      return result;
    } catch (err) {
      setError(err.message || "Unable to create record.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateRecord = async (id, payload) => {
    setSaving(true);
    setError("");

    try {
      const result = await patch(
        `${endpoint}/${encodeURIComponent(id)}`,
        payload
      );

      await loadData();
      return result;
    } catch (err) {
      setError(err.message || "Unable to update record.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    setSaving(true);
    setError("");

    try {
      const result = await del(
        `${endpoint}/${encodeURIComponent(id)}`
      );

      await loadData();
      return result;
    } catch (err) {
      setError(err.message || "Unable to delete record.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    records,
    setRecords,
    loading,
    saving,
    error,
    lastUpdated,
    refresh: loadData,
    createRecord,
    updateRecord,
    deleteRecord
  };
}
