import Spinner
from "react-bootstrap/Spinner";

function LoadingSpinner(){

 return (

 <div
 className=
 "loading-wrapper"
 >

 <Spinner
 animation="border"
 variant="primary"
 />

 </div>

 );

}

export default LoadingSpinner;