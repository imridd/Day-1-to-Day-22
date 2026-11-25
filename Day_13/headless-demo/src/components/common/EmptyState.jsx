
import { FaBoxOpen }from "react-icons/fa";

function EmptyState({title}) {
 return (
 <div className="empty-state">
 <FaBoxOpen
 size={50}
 />

 <h4>
  No {title} Found
 </h4>

 </div>

 );

}

export default EmptyState;
