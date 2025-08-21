import { Box, Typography } from '@mui/material';

export default function GradientBanner() {
  return (
    <Box sx={{
      p: 2,
      borderRadius: 2,
      mb: 2,
      background: 'linear-gradient(100deg, #e0f2fe, #fef9c3, #fee2e2)',
      backgroundSize: '300% 300%',
      animation: 'gradient-flow 12s ease infinite',
    }}>
      <Typography variant="subtitle2" color="text.secondary">
        Smooth journeys start here – search, compare, and book confidently.
      </Typography>
    </Box>
  );
}

