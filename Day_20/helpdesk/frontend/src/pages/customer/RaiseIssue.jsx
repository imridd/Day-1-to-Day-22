import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material';
import api, { apiError } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { issueSchema, validate } from '../../validation/schemas';
import { CATEGORIES } from '../../utils/constants';

export default function RaiseIssue() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: user.name, email: user.email, mobile: '', subject: '', category: '', description: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const v = validate(issueSchema, values);
    setErrors(v.errors);
    if (!v.ok) return;
    setBusy(true);
    setServerError('');
    try {
      await api.post('/issues', v.data);
      toast('Issue submitted. A manager will review it shortly.');
      navigate('/customer/tickets');
    } catch (err) {
      setServerError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (k, label, extra = {}) => (
    <TextField label={label} value={values[k]} onChange={set(k)} error={!!errors[k]} helperText={errors[k]} {...extra} />
  );

  return (
    <Box sx={{ maxWidth: 680 }}>
      <Typography variant="h5" gutterBottom>Raise an issue</Typography>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={submit} noValidate>
            <Stack spacing={2}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                {field('name', 'Name')}
                {field('email', 'Email', { type: 'email' })}
                {field('mobile', 'Mobile', { autoComplete: 'tel' })}
                {field('category', 'Category', {
                  select: true,
                  children: CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>),
                })}
              </Box>
              {field('subject', 'Subject')}
              {field('description', 'What happened?', { multiline: true, minRows: 5 })}
              <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? 'Submitting...' : 'Submit issue'}</Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
