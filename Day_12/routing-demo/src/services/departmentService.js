import axios from "axios";

const DEPARTMENT_URL =
  "http://localhost:3002/departments";

export const getDepartments =
  async () => {

    const response =
      await axios.get(
        DEPARTMENT_URL
      );

    return response.data;
  };

export const addDepartment =
  async (name) => {

    const departments =
      await getDepartments();

    const newId =
      departments.length > 0
        ? Math.max(
            ...departments.map(
              (department) =>
                department.id
            )
          ) + 1
        : 1;

    return axios.post(
      DEPARTMENT_URL,
      {
        id: newId,
        name,
      }
    );
  };