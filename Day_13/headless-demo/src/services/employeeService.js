import axiosClient from "../api/axiosClient";

const EMPLOYEE_URL = "/employees";

export const getEmployees = async () => {
  const res = await axiosClient.get(EMPLOYEE_URL);
  return res.data;
};

export const addEmployee = async (employee) => {
  const res = await axiosClient.post(
    EMPLOYEE_URL,
    employee
  );

  return res.data;
};

export const updateEmployee = async (
  id,
  employee
) => {
  const res = await axiosClient.put(
    `${EMPLOYEE_URL}/${id}`,
    employee
  );

  return res.data;
};

export const deleteEmployee = async (id) => {
  await axiosClient.delete(
    `${EMPLOYEE_URL}/${id}`
  );

  return id;
};
