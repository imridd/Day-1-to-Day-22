const API = "http://localhost:3000/employees";

export const getEmployees = async () => {
  const res = await fetch(API);
  return await res.json();
};

export const addEmployee = async (employee) => {
  await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employee)
  });
};

export const updateEmployee = async (id, employee) => {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employee)
  });
};

export const deleteEmployeeById = async (id) => {
  await fetch(`${API}/${id}`, {
    method: "DELETE"
  });
};