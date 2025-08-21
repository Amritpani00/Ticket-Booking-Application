import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Slide,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Train as TrainIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  BookOnline as BookOnlineIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface DashboardStats {
  totalTrains: number;
  activeBookings: number;
  totalRevenue: number;
  averageSpeed: number;
  onTimePercentage: number;
  popularRoutes: Array<{
    source: string;
    destination: string;
    bookings: number;
    rating: number;
  }>;
  recentBookings: Array<{
    id: string;
    trainNumber: string;
    source: string;
    destination: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    amount: number;
  }>;
}

interface ProfessionalDashboardProps {
  stats: DashboardStats;
  onQuickAction: (action: string) => void;
}

export default function ProfessionalDashboard({ 
  stats, 
  onQuickAction 
}: ProfessionalDashboardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon />;
      case 'pending': return <WarningIcon />;
      case 'cancelled': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Welcome Section */}
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Welcome to IRCTC Pro Dashboard
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Your professional train booking companion
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8, mb: 3 }}>
              Discover 13+ premium trains, manage bookings, and track your journeys with ease
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<BookOnlineIcon />}
              onClick={() => onQuickAction('book')}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Start Booking
            </Button>
          </Box>
          
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            zIndex: 0
          }} />
        </Paper>
      </Fade>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={800}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <TrainIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {stats.totalTrains}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Trains
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={900}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <PeopleIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {stats.activeBookings}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Active Bookings
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={1000}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <MoneyIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  ₹{stats.totalRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Revenue
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Zoom in={true} timeout={1100}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: 'white',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mx: 'auto', 
                  mb: 2 
                }}>
                  <SpeedIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {stats.averageSpeed}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Avg Speed (km/h)
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Slide direction="up" in={true} timeout={1200}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                  On-Time Performance
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mr: 2 }}>
                    {stats.onTimePercentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trains running on time
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.onTimePercentage} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'success.main'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Based on last 30 days performance
                </Typography>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        <Grid item xs={12} md={6}>
          <Slide direction="up" in={true} timeout={1300}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
                  Popular Routes
                </Typography>
                <Stack spacing={1}>
                  {stats.popularRoutes.slice(0, 3).map((route, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {route.source} → {route.destination}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {route.bookings} bookings
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                        <Typography variant="body2" fontWeight={500}>
                          {route.rating.toFixed(1)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Slide direction="up" in={true} timeout={1400}>
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BookOnlineIcon />}
                  onClick={() => onQuickAction('book')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Book Tickets
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => onQuickAction('history')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    View History
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<NotificationsIcon />}
                  onClick={() => onQuickAction('notifications')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Notifications
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HelpIcon />}
                  onClick={() => onQuickAction('help')}
                  sx={{ 
                    height: 80, 
                    flexDirection: 'column',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Help & Support
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Slide>

      {/* Recent Bookings */}
      <Slide direction="up" in={true} timeout={1500}>
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Bookings
            </Typography>
            <Stack spacing={2}>
              {stats.recentBookings.map((booking, index) => (
                <Paper 
                  key={booking.id} 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    '&:hover': { 
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {booking.trainNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.source} → {booking.destination}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={getStatusIcon(booking.status)}
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2" fontWeight={600}>
                        ₹{booking.amount}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Slide>
    </Box>
  );
}