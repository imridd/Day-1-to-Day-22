
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  eyebrow
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 3
      }}
    >
      <Box>
        {breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 1 }}
          >
            {breadcrumbs.map((item, index) => (
              <Link
                key={`${item.label}-${index}`}
                underline="hover"
                color={
                  index === breadcrumbs.length - 1
                    ? "text.primary"
                    : "text.secondary"
                }
                href={item.path || undefined}
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  pointerEvents: item.path ? "auto" : "none"
                }}
              >
                {item.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}

        {eyebrow && (
          <Typography
            variant="overline"
            color="primary.main"
            fontWeight={800}
            letterSpacing={1.5}
          >
            {eyebrow}
          </Typography>
        )}

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            fontFamily: "Space Grotesk",
            fontSize: { xs: 25, md: 32 }
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ mt: 0.7 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box sx={{ flexShrink: 0 }}>
          {action}
        </Box>
      )}
    </Box>
  );
}
