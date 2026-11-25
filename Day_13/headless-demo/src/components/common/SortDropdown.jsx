import Form from "react-bootstrap/Form";

function SortDropdown({

 value,

 onChange,

 options

}) {

 return (

 <Form.Select

 value={value}

 onChange={(e)=>
 onChange(
  e.target.value
 )}

 >

 {options.map(
 option => (

 <option

 key={option.value}

 value={option.value}

 >

 {option.label}

 </option>

 ))}

 </Form.Select>

 );

}

export default SortDropdown;
