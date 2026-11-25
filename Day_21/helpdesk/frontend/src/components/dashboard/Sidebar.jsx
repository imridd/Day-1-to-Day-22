
'use client';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';

import { LogoutRounded } from '@mui/icons-material';

const DRAWER_WIDTH = 260;

export default function Sidebar({
  nav = [],
  tab,
  setTab,
  mobileOpen,
  setMobileOpen,
  user,
  onLogout
}) {
  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      <Box sx={{ px: 1, py: 2, mb: 2 }}>
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{ color: '#7158f5', letterSpacing: '-1px' }}
        >
          HelpDesk<span style={{ color: '#ff6b9d' }}>.</span>
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Workspace dashboard
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={800}
        sx={{ px: 1.5, mb: 1 }}
      >
        WORKSPACE
      </Typography>

      <List sx={{ p: 0, flexGrow: 1 }}>
        {nav.map((item) => {
          const active = tab === item.id;

          return (
            <ListItemButton
              key={item.id}
              selected={active}
              onClick={() => {
                setTab(item.id);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 3,
                mb: 0.7,
                px: 1.5,
                py: 1.2,
                color: active ? '#7158f5' : 'text.secondary',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(113,88,245,0.12)',
                  color: '#7158f5'
                },
                '&.Mui-selected:hover': {
                  backgroundColor: 'rgba(113,88,245,0.18)'
                },
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 800 : 600
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          mb: 1.5,
          borderRadius: 3,
          backgroundColor: 'action.hover'
        }}
      >
        <Avatar sx={{ bgcolor: '#7158f5', fontWeight: 800 }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography fontWeight={800} fontSize={13} noWrap>
            {user?.name || 'User'}
          </Typography>

          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.role || 'Member'}
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        color="error"
        variant="outlined"
        startIcon={<LogoutRounded />}
        onClick={() => {
          setMobileOpen(false);
          onLogout?.();
        }}
        sx={{
          justifyContent: 'flex-start',
          borderRadius: 3,
          py: 1.2,
          px: 2,
          fontWeight: 800
        }}
      >
        Logout
      </Button>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        {sidebarContent}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box'
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}
