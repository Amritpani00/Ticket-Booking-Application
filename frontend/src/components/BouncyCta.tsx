import { Button } from '@mui/material';

export default function BouncyCta(props: { onClick?: () => void; children?: any; disabled?: boolean }) {
  return (
    <Button className="bouncy-cta" variant="contained" color="success" onClick={props.onClick} disabled={props.disabled}>
      {props.children || 'Book Now'}
    </Button>
  );
}

