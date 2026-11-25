import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";

export default function DashboardLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Topbar />

        <Box component="main">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}