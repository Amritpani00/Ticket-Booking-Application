import { Button } from '@mui/material';

export default function BouncyCta(props: { onClick?: () => void; children?: any }) {
  return (
    <Button className="bouncy-cta" variant="contained" color="success" onClick={props.onClick}>
      {props.children || 'Book Now'}
    </Button>
  );
}

