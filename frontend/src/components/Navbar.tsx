import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { getRole, getToken } from '../auth';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { 
  Box, 
  IconButton, 
  Badge, 
  Menu, 
  MenuItem, 
  Avatar, 
  Chip, 
  Tooltip,
  Divider,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Train as TrainIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => getToken());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const role = getRole();

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'token') setToken(getToken());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="sticky" 
      elevation={2} 
      color="default"
      sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white'
      }}
    >
      <Toolbar sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* Logo and Brand */}
        <Box 
          component={RouterLink} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit',
            flexGrow: 1 
          }}
        >
          <TrainIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight={700}>
            IRCTC
          </Typography>
          <Typography variant="subtitle2" sx={{ ml: 1, opacity: 0.8 }}>
            Train Booking
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            startIcon={<HomeIcon />}
            sx={{ 
              backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Home
          </Button>
          
          {token && (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/dashboard"
                startIcon={<DashboardIcon />}
                sx={{ 
                  backgroundColor: isActive('/dashboard') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Dashboard
              </Button>
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/history"
                startIcon={<HistoryIcon />}
                sx={{ 
                  backgroundColor: isActive('/history') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                History
              </Button>
              
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/fare"
                startIcon={<ReceiptIcon />}
                sx={{ 
                  backgroundColor: isActive('/fare') ? 'rgba(255,255,255,0.1)' : 'transparent',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Fare
              </Button>
            </>
          )}
        </Box>

        {/* Right Side Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {token ? (
            <>
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit" 
                  onClick={handleNotificationsOpen}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Favorites */}
              <Tooltip title="Favorites">
                <IconButton 
                  color="inherit" 
                  component={RouterLink} 
                  to="/favorites"
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  <Badge badgeContent={5} color="error">
                    <FavoriteIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Profile Menu */}
              <Tooltip title="Profile">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <PersonIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* Profile Menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem 
                  component={RouterLink} 
                  to="/profile" 
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                
                {role === 'ADMIN' && (
                  <MenuItem 
                    component={RouterLink} 
                    to="/admin" 
                    onClick={handleProfileMenuClose}
                  >
                    <ListItemIcon>
                      <AdminIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Admin Panel</ListItemText>
                  </MenuItem>
                )}
                
                <Divider />
                
                <MenuItem 
                  component={RouterLink} 
                  to="/logout" 
                  onClick={handleProfileMenuClose}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>

              {/* Notifications Menu */}
              <Menu
                anchorEl={notificationsAnchor}
                open={Boolean(notificationsAnchor)}
                onClose={handleNotificationsClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 300,
                    maxHeight: 400,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem>
                  <ListItemText 
                    primary="Train 12951 delayed by 15 minutes"
                    secondary="2 minutes ago"
                  />
                </MenuItem>
                <MenuItem>
                  <ListItemText 
                    primary="Your booking for tomorrow is confirmed"
                    secondary="1 hour ago"
                  />
                </MenuItem>
                <MenuItem>
                  <ListItemText 
                    primary="New trains added to Delhi-Mumbai route"
                    secondary="3 hours ago"
                  />
                </MenuItem>
                <Divider />
                <MenuItem sx={{ justifyContent: 'center' }}>
                  <Button size="small" color="primary">
                    View All Notifications
                  </Button>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

