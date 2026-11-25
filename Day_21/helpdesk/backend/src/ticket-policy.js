export const transitions = Object.freeze({
  CUSTOMER: {
    RESOLVED: ['REOPENED'],
    CLOSED: ['REOPENED']
  },

  AGENT: {
    IN_PROGRESS: ['COMPLETED', 'HOLD_REQUESTED']
  },

  MANAGER: {
    OPEN: ['IN_PROGRESS'],
    REOPENED: ['IN_PROGRESS'],
    HOLD_REQUESTED: ['ON_HOLD'],
    ON_HOLD: ['OPEN'],
    COMPLETED: ['RESOLVED'],
    RESOLVED: ['CLOSED']
  }
});

export function canTransition(role, current, next) {
  return (transitions[role]?.[current] || []).includes(next);
}

export function chatIsWritable(status) {
  return !['COMPLETED', 'RESOLVED', 'CLOSED'].includes(status);
}