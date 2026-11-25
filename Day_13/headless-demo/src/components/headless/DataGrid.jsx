import Table from "react-bootstrap/Table";
function DataGrid({columns,data,renderActions}) {
 return (

 <Table striped bordered hover responsive>
  <thead>
   <tr>

    {columns.map(
     column=>

      <th
       key={column.key}
      >
       {column.label}
      </th>
    )}

    <th>
      Actions
    </th>

   </tr>

  </thead>

  <tbody>

  {data.map((row)=>(

   <tr key={row.id}>

   {columns.map(
    column=>(
      <td
        key={column.key}
      >
       {row[column.key]}
      </td>
    )
   )}

   <td>
     {
      renderActions(row)
     }
   </td>

   </tr>

  ))}

  </tbody>

 </Table>

 );
}

export default DataGrid;
