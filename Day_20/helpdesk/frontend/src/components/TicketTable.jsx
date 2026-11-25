import {
  Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import StatusChip from './StatusChip';
import PriorityChip from './PriorityChip';
import { fmtDate } from '../utils/constants';

/** Generic ticket list. Optional columns appear only when the data/props call for them. */
export default function TicketTable({ rows, onView, renderAction, showCustomer = false, showAgent = true, showPriority = true, empty = 'No tickets yet.' }) {
  const columnCount = 4 + Number(showCustomer) + Number(showAgent) + Number(showPriority) + Number(Boolean(onView || renderAction));

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ticket</TableCell>
            <TableCell>Subject</TableCell>
            {showCustomer && <TableCell>Customer</TableCell>}
            <TableCell>Status</TableCell>
            {showPriority && <TableCell>Priority</TableCell>}
            {showAgent && <TableCell>Agent</TableCell>}
            <TableCell>Created</TableCell>
            {(onView || renderAction) && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.ticket_id} hover>
              <TableCell>#{t.ticket_id}</TableCell>
              <TableCell sx={{ maxWidth: 280 }}><Typography variant="body2" noWrap>{t.subject}</Typography></TableCell>
              {showCustomer && <TableCell>{t.customer_name}</TableCell>}
              <TableCell><StatusChip status={t.status} /></TableCell>
              {showPriority && <TableCell><PriorityChip priority={t.priority} /></TableCell>}
              {showAgent && <TableCell>{t.agent_name || <Typography variant="body2" color="text.secondary">Unassigned</Typography>}</TableCell>}
              <TableCell>{fmtDate(t.created_at)}</TableCell>
              {(onView || renderAction) && (
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {renderAction?.(t)}
                  {onView && <Button size="small" onClick={() => onView(t.ticket_id)}>View</Button>}
                </TableCell>
              )}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columnCount} align="center" sx={{ py: 4, color: 'text.secondary' }}>{empty}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
