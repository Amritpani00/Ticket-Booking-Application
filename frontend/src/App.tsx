import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from './api';
import { getToken } from './auth';
import { 
  Alert, 
  Box, 
  Button, 
  Card, 
  CardActionArea, 
  CardContent, 
  Chip, 
  Divider, 
  Skeleton, 
  Stack, 
  TextField, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Autocomplete,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Search as SearchIcon,
  Train as TrainIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import AnimatedClouds from './components/AnimatedClouds';
import PulseIcons from './components/PulseIcons';
import GradientBanner from './components/GradientBanner';
import DottedLine from './components/DottedLine';
import BouncyCta from './components/BouncyCta';
import Confetti from './components/Confetti';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Enhanced interfaces for real-world train data
interface TrainStation {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  category: 'A1' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

interface TrainRoute {
  id: number;
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  sourceCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distance: number;
  runningDays: string[];
  trainType: 'Rajdhani' | 'Shatabdi' | 'Duronto' | 'Express' | 'Passenger' | 'Local';
  zone: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface TrainClass {
  id: number;
  code: string;
  name: string;
  category: 'AC' | 'Non-AC' | 'Sleeper' | 'General';
  fare: number;
  available: number;
  total: number;
  features: string[];
}

interface SeatDto { 
  id: number; 
  rowLabel: string; 
  seatNumber: number; 
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED'; 
  fare: number;
  classType: string;
}

interface CreateBookingResponse { 
  bookingId: number; 
  orderId: string; 
  razorpayKeyId: string; 
  amount: number; 
  currency: string; 
}

// Real-world train stations data
const MAJOR_STATIONS: TrainStation[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi', zone: 'NR', category: 'A1' },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'WR', category: 'A1' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal', zone: 'ER', category: 'A1' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', zone: 'SR', category: 'A1' },
  { code: 'SBC', name: 'Bangalore City', city: 'Bangalore', state: 'Karnataka', zone: 'SWR', category: 'A' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat', zone: 'WR', category: 'A' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar', zone: 'ECR', category: 'A' },
  { code: 'LKO', name: 'Lucknow Junction', city: 'Lucknow', state: 'Uttar Pradesh', zone: 'NR', category: 'A' },
  { code: 'JAI', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan', zone: 'NWR', category: 'A' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana', zone: 'SCR', category: 'A' },
  { code: 'BBS', name: 'Bhubaneswar', city: 'Bhubaneswar', state: 'Odisha', zone: 'ECoR', category: 'A' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra', zone: 'CR', category: 'A' },
  { code: 'BZA', name: 'Vijayawada Junction', city: 'Vijayawada', state: 'Andhra Pradesh', zone: 'SCR', category: 'A' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh', zone: 'NER', category: 'A' },
  { code: 'JHS', name: 'Jhansi Junction', city: 'Jhansi', state: 'Uttar Pradesh', zone: 'NCR', category: 'A' }
];

// Real-world train routes data
const TRAIN_ROUTES: TrainRoute[] = [
  {
    id: 1,
    trainNumber: '12951',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Mumbai Central',
    sourceCode: 'NDLS',
    destinationCode: 'BCT',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    distance: 1384,
    runningDays: ['Mon', 'Wed', 'Fri'],
    trainType: 'Rajdhani',
    zone: 'NR',
    priority: 'High'
  },
  {
    id: 2,
    trainNumber: '12952',
    trainName: 'Rajdhani Express',
    source: 'Mumbai Central',
    destination: 'New Delhi',
    sourceCode: 'BCT',
    destinationCode: 'NDLS',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    distance: 1384,
    runningDays: ['Tue', 'Thu', 'Sat'],
    trainType: 'Rajdhani',
    zone: 'WR',
    priority: 'High'
  },
  {
    id: 3,
    trainNumber: '12019',
    trainName: 'Shatabdi Express',
    source: 'New Delhi',
    destination: 'Bhopal Junction',
    sourceCode: 'NDLS',
    destinationCode: 'BPL',
    departureTime: '06:00',
    arrivalTime: '14:30',
    duration: '8h 30m',
    distance: 708,
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    trainType: 'Shatabdi',
    zone: 'NR',
    priority: 'High'
  },
  {
    id: 4,
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Howrah Junction',
    sourceCode: 'NDLS',
    destinationCode: 'HWH',
    departureTime: '16:55',
    arrivalTime: '10:00',
    duration: '17h 5m',
    distance: 1448,
    runningDays: ['Mon', 'Wed', 'Fri'],
    trainType: 'Rajdhani',
    zone: 'NR',
    priority: 'High'
  },
  {
    id: 5,
    trainNumber: '12302',
    trainName: 'Rajdhani Express',
    source: 'Howrah Junction',
    destination: 'New Delhi',
    sourceCode: 'HWH',
    destinationCode: 'NDLS',
    departureTime: '16:55',
    arrivalTime: '10:00',
    duration: '17h 5m',
    distance: 1448,
    runningDays: ['Tue', 'Thu', 'Sat'],
    trainType: 'Rajdhani',
    zone: 'ER',
    priority: 'High'
  },
  {
    id: 6,
    trainNumber: '12627',
    trainName: 'Karnataka Express',
    source: 'New Delhi',
    destination: 'Bangalore City',
    sourceCode: 'NDLS',
    destinationCode: 'SBC',
    departureTime: '20:30',
    arrivalTime: '05:00',
    duration: '32h 30m',
    distance: 2370,
    runningDays: ['Daily'],
    trainType: 'Express',
    zone: 'NR',
    priority: 'Medium'
  },
  {
    id: 7,
    trainNumber: '12628',
    trainName: 'Karnataka Express',
    source: 'Bangalore City',
    destination: 'New Delhi',
    sourceCode: 'SBC',
    destinationCode: 'NDLS',
    departureTime: '20:30',
    arrivalTime: '05:00',
    duration: '32h 30m',
    distance: 2370,
    runningDays: ['Daily'],
    trainType: 'Express',
    zone: 'SWR',
    priority: 'Medium'
  },
  {
    id: 8,
    trainNumber: '12951',
    trainName: 'Duronto Express',
    source: 'New Delhi',
    destination: 'Ahmedabad Junction',
    sourceCode: 'NDLS',
    destinationCode: 'ADI',
    departureTime: '23:00',
    arrivalTime: '14:30',
    duration: '15h 30m',
    distance: 937,
    runningDays: ['Mon', 'Wed', 'Fri'],
    trainType: 'Duronto',
    zone: 'NR',
    priority: 'High'
  },
  {
    id: 9,
    trainNumber: '12952',
    trainName: 'Duronto Express',
    source: 'Ahmedabad Junction',
    destination: 'New Delhi',
    sourceCode: 'ADI',
    destinationCode: 'NDLS',
    departureTime: '23:00',
    arrivalTime: '14:30',
    duration: '15h 30m',
    distance: 937,
    runningDays: ['Tue', 'Thu', 'Sat'],
    trainType: 'Duronto',
    zone: 'WR',
    priority: 'High'
  },
  {
    id: 10,
    trainNumber: '12309',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Patna Junction',
    sourceCode: 'NDLS',
    destinationCode: 'PNBE',
    departureTime: '16:55',
    arrivalTime: '08:00',
    duration: '15h 5m',
    distance: 1000,
    runningDays: ['Mon', 'Wed', 'Fri'],
    trainType: 'Rajdhani',
    zone: 'NR',
    priority: 'High'
  }
];

// Real-world train classes
const TRAIN_CLASSES: TrainClass[] = [
  { id: 1, code: '1A', name: 'First AC', category: 'AC', fare: 2500, available: 20, total: 24, features: ['AC', 'Bedding', 'Food', 'Priority'] },
  { id: 2, code: '2A', name: 'Second AC', category: 'AC', fare: 1500, available: 45, total: 52, features: ['AC', 'Bedding', 'Food'] },
  { id: 3, code: '3A', name: 'Third AC', category: 'AC', fare: 1000, available: 72, total: 80, features: ['AC', 'Bedding'] },
  { id: 4, code: 'SL', name: 'Sleeper', category: 'Sleeper', fare: 400, available: 120, total: 144, features: ['Bedding'] },
  { id: 5, code: 'CC', name: 'Chair Car', category: 'AC', fare: 800, available: 60, total: 72, features: ['AC', 'Food'] },
  { id: 6, code: '2S', name: 'Second Sitting', category: 'Non-AC', fare: 200, available: 180, total: 200, features: ['Basic'] },
  { id: 7, code: 'GEN', name: 'General', category: 'General', fare: 100, available: 300, total: 400, features: ['Basic'] }
];

function App() {
  const [searchTab, setSearchTab] = useState(0);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDate, setJourneyDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [classType, setClassType] = useState('');
  const [trainType, setTrainType] = useState('');
  const [zone, setZone] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [sortBy, setSortBy] = useState('departure');
  const [favorites, setFavorites] = useState<number[]>([]);
  
  const [filteredTrains, setFilteredTrains] = useState<TrainRoute[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<TrainRoute | null>(null);
  const [selectedClass, setSelectedClass] = useState<TrainClass | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const navigate = useNavigate();

  // Filter trains based on search criteria
  useEffect(() => {
    let filtered = TRAIN_ROUTES.filter(train => {
      // Source and destination filter
      if (source && !train.source.toLowerCase().includes(source.toLowerCase()) && 
          !train.sourceCode.toLowerCase().includes(source.toLowerCase())) return false;
      if (destination && !train.destination.toLowerCase().includes(destination.toLowerCase()) && 
          !train.destinationCode.toLowerCase().includes(destination.toLowerCase())) return false;
      
      // Train type filter
      if (trainType && train.trainType !== trainType) return false;
      
      // Zone filter
      if (zone && train.zone !== zone) return false;
      
      // Price range filter (using class fares)
      const minFare = Math.min(...TRAIN_CLASSES.map(c => c.fare));
      const maxFare = Math.max(...TRAIN_CLASSES.map(c => c.fare));
      if (priceRange[0] > minFare || priceRange[1] < maxFare) return false;
      
      return true;
    });

    // Sort trains
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'departure':
          return a.departureTime.localeCompare(b.departureTime);
        case 'arrival':
          return a.arrivalTime.localeCompare(b.arrivalTime);
        case 'duration':
          return a.duration.localeCompare(b.duration);
        case 'distance':
          return a.distance - b.distance;
        case 'priority':
          const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        default:
          return 0;
      }
    });

    setFilteredTrains(filtered);
  }, [source, destination, trainType, zone, priceRange, sortBy]);

  // Get available classes for selected train
  const availableClasses = useMemo(() => {
    if (!selectedTrain) return [];
    return TRAIN_CLASSES.filter(cls => cls.available > 0);
  }, [selectedTrain]);

  // Calculate total fare
  const totalFare = useMemo(() => {
    if (!selectedClass || selectedSeatIds.length === 0) return 0;
    return selectedSeatIds.length * selectedClass.fare;
  }, [selectedClass, selectedSeatIds]);

  // Toggle favorite
  const toggleFavorite = (trainId: number) => {
    setFavorites(prev => 
      prev.includes(trainId) 
        ? prev.filter(id => id !== trainId)
        : [...prev, trainId]
    );
  };

  // Toggle seat selection
  const toggleSeat = (id: number) => {
    setSelectedSeatIds(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  // Create booking
  async function createBooking() {
    if (!selectedTrain || !selectedClass || selectedSeatIds.length === 0) return;
    if (!getToken()) { 
      setToast('Please login or register first'); 
      return; 
    }
    
    setCreating(true);
    try {
      const resp = await apiPost<any, CreateBookingResponse>('/api/bookings', { 
        trainId: selectedTrain.id, 
        classId: selectedClass.id,
        seatIds: selectedSeatIds, 
        customerName: customer.name, 
        customerEmail: customer.email, 
        customerPhone: customer.phone 
      });
      await launchRazorpay(resp);
    } catch (e: any) { 
      setToast(e.message || 'Failed to create booking'); 
    } finally { 
      setCreating(false); 
    }
  }

  // Launch Razorpay payment
  async function launchRazorpay(data: CreateBookingResponse) {
    if (!(window as any).Razorpay) {
      await new Promise<void>((resolve, reject) => { 
        const script = document.createElement('script'); 
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'; 
        script.onload = () => resolve(); 
        script.onerror = () => reject(new Error('Failed to load Razorpay')); 
        document.body.appendChild(script); 
      });
    }
    
    const options = { 
      key: data.razorpayKeyId, 
      amount: Math.round(data.amount * 100), 
      currency: data.currency, 
      name: 'IRCTC Train Booking', 
      description: 'Train ticket booking', 
      order_id: data.orderId, 
      prefill: { 
        name: customer.name, 
        email: customer.email, 
        contact: customer.phone 
      }, 
      modal: { 
        ondismiss: () => setToast('Payment dismissed') 
      }, 
      handler: async (response: any) => { 
        await apiPost('/api/bookings/verify', { 
          bookingId: data.bookingId, 
          razorpayOrderId: response.razorpay_order_id, 
          razorpayPaymentId: response.razorpay_payment_id, 
          razorpaySignature: response.razorpay_signature, 
        }); 
        navigate(`/ticket/${data.bookingId}`); 
      } 
    } as any;
    
    const rz = new (window as any).Razorpay(options); 
    rz.open();
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header Banner */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">
            🚂 IRCTC Train Booking System
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>
            Book your train tickets with ease - Advanced search, real-time availability, and secure payments
          </Typography>
          <AnimatedClouds />
          <PulseIcons />
        </CardContent>
      </Card>

      {/* Search Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={searchTab} onChange={(_, newValue) => setSearchTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Quick Search" icon={<SearchIcon />} />
            <Tab label="Advanced Search" icon={<FilterIcon />} />
            <Tab label="Popular Routes" icon={<TrainIcon />} />
          </Tabs>

          {searchTab === 0 && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <Autocomplete
                options={MAJOR_STATIONS}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                renderInput={(params) => <TextField {...params} label="From Station" />}
                value={MAJOR_STATIONS.find(s => s.code === source) || null}
                onChange={(_, newValue) => setSource(newValue?.code || '')}
                sx={{ minWidth: { xs: '100%', md: 250 } }}
              />
              <Autocomplete
                options={MAJOR_STATIONS}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                renderInput={(params) => <TextField {...params} label="To Station" />}
                value={MAJOR_STATIONS.find(s => s.code === destination) || null}
                onChange={(_, newValue) => setDestination(newValue?.code || '')}
                sx={{ minWidth: { xs: '100%', md: 250 } }}
              />
              <DatePicker 
                label="Journey Date" 
                value={journeyDate ? dayjs(journeyDate) : null} 
                onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')} 
                slotProps={{ textField: { sx: { minWidth: { xs: '100%', md: 200 } } } }} 
              />
              <FormControlLabel
                control={<Switch checked={isRoundTrip} onChange={(e) => setIsRoundTrip(e.target.checked)} />}
                label="Round Trip"
              />
              {isRoundTrip && (
                <DatePicker 
                  label="Return Date" 
                  value={returnDate ? dayjs(returnDate) : null} 
                  onChange={(d) => setReturnDate(d ? d.format('YYYY-MM-DD') : '')} 
                  slotProps={{ textField: { sx: { minWidth: { xs: '100%', md: 200 } } } }} 
                />
              )}
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<SearchIcon />}
                sx={{ minWidth: { xs: '100%', md: 150 } }}
              >
                Search Trains
              </Button>
            </Stack>
          )}

          {searchTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Autocomplete
                    options={MAJOR_STATIONS}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    renderInput={(params) => <TextField {...params} label="From Station" />}
                    value={MAJOR_STATIONS.find(s => s.code === source) || null}
                    onChange={(_, newValue) => setSource(newValue?.code || '')}
                  />
                  <Autocomplete
                    options={MAJOR_STATIONS}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    renderInput={(params) => <TextField {...params} label="To Station" />}
                    value={MAJOR_STATIONS.find(s => s.code === destination) || null}
                    onChange={(_, newValue) => setDestination(newValue?.code || '')}
                  />
                  <DatePicker 
                    label="Journey Date" 
                    value={journeyDate ? dayjs(journeyDate) : null} 
                    onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')} 
                    slotProps={{ textField: { fullWidth: true } }} 
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Train Type</InputLabel>
                    <Select value={trainType} onChange={(e) => setTrainType(e.target.value)}>
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="Rajdhani">Rajdhani Express</MenuItem>
                      <MenuItem value="Shatabdi">Shatabdi Express</MenuItem>
                      <MenuItem value="Duronto">Duronto Express</MenuItem>
                      <MenuItem value="Express">Express</MenuItem>
                      <MenuItem value="Passenger">Passenger</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Zone</InputLabel>
                    <Select value={zone} onChange={(e) => setZone(e.target.value)}>
                      <MenuItem value="">All Zones</MenuItem>
                      <MenuItem value="NR">Northern Railway</MenuItem>
                      <MenuItem value="WR">Western Railway</MenuItem>
                      <MenuItem value="ER">Eastern Railway</MenuItem>
                      <MenuItem value="SR">Southern Railway</MenuItem>
                      <MenuItem value="SWR">South Western Railway</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <MenuItem value="departure">Departure Time</MenuItem>
                      <MenuItem value="arrival">Arrival Time</MenuItem>
                      <MenuItem value="duration">Duration</MenuItem>
                      <MenuItem value="distance">Distance</MenuItem>
                      <MenuItem value="priority">Priority</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Typography>
                <Slider
                  value={priceRange}
                  onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={5000}
                  step={100}
                />
                <FormControlLabel
                  control={<Switch checked={showOnlyAvailable} onChange={(e) => setShowOnlyAvailable(e.target.checked)} />}
                  label="Show only available trains"
                />
              </Grid>
            </Grid>
          )}

          {searchTab === 2 && (
            <Grid container spacing={2}>
              {[
                { from: 'NDLS', to: 'BCT', name: 'Delhi - Mumbai' },
                { from: 'NDLS', to: 'HWH', name: 'Delhi - Kolkata' },
                { from: 'BCT', to: 'MAS', name: 'Mumbai - Chennai' },
                { from: 'NDLS', to: 'SBC', name: 'Delhi - Bangalore' }
              ].map((route) => (
                <Grid item xs={12} sm={6} md={3} key={route.name}>
                  <Card 
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                    onClick={() => {
                      setSource(route.from);
                      setDestination(route.to);
                      setSearchTab(0);
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{route.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {MAJOR_STATIONS.find(s => s.code === route.from)?.name} → {MAJOR_STATIONS.find(s => s.code === route.to)?.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {filteredTrains.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Found {filteredTrains.length} trains
            </Typography>
            <Grid container spacing={2}>
              {filteredTrains.map((train) => (
                <Grid item xs={12} key={train.id}>
                  <Card 
                    variant={selectedTrain?.id === train.id ? 'outlined' : undefined}
                    sx={{ 
                      borderColor: selectedTrain?.id === train.id ? 'primary.main' : undefined,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 }
                    }}
                    onClick={() => setSelectedTrain(train)}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                            <Typography variant="h6" fontWeight={700}>
                              {train.trainNumber} - {train.trainName}
                            </Typography>
                            <Chip 
                              label={train.trainType} 
                              color={train.trainType === 'Rajdhani' ? 'primary' : 'default'}
                              size="small"
                            />
                            <Chip 
                              label={train.priority} 
                              color={train.priority === 'High' ? 'success' : train.priority === 'Medium' ? 'warning' : 'default'}
                              size="small"
                            />
                          </Stack>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary">
                                    {train.departureTime}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {train.source}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {train.sourceCode}
                                  </Typography>
                                </Box>
                                <DottedLine />
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary">
                                    {train.arrivalTime}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {train.destination}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {train.destinationCode}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Stack spacing={1}>
                                <Typography variant="body2">
                                  <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                  Duration: {train.duration}
                                </Typography>
                                <Typography variant="body2">
                                  <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                  Distance: {train.distance} km
                                </Typography>
                                <Typography variant="body2">
                                  <TrainIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                  Zone: {train.zone}
                                </Typography>
                                <Typography variant="body2">
                                  Running Days: {train.runningDays.join(', ')}
                                </Typography>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title={favorites.includes(train.id) ? 'Remove from favorites' : 'Add to favorites'}>
                            <IconButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(train.id);
                              }}
                            >
                              {favorites.includes(train.id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Train Details and Booking */}
      {selectedTrain && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {selectedTrain.trainNumber} - {selectedTrain.trainName}
            </Typography>
            
            {/* Class Selection */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Select Class</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {availableClasses.map((cls) => (
                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                  <Card 
                    variant={selectedClass?.id === cls.id ? 'outlined' : undefined}
                    sx={{ 
                      borderColor: selectedClass?.id === cls.id ? 'primary.main' : undefined,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 }
                    }}
                    onClick={() => setSelectedClass(cls)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {cls.code} - {cls.name}
                      </Typography>
                      <Typography variant="h5" color="primary" gutterBottom>
                        ₹{cls.fare}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Available: {cls.available}/{cls.total}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {cls.features.map((feature, index) => (
                          <Chip key={index} label={feature} size="small" sx={{ mb: 0.5 }} />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Seat Selection */}
            {selectedClass && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Select Seats - {selectedClass.name} (₹{selectedClass.fare} each)
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selected: {selectedSeatIds.length} | Total: ₹{totalFare}
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 1, mb: 3 }}>
                  {Array.from({ length: Math.min(selectedClass.available, 50) }).map((_, index) => {
                    const seatId = index + 1;
                    const isSelected = selectedSeatIds.includes(seatId);
                    return (
                      <Button
                        key={seatId}
                        variant={isSelected ? 'contained' : 'outlined'}
                        color={isSelected ? 'success' : 'inherit'}
                        onClick={() => toggleSeat(seatId)}
                        sx={{ minWidth: 0, px: 0 }}
                      >
                        {Math.floor(index / 4) + 1}{String.fromCharCode(65 + (index % 4))}
                      </Button>
                    );
                  })}
                </Box>

                {/* Customer Details */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>Passenger Details</Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Full Name"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Email"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Phone"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>

                {/* Booking Button */}
                <Box sx={{ textAlign: 'center' }}>
                  <BouncyCta 
                    onClick={() => { 
                      setConfetti(true); 
                      createBooking(); 
                      setTimeout(() => setConfetti(false), 1500); 
                    }}
                    disabled={!customer.name || !customer.email || !customer.phone || selectedSeatIds.length === 0}
                  >
                    {creating ? 'Creating Booking...' : `Book Now - ₹${totalFare}`}
                  </BouncyCta>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Toast Messages */}
      {toast && (
        <Box position="fixed" right={16} bottom={16} zIndex={9999}>
          <Alert severity="info" onClose={() => setToast(null)}>
            {toast}
          </Alert>
        </Box>
      )}
      
      {/* Confetti Effect */}
      <Confetti fire={confetti} />
    </Box>
  );
}

export default App;
