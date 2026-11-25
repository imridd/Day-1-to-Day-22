
import Button
from "react-bootstrap/Button";

function PageHeader({

 title,

 buttonText,

 onAdd

}) {

 return (

 <div
 className=
 "page-header"
 >

 <h2>{title}</h2>

 <Button
 className=
 "btn-gradient"
 onClick={onAdd}
 >
 {buttonText}
 </Button>

 </div>

 );

}

export default PageHeader;
