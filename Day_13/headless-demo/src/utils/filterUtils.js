
export const searchFilter =
(
 items,
 key,
 term
)=>{

 return items.filter(
 item =>
 item[key]
 .toLowerCase()
 .includes(
  term.toLowerCase()
 )
 );

};