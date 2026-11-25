
import { useState } from "react";

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme
} from "@mui/material";

import {
  Menu as MenuIcon,
  NotificationsNone,
  DarkMode,
  LightMode,
  KeyboardArrowDown,
  Logout,
  Person,
  SettingsOutlined
} from "@mui/icons-material";

import { useThemeMode } from "../../app/ThemeProvider";

export default function Topbar({
  user,
  onMenuClick,
  onLogout,
  onNotificationsClick,
  notificationCount = 0
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { mode, toggleTheme } = useThemeMode();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const name =
    user?.fullName ||
    user?.name ||
    user?.email ||
    "User";

  const role = user?.role || "Member";

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        backdropFilter: "blur(16px)"
      }}
    >
      <Toolbar
        sx={{
          minHeight: "76px !important",
          px: { xs: 2, md: 3 },
          justifyContent: "space-between"
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          {isMobile && (
            <IconButton onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}

          <Box>
            <Typography
              fontWeight={800}
              fontSize={{ xs: 15, md: 17 }}
              color="text.primary"
            >
              Hey, {name.split(" ")[0]} 👋
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Here's what's happening in your workspace.
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={{ xs: 0.5, md: 1.5 }}>
          <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                backgroundColor: "action.hover"
              }}
            >
              {mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton
              onClick={onNotificationsClick}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px"
              }}
            >
              <Badge
                badgeContent={notificationCount}
                color="error"
                max={99}
              >
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, my: 1.5 }}
          />

          <Box
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              borderRadius: "14px",
              p: 0.5,
              "&:hover": {
                backgroundColor: "action.hover"
              }
            }}
          >
            <Avatar
              sx={{
                width: 38,
                height: 38,
                fontSize: 13,
                fontWeight: 800,
                background: "linear-gradient(135deg,#9875ff,#f47bbd)"
              }}
            >
              {initials || "U"}
            </Avatar>

            {!isMobile && (
              <Box>
                <Typography fontWeight={700} fontSize={12.5}>
                  {name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {role}
                </Typography>
              </Box>
            )}

            <KeyboardArrowDown fontSize="small" />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{
              sx: {
                minWidth: 190,
                mt: 1,
                borderRadius: "15px"
              }
            }}
          >
            <MenuItem disabled>
              <Person fontSize="small" sx={{ mr: 1 }} />
              My Profile
            </MenuItem>

            <MenuItem disabled>
              <SettingsOutlined fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                onLogout?.();
              }}
              sx={{ color: "error.main" }}
            >
              <Logout fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
