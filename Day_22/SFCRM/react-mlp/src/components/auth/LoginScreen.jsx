
import { useEffect, useState } from "react";
import {
  Layers3,
  ArrowRight,
  LoaderCircle,
  ShieldCheck
} from "lucide-react";

import { get, setDemoUser } from "../../lib/api";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("u1");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load available demo users
  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const session = await get("/session");

        const availableUsers = Array.isArray(session.availableUsers)
          ? session.availableUsers
          : [];

        if (!availableUsers.length) {
          throw new Error("No demo users were returned by the server.");
        }

        if (!isMounted) return;

        setUsers(availableUsers);

        if (session.user?.Id) {
          setSelectedUser(session.user.Id);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Unable to connect to the CRM server."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login using the selected demo identity
  async function handleLogin(event) {
    event.preventDefault();

    if (!selectedUser) {
      setError("Please select a demo user.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      setDemoUser(selectedUser);

      const session = await get("/session");

      if (!session.user?.Id) {
        throw new Error("The selected demo user could not be loaded.");
      }

      onLogin(session);
    } catch (err) {
      setError(err.message || "Unable to enter the CRM.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-screen">
      <section
        className="login-card"
        aria-labelledby="login-heading"
        aria-busy={loading || submitting}
      >
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Layers3 size={27} strokeWidth={2.2} />
          </div>

          <div className="login-brand-text">
            <h1>CloudBridge</h1>
            <p>CRM Workspace</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="login-intro">
          <span className="login-eyebrow">
            WELCOME BACK
          </span>

          <h2 id="login-heading">
            Enter your workspace.
          </h2>

          <p>
            Select a demo identity to explore CRM modules
            and role-based permissions.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="login-loading" role="status">
            <LoaderCircle
              className="login-spin"
              size={25}
            />
            <span>Connecting to your CRM...</span>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <label htmlFor="demo-user">
              Choose your demo user
            </label>

            <select
              id="demo-user"
              name="demoUser"
              value={selectedUser}
              onChange={(event) =>
                setSelectedUser(event.target.value)
              }
              disabled={submitting || !users.length}
              required
            >
              <option value="" disabled>
                Select a user
              </option>

              {users.map((user) => (
                <option key={user.Id} value={user.Id}>
                  {user.Name} — {user.Role || user.Title || "CRM User"}
                </option>
              ))}
            </select>

            {/* Error State */}
            {error && (
              <div
                className="login-error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              className="login-submit"
              type="submit"
              disabled={submitting || !users.length}
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    className="login-spin"
                    size={18}
                  />
                  <span>Entering workspace...</span>
                </>
              ) : (
                <>
                  <span>Enter workspace</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security Information */}
        <div className="login-security-note">
          <ShieldCheck size={17} />
          <span>
            Educational demo environment · Local server
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="login-footer">
        CLOUDBRIDGE CRM
        <span>•</span>
        SALESFORCE LEARNING SIMULATOR
      </footer>
    </main>
  );
}
