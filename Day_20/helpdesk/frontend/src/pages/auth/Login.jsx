import { useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { useAuth } from '../../context/AuthContext';
import { apiError } from '../../api/axios';
import { loginSchema, validate } from '../../validation/schemas';
import { ROLE_HOME } from '../../utils/constants';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={ROLE_HOME[user.role]} replace />;
  const set = (key) => (event) => setValues((value) => ({ ...value, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = validate(loginSchema, values);
    setErrors(result.errors);
    if (!result.ok) return;
    setBusy(true); setServerError('');
    try { const current = await login(result.data.email, result.data.password); navigate(ROLE_HOME[current.role], { replace: true }); }
    catch (error) { setServerError(apiError(error)); }
    finally { setBusy(false); }
  };

  return (
    <Box className="auth-screen">
      <Box className="auth-art">
        <Box className="auth-art-mark"><AutoAwesomeRoundedIcon /> orbitdesk</Box>
        <Box><Typography className="eyebrow" sx={{ color: '#d6d3ff!important' }}>THE SUPPORT WORKSPACE</Typography><Typography component="h2">Good support starts with a better conversation.</Typography><Typography>Bring tickets, people and progress together in one calm workspace.</Typography></Box>
        <Typography variant="caption" sx={{ color: '#c7c4ff' }}>A little more clarity. A lot less chaos.</Typography>
      </Box>
      <Box className="auth-form-wrap"><Box className="auth-form">
        <Typography className="eyebrow">WELCOME BACK</Typography>
        <Typography component="h1">Sign in to your space.</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: 13 }}>Use your account to continue to OrbitDesk.</Typography>
        <form onSubmit={submit} noValidate>
          <Stack spacing={1.3}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField label="Email address" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} autoFocus fullWidth />
            <TextField label="Password" type="password" autoComplete="current-password" value={values.password} onChange={set('password')} error={!!errors.password} helperText={errors.password} fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>{busy ? 'Signing you in…' : 'Sign in'}</Button>
            <Typography className="auth-switch">New customer? <Link component={RouterLink} to="/signup">Create an account</Link></Typography>
          </Stack>
        </form>
      </Box></Box>
    </Box>
  );
}
