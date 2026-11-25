
import { Card, CardContent, Box, Typography } from "@mui/material";

export default function AppCard({
  title,
  subtitle,
  action,
  children,
  icon,
  sx = {},
  contentSx = {},
  ...props
}) {
  return (
    <Card
      className="hover-lift"
      sx={{
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px",
        overflow: "hidden",
        ...sx
      }}
      {...props}
    >
      {(title || subtitle || action || icon) && (
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            {icon && (
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "13px",
                  color: "primary.main",
                  backgroundColor: "action.hover"
                }}
              >
                {icon}
              </Box>
            )}

            <Box>
              {title && (
                <Typography fontWeight={700} variant="h6">
                  {title}
                </Typography>
              )}

              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>

          {action}
        </Box>
      )}

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 }, ...contentSx }}>
        {children}
      </CardContent>
    </Card>
  );
}
