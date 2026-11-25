
function RecentActivity({
  employees,
  products,
  courses,
}) {
  return (
    <div className="glass-card p-4">
      <h3 className="mb-4">
        Recent Activity
      </h3>

      <div className="row">

        <div className="col-md-4">
          <h5 className="text-primary">
            Employees
          </h5>

          <ul className="list-group">
            {employees
              .slice(-5)
              .reverse()
              .map((emp) => (
                <li
                  key={emp.id}
                  className="list-group-item"
                >
                  👤 {emp.name}
                </li>
              ))}
          </ul>
        </div>

        <div className="col-md-4">
          <h5 className="text-success">
            Products
          </h5>

          <ul className="list-group">
            {products
              .slice(-5)
              .reverse()
              .map((product) => (
                <li
                  key={product.id}
                  className="list-group-item"
                >
                  📦 {product.name}
                </li>
              ))}
          </ul>
        </div>

        <div className="col-md-4">
          <h5 className="text-info">
            Courses
          </h5>

          <ul className="list-group">
            {courses
              .slice(-5)
              .reverse()
              .map((course) => (
                <li
                  key={course.id}
                  className="list-group-item"
                >
                  📚 {course.name}
                </li>
              ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default RecentActivity;