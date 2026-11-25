import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useAuth } from '../context/AuthContext';

const WIDTH = 258;
const NAV = {
  MANAGER: [
    { label: 'Overview', to: '/manager', icon: <SpaceDashboardRoundedIcon />, end: true },
    { label: 'All tickets', to: '/manager/tickets', icon: <ConfirmationNumberRoundedIcon /> },
    { label: 'Team members', to: '/manager/agents', icon: <Groups2RoundedIcon /> },
    { label: 'Conversations', to: '/manager/chat', icon: <ForumRoundedIcon /> },
  ],
  AGENT: [
    { label: 'My workspace', to: '/agent', icon: <SpaceDashboardRoundedIcon />, end: true },
    { label: 'My tickets', to: '/agent/tickets', icon: <ConfirmationNumberRoundedIcon /> },
    { label: 'Conversations', to: '/agent/chat', icon: <ForumRoundedIcon /> },
  ],
  CUSTOMER: [
    { label: 'Overview', to: '/customer', icon: <SpaceDashboardRoundedIcon />, end: true },
    { label: 'Raise a request', to: '/customer/raise-issue', icon: <AddCircleOutlineRoundedIcon /> },
    { label: 'My tickets', to: '/customer/tickets', icon: <ConfirmationNumberRoundedIcon /> },
    { label: 'Conversations', to: '/customer/chat', icon: <ForumRoundedIcon /> },
  ],
};

const roleLabel = { MANAGER: 'Workspace admin', AGENT: 'Support specialist', CUSTOMER: 'Customer portal' };

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const current = NAV[user.role].find((item) => item.end ? location.pathname === item.to : location.pathname.startsWith(item.to));

  const sidebar = (
    <Box className="sidebar-inner">
      <Box className="brand-lockup">
        <Box className="brand-mark"><AutoAwesomeRoundedIcon /></Box>
        <Box><Typography className="brand-name">orbit<span>desk</span></Typography><Typography className="brand-caption">SUPPORT, IN SYNC</Typography></Box>
      </Box>
      <Box className="workspace-label">WORKSPACE</Box>
      <List className="side-nav" disablePadding>
        {NAV[user.role].map((item) => (
          <ListItemButton key={item.to} component={NavLink} to={item.to} end={item.end} onClick={() => setOpen(false)} className="side-nav-item">
            <ListItemIcon>{item.icon}</ListItemIcon><ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="sidebar-spacer" />
      <Box className="sidebar-tip"><Box className="tip-spark">✦</Box><Typography fontWeight={800} variant="body2">A smoother support day.</Typography><Typography variant="caption">Every request has a place. Every conversation has context.</Typography></Box>
      <Divider />
      <Box className="profile-row">
        <Avatar className="profile-avatar">{user.name?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={750} variant="body2" noWrap>{user.name}</Typography><Typography variant="caption" color="text.secondary">{roleLabel[user.role]}</Typography></Box>
        <IconButton size="small" aria-label="Sign out" onClick={() => { logout(); navigate('/login'); }}><LogoutRoundedIcon fontSize="small" /></IconButton>
      </Box>
    </Box>
  );

  return (
    <Box className="app-frame">
      <AppBar position="fixed" className="topbar" elevation={0} sx={{ ml: { md: `${WIDTH}px` }, width: { md: `calc(100% - ${WIDTH}px)` } }}>
        <Toolbar className="topbar-toolbar">
          {!desktop && <IconButton onClick={() => setOpen(true)} sx={{ mr: 1 }} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>}
          <Box sx={{ flex: 1 }}><Typography className="topbar-context">{roleLabel[user.role]}</Typography><Typography className="topbar-page">{current?.label || 'Workspace'}</Typography></Box>
          <Box className="topbar-status"><Box className="status-dot" /> All systems operational</Box>
          <Button className="topbar-logout" startIcon={<LogoutRoundedIcon />} onClick={() => { logout(); navigate('/login'); }}>Sign out</Button>
        </Toolbar>
      </AppBar>
      <Drawer variant={desktop ? 'permanent' : 'temporary'} open={desktop || open} onClose={() => setOpen(false)} className="app-drawer" sx={{ width: WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: WIDTH, boxSizing: 'border-box' } }}>{sidebar}</Drawer>
      <Box component="main" className="main-content" sx={{ ml: { md: `${WIDTH}px` } }}><Toolbar className="main-toolbar-spacer" />{children}</Box>
    </Box>
  );
}
