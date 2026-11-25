import { MenuItem, TextField } from '@mui/material';
import { STATUSES } from '../utils/constants';

export default function StatusFilter({ value, onChange }) {
  return (
    <TextField select size="small" label="Status" value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 160 }}>
      <MenuItem value="">All statuses</MenuItem>
      {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
    </TextField>
  );
}
