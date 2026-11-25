export const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
export const CATEGORIES = ['Billing', 'Technical', 'Account', 'General', 'Other'];

export const STATUS_COLORS = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'default',
};

export const ROLE_HOME = {
  MANAGER: '/manager',
  AGENT: '/agent',
  CUSTOMER: '/customer',
};

export const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '-');

