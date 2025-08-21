import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Train as TrainIcon,
  Search as SearchIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Home as HomeIcon,
  BookOnline as BookOnlineIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProfessionalHeaderProps {
  onSearchClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export default function ProfessionalHeader({ 
  onSearchClick, 
  onThemeToggle, 
  isDarkMode = false 
}: ProfessionalHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Search Trains', icon: <SearchIcon />, path: '/search', action: onSearchClick },
    { text: 'Book Tickets', icon: <BookOnlineIcon />, path: '/booking' },
    { text: 'Booking History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
    { text: 'About Us', icon: <InfoIcon />, path: '/about' }
  ];

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <TrainIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" fontWeight={700} color="primary.main">
            IRCTC Pro
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Professional Train Booking System
        </Typography>
      </Box>
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            button 
            onClick={() => item.action ? item.action() : handleNavigation(item.path)}
            sx={{ 
              borderRadius: 1, 
              mx: 1, 
              mb: 0.5,
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ fontWeight: 500 }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label="PNR Status" 
            size="small" 
            variant="outlined" 
            onClick={() => handleNavigation('/pnr-status')}
          />
          <Chip 
            label="Live Status" 
            size="small" 
            variant="outlined" 
            onClick={() => handleNavigation('/live-status')}
          />
          <Chip 
            label="Fare Enquiry" 
            size="small" 
            variant="outlined" 
            onClick={() => handleNavigation('/fare-enquiry')}
          />
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ px: { xs: 0 } }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.05)' },
                  transition: 'transform 0.2s ease-in-out'
                }}
                onClick={() => handleNavigation('/')}
              >
                <Box sx={{ 
                  position: 'relative',
                  mr: 2
                }}>
                  <Avatar 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'primary.main',
                      boxShadow: 2
                    }}
                  >
                    <TrainIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 16,
                    height: 16,
                    bgcolor: 'success.main',
                    borderRadius: '50%',
                    border: 2,
                    borderColor: 'background.paper'
                  }} />
                </Box>
                <Box>
                  <Typography 
                    variant="h5" 
                    fontWeight={800} 
                    color="primary.main"
                    sx={{ 
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.5px'
                    }}
                  >
                    IRCTC Pro
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      fontWeight: 500,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  >
                    Professional Train Booking
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="text"
                  startIcon={<SearchIcon />}
                  onClick={onSearchClick}
                  sx={{ 
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  Search Trains
                </Button>
                <Button
                  variant="text"
                  startIcon={<BookOnlineIcon />}
                  onClick={() => handleNavigation('/booking')}
                  sx={{ 
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  Book Tickets
                </Button>
                <Button
                  variant="text"
                  startIcon={<HistoryIcon />}
                  onClick={() => handleNavigation('/history')}
                  sx={{ 
                    fontWeight: 600,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  History
                </Button>
              </Box>
            )}

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Theme Toggle */}
              <IconButton
                onClick={onThemeToggle}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              {/* Language Selector */}
              <IconButton
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <LanguageIcon />
              </IconButton>

              {/* Notifications */}
              <IconButton
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <IconButton
                onClick={handleProfileMenuOpen}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <AccountIcon />
              </IconButton>

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 200,
            mt: 1,
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigation('/profile'); }}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigation('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            backgroundColor: 'background.paper'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}