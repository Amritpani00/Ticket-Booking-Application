import { Stack } from '@mui/material';

export default function PulseIcons() {
  return (
    <Stack direction="row" spacing={1} sx={{ my: 1 }}>
      <span className="pulse-icon">🚉</span>
      <span className="pulse-icon">🧭</span>
      <span className="pulse-icon">🧳</span>
      <span className="pulse-icon">🎫</span>
    </Stack>
  );
}

