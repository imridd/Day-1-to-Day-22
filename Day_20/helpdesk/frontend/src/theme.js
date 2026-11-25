import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#635bff', dark: '#4b43dc', light: '#eeedff', contrastText: '#fff' },
    secondary: { main: '#15b8a6' },
    background: { default: '#f6f7fb', paper: '#ffffff' },
    text: { primary: '#17182b', secondary: '#777b91' },
    divider: '#ececf3',
    success: { main: '#16a779' },
    warning: { main: '#e49a2f' },
    error: { main: '#e35d6a' },
    info: { main: '#4389e8' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, "Public Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.045em', fontSize: '2rem' },
    h5: { fontWeight: 800, letterSpacing: '-0.035em' },
    h6: { fontWeight: 750, letterSpacing: '-0.02em' },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    body2: { lineHeight: 1.55 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 11, padding: '9px 16px' } } },
    MuiCard: { defaultProps: { variant: 'outlined' }, styleOverrides: { root: { borderColor: '#ececf3', borderRadius: 18, boxShadow: '0 6px 24px rgba(28, 31, 66, 0.035)' } } },
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { borderColor: '#ececf3', borderRadius: 18 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12, background: '#fff' } } },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 800, color: '#777b91', backgroundColor: '#f8f8fc', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '.055em' }, root: { borderColor: '#f0f0f5' } } },
    MuiListItemButton: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export default theme;
