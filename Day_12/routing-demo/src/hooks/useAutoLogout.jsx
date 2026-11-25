import {
 useEffect
} from "react";

import useAuth
from "./useAuth";

function useAutoLogout(){

 const {
  logout
 } = useAuth();

 useEffect(()=>{

  const timer =
   setTimeout(()=>{

     logout();

     alert(
      "Session Expired"
     );

   },3600000);

   return ()=>clearTimeout(
    timer
   );

 },[]);

}

export default useAutoLogout;