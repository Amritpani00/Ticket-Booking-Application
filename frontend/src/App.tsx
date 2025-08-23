import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from './api';
import { getToken } from './auth';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Skeleton, Stack, TextField, Typography, Tabs, Tab, Grid, Stepper, Step, StepLabel, Container, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AnimatedClouds from './components/AnimatedClouds';
import PulseIcons from './components/PulseIcons';
import GradientBanner from './components/GradientBanner';
import DottedLine from './components/DottedLine';
import BouncyCta from './components/BouncyCta';
import Confetti from './components/Confetti';
import ProfessionalHeader from './components/ProfessionalHeader';
import InteractiveTrainSearch from './components/InteractiveTrainSearch';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import EnhancedTrainCard from './components/EnhancedTrainCard';
import PassengerDetailsForm from './components/PassengerDetailsForm';
import BookingSummary from './components/BookingSummary';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TrainIcon from '@mui/icons-material/Train';

interface EventDto { 
  id: number; 
  name: string; 
  trainNumber?: string; 
  source?: string; 
  destination?: string; 
  venue: string; 
  description?: string; 
  startTime: string; 
  endTime: string; 
  seatPrice: number; 
  classType?: string;
  trainType?: string;
  trainCategory?: string;
  platformNumber?: string;
  totalCoaches?: number;
  runningDays?: string;
  isRunningToday?: boolean;
  intermediateStations?: string;
  journeyDurationMinutes?: number;
  hasPantry?: boolean;
  hasAC?: boolean;
  trainOperator?: string;
  routeType?: string;
  averageSpeed?: number;
  trainStatus?: string;
  delayMinutes?: number;
}

interface SeatDto { 
  id: number; 
  rowLabel: string; 
  seatNumber: number; 
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED';
  coach?: {
    id: number;
    code: string;
    classType: string;
  };
}

interface CoachDto { id: number; code: string; classType: string; available: number; reserved: number; booked: number; total: number; }
interface CreateBookingResponse { bookingId: number; orderId: string; razorpayKeyId: string; amount: number; currency: string; pnrNumber?: string; }

interface SearchFilters {
  source: string;
  destination: string;
  journeyDate: string;
  trainType: string;
  trainCategory: string;
  hasAC: boolean | null;
  trainOperator: string;
  minSpeed: number;
  maxFare: number;
  classType: string;
  sortBy: string;
  sortOrder: string;
}

interface PassengerInfo {
  name: string;
  age: string;
  gender: string;
  idProofType: string;
  idProofNumber: string;
  passengerType: string;
  contactNumber: string;
  email: string;
}

function formatSeat(seat: SeatDto) { return `${seat.rowLabel}${seat.seatNumber}`; }
function classLabelToAcType(classType?: string) { if (!classType) return 'General'; const t = classType.toUpperCase(); return (['1A','2A','3A','EC'].includes(t)) ? 'AC' : 'Non-AC'; }
function classCategoryOf(classType?: string) { if (!classType) return 'General'; const t = classType.toUpperCase(); if (['1A','2A','3A','EC','CC'].includes(t)) return 'AC'; if (['SL'].includes(t)) return 'Sleeper'; if (['GEN','2S'].includes(t)) return 'General'; return 'General'; }

// Create professional theme
const professionalTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.3px',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.2px',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatsError, setSeatsError] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const navigate = useNavigate();

  const [coaches, setCoaches] = useState<CoachDto[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coachesError, setCoachesError] = useState<string | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);

  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [classType, setClassType] = useState('');
  const [journeyDate, setJourneyDate] = useState<string>('');

  // Advanced search state
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced'>('basic');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    source: '',
    destination: '',
    journeyDate: '',
    trainType: '',
    trainCategory: '',
    hasAC: null,
    trainOperator: '',
    minSpeed: 0,
    maxFare: 10000,
    classType: '',
    sortBy: 'startTime',
    sortOrder: 'asc'
  });

  // Booking flow state
  const [bookingStep, setBookingStep] = useState<number>(0);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [showPassengerForm, setShowPassengerForm] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(false);

  // Professional features
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);

  // Dashboard stats
  const dashboardStats = useMemo(() => ({
    totalTrains: 13,
    activeBookings: 5,
    totalRevenue: 45000,
    averageSpeed: 75,
    onTimePercentage: 92,
    popularRoutes: [
      { source: 'New Delhi', destination: 'Mumbai Central', bookings: 156, rating: 4.5 },
      { source: 'Mumbai Central', destination: 'New Delhi', bookings: 142, rating: 4.3 },
      { source: 'Kolkata', destination: 'New Delhi', bookings: 98, rating: 4.2 },
      { source: 'Chennai Central', destination: 'Bangalore City', bookings: 87, rating: 4.1 },
      { source: 'New Delhi', destination: 'Ahmedabad Junction', bookings: 76, rating: 4.4 }
    ],
    recentBookings: [
      { id: '1', trainNumber: '12951', source: 'New Delhi', destination: 'Mumbai Central', status: 'confirmed' as const, amount: 2500 },
      { id: '2', trainNumber: '12213', source: 'New Delhi', destination: 'Howrah Junction', status: 'pending' as const, amount: 1800 },
      { id: '3', trainNumber: '12004', source: 'New Delhi', destination: 'Lucknow Charbagh', status: 'confirmed' as const, amount: 1200 }
    ]
  }), []);

  const [customerErrors, setCustomerErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  function validateCustomerFields(next = customer) {
    const errs: { name?: string; email?: string; phone?: string } = {};
    if (!next.name || next.name.trim().length < 2) errs.name = 'Enter at least 2 characters';
    const emailCandidate = next.email || passengers[0]?.email || '';
    if (!/.+@.+\..+/.test(emailCandidate)) errs.email = 'Enter a valid email';
    const phoneCandidate = (next.phone || passengers[0]?.contactNumber || '').trim();
    if (!/^\d{10}$/.test(phoneCandidate)) errs.phone = 'Enter a 10-digit phone number';
    return errs;
  }

  function setCustomerField(field: 'name'|'email'|'phone', value: string) {
    const next = { ...customer, [field]: value };
    setCustomer(next);
    setCustomerErrors(validateCustomerFields(next));
  }

  function validateCustomer(): string | null {
    const errs = validateCustomerFields();
    setCustomerErrors(errs);
    const first = Object.values(errs)[0];
    return first || null;
  }

  const canProceedToPassenger = selectedSeatIds.length > 0 &&
    !validateCustomerFields().name && !validateCustomerFields().email && !validateCustomerFields().phone;

  useEffect(() => {
    let active = true;
    setLoadingEvents(true);
    setEventsError(null);
    const id = setTimeout(() => {
      if (searchMode === 'advanced') {
        // Use advanced search API
        const params = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            const k = key === 'journeyDate' ? 'date' : key;
            params.set(k, value.toString());
          }
        });
        const qs = params.toString();
        apiGet<EventDto[]>(`/api/train-search/advanced${qs ? `?${qs}` : ''}`)
          .then((data) => { if (active) setEvents(data); })
          .catch((err) => { if (active) setEventsError(err.message || 'Failed to load trains'); })
          .finally(() => { if (active) setLoadingEvents(false); });
      } else {
        // Use basic search
        const params = new URLSearchParams();
        if (source && destination) { 
          params.set('source', source); 
          params.set('destination', destination); 
        } else if (query) { 
          params.set('q', query); 
        }
        const qs = params.toString();
        apiGet<EventDto[]>(`/api/events${qs ? `?${qs}` : ''}`)
          .then((data) => { if (active) setEvents(data); })
          .catch((err) => { if (active) setEventsError(err.message || 'Failed to load trains'); })
          .finally(() => { if (active) setLoadingEvents(false); });
      }
    }, 300);
    return () => { active = false; clearTimeout(id); };
  }, [query, source, destination, searchMode, searchFilters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');
    if (eventIdParam && events.length > 0) {
      const found = events.find(e => String(e.id) === eventIdParam);
      if (found) setSelectedEvent(found);
    }
  }, [events]);

  useEffect(() => {
    if (!selectedEvent) return;
    let active = true;
    setLoadingCoaches(true);
    setCoachesError(null);
    apiGet<CoachDto[]>(`/api/events/${selectedEvent.id}/coaches`)
      .then((data) => {
        if (!active) return;
        setCoaches(data);
        if (data.length > 0) {
          if (!data.find(c => c.id === selectedCoachId)) { setSelectedCoachId(data[0].id); }
        } else {
          setSelectedCoachId(null);
          setLoadingSeats(true);
          setSeatsError(null);
          apiGet<SeatDto[]>(`/api/events/${selectedEvent.id}/seats`)
            .then((ss) => { if (active) setSeats(ss); })
            .catch((err) => { if (active) setSeatsError(err.message || 'Failed to load seats'); })
            .finally(() => { if (active) setLoadingSeats(false); });
        }
      })
      .catch((err) => { if (active) setCoachesError(err.message || 'Failed to load coaches'); })
      .finally(() => { if (active) setLoadingCoaches(false); });
    return () => { active = false; };
  }, [selectedEvent?.id]);

  useEffect(() => {
    if (!selectedCoachId) return;
    let active = true;
    setLoadingSeats(true);
    setSeatsError(null);
    apiGet<SeatDto[]>(`/api/events/coaches/${selectedCoachId}/seats`)
      .then((data) => { if (active) setSeats(data); })
      .catch((err) => { if (active) setSeatsError(err.message || 'Failed to load seats'); })
      .finally(() => { if (active) setLoadingSeats(false); });
    return () => { active = false; };
  }, [selectedCoachId]);

  useEffect(() => {
    if (!selectedCoachId) return;
    const timer = setInterval(() => { apiGet<SeatDto[]>(`/api/events/coaches/${selectedCoachId}/seats`).then(setSeats).catch(() => {}); }, 5000);
    return () => clearInterval(timer);
  }, [selectedCoachId]);

  useEffect(() => {
    if (!selectedEvent) return;
    let cancelled = false;
    const es = new EventSource(`/api/events/${selectedEvent.id}/seats/stream`);
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (!msg || !msg.data) return;
        const updates: any[] = msg.data;
        setSeats((prev) => {
          // Merge updates into existing seats; if init, replace
          if (msg.type === 'init') return updates as any;
          const map = new Map(prev.map(s => [s.id, s] as const));
          for (const u of updates) {
            const existing = map.get(u.id);
            if (existing) { map.set(u.id, { ...existing, status: u.status }); }
          }
          return Array.from(map.values());
        });
      } catch {}
    };
    es.onerror = () => { if (!cancelled) es.close(); };
    return () => { cancelled = true; es.close(); };
  }, [selectedEvent?.id]);

  const total = useMemo(() => { if (!selectedEvent) return 0; return selectedSeatIds.length * selectedEvent.seatPrice; }, [selectedSeatIds, selectedEvent]);
  
  function toggleSeat(id: number) { 
    setSelectedSeatIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); 
  }

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setJourneyDate(filters.journeyDate);
    setSearchMode('advanced');
    setShowDashboard(false);
  };

  const handleClearSearch = () => {
    setSearchFilters({
      source: '',
      destination: '',
      journeyDate: '',
      trainType: '',
      trainCategory: '',
      hasAC: null,
      trainOperator: '',
      minSpeed: 0,
      maxFare: 10000,
      classType: '',
      sortBy: 'startTime',
      sortOrder: 'asc'
    });
    setSearchMode('basic');
    setSource('');
    setDestination('');
    setClassType('');
    setJourneyDate('');
    setQuery('');
    setShowDashboard(true);
  };

  const handleViewTrainDetails = (train: EventDto) => {
    console.log('View train details:', train);
  };

  const handleProceedToPassengerDetails = () => {
    if (selectedSeatIds.length === 0) {
      setToast('Please select at least one seat');
      return;
    }
    const err = validateCustomer();
    if (err) { setToast(err); return; }
    setShowPassengerForm(true);
    setShowBookingSummary(false);
    setBookingStep(1);
  };

  const handlePassengersChange = (newPassengers: PassengerInfo[]) => {
    setPassengers(newPassengers);
  };

  const handleProceedToBookingSummary = () => {
    if (passengers.length !== selectedSeatIds.length) {
      setToast(`Please add details for all ${selectedSeatIds.length} passengers`);
      return;
    }
    // Basic passenger validation
    for (const p of passengers) {
      if (!p.name || p.name.trim().length < 2) { setToast('Enter valid passenger names'); return; }
      if (!/^\d{1,3}$/.test(p.age) || parseInt(p.age) < 1 || parseInt(p.age) > 120) { setToast('Enter valid ages (1-120)'); return; }
      if (!p.gender) { setToast('Select gender for all passengers'); return; }
      if (!p.idProofType || !p.idProofNumber) { setToast('Provide ID proof details'); return; }
      if (!/^\d{10}$/.test((p.contactNumber || '').trim())) { setToast('Enter 10-digit contact numbers'); return; }
      if (p.email && !/.+@.+\..+/.test(p.email)) { setToast('Enter valid emails'); return; }
    }
    setShowPassengerForm(false);
    setShowBookingSummary(true);
    setBookingStep(2);
  };

  const handleProceedToPayment = () => {
    if (!getToken()) { 
      setToast('Please login or register first'); 
      return; 
    }
    createBooking();
  };

  const handleAddToWaitlist = () => {
    if (!getToken()) { 
      setToast('Please login or register first'); 
      return; 
    }
    setToast('Added to waitlist successfully');
  };

  const resetBookingFlow = () => {
    setSelectedSeatIds([]);
    setPassengers([]);
    setShowPassengerForm(false);
    setShowBookingSummary(false);
    setBookingStep(0);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'book':
        setShowDashboard(false);
        break;
      case 'history':
        navigate('/history');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'help':
        navigate('/help');
        break;
      default:
        break;
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSearchClick = () => {
    setShowDashboard(false);
  };

  async function createBooking() {
    if (!selectedEvent || selectedSeatIds.length === 0 || passengers.length === 0) return;
    if (!journeyDate) { setToast('Please select a journey date'); return; }
    const err = validateCustomer();
    if (err) { setToast(err); return; }
    
    setCreating(true);
    try {
      const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
      
      const request = {
        eventId: selectedEvent.id,
        seatIds: selectedSeatIds,
        customerName: customer.name || passengers[0].name,
        customerEmail: customer.email || passengers[0].email,
        customerPhone: customer.phone || passengers[0].contactNumber,
        journeyDate: journeyDate,
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender,
          idProofType: p.idProofType,
          idProofNumber: p.idProofNumber,
          passengerType: p.passengerType,
          contactNumber: p.contactNumber,
          email: p.email
        }))
      };

      const resp = await apiPost<any, CreateBookingResponse>('/api/bookings', request);
      await launchRazorpay(resp);
    } catch (e: any) { 
      if (e?.code === 'VALIDATION_ERROR' && e?.details) {
        const first = Object.values(e.details as any)[0] as string;
        setToast(first || e.message || 'Validation failed');
      } else {
        setToast(e.message || 'Failed to create booking'); 
      }
    } finally { 
      setCreating(false); 
    }
  }

  async function launchRazorpay(data: CreateBookingResponse) {
    // Dev-mode bypass: if Razorpay SDK not available, auto-verify
    const devMode = !(window as any).Razorpay;
    if (devMode) {
      try {
        const resp: any = await apiPost('/api/bookings/verify', {
          bookingId: data.bookingId,
          razorpayOrderId: data.orderId,
          razorpayPaymentId: 'pay_test_123',
          razorpaySignature: 'sig_test_123',
        } as any);
        setToast(`Booking confirmed! PNR: ${resp?.pnrNumber || 'N/A'}`);
        setConfetti(true);
        navigate(`/ticket/${data.bookingId}`);
        return;
      } catch (e: any) {
        if (e?.code === 'VALIDATION_ERROR' && e?.details) {
          const first = Object.values(e.details as any)[0] as string;
          setToast(first || e.message || 'Validation failed');
        } else {
          setToast(e.message || 'Payment verification failed');
        }
        return;
      }
    }

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
      name: 'IRCTC Pro - Train Ticket Booking', 
      description: `Train: ${selectedEvent?.trainNumber} - ${selectedEvent?.name}`, 
      order_id: data.orderId, 
      prefill: { 
        name: customer.name || passengers[0]?.name, 
        email: customer.email || passengers[0]?.email, 
        contact: customer.phone || passengers[0]?.contactNumber 
      }, 
      modal: { ondismiss: () => setToast('Payment dismissed') }, 
      handler: async (response: any) => { 
        const verifyResp: any = await apiPost('/api/bookings/verify', { 
          bookingId: data.bookingId, 
          razorpayOrderId: response.razorpay_order_id, 
          razorpayPaymentId: response.razorpay_payment_id, 
          razorpaySignature: response.razorpay_signature, 
        }); 
        setToast(`Booking confirmed! PNR: ${verifyResp?.pnrNumber || 'N/A'}`);
        setConfetti(true);
        navigate(`/ticket/${data.bookingId}`); 
      } 
    } as any;
    
    const rz = new (window as any).Razorpay(options); 
    rz.open();
  }

  const steps = ['Select Train & Seats', 'Passenger Details', 'Booking Summary & Payment'];

  return (
    <ThemeProvider theme={professionalTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          {/* Professional Header */}
          <ProfessionalHeader
            onSearchClick={handleSearchClick}
            onThemeToggle={handleThemeToggle}
            isDarkMode={isDarkMode}
          />

          <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Dashboard */}
            {showDashboard && (
              <ProfessionalDashboard
                stats={dashboardStats}
                onQuickAction={handleQuickAction}
              />
            )}

            {/* Search Section */}
            {!showDashboard && (
              <>
                {/* Interactive Search */}
                <InteractiveTrainSearch
                  onSearch={handleAdvancedSearch}
                  onClear={handleClearSearch}
                  filters={searchFilters}
                  loading={loadingEvents}
                />

                {/* Booking Progress Stepper */}
                {selectedEvent && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Stepper activeStep={bookingStep} alternativeLabel>
                        {steps.map((label) => (
                          <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </CardContent>
                  </Card>
                )}

                {loadingEvents && (<Stack gap={1} mb={2}><Skeleton variant="rounded" height={36} /><Skeleton variant="rounded" height={36} width="80%" /><Skeleton variant="rounded" height={36} width="60%" /></Stack>)}
                {eventsError && <Alert severity="error">{eventsError}</Alert>}
                
                {/* Results Summary */}
                {events.length > 0 && !showPassengerForm && !showBookingSummary && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Found {events.length} train(s)
                    </Typography>
                  </Box>
                )}

                {/* Train Results */}
                {!showPassengerForm && !showBookingSummary && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
                    {events.filter(ev => !classType || (ev.classType || '').toUpperCase() === classType.toUpperCase()).map((ev) => (
                      <EnhancedTrainCard
                        key={ev.id}
                        train={ev}
                        isSelected={selectedEvent?.id === ev.id}
                        onSelect={(t) => setSelectedEvent(t as EventDto)}
                        onViewDetails={(t) => handleViewTrainDetails(t as EventDto)}
                      />
                    ))}
                  </Box>
                )}

                {/* Passenger Details Form */}
                {showPassengerForm && selectedEvent && (
                  <>
                    <PassengerDetailsForm
                      numberOfSeats={selectedSeatIds.length}
                      onPassengersChange={handlePassengersChange}
                      passengers={passengers}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button variant="contained" size="large" onClick={handleProceedToBookingSummary} disabled={passengers.length !== selectedSeatIds.length}>
                        Continue to Booking Summary
                      </Button>
                    </Box>
                  </>
                )}

                {/* Booking Summary */}
                {showBookingSummary && selectedEvent && (
                  <BookingSummary
                    train={selectedEvent}
                    selectedSeats={seats.filter(s => selectedSeatIds.includes(s.id)).map(s => ({
                      id: s.id,
                      rowLabel: s.rowLabel,
                      seatNumber: s.seatNumber,
                      coachCode: s.coach?.code || 'N/A',
                      classType: s.coach?.classType || 'N/A'
                    }))}
                    passengers={passengers}
                    journeyDate={journeyDate}
                    onProceedToPayment={handleProceedToPayment}
                    onAddToWaitlist={handleAddToWaitlist}
                  />
                )}

                {/* Train Selection and Seat Booking */}
                {selectedEvent && !showPassengerForm && !showBookingSummary && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" fontWeight={700} gutterBottom>{selectedEvent.trainNumber ? `${selectedEvent.trainNumber} — ${selectedEvent.name}` : selectedEvent.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>{(selectedEvent.source || selectedEvent.venue)} → {selectedEvent.destination || 'Destination'} • Class: {selectedEvent.classType || 'General'}</Typography>
                      {selectedEvent.description && <Typography variant="body2" gutterBottom>{selectedEvent.description}</Typography>}
                      
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 1 }}>
                        <Chip color="success" variant="outlined" label="Selected" />
                        <Chip variant="outlined" label="Unavailable" />
                      </Stack>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>Price: ₹{selectedEvent.seatPrice.toFixed(2)} | Selected: {selectedSeatIds.length} | Total: ₹{total.toFixed(2)}</Typography>

                      {coachesError && <Alert severity="error">{coachesError}</Alert>}
                      {seatsError && <Alert severity="error">{seatsError}</Alert>}
                      
                      <Box sx={{ mb: 1, overflowX: 'auto' }}>
                        <Stack direction="row" spacing={1}>
                          {coaches.map(c => (
                            <Button key={c.id} variant={selectedCoachId === c.id ? 'contained' : 'outlined'} onClick={() => setSelectedCoachId(c.id)}>
                              {c.code} • {c.classType} • {c.available}/{c.total}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                      
                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip size="small" color="primary" label={`AC: ${coaches.filter(c => classCategoryOf(c.classType) === 'AC').reduce((s, c) => s + c.available, 0)}`} />
                        <Chip size="small" label={`Sleeper: ${coaches.filter(c => classCategoryOf(c.classType) === 'Sleeper').reduce((s, c) => s + c.available, 0)}`} />
                        <Chip size="small" label={`General: ${coaches.filter(c => classCategoryOf(c.classType) === 'General').reduce((s, c) => s + c.available, 0)}`} />
                        {coaches.length === 0 && <Chip size="small" color="warning" label="Showing seats for entire train (no coach data)" />}
                      </Stack>

                      {loadingSeats && (<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 1 }}>{Array.from({ length: 24 }).map((_, i) => (<Skeleton key={i} variant="rounded" height={40} />))}</Box>)}
                      
                      <Box className="fade-up" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: 1, mb: 2 }}>
                        {seats.map((s) => {
                          const disabled = s.status !== 'AVAILABLE';
                          const active = selectedSeatIds.includes(s.id);
                          return (
                            <Button key={s.id} fullWidth variant={active ? 'contained' : 'outlined'} color={active ? 'success' : 'inherit'} disabled={disabled} sx={{ minWidth: 0, px: 0 }} onClick={() => toggleSeat(s.id)}>
                              {formatSeat(s)}
                            </Button>
                          );
                        })}
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Customer Details */}
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 2 }}>
                        <TextField label="Name" value={customer.name} onChange={(e) => setCustomerField('name', e.target.value)} fullWidth error={!!customerErrors.name} helperText={customerErrors.name} />
                        <TextField label="Email" type="email" value={customer.email} onChange={(e) => setCustomerField('email', e.target.value)} fullWidth error={!!customerErrors.email} helperText={customerErrors.email} />
                        <TextField label="Phone" value={customer.phone} onChange={(e) => setCustomerField('phone', e.target.value)} fullWidth error={!!customerErrors.phone} helperText={customerErrors.phone} />
                      </Stack>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          onClick={handleProceedToPassengerDetails}
                          disabled={selectedSeatIds.length === 0 || !canProceedToPassenger}
                          size="large"
                          sx={{ minWidth: 200 }}
                        >
                          Continue to Passenger Details ({selectedSeatIds.length} seats)
                        </Button>
                        
                        <Button
                          variant="outlined"
                          onClick={resetBookingFlow}
                          size="large"
                        >
                          Reset Selection
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Back to Dashboard Button */}
            {!showDashboard && (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowDashboard(true)}
                  startIcon={<TrainIcon />}
                  size="large"
                >
                  Back to Dashboard
                </Button>
              </Box>
            )}
          </Container>

          {toast && (<Box position="fixed" right={16} bottom={16}><Alert severity="info" onClose={() => setToast(null)}>{toast}</Alert></Box>)}
          <Confetti fire={confetti} />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
