
export function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

export function getStatusLabel(status) {
  const labels = {
    OPEN: 'Open',
    REOPENED: 'Reopened',
    IN_PROGRESS: 'In progress',
    ON_HOLD: 'On hold',
    HOLD_REQUESTED: 'Hold requested',
    COMPLETED: 'Completed',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
  };

  return labels[status] || status || '-';
}

export function getTicketTotal(counts = []) {
  return counts.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );
}
