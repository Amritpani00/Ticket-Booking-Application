import { Box } from '@mui/material';

export default function AnimatedTrain() {
    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', height: 36 }}>
            <span className="train-anim" aria-hidden>🚆</span>
        </Box>
    );
}

