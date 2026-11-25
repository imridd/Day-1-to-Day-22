import { Chip } from '@mui/material';

const COLORS = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };

export default function PriorityChip({ priority = 'MEDIUM', size = 'small' }) {
  const value = ['HIGH', 'MEDIUM', 'LOW'].includes(priority) ? priority : 'MEDIUM';
  return (
    <Chip
      size={size}
      color={COLORS[value]}
      variant={value === 'MEDIUM' ? 'outlined' : 'filled'}
      label={`${value} PRIORITY`}
      sx={{ fontWeight: 800, letterSpacing: 0.35 }}
    />
  );
}
