import axios from "axios";

const EMPLOYEE_URL =
  "http://localhost:3002/employees";

export const getEmployees = async () => {
  const response = await axios.get(
    EMPLOYEE_URL
  );

  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await axios.get(
    `${EMPLOYEE_URL}/${id}`
  );

  return response.data;
};

export const addEmployee = async (
  employee
) => {
  const employees = await getEmployees();

  const newId =
    employees.length > 0
      ? Math.max(
          ...employees.map((e) =>
            Number(e.id)
          )
        ) + 1
      : 1;

  const response = await axios.post(
    EMPLOYEE_URL,
    {
      ...employee,
      id: newId,
    }
  );

  return response.data;
};

export const updateEmployee = async (
  id,
  data
) => {
  const response =
    await axios.put(
      `${EMPLOYEE_URL}/${id}`,
      data
    );

  return response.data;
};

export const deleteEmployee = async (
  id
) => {
  await axios.delete(
    `${EMPLOYEE_URL}/${id}`
  );
};