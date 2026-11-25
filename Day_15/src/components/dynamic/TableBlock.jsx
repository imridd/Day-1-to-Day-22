import { Table } from "react-bootstrap";
export default function TableBlock({
  title = "Data overview",
  data = [],
  headerColor = "#171a2b",
  headerTextColor = "#fff",
  rowColor = "#fff",
  striped = true,
  hover = true,
  bordered = true,
}) {
  const rows = Array.isArray(data) ? data : [],
    keys = rows.length ? Object.keys(rows[0]) : [];
  return (
    <section className="my-4">
      <h2 className="section-heading">{title}</h2>
      {rows.length && keys.length ? (
        <div className="table-responsive rounded-3">
          <Table
            striped={striped}
            hover={hover}
            bordered={bordered}
            className="align-middle mb-0"
          >
            <thead>
              <tr>
                {keys.map((k) => (
                  <th
                    key={k}
                    style={{ background: headerColor, color: headerTextColor }}
                  >
                    {k}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {keys.map((k) => (
                    <td
                      key={k}
                      style={{
                        backgroundColor: rowColor,
                        color: "#20243a",
                      }}
                    >
                      {typeof r[k] === "object"
                        ? JSON.stringify(r[k])
                        : String(r[k] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="empty-data">
          Add a JSON array of objects to display this table.
        </div>
      )}
    </section>
  );
}
