
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "🏠",
  },
  {
    title: "Employees",
    path: "/employees",
    icon: "👥",
  },
  {
    title: "Products",
    path: "/products",
    icon: "🛍️",
  },
  {
    title: "Courses",
    path: "/courses",
    icon: "📚",
  },
];

function Sidebar() {
  return (
    <div className="sidebar p-3">
      <h6 className="text-secondary fw-bold small mb-4 px-2">
        WORKSPACE
      </h6>

      <div className="d-flex flex-column gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link d-flex align-items-center gap-3 ${
                isActive ? "active" : ""
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
