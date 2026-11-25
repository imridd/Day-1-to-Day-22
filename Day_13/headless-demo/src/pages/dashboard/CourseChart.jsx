
import {

 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer

}
from "recharts";

function CourseChart({

 data

}){

 return (

 <ResponsiveContainer
 width="100%"
 height={350}
 >

 <AreaChart
 data={data}
 >

 <XAxis
 dataKey="name"
 />

 <YAxis />

 <Tooltip />

 <Area

 type="monotone"

 dataKey="students"

 stroke="#8b5cf6"

 fill="#8b5cf6"

 />

 </AreaChart>

 </ResponsiveContainer>

 );

}

export default
CourseChart;
