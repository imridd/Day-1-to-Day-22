
import {
  IconButton,
  Badge,
  Tooltip
} from "@mui/material";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

export default function NotificationBell({
  count = 0,
  onClick
}) {
  return (
    <Tooltip title="Notifications">
      <IconButton
        onClick={onClick}
        aria-label="Open notifications"
        sx={{
          width: 42,
          height: 42,
          borderRadius: "13px",
          backgroundColor: "action.hover",
          "&:hover": {
            backgroundColor: "action.selected"
          }
        }}
      >
        <Badge
          badgeContent={count}
          color="error"
          max={99}
          overlap="circular"
        >
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}
