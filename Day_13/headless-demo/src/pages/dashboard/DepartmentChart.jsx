import {

 PieChart,
 Pie,
 Cell,
 Tooltip,
 ResponsiveContainer

}
from "recharts";

const COLORS = [
 "#6366f1",
 "#8b5cf6",
 "#06b6d4",
 "#10b981"
];

function DepartmentChart({

 data

}) {

 return (

 <ResponsiveContainer
 width="100%"
 height={350}
 >

 <PieChart>

 <Pie

 data={data}

 dataKey="count"

 outerRadius={120}

 >

 {data.map(
 (item,index)=>(

 <Cell

 key={index}

 fill={
 COLORS[
 index %
 COLORS.length
 ]
 }

 />

 ))}

 </Pie>

 <Tooltip />

 </PieChart>

 </ResponsiveContainer>

 );

}

export default
DepartmentChart;
