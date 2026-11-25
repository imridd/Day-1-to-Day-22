import React, { Component } from "react";

class ProductTable extends Component {
  state = {
    employees: [
      { id: 1, pName: "Pen", price: 10, qty: 5 },
      { id: 2, pName: "Book", price: 50, qty: 2 },
      { id: 3, pName: "Scale", price: 20, qty: 0 }
    ]
  };
  render() {
    const { employees } = this.state;
    return employees.length ? (
      <table border="1">
        <thead>
          <tr>
            {[...Object.keys(employees[0]), "TotalPrice", "StockStatus"]
              .map(head => (
                <th key={head}>
                  {head.toUpperCase()}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id}>
              {Object.values(employee).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
              <td>{employee.price * employee.qty}</td>
              <td>
                {employee.qty > 0
                  ? "In Stock"
                  : "Out Of Stock"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <h2>No Data Found</h2>
    );
  }
}

export default ProductTable;
