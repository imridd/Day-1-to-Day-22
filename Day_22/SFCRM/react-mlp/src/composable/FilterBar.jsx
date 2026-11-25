
import { useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  X
} from "lucide-react";

import "./FilterBar.css";

export default function FilterBar({
  filters = [],
  values = {},
  search = "",
  searchPlaceholder = "Search records...",
  onSearchChange,
  onFilterChange,
  onReset,
  resultCount,
  actions,
  compact = false
}) {
  const activeFilterCount = useMemo(
    () =>
      filters.filter((filter) => {
        const value = values[filter.name];

        return value !== "" &&
          value !== null &&
          value !== undefined;
      }).length,
    [filters, values]
  );

  const hasActiveFilters = Boolean(search) || activeFilterCount > 0;

  function handleChange(name, value) {
    onFilterChange?.(name, value);
  }

  return (
    <section className={`filter-bar ${compact ? "filter-bar-compact" : ""}`}>
      <div className="filter-bar-main">
        <div className="filter-bar-search">
          <Search size={17} />

          <input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) =>
              onSearchChange?.(event.target.value)
            }
            aria-label="Search records"
          />

          {search && (
            <button
              type="button"
              className="filter-clear-search"
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="filter-bar-controls">
          {filters.map((filter) => (
            <div className="filter-control" key={filter.name}>
              {filter.type === "date" ? (
                <>
                  <label htmlFor={`filter-${filter.name}`}>
                    {filter.label}
                  </label>

                  <input
                    id={`filter-${filter.name}`}
                    type="date"
                    value={values[filter.name] || ""}
                    onChange={(event) =>
                      handleChange(filter.name, event.target.value)
                    }
                  />
                </>
              ) : filter.type === "text" ? (
                <>
                  <label htmlFor={`filter-${filter.name}`}>
                    {filter.label}
                  </label>

                  <input
                    id={`filter-${filter.name}`}
                    type="text"
                    placeholder={filter.placeholder || `Filter ${filter.label}`}
                    value={values[filter.name] || ""}
                    onChange={(event) =>
                      handleChange(filter.name, event.target.value)
                    }
                  />
                </>
              ) : (
                <>
                  <label htmlFor={`filter-${filter.name}`}>
                    {filter.label}
                  </label>

                  <select
                    id={`filter-${filter.name}`}
                    value={values[filter.name] || ""}
                    onChange={(event) =>
                      handleChange(filter.name, event.target.value)
                    }
                  >
                    <option value="">
                      All {filter.label}
                    </option>

                    {(filter.options || []).map((option) => {
                      const item =
                        typeof option === "string"
                          ? { label: option, value: option }
                          : option;

                      return (
                        <option
                          key={item.value}
                          value={item.value}
                          disabled={item.disabled}
                        >
                          {item.label}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
            </div>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              className="filter-reset-button"
              onClick={onReset}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>

        {actions && (
          <div className="filter-bar-actions">
            {actions}
          </div>
        )}
      </div>

      <div className="filter-bar-footer">
        <span>
          <SlidersHorizontal size={13} />
          {activeFilterCount > 0
            ? `${activeFilterCount} active filter${activeFilterCount > 1 ? "s" : ""}`
            : "All records"}
        </span>

        {resultCount !== undefined && (
          <span>
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </span>
        )}
      </div>
    </section>
  );
}
