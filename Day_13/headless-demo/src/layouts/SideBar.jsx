
import { NavLink } from "react-router";

import {
  FaHome,
  FaUsers,
  FaBox,
  FaBook,
  FaMoon,
  FaSun,
} from "react-icons/fa";

import { useTheme } from "../context/ThemeContext";

function Sidebar() {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  return (
    <div className="sidebar">
      <h3 className="logo">
        ManageHub
      </h3>

      <NavLink to="/">
        <FaHome />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/employees">
        <FaUsers />
        <span>Employees</span>
      </NavLink>

      <NavLink to="/products">
        <FaBox />
        <span>Products</span>
      </NavLink>

      <NavLink to="/courses">
        <FaBook />
        <span>Courses</span>
      </NavLink>

      <div className="mt-auto pt-4">
        <button
          className="btn btn-outline-light w-100"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <>
              <FaMoon className="me-2" />
              Dark Mode
            </>
          ) : (
            <>
              <FaSun className="me-2" />
              Light Mode
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
