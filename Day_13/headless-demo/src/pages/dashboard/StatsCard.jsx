import Card from "react-bootstrap/Card";

function StatsCard({

 title,

 count,

 icon,

 color

}) {

 return (

 <Card
 className="stats-card"
 >

 <Card.Body>

 <div
 className="stats-top"
 >

 <div>

 <h5>{title}</h5>

 <h2>{count}</h2>

 </div>

 <div
 style={{
 color
 }}
 >
 {icon}
 </div>

 </div>

 </Card.Body>

 </Card>

 );

}

export default StatsCard;