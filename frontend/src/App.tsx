import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from './api';
import { getToken } from './auth';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Skeleton, Stack, TextField, Typography, Tabs, Tab, Grid, Stepper, Step, StepLabel } from '@mui/material';
import AnimatedClouds from './components/AnimatedClouds';
import PulseIcons from './components/PulseIcons';
import GradientBanner from './components/GradientBanner';
import DottedLine from './components/DottedLine';
import BouncyCta from './components/BouncyCta';
import Confetti from './components/Confetti';
import AdvancedTrainSearch from './components/AdvancedTrainSearch';
import EnhancedTrainCard from './components/EnhancedTrainCard';
import PassengerDetailsForm from './components/PassengerDetailsForm';
import BookingSummary from './components/BookingSummary';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

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
interface CreateBookingResponse { bookingId: number; orderId: string; razorpayKeyId: string; amount: number; currency: string; pnrNumber: string; }

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
            params.set(key, value.toString());
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

  const total = useMemo(() => { if (!selectedEvent) return 0; return selectedSeatIds.length * selectedEvent.seatPrice; }, [selectedSeatIds, selectedEvent]);
  
  function toggleSeat(id: number) { 
    setSelectedSeatIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); 
  }

  const handleAdvancedSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setSearchMode('advanced');
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
  };

  const handleViewTrainDetails = (train: EventDto) => {
    // Navigate to train details page or show modal
    console.log('View train details:', train);
  };

  const handleProceedToPassengerDetails = () => {
    if (selectedSeatIds.length === 0) {
      setToast('Please select at least one seat');
      return;
    }
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
    // Add to waitlist logic
    setToast('Added to waitlist successfully');
  };

  const resetBookingFlow = () => {
    setSelectedSeatIds([]);
    setPassengers([]);
    setShowPassengerForm(false);
    setShowBookingSummary(false);
    setBookingStep(0);
  };

  async function createBooking() {
    if (!selectedEvent || selectedSeatIds.length === 0 || passengers.length === 0) return;
    
    setCreating(true);
    try {
      const selectedSeats = seats.filter(s => selectedSeatIds.includes(s.id));
      
      const request = {
        eventId: selectedEvent.id,
        seatIds: selectedSeatIds,
        customerName: customer.name || passengers[0].name,
        customerEmail: customer.email || passengers[0].email,
        customerPhone: customer.phone || passengers[0].contactNumber,
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
      setToast(e.message || 'Failed to create booking'); 
    } finally { 
      setCreating(false); 
    }
  }

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
      name: 'Train Ticket Booking', 
      description: `Train: ${selectedEvent?.trainNumber} - ${selectedEvent?.name}`, 
      order_id: data.orderId, 
      prefill: { 
        name: customer.name || passengers[0]?.name, 
        email: customer.email || passengers[0]?.email, 
        contact: customer.phone || passengers[0]?.contactNumber 
      }, 
      modal: { ondismiss: () => setToast('Payment dismissed') }, 
      handler: async (response: any) => { 
        await apiPost('/api/bookings/verify', { 
          bookingId: data.bookingId, 
          razorpayOrderId: response.razorpay_order_id, 
          razorpayPaymentId: response.razorpay_payment_id, 
          razorpaySignature: response.razorpay_signature, 
        }); 
        setToast(`Booking confirmed! PNR: ${data.pnrNumber}`);
        resetBookingFlow();
        navigate(`/ticket/${data.bookingId}`); 
      } 
    } as any;
    
    const rz = new (window as any).Razorpay(options); 
    rz.open();
  }

  const steps = ['Select Train & Seats', 'Passenger Details', 'Booking Summary & Payment'];

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>IRCTC-like Train Booking</Typography>
          <GradientBanner />
          <AnimatedClouds />
          <PulseIcons />
          <DottedLine />
          
          {/* Search Mode Tabs */}
          <Tabs 
            value={searchMode} 
            onChange={(_, newValue) => setSearchMode(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Basic Search" value="basic" />
            <Tab label="Advanced Search" value="advanced" />
          </Tabs>

          {searchMode === 'basic' ? (
            // Basic Search
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              <TextField label="From (source)" value={source} onChange={(e) => setSource(e.target.value)} sx={{ minWidth: { xs: '100%', md: 220 }, flex: 1 }} />
              <TextField label="To (destination)" value={destination} onChange={(e) => setDestination(e.target.value)} sx={{ minWidth: { xs: '100%', md: 220 }, flex: 1 }} />
              <Box sx={{ minWidth: { xs: '100%', md: 200 } }}>
                <DatePicker label="Journey date" value={journeyDate ? dayjs(journeyDate) : null} onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')} slotProps={{ textField: { fullWidth: true } }} />
              </Box>
              <TextField label="Class (e.g. 3A, SL)" value={classType} onChange={(e) => setClassType(e.target.value)} sx={{ minWidth: { xs: '100%', md: 160 } }} />
              <TextField label="Search trains or stations" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }} />
            </Stack>
          ) : (
            // Advanced Search
            <AdvancedTrainSearch
              onSearch={handleAdvancedSearch}
              onClear={handleClearSearch}
              filters={searchFilters}
            />
          )}
        </CardContent>
      </Card>

      {/* Booking Progress Stepper */}
      {selectedEvent && (
        <Card sx={{ mb: 2 }}>
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
              onSelect={setSelectedEvent}
              onViewDetails={handleViewTrainDetails}
            />
          ))}
        </Box>
      )}

      {/* Passenger Details Form */}
      {showPassengerForm && selectedEvent && (
        <PassengerDetailsForm
          numberOfSeats={selectedSeatIds.length}
          onPassengersChange={handlePassengersChange}
          passengers={passengers}
        />
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
              <TextField label="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} fullWidth />
              <TextField label="Email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} fullWidth />
              <TextField label="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} fullWidth />
            </Stack>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={handleProceedToPassengerDetails}
                disabled={selectedSeatIds.length === 0}
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

      {toast && (<Box position="fixed" right={16} bottom={16}><Alert severity="info" onClose={() => setToast(null)}>{toast}</Alert></Box>)}
      <Confetti fire={confetti} />
    </Box>
  );
}

export default App;
