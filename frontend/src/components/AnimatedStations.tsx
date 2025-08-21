import { Box } from '@mui/material';

export default function AnimatedStations() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
      <span className="station-marker" />
      <div className="station-line" />
      <span className="station-marker" />
      <div className="station-line" />
      <span className="station-marker" />
    </Box>
  );
}

