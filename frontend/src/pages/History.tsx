import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Stack,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Train as TrainIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface BookingHistory {
  id: string;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  date: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  amount: number;
  passengers: number;
  pnr: string;
  seatNumbers: string[];
  classType: string;
  bookingDate: string;
  cancellationDate?: string;
  refundAmount?: number;
}

interface FilterOptions {
  status: string;
  dateRange: [string, string];
  trainType: string;
  classType: string;
}

const SAMPLE_BOOKINGS: BookingHistory[] = [
  {
    id: 'BK001',
    trainNumber: '12951',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Mumbai Central',
    departureTime: '16:55',
    arrivalTime: '08:35',
    date: '2024-01-15',
    status: 'completed',
    amount: 3000,
    passengers: 2,
    pnr: '1234567890',
    seatNumbers: ['A1', 'A2'],
    classType: '2A',
    bookingDate: '2024-01-10'
  },
  {
    id: 'BK002',
    trainNumber: '12019',
    trainName: 'Shatabdi Express',
    source: 'New Delhi',
    destination: 'Bhopal Junction',
    departureTime: '06:00',
    arrivalTime: '14:30',
    date: '2024-01-20',
    status: 'confirmed',
    amount: 1600,
    passengers: 1,
    pnr: '0987654321',
    seatNumbers: ['B3'],
    classType: 'CC',
    bookingDate: '2024-01-15'
  },
  {
    id: 'BK003',
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Howrah Junction',
    departureTime: '16:55',
    arrivalTime: '10:00',
    date: '2024-01-10',
    status: 'cancelled',
    amount: 2500,
    passengers: 1,
    pnr: '1122334455',
    seatNumbers: ['C1'],
    classType: '2A',
    bookingDate: '2024-01-05',
    cancellationDate: '2024-01-08',
    refundAmount: 2350
  },
  {
    id: 'BK004',
    trainNumber: '12627',
    trainName: 'Karnataka Express',
    source: 'New Delhi',
    destination: 'Bangalore City',
    departureTime: '20:30',
    arrivalTime: '05:00',
    date: '2024-02-01',
    status: 'pending',
    amount: 1800,
    passengers: 1,
    pnr: '5566778899',
    seatNumbers: ['D2'],
    classType: '3A',
    bookingDate: '2024-01-25'
  }
];

export default function History() {
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState<BookingHistory[]>(SAMPLE_BOOKINGS);
  const [filteredBookings, setFilteredBookings] = useState<BookingHistory[]>(SAMPLE_BOOKINGS);
  const [filters, setFilters] = useState<FilterOptions>({
    status: '',
    dateRange: ['', ''],
    trainType: '',
    classType: ''
  });
  const [selectedBooking, setSelectedBooking] = useState<BookingHistory | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const applyFilters = () => {
    let filtered = bookings;

    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    if (filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(b => {
        const bookingDate = dayjs(b.date);
        const startDate = dayjs(filters.dateRange[0]);
        const endDate = dayjs(filters.dateRange[1]);
        return bookingDate.isBetween(startDate, endDate, 'day', '[]');
      });
    }

    if (filters.trainType) {
      filtered = filtered.filter(b => b.trainName.includes(filters.trainType));
    }

    if (filters.classType) {
      filtered = filtered.filter(b => b.classType === filters.classType);
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      case 'pending':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const toggleFavorite = (trainNumber: string) => {
    setFavorites(prev => 
      prev.includes(trainNumber) 
        ? prev.filter(t => t !== trainNumber)
        : [...prev, trainNumber]
    );
  };

  const handleDownloadTicket = (booking: BookingHistory) => {
    // Simulate ticket download
    console.log('Downloading ticket for:', booking.pnr);
  };

  const handleShareTicket = (booking: BookingHistory) => {
    // Simulate sharing ticket
    console.log('Sharing ticket for:', booking.pnr);
  };

  const handleCancelBooking = (booking: BookingHistory) => {
    // Simulate cancellation
    console.log('Cancelling booking:', booking.id);
  };

  const getTabBookings = (tabIndex: number) => {
    switch (tabIndex) {
      case 0: // All
        return filteredBookings;
      case 1: // Upcoming
        return filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
      case 2: // Completed
        return filteredBookings.filter(b => b.status === 'completed');
      case 3: // Cancelled
        return filteredBookings.filter(b => b.status === 'cancelled');
      default:
        return filteredBookings;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            📋 Booking History
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>
            Track your journeys, download tickets, and manage your bookings
          </Typography>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select 
                  value={filters.status} 
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={filters.dateRange[0] ? dayjs(filters.dateRange[0]) : null}
                onChange={(d) => setFilters({ 
                  ...filters, 
                  dateRange: [d ? d.format('YYYY-MM-DD') : '', filters.dateRange[1]] 
                })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="To Date"
                value={filters.dateRange[1] ? dayjs(filters.dateRange[1]) : null}
                onChange={(d) => setFilters({ 
                  ...filters, 
                  dateRange: [filters.dateRange[0], d ? d.format('YYYY-MM-DD') : ''] 
                })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class Type</InputLabel>
                <Select 
                  value={filters.classType} 
                  onChange={(e) => setFilters({ ...filters, classType: e.target.value })}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  <MenuItem value="1A">First AC</MenuItem>
                  <MenuItem value="2A">Second AC</MenuItem>
                  <MenuItem value="3A">Third AC</MenuItem>
                  <MenuItem value="SL">Sleeper</MenuItem>
                  <MenuItem value="CC">Chair Car</MenuItem>
                  <MenuItem value="2S">Second Sitting</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label={`All (${filteredBookings.length})`} />
            <Tab label={`Upcoming (${filteredBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length})`} />
            <Tab label={`Completed (${filteredBookings.filter(b => b.status === 'completed').length})`} />
            <Tab label={`Cancelled (${filteredBookings.filter(b => b.status === 'cancelled').length})`} />
          </Tabs>

          {/* Bookings List */}
          <List>
            {getTabBookings(activeTab).map((booking, index) => (
              <Box key={booking.id}>
                <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrainIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>
                          {booking.trainNumber} - {booking.trainName}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(booking.trainNumber)}
                          sx={{ ml: 1 }}
                        >
                          {favorites.includes(booking.trainNumber) ? 
                            <StarIcon color="warning" /> : 
                            <StarBorderIcon />
                          }
                        </IconButton>
                      </Box>
                      
                      <Grid container spacing={3} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary" fontWeight={600}>
                              {booking.departureTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.source}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary" fontWeight={600}>
                              {booking.arrivalTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {booking.destination}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Date: {new Date(booking.date).toLocaleDateString()} | 
                        PNR: {booking.pnr} | 
                        Class: {booking.classType} | 
                        Seats: {booking.seatNumbers.join(', ')}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Booked on: {new Date(booking.bookingDate).toLocaleDateString()} | 
                        Amount: ₹{booking.amount} | 
                        Passengers: {booking.passengers}
                      </Typography>
                      
                      {booking.status === 'cancelled' && booking.cancellationDate && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Cancelled on: {new Date(booking.cancellationDate).toLocaleDateString()} | 
                          Refund: ₹{booking.refundAmount}
                        </Typography>
                      )}
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip
                          icon={getStatusIcon(booking.status)}
                          label={booking.status}
                          color={getStatusColor(booking.status) as any}
                          sx={{ mb: 2 }}
                        />
                        
                        <Stack spacing={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadTicket(booking)}
                            fullWidth
                          >
                            Download
                          </Button>
                          
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ShareIcon />}
                            onClick={() => handleShareTicket(booking)}
                            fullWidth
                          >
                            Share
                          </Button>
                          
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleCancelBooking(booking)}
                              fullWidth
                            >
                              Cancel
                            </Button>
                          )}
                          
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetails(true);
                            }}
                            fullWidth
                          >
                            View Details
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
                {index < getTabBookings(activeTab).length - 1 && <Divider />}
              </Box>
            ))}
          </List>
          
          {getTabBookings(activeTab).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No bookings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or check other tabs
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                Booking Details - {selectedBooking.pnr}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Train Information</Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Train:</strong> {selectedBooking.trainNumber} - {selectedBooking.trainName}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Route:</strong> {selectedBooking.source} → {selectedBooking.destination}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Date:</strong> {new Date(selectedBooking.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Time:</strong> {selectedBooking.departureTime} - {selectedBooking.arrivalTime}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Class:</strong> {selectedBooking.classType}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Booking Information</Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>PNR:</strong> {selectedBooking.pnr}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> 
                    <Chip 
                      icon={getStatusIcon(selectedBooking.status)}
                      label={selectedBooking.status}
                      color={getStatusColor(selectedBooking.status) as any}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Seats:</strong> {selectedBooking.seatNumbers.join(', ')}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Passengers:</strong> {selectedBooking.passengers}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Amount:</strong> ₹{selectedBooking.amount}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Booked on:</strong> {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                  </Typography>
                  
                  {selectedBooking.status === 'cancelled' && selectedBooking.cancellationDate && (
                    <>
                      <Typography variant="body2" gutterBottom>
                        <strong>Cancelled on:</strong> {new Date(selectedBooking.cancellationDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Refund Amount:</strong> ₹{selectedBooking.refundAmount}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
              <Button 
                variant="contained" 
                startIcon={<DownloadIcon />}
                onClick={() => handleDownloadTicket(selectedBooking)}
              >
                Download Ticket
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

