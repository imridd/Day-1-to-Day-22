
function DataList({data,renderItem}) {
 return (
 <div>
 {data.map((item)=>(
  <div key={item.id}>
   {renderItem(item)}
  </div>
 ))}
 </div>
 );
}
export default DataList;