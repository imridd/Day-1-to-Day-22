
'use client';

import { useState } from 'react';

import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';

import {
  MenuRounded,
  NotificationsRounded,
  DarkModeRounded,
  LightModeRounded,
  GroupsRounded,
  CircleRounded
} from '@mui/icons-material';

export default function TopNavbar({
  title = 'Dashboard',
  user,
  mode = 'light',
  onToggleTheme,
  onMenuClick,
  onNotificationClick,
  unreadCount = 0,
  agents = []
}) {
  const [agentAnchor, setAgentAnchor] = useState(null);

  const isManager = user?.role === 'MANAGER';

  const onlineAgents = agents.filter(
    agent => Number(agent.is_online) === 1 &&
             Number(agent.is_active) === 1
  );

  const offlineAgents = agents.filter(
    agent => Number(agent.is_online) !== 1 ||
             Number(agent.is_active) !== 1
  );

  const closeAgentsMenu = () => {
    setAgentAnchor(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="inherit"
      sx={{
        ml: { xs: 0, md: '260px' },
        width: {
          xs: '100%',
          md: 'calc(100% - 260px)'
        },
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        zIndex: 1100
      }}
    >
      <Toolbar
        sx={{
          minHeight: '76px !important',
          px: { xs: 2, md: 3 },
          gap: { xs: 1, sm: 2 }
        }}
      >
        {/* MOBILE MENU */}

        <IconButton
          onClick={onMenuClick}
          sx={{
            display: { xs: 'inline-flex', md: 'none' }
          }}
        >
          <MenuRounded />
        </IconButton>

        {/* TITLE */}

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={850}
            noWrap
            sx={{ letterSpacing: '-0.5px' }}
          >
            {title}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Welcome back, {user?.name || 'User'} 👋
          </Typography>
        </Box>

        {/* MANAGER AGENT STATUS */}

        {isManager && (
          <>
            <Button
              onClick={(event) =>
                setAgentAnchor(event.currentTarget)
              }
              startIcon={<GroupsRounded />}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 3,
                px: { xs: 1, sm: 2 },
                minWidth: 0,
                backgroundColor: 'action.hover',
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: { xs: 'none', sm: 'inline' }
                  }}
                >
                  Agents
                </Box>

                <Badge
                  badgeContent={onlineAgents.length}
                  color="success"
                  max={99}
                />
              </Box>
            </Button>

            <Menu
              anchorEl={agentAnchor}
              open={Boolean(agentAnchor)}
              onClose={closeAgentsMenu}
              PaperProps={{
                sx: {
                  width: 320,
                  maxWidth: '90vw',
                  maxHeight: 440,
                  mt: 1,
                  borderRadius: 3,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.14)'
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography fontWeight={850}>
                  Agent Activity
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 1
                  }}
                >
                  <Chip
                    size="small"
                    color="success"
                    label={`${onlineAgents.length} Online`}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${offlineAgents.length} Offline`}
                  />
                </Box>
              </Box>

              <Divider />

              <Box sx={{ px: 2, py: 1 }}>
                <Typography
                  variant="overline"
                  color="success.main"
                  fontWeight={800}
                >
                  ONLINE
                </Typography>
              </Box>

              {onlineAgents.length > 0 ? (
                onlineAgents.map(agent => (
                  <MenuItem
                    key={agent.id}
                    onClick={closeAgentsMenu}
                    sx={{ py: 1 }}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="success"
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: '#7158f5',
                            fontWeight: 800
                          }}
                        >
                          {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={agent.name}
                      secondary={agent.email}
                      primaryTypographyProps={{
                        fontWeight: 750,
                        fontSize: 14
                      }}
                      secondaryTypographyProps={{
                        fontSize: 12
                      }}
                    />

                    <CircleRounded
                      sx={{
                        color: 'success.main',
                        fontSize: 11
                      }}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  No agents online
                </MenuItem>
              )}

              <Divider />

              <Box sx={{ px: 2, py: 1 }}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={800}
                >
                  OFFLINE
                </Typography>
              </Box>

              {offlineAgents.length > 0 ? (
                offlineAgents.map(agent => (
                  <MenuItem
                    key={agent.id}
                    onClick={closeAgentsMenu}
                    sx={{ py: 1 }}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="error"
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: 'action.selected',
                            color: 'text.secondary',
                            fontWeight: 800
                          }}
                        >
                          {agent.name?.charAt(0)?.toUpperCase() || 'A'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>

                    <ListItemText
                      primary={agent.name}
                      secondary={agent.email}
                      primaryTypographyProps={{
                        fontWeight: 650,
                        fontSize: 14
                      }}
                      secondaryTypographyProps={{
                        fontSize: 12
                      }}
                    />

                    <CircleRounded
                      sx={{
                        color: 'error.main',
                        fontSize: 11
                      }}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  No agents offline
                </MenuItem>
              )}
            </Menu>
          </>
        )}

        {/* THEME TOGGLE */}

        <Tooltip
          title={mode === 'light' ? 'Dark mode' : 'Light mode'}
        >
          <IconButton
            onClick={onToggleTheme}
            sx={{
              width: 42,
              height: 42,
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected'
              }
            }}
          >
            {mode === 'light'
              ? <DarkModeRounded />
              : <LightModeRounded />}
          </IconButton>
        </Tooltip>

        {/* NOTIFICATIONS */}

        <Tooltip title="Notifications">
          <IconButton
            onClick={onNotificationClick}
            sx={{
              width: 42,
              height: 42,
              backgroundColor: 'action.hover',
              '&:hover': {
                backgroundColor: 'action.selected'
              }
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
            >
              <NotificationsRounded />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* PROFILE */}

        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: '#7158f5',
            fontWeight: 800
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}
