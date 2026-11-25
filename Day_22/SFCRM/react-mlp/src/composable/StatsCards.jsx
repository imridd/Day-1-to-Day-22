
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight
} from "lucide-react";

import "./StatsCards.css";

export default function StatsCards({
  stats = [],
  loading = false,
  onCardClick,
  columns = 4
}) {
  if (loading) {
    return (
      <div
        className="stats-grid"
        style={{ "--stats-columns": columns }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div className="stats-card stats-skeleton" key={index}>
            <div className="skeleton-line skeleton-label" />
            <div className="skeleton-line skeleton-value" />
            <div className="skeleton-line skeleton-footer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="stats-grid"
      style={{ "--stats-columns": columns }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon || Minus;
        const TrendIcon =
          stat.trend?.direction === "down"
            ? TrendingDown
            : stat.trend?.direction === "up"
              ? TrendingUp
              : Minus;

        const clickable = Boolean(onCardClick || stat.onClick);

        return (
          <article
            key={stat.id || stat.label}
            className={`stats-card ${
              clickable ? "stats-card-clickable" : ""
            }`}
            onClick={() => {
              if (stat.onClick) {
                stat.onClick();
              } else {
                onCardClick?.(stat);
              }
            }}
            onKeyDown={(event) => {
              if (
                clickable &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();

                if (stat.onClick) {
                  stat.onClick();
                } else {
                  onCardClick?.(stat);
                }
              }
            }}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
          >
            <div className="stats-card-top">
              <div className={`stats-icon ${stat.color || "purple"}`}>
                <Icon size={19} />
              </div>

              {clickable && (
                <ArrowUpRight
                  size={16}
                  className="stats-card-arrow"
                />
              )}
            </div>

            <div className="stats-card-content">
              <span className="stats-card-label">
                {stat.label}
              </span>

              <strong className="stats-card-value">
                {stat.value ?? 0}
              </strong>

              {stat.description && (
                <span className="stats-card-description">
                  {stat.description}
                </span>
              )}
            </div>

            {stat.trend && (
              <div
                className={`stats-card-trend ${
                  stat.trend.direction || "neutral"
                }`}
              >
                <TrendIcon size={14} />

                <span>{stat.trend.value}</span>

                {stat.trend.label && (
                  <span className="stats-trend-label">
                    {stat.trend.label}
                  </span>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
