
'use client';

import {
  Card,
  CardContent,
  Box,
  Typography
} from '@mui/material';

import ConfirmationNumberRounded from '@mui/icons-material/ConfirmationNumberRounded';

export default function Stat({
  label,
  value,
  icon,
  color = 'primary',
  subtitle
}) {
  const colorMap = {
    primary: '#7158f5',
    secondary: '#ff6b9d',
    success: '#16a36a',
    warning: '#ed9b25',
    info: '#2196f3'
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        transition: '0.25s ease',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 16px 35px rgba(30,20,80,0.10)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={700}
          >
            {label}
          </Typography>

          <Box
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selectedColor,
              backgroundColor: `${selectedColor}18`,
              '& svg': {
                fontSize: 25
              }
            }}
          >
            {icon || <ConfirmationNumberRounded />}
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight={850}
          sx={{ letterSpacing: '-1px' }}
        >
          {value ?? 0}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
