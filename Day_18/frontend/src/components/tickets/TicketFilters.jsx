
import { Stack, TextField, MenuItem, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function TicketFilters({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ mb: 2.5 }}
    >
      <TextField
        placeholder="Search tickets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px"
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            )
          }
        }}
      />

      <TextField
        select
        size="small"
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        sx={{ minWidth: { sm: 160 } }}
      >
        <MenuItem value="all">All statuses</MenuItem>
        <MenuItem value="open">Open</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="in_progress">In Progress</MenuItem>
        <MenuItem value="resolved">Resolved</MenuItem>
        <MenuItem value="closed">Closed</MenuItem>
      </TextField>

      <TextField
        select
        size="small"
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        sx={{ minWidth: { sm: 160 } }}
      >
        <MenuItem value="all">All priorities</MenuItem>
        <MenuItem value="urgent">Urgent</MenuItem>
        <MenuItem value="high">High</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
        <MenuItem value="low">Low</MenuItem>
      </TextField>
    </Stack>
  );
}
