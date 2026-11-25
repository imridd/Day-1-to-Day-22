
import { useCallback, useEffect, useState } from "react";

import { get } from "../lib/api";

export default function usePermissions() {
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await get("/security");

      setSecurity(response);

      return response;
    } catch (err) {
      setSecurity(null);
      setError(
        err.message || "Unable to load permissions."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions().catch(() => {});
  }, [loadPermissions]);

  // Check whether the current user can perform an action.
  const can = useCallback(
    (objectName, action) => {
      if (!security?.permissions) {
        return false;
      }

      const permission =
        security.permissions[objectName] || "";

      return permission.includes(
        action.toUpperCase()
      );
    },
    [security]
  );

  // Check whether the user can perform all requested actions.
  const canAll = useCallback(
    (objectName, actions) => {
      return actions.every((action) =>
        can(objectName, action)
      );
    },
    [can]
  );

  return {
    security,
    user: security?.user || null,
    roles: security?.roles || [],
    permissions: security?.permissions || {},
    hiddenFields: security?.hiddenFields || {},
    loading,
    error,
    can,
    canAll,
    refreshPermissions: loadPermissions
  };
}
