import { useDispatch, useSelector }
from "react-redux";

import {
 fetchEmployees,
 createEmployee,
 editEmployee,
 removeEmployee
}
from "../redux/employee/employeeThunk";

export const useEmployees = () => {

 const dispatch = useDispatch();

 const {
  employees,
  loading
 } = useSelector(
   state =>
   state.employees
 );
return {
  employees,
  loading,

  fetchEmployees: () =>
    dispatch(fetchEmployees()),

  createEmployee: (
    employee
  ) =>
    dispatch(
      createEmployee(
        employee
      )
    ),

  editEmployee: (
    id,
    employee
  ) =>
    dispatch(
      editEmployee({
        id,
        employee,
      })
    ),

  deleteEmployee: (
    id
  ) =>
    dispatch(
      removeEmployee(id)
    ),
};
};





