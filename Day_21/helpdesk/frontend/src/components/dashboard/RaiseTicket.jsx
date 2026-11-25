
'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Divider
} from '@mui/material';

import {
  SendRounded,
  ConfirmationNumberRounded
} from '@mui/icons-material';

export default function RaiseTicket({
  form,
  setForm,
  onSubmit,
  loading = false
}) {
  const issueTitle = form?.title || '';
  const description = form?.description || '';

  const handleChange = (field, value) => {
    setForm(previous => ({
      ...previous,
      [field]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!issueTitle.trim() || !description.trim()) {
      return;
    }

    onSubmit();
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 850,
        mx: 'auto'
      }}
    >
      {/* HEADER */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        mb={3}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <ConfirmationNumberRounded />
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={900}>
            Raise an Issue 🚀
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Tell us what is happening. Our support team
            will help you resolve it.
          </Typography>
        </Box>
      </Stack>

      {/* FORM CARD */}

      <Card
        sx={{
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          boxShadow: '0 12px 35px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 4 }
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            <Stack spacing={3}>

              {/* ISSUE TITLE */}

              <Box>
                <Typography fontWeight={800} mb={1}>
                  Issue title
                </Typography>

                <TextField
                  fullWidth
                  name="title"
                  placeholder="Example: Unable to access my account"
                  value={issueTitle}
                  onChange={(event) =>
                    handleChange('title', event.target.value)
                  }
                  disabled={loading}
                  required
                  inputProps={{
                    maxLength: 150
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Briefly explain the problem.
                </Typography>
              </Box>

              {/* DESCRIPTION */}

              <Box>
                <Typography fontWeight={800} mb={1}>
                  Description
                </Typography>

                <TextField
                  fullWidth
                  name="description"
                  multiline
                  minRows={5}
                  maxRows={10}
                  placeholder="Explain what happened, when it started, and what you have already tried..."
                  value={description}
                  onChange={(event) =>
                    handleChange('description', event.target.value)
                  }
                  disabled={loading}
                  required
                  inputProps={{
                    maxLength: 2000
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {description.length}/2000 characters
                </Typography>
              </Box>

              <Divider />

              {/* SUBMIT */}

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: 'stretch',
                  sm: 'center'
                }}
                spacing={2}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Category and priority will be assigned by the manager.
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<SendRounded />}
                  disabled={
                    loading ||
                    !issueTitle.trim() ||
                    !description.trim()
                  }
                  sx={{
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    fontWeight: 900,
                    textTransform: 'none'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Issue'}
                </Button>
              </Stack>

            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
