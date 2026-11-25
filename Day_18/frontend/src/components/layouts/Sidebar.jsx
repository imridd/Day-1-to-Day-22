
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";

import {
  SpaceDashboard,
  ConfirmationNumber,
  PeopleAlt,
  Groups,
  Business,
  MessageRounded,
  Settings,
  SupportAgent,
  ChevronLeft,
  ChevronRight,
  AutoAwesome
} from "@mui/icons-material";

const navigation = {
  Manager: [
    { label: "Overview", path: "/manager/dashboard", icon: <SpaceDashboard /> },
    { label: "All Tickets", path: "/manager/tickets", icon: <ConfirmationNumber /> },
    { label: "Agents", path: "/manager/agents", icon: <SupportAgent /> },
    { label: "Customers", path: "/manager/customers", icon: <PeopleAlt /> },
    { label: "Departments", path: "/manager/departments", icon: <Business /> },
    { label: "Team Chat", path: "/manager/chat", icon: <MessageRounded /> }
  ],
  Agent: [
    { label: "Overview", path: "/agent/dashboard", icon: <SpaceDashboard /> },
    { label: "My Tickets", path: "/agent/tickets", icon: <ConfirmationNumber /> },
    { label: "Team Chat", path: "/agent/chat", icon: <MessageRounded /> }
  ],
  Customer: [
    { label: "Overview", path: "/customer/dashboard", icon: <SpaceDashboard /> },
    { label: "My Requests", path: "/customer/requests", icon: <ConfirmationNumber /> },
    { label: "Create Ticket", path: "/customer/create-ticket", icon: <AutoAwesome /> },
    { label: "Support Chat", path: "/customer/chat", icon: <MessageRounded /> }
  ]
};

export default function Sidebar({
  role = "Customer",
  mobileOpen = false,
  onMobileClose,
  width = 258
}) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = navigation[role] || navigation.Customer;
  const sidebarWidth = collapsed ? 82 : width;

  const content = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.paper"
      }}
    >
      {/* BRAND */}
      <Box
        sx={{
          height: 78,
          display: "flex",
          alignItems: "center",
          px: collapsed ? 2 : 2.5,
          gap: 1.5
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: "linear-gradient(135deg,#9875ff,#f47bbd)"
          }}
        >
          <SupportAgent />
        </Box>

        {!collapsed && (
          <Box>
            <Typography fontWeight={800} fontSize={19}>
              helpdesk<span style={{ color: "#9875ff" }}>.</span>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SUPPORT, SIMPLIFIED
            </Typography>
          </Box>
        )}
      </Box>

      <Divider />

      {/* NAVIGATION */}
      <Box sx={{ px: 1.5, pt: 3, flex: 1 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={700}
            sx={{ px: 1.5, letterSpacing: 1.2 }}
          >
            WORKSPACE
          </Typography>
        )}

        <List sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.7 }}>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Tooltip
                key={item.path}
                title={collapsed ? item.label : ""}
                placement="right"
              >
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={onMobileClose}
                  sx={{
                    minHeight: 48,
                    borderRadius: "13px",
                    px: collapsed ? 2 : 1.5,
                    justifyContent: collapsed ? "center" : "flex-start",
                    color: active ? "primary.main" : "text.secondary",
                    backgroundColor: active
                      ? "action.selected"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "action.hover"
                    },
                    "&.active": {
                      color: "primary.main",
                      backgroundColor: "action.selected"
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 42,
                      color: "inherit"
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13.5,
                        fontWeight: active ? 700 : 500
                      }}
                    />
                  )}

                  {!collapsed && active && (
                    <Box
                      sx={{
                        width: 5,
                        height: 22,
                        borderRadius: 4,
                        backgroundColor: "primary.main"
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* SIDEBAR FOOTER */}
      <Box sx={{ p: 1.5 }}>
        <Divider sx={{ mb: 1.5 }} />

        {!collapsed && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: "15px",
              background: "linear-gradient(135deg,rgba(152,117,255,.15),rgba(244,123,189,.08))"
            }}
          >
            <AutoAwesome color="primary" fontSize="small" />
            <Typography fontWeight={700} fontSize={12} mt={0.5}>
              Stay in the loop ✨
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Keep your support workspace moving.
            </Typography>
          </Box>
        )}

        <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <IconButton
            onClick={() => setCollapsed((current) => !current)}
            sx={{
              mt: 1.5,
              width: "100%",
              borderRadius: "12px",
              color: "text.secondary"
            }}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
            {!collapsed && (
              <Typography variant="caption" ml={1}>
                Collapse menu
              </Typography>
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width,
            borderRight: "1px solid",
            borderColor: "divider"
          }
        }}
      >
        {content}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            transition: "width 200ms ease",
            overflowX: "hidden"
          }
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
