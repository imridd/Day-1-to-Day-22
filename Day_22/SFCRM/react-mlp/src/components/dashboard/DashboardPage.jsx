
import {
  Users,
  Building2,
  Contact,
  Headset,
  Clock3,
  TrendingUp,
  Wallet,
  Trophy,
  Target,
  RefreshCw,
  ArrowUpRight,
  Activity
} from "lucide-react";

import useDashboardData from "../../hooks/useDashboardData";
import "./DashboardPage.css";

const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(value || 0);

const formatDate = (value) => {
  if (!value) return "Recently";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const metrics = [
  {
    key: "totalLeads",
    label: "Total Leads",
    icon: Target,
    color: "purple",
    description: "All captured prospects"
  },
  {
    key: "totalAccounts",
    label: "Accounts",
    icon: Building2,
    color: "blue",
    description: "Business organizations"
  },
  {
    key: "totalContacts",
    label: "Contacts",
    icon: Contact,
    color: "pink",
    description: "Customer connections"
  },
  {
    key: "openCases",
    label: "Open Cases",
    icon: Headset,
    color: "orange",
    description: "Awaiting resolution"
  },
  {
    key: "overdueTasks",
    label: "Overdue Tasks",
    icon: Clock3,
    color: "green",
    description: "Tasks past due date"
  }
];

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboardData();

  const maxAmount = Math.max(
    ...data.breakdown.map((item) => item.amount || 0),
    1
  );

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <p>Preparing your dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => refresh()}>
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      {/* HEADER */}
      <section className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">
            <span className="dashboard-live-dot" />
            YOUR WORKSPACE
          </div>

          <h1>
            Welcome back <span>👋</span>
          </h1>

          <p>
            Here's what's happening across your CRM today.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={() => refresh()}
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </section>

      {/* METRIC CARDS */}
      <section className="dashboard-metrics">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              className={`metric-card metric-${metric.color}`}
              key={metric.key}
            >
              <div className="metric-top">
                <div className="metric-icon">
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="metric-arrow"
                />
              </div>

              <h2>{number(data[metric.key])}</h2>

              <h3>{metric.label}</h3>

              <p>{metric.description}</p>
            </article>
          );
        })}
      </section>

      {/* REVENUE CARDS */}
      <section className="revenue-grid">

        <article className="revenue-card revenue-main">
          <div className="revenue-icon">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>Total Sales Pipeline</span>
            <h2>{currency(data.pipeline)}</h2>
            <small>All opportunity stages</small>
          </div>
        </article>

        <article className="revenue-card">
          <div className="revenue-icon revenue-blue">
            <Wallet size={22} />
          </div>

          <div>
            <span>Weighted Pipeline</span>
            <h2>{currency(data.weighted)}</h2>
            <small>Probability-adjusted value</small>
          </div>
        </article>

        <article className="revenue-card">
          <div className="revenue-icon revenue-green">
            <Trophy size={22} />
          </div>

          <div>
            <span>Closed Won</span>
            <h2>{currency(data.won)}</h2>
            <small>Successfully closed deals</small>
          </div>
        </article>
      </section>

      {/* MAIN CONTENT */}
      <section className="dashboard-content-grid">

        {/* PIPELINE */}
        <article className="dashboard-panel pipeline-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                SALES PERFORMANCE
              </span>
              <h2>Pipeline Overview</h2>
              <p>Opportunity distribution by stage</p>
            </div>

            <div className="panel-heading-icon">
              <Activity size={20} />
            </div>
          </div>

          <div className="pipeline-list">
            {data.breakdown.map((item, index) => (
              <div className="pipeline-item" key={item.stage}>
                <div className="pipeline-item-header">
                  <div className="pipeline-stage">
                    <span className={`stage-dot stage-${index % 6}`} />
                    <strong>{item.stage}</strong>
                  </div>

                  <div className="pipeline-amount">
                    <strong>{currency(item.amount)}</strong>
                    <span>{item.count} deals</span>
                  </div>
                </div>

                <div className="pipeline-track">
                  <div
                    className={`pipeline-progress progress-${index % 6}`}
                    style={{
                      width: `${(item.amount / maxAmount) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}

            {data.breakdown.length === 0 && (
              <p className="dashboard-empty">
                No pipeline data available.
              </p>
            )}
          </div>
        </article>

        {/* ACTIVITY */}
        <article className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">
                WHAT'S HAPPENING
              </span>
              <h2>Recent Activity</h2>
              <p>Latest changes in your CRM</p>
            </div>

            <div className="panel-heading-icon activity-heading-icon">
              <Activity size={20} />
            </div>
          </div>

          <div className="activity-list">
            {data.recentActivities.map((activity) => (
              <div
                className="activity-item"
                key={activity.id}
              >
                <div className="activity-avatar">
                  {(activity.actorName || "U")
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div className="activity-details">
                  <strong>{activity.label || "CRM record"}</strong>

                  <p>
                    {activity.actorName}{" "}
                    <span>{activity.operation.toLowerCase()}</span>{" "}
                    a {activity.object.replace(/s$/, "")}
                  </p>

                  <small>{formatDate(activity.at)}</small>
                </div>

                <span
                  className={`activity-operation operation-${activity.operation.toLowerCase()}`}
                >
                  {activity.operation}
                </span>
              </div>
            ))}

            {data.recentActivities.length === 0 && (
              <p className="dashboard-empty">
                No recent activity available.
              </p>
            )}
          </div>
        </article>

      </section>

      {/* FOOTER SUMMARY */}
      <section className="dashboard-footer">
        <div>
          <Users size={17} />
          <span>
            {number(data.unconvertedLeads)} unconverted leads
          </span>
        </div>

        <span className="dashboard-footer-status">
          <span className="dashboard-live-dot" />
          Connected to CRM backend
        </span>
      </section>

    </main>
  );
}
