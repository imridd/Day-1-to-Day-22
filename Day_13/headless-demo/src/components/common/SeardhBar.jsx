import Form from "react-bootstrap/Form";
import { FaSearch } from "react-icons/fa";

function SearchBar({
 value,
 onChange,
 placeholder
}) {

 return (

 <div className="search-wrapper">

  <FaSearch className="search-icon" />

  <Form.Control
   value={value}
   placeholder={placeholder}
   onChange={(e)=>
    onChange(e.target.value)
   }
  />

 </div>

 );

}

export default SearchBar;
