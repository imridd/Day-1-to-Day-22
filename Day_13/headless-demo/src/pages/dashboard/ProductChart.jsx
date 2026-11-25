import {

 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer

}
from "recharts";

function ProductChart({
 data
}){

 return (

 <ResponsiveContainer
 width="100%"
 height={350}
 >

 <BarChart
 data={data}
 >

 <XAxis
 dataKey="name"
 />

 <YAxis />

 <Tooltip />

 <Bar
 dataKey="stock"
 fill="#6366f1"
 />

 </BarChart>

 </ResponsiveContainer>

 );
}

export default
ProductChart;
