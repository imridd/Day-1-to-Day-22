
import { useMemo, useState } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  LoaderCircle,
  Inbox,
  X
} from "lucide-react";

import "./DataTable.css";

function getValue(row, accessor) {
  if (typeof accessor === "function") {
    return accessor(row);
  }

  if (!accessor) return "";

  return accessor
    .split(".")
    .reduce((value, key) => value?.[key], row);
}

function compareValues(a, b) {
  if (a == null) return b == null ? 0 : -1;
  if (b == null) return 1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base"
  });
}

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  error = "",
  searchPlaceholder = "Search records...",
  pageSize = 8,
  getRowId = (row) => row.Id,
  onView,
  onEdit,
  onDelete,
  selectedIds = [],
  onSelectionChange,
  emptyTitle = "No records found",
  emptyDescription = "Try changing your search or add a new record.",
  title,
  description,
  toolbarActions,
  rowActions
}) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc"
  });
  const [currentPage, setCurrentPage] = useState(1);

  const searchableColumns = useMemo(
    () => columns.filter((column) => column.searchable !== false),
    [columns]
  );

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return data;

    return data.filter((row) =>
      searchableColumns.some((column) => {
        const value = getValue(row, column.accessor ?? column.key);

        return String(value ?? "")
          .toLowerCase()
          .includes(query);
      })
    );
  }, [data, search, searchableColumns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const column = columns.find(
      (item) => item.key === sortConfig.key
    );

    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const first = getValue(a, column.accessor ?? column.key);
      const second = getValue(b, column.accessor ?? column.key);

      const result = compareValues(first, second);

      return sortConfig.direction === "asc"
        ? result
        : -result;
    });
  }, [filteredData, sortConfig, columns]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedData.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const pageData = useMemo(() => {
    const start = (safePage - 1) * pageSize;

    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safePage, pageSize]);

  const pageIds = pageData.map(getRowId);
  const allPageSelected =
    pageIds.length > 0 &&
    pageIds.every((id) => selectedIds.includes(id));

  const somePageSelected =
    pageIds.some((id) => selectedIds.includes(id));

  function handleSearch(value) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleSort(column) {
    if (column.sortable === false) return;

    setSortConfig((previous) => ({
      key: column.key,
      direction:
        previous.key === column.key &&
        previous.direction === "asc"
          ? "desc"
          : "asc"
    }));

    setCurrentPage(1);
  }

  function toggleRow(id) {
    if (!onSelectionChange) return;

    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];

    onSelectionChange(next);
  }

  function togglePageSelection() {
    if (!onSelectionChange) return;

    if (allPageSelected) {
      onSelectionChange(
        selectedIds.filter((id) => !pageIds.includes(id))
      );
    } else {
      onSelectionChange([
        ...new Set([...selectedIds, ...pageIds])
      ]);
    }
  }

  const hasRowActions =
    Boolean(onView || onEdit || onDelete || rowActions);

  const startRecord =
    sortedData.length === 0
      ? 0
      : (safePage - 1) * pageSize + 1;

  const endRecord = Math.min(
    safePage * pageSize,
    sortedData.length
  );

  return (
    <section className="data-table-card">
      {(title || description || toolbarActions) && (
        <div className="data-table-heading">
          <div>
            {title && <h2>{title}</h2>}
            {description && <p>{description}</p>}
          </div>

          {toolbarActions && (
            <div className="data-table-toolbar-actions">
              {toolbarActions}
            </div>
          )}
        </div>
      )}

      <div className="data-table-toolbar">
        <div className="data-table-search">
          <Search size={17} />

          <input
            type="search"
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search records"
          />

          {search && (
            <button
              type="button"
              className="data-table-clear-search"
              onClick={() => handleSearch("")}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <span className="data-table-count">
          {filteredData.length}{" "}
          {filteredData.length === 1 ? "record" : "records"}
        </span>
      </div>

      {error && (
        <div className="data-table-error" role="alert">
          {error}
        </div>
      )}

      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {onSelectionChange && (
                <th className="data-table-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          somePageSelected && !allPageSelected;
                      }
                    }}
                    onChange={togglePageSelection}
                    aria-label="Select all records on this page"
                  />
                </th>
              )}

              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`align-${column.align || "left"}`}
                >
                  <button
                    type="button"
                    className="data-table-sort"
                    onClick={() => handleSort(column)}
                    disabled={column.sortable === false}
                  >
                    {column.label}

                    {column.sortable !== false && (
                      <ArrowUpDown
                        size={13}
                        className={
                          sortConfig.key === column.key
                            ? "sort-active"
                            : ""
                        }
                      />
                    )}
                  </button>
                </th>
              ))}

              {hasRowActions && (
                <th className="align-right">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onSelectionChange ? 1 : 0) +
                    (hasRowActions ? 1 : 0)
                  }
                  className="data-table-state"
                >
                  <LoaderCircle className="data-table-spinner" size={25} />
                  <span>Loading records...</span>
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onSelectionChange ? 1 : 0) +
                    (hasRowActions ? 1 : 0)
                  }
                  className="data-table-state"
                >
                  <Inbox size={29} />
                  <strong>{emptyTitle}</strong>
                  <span>{emptyDescription}</span>
                </td>
              </tr>
            ) : (
              pageData.map((row) => {
                const rowId = getRowId(row);

                return (
                  <tr key={rowId}>
                    {onSelectionChange && (
                      <td className="data-table-checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(rowId)}
                          onChange={() => toggleRow(rowId)}
                          aria-label={`Select record ${rowId}`}
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const value = getValue(
                        row,
                        column.accessor ?? column.key
                      );

                      return (
                        <td
                          key={column.key}
                          className={`align-${column.align || "left"}`}
                        >
                          {column.render
                            ? column.render(value, row)
                            : value == null || value === ""
                              ? <span className="data-table-muted">—</span>
                              : String(value)}
                        </td>
                      );
                    })}

                    {hasRowActions && (
                      <td className="align-right">
                        <div className="data-table-row-actions">
                          {rowActions
                            ? rowActions(row)
                            : (
                              <>
                                {onView && (
                                  <button
                                    type="button"
                                    title="View record"
                                    aria-label="View record"
                                    onClick={() => onView(row)}
                                  >
                                    <Eye size={16} />
                                  </button>
                                )}

                                {onEdit && (
                                  <button
                                    type="button"
                                    title="Edit record"
                                    aria-label="Edit record"
                                    onClick={() => onEdit(row)}
                                  >
                                    <Pencil size={16} />
                                  </button>
                                )}

                                {onDelete && (
                                  <button
                                    type="button"
                                    title="Delete record"
                                    aria-label="Delete record"
                                    className="data-table-delete"
                                    onClick={() => onDelete(row)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </>
                            )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="data-table-pagination">
        <span>
          Showing {startRecord}–{endRecord} of {sortedData.length}
        </span>

        <div className="data-table-page-controls">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage <= 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <span>
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={safePage >= totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </footer>
    </section>
  );
}
