import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../utils/constants';

export default function StatusChip({ status }) {
  return <Chip size="small" color={STATUS_COLORS[status] || 'default'} label={String(status).replace('_', ' ')} />;
}
