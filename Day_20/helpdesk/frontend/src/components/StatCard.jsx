import { Box, Card, CardContent, Typography } from '@mui/material';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';

export default function StatCard({ title, value, color = 'primary.main' }) {
  return (
    <Card className="stat-card">
      <CardContent>
        <Box className="stat-card-top"><Box className="stat-card-accent" /><ConfirmationNumberRoundedIcon sx={{ color, opacity: 0.72, fontSize: 19 }} /></Box>
        <Typography className="stat-card-label">{title}</Typography>
        <Typography className="stat-card-value">{value ?? '—'}</Typography>
      </CardContent>
    </Card>
  );
}

export const statGridSx = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(auto-fit, minmax(170px, 1fr))' },
};
