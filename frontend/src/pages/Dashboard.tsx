import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Badge
} from '@mui/material';
import {
  Train as TrainIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getToken } from '../auth';

interface RecentBooking {
  id: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  passengers: number;
}

interface UpcomingJourney {
  id: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  status: 'onTime' | 'delayed' | 'cancelled';
  delay: number;
}

interface QuickStats {
  totalBookings: number;
  upcomingJourneys: number;
  totalSpent: number;
  favoriteRoutes: number;
  loyaltyPoints: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([
    {
      id: 'BK001',
      trainNumber: '12951',
      trainName: 'Rajdhani Express',
      source: 'New Delhi',
      destination: 'Mumbai Central',
      date: '2024-01-15',
      status: 'confirmed',
      amount: 3000,
      passengers: 2
    },
    {
      id: 'BK002',
      trainNumber: '12019',
      trainName: 'Shatabdi Express',
      source: 'New Delhi',
      destination: 'Bhopal Junction',
      date: '2024-01-20',
      status: 'pending',
      amount: 1600,
      passengers: 1
    },
    {
      id: 'BK003',
      trainNumber: '12301',
      trainName: 'Rajdhani Express',
      source: 'New Delhi',
      destination: 'Howrah Junction',
      date: '2024-01-10',
      status: 'confirmed',
      amount: 2500,
      passengers: 1
    }
  ]);

  const [upcomingJourneys, setUpcomingJourneys] = useState<UpcomingJourney[]>([
    {
      id: 'UJ001',
      trainNumber: '12951',
      trainName: 'Rajdhani Express',
      source: 'New Delhi',
      destination: 'Mumbai Central',
      departureTime: '16:55',
      arrivalTime: '08:35',
      date: '2024-01-15',
      status: 'onTime',
      delay: 0
    },
    {
      id: 'UJ002',
      trainNumber: '12019',
      trainName: 'Shatabdi Express',
      source: 'New Delhi',
      destination: 'Bhopal Junction',
      departureTime: '06:00',
      arrivalTime: '14:30',
      date: '2024-01-20',
      status: 'delayed',
      delay: 15
    }
  ]);

  const [quickStats] = useState<QuickStats>({
    totalBookings: 15,
    upcomingJourneys: 2,
    totalSpent: 25000,
    favoriteRoutes: 3,
    loyaltyPoints: 1250
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'onTime':
        return 'success';
      case 'pending':
        return 'warning';
      case 'delayed':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'onTime':
        return <CheckCircleIcon />;
      case 'pending':
        return <AccessTimeIcon />;
      case 'delayed':
        return <WarningIcon />;
      case 'cancelled':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome back! 👋
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Here's what's happening with your train journeys today
          </Typography>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
              <ReceiptIcon />
            </Avatar>
            <Typography variant="h4" color="primary">
              {quickStats.totalBookings}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Bookings
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
              <TrainIcon />
            </Avatar>
            <Typography variant="h4" color="success.main">
              {quickStats.upcomingJourneys}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming Journeys
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
              <TrendingUpIcon />
            </Avatar>
            <Typography variant="h4" color="warning.main">
              ₹{quickStats.totalSpent.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Spent
            </Typography>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
              <StarIcon />
            </Avatar>
            <Typography variant="h4" color="secondary.main">
              {quickStats.loyaltyPoints}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loyalty Points
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Upcoming Journeys */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Journeys
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/history')}
                >
                  View All
                </Button>
              </Box>
              
              {upcomingJourneys.map((journey, index) => (
                <Box key={journey.id}>
                  <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TrainIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight={600}>
                            {journey.trainNumber} - {journey.trainName}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="primary" fontWeight={600}>
                                {journey.departureTime}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {journey.source}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box textAlign="center">
                              <Typography variant="h6" color="primary" fontWeight={600}>
                                {journey.arrivalTime}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {journey.destination}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Date: {new Date(journey.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip
                            icon={getStatusIcon(journey.status)}
                            label={journey.status === 'delayed' ? `Delayed by ${journey.delay} min` : journey.status}
                            color={getStatusColor(journey.status) as any}
                            sx={{ mb: 1 }}
                          />
                          
                          {journey.status === 'delayed' && (
                            <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
                              Train delayed by {journey.delay} minutes
                            </Alert>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                  {index < upcomingJourneys.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Bookings
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/history')}
                >
                  View All
                </Button>
              </Box>
              
              <List>
                {recentBookings.map((booking, index) => (
                  <Box key={booking.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <ReceiptIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {booking.trainNumber} - {booking.trainName}
                            </Typography>
                            <Chip
                              icon={getStatusIcon(booking.status)}
                              label={booking.status}
                              color={getStatusColor(booking.status) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {booking.source} → {booking.destination}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Date: {new Date(booking.date).toLocaleDateString()} | 
                              Passengers: {booking.passengers} | 
                              Amount: ₹{booking.amount}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentBookings.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/')}
                  sx={{ py: 1.5 }}
                >
                  Book New Ticket
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ScheduleIcon />}
                  onClick={() => navigate('/fare')}
                  sx={{ py: 1.5 }}
                >
                  Check Fare
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FavoriteIcon />}
                  onClick={() => navigate('/favorites')}
                  sx={{ py: 1.5 }}
                >
                  View Favorites
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<NotificationsIcon />}
                  sx={{ py: 1.5 }}
                >
                  Notification Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Loyalty Program */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Loyalty Program
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {quickStats.loyaltyPoints}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Points Earned
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Next milestone: 1500 points
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(quickStats.loyaltyPoints / 1500) * 100} 
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {1500 - quickStats.loyaltyPoints} points to next tier
              </Typography>
            </CardContent>
          </Card>

          {/* Favorite Routes */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Favorite Routes
              </Typography>
              <Stack spacing={1}>
                <Paper sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Delhi → Mumbai
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rajdhani Express • 3 bookings
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Delhi → Kolkata
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rajdhani Express • 2 bookings
                  </Typography>
                </Paper>
                <Paper sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600}>
                    Delhi → Bangalore
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Karnataka Express • 1 booking
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}