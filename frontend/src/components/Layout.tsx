import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const theme = createTheme({
	palette: {
		mode: 'light',
		primary: { main: '#1976d2' },
		secondary: { main: '#9c27b0' },
		background: { default: '#fafafa' },
	},
	shape: { borderRadius: 10 },
});

export default function Layout() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<div className="container">
					<Navbar />
					<div>
						<Outlet />
					</div>
				</div>
			</LocalizationProvider>
		</ThemeProvider>
	);
}