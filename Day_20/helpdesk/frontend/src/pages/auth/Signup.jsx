import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { signupSchema, validate } from '../../validation/schemas';

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [values, setValues] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setValues((value) => ({ ...value, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const result = validate(signupSchema, values);
    setErrors(result.errors);
    if (!result.ok) return;
    setBusy(true); setServerError('');
    try {
      const { confirmPassword, ...payload } = result.data;
      await api.post('/auth/register', payload);
      toast('Account created. Sign in to continue.'); navigate('/login');
    } catch (error) { setServerError(apiError(error)); }
    finally { setBusy(false); }
  };
  const field = (key, label, extra = {}) => <TextField label={label} value={values[key]} onChange={set(key)} error={!!errors[key]} helperText={errors[key]} fullWidth {...extra} />;

  return (
    <Box className="auth-screen">
      <Box className="auth-art">
        <Box className="auth-art-mark"><AutoAwesomeRoundedIcon /> orbitdesk</Box>
        <Box><Typography className="eyebrow" sx={{ color: '#d6d3ff!important' }}>A BETTER WAY TO GET HELP</Typography><Typography component="h2">Your request deserves to be heard.</Typography><Typography>Create an account, raise an issue and stay in the loop while your team works on it.</Typography></Box>
        <Typography variant="caption" sx={{ color: '#c7c4ff' }}>Clear updates, right when you need them.</Typography>
      </Box>
      <Box className="auth-form-wrap"><Box className="auth-form">
        <Typography className="eyebrow">GET STARTED</Typography>
        <Typography component="h1">Create your account.</Typography>
        <Typography color="text.secondary" sx={{ mb: 3, fontSize: 13 }}>Customer accounts are open. Agents and managers are invited by an admin.</Typography>
        <form onSubmit={submit} noValidate><Stack spacing={1.25}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          {field('name', 'Full name', { autoComplete: 'name', autoFocus: true })}
          {field('email', 'Email address', { type: 'email', autoComplete: 'email' })}
          {field('mobile', 'Mobile number (optional)', { autoComplete: 'tel' })}
          {field('password', 'Password', { type: 'password', autoComplete: 'new-password' })}
          {field('confirmPassword', 'Confirm password', { type: 'password', autoComplete: 'new-password' })}
          <Button type="submit" variant="contained" size="large" disabled={busy} fullWidth>{busy ? 'Creating account…' : 'Create account'}</Button>
          <Typography className="auth-switch">Already registered? <Link component={RouterLink} to="/login">Sign in</Link></Typography>
        </Stack></form>
      </Box></Box>
    </Box>
  );
}
