import { Box } from '@mui/material';

export default function AnimatedClouds() {
  return (
    <Box sx={{ position: 'relative', height: 60, overflow: 'hidden', my: 1 }}>
      <span className="cloud cloud-1" />
      <span className="cloud cloud-2" />
      <span className="cloud cloud-3" />
    </Box>
  );
}

