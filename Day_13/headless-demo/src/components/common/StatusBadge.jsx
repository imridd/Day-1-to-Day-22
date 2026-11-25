
import Badge from "react-bootstrap/Badge";

function StatusBadge({text,bg}){
 return (
 <Badge bg={bg}>
 {text}
 </Badge>

 );
}
export default StatusBadge;
