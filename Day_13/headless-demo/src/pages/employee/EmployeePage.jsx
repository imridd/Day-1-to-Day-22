
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CardList from "../../components/headless/CardList";
import DataList from "../../components/headless/DataList";
import DataGrid from "../../components/headless/DataGrid";
import EmployeeModal from "../../components/modals/EmployeeModal";
import EmployeeViewModal from "../../components/modals/EmployeeViewModal";
import EmployeeCard from "./EmployeeCard";
import { useEmployees } from "../../hooks/useEmployees";

function EmployeesPage() {
  const {
    employees,
    loading,
    fetchEmployees,
    createEmployee,
    editEmployee,
    deleteEmployee,
  } = useEmployees();

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] =
    useState("name-asc");

  const [viewType, setViewType] =
    useState("card");

  const [showModal, setShowModal] =
    useState(false);

  const [showView, setShowView] =
    useState(false);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowModal(true);
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowView(true);

    toast.info(
      `${employee.name} profile opened 👤`
    );
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);

      toast.error(
        "Employee left the organization 👋"
      );

      await fetchEmployees();
    } catch (error) {
      console.error(
        "Delete Employee Error",
        error
      );
    }
  };

  const handleSave = async (
    employeeData
  ) => {
    try {
      if (selectedEmployee) {
        await editEmployee(
          selectedEmployee.id,
          {
            ...employeeData,
            id: selectedEmployee.id,
          }
        );

        toast.info(
          "Employee updated successfully ✏️"
        );
      } else {
        await createEmployee(
          employeeData
        );

        toast.success(
          "Employee joined the organization 🎉"
        );
      }

      await fetchEmployees();

      setShowModal(false);
      setSelectedEmployee(null);
    } catch (error) {
      console.error(
        "Save Employee Error",
        error
      );
    }
  };

  const filteredEmployees =
    [...employees]
      .filter((employee) =>
        employee?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(
              b.name
            );

          case "name-desc":
            return b.name.localeCompare(
              a.name
            );

          case "salary-high":
            return (
              Number(b.salary) -
              Number(a.salary)
            );

          case "salary-low":
            return (
              Number(a.salary) -
              Number(b.salary)
            );

          default:
            return 0;
        }
      });

  if (loading) {
    return (
      <div className="text-center mt-5">
        Loading Employees...
      </div>
    );
  }
  const employeeColumns = [
    {
      key: "name",
      label: "Name",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "department",
      label: "Department",
    },
    {
      key: "designation",
      label: "Designation",
    },
    {
      key: "salary",
      label: "Salary",
    },
  ];
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">

        <input
          type="text"
          className="form-control"
          style={{ width: "250px" }}
          placeholder="Search Employee"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />

        <select
          className="form-select w-auto"
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
        >
          <option value="name-asc">
            Name A-Z
          </option>

          <option value="name-desc">
            Name Z-A
          </option>

          <option value="salary-high">
            Salary High-Low
          </option>

          <option value="salary-low">
            Salary Low-High
          </option>
        </select>

        <select
          className="form-select w-auto"
          value={viewType}
          onChange={(e) =>
            setViewType(
              e.target.value
            )
          }
        >
          <option value="card">
            Card View
          </option>

          <option value="table">
            Table View
          </option>

          <option value="list">
            List View
          </option>
        </select>

        <button
          className="btn btn-primary"
          onClick={
            handleAddEmployee
          }
        >
          Add Employee
        </button>
      </div>

      {filteredEmployees.length >
        0 ? (
        <>
          {viewType === "card" && (
            <CardList
              data={filteredEmployees}
              renderItem={(employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            />
          )}

          {viewType === "table" && (
            <DataGrid
              columns={employeeColumns}
              data={filteredEmployees}
              renderActions={(row) => (
                <>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() =>
                      handleView(row)
                    }
                  >
                    View
                  </button>

                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() =>
                      handleEdit(row)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDelete(row.id)
                    }
                  >
                    Delete
                  </button>
                </>
              )}
            />
          )}

          {viewType === "list" && (
            <DataList
              data={filteredEmployees}
              renderItem={(employee) => (
                <div
                  key={employee.id}
                  className="course-item"
                >
                  <div>
                    <h5>{employee.name}</h5>

                    <p>
                      {employee.email}
                    </p>

                    <p>
                      {
                        employee.department
                      }
                    </p>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        handleView(
                          employee
                        )
                      }
                    >
                      View
                    </button>

                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        handleEdit(
                          employee
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(
                          employee.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          )}
        </>
      ) : (
        <div className="text-center mt-5">
          No Employees Found
        </div>
      )}

      <EmployeeModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedEmployee(
            null
          );
        }}
        onSave={handleSave}
        employee={
          selectedEmployee
        }
      />

      <EmployeeViewModal
        show={showView}
        onHide={() => {
          setShowView(false);
        }}
        employee={
          selectedEmployee
        }
      />
    </div>
  );
}

export default EmployeesPage;