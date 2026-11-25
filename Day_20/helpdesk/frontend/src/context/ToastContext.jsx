import { createContext, useCallback, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ToastContext = createContext(() => {});

export function ToastProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', severity: 'success' });
  const toast = useCallback((message, severity = 'success') => setState({ open: true, message, severity }), []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={() => setState((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={state.severity} variant="filled" onClose={() => setState((s) => ({ ...s, open: false }))}>
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
