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
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Autocomplete,
  Switch,
  FormControlLabel,
  Slider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Train as TrainIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import AnimatedClouds from './components/AnimatedClouds';
import PulseIcons from './components/PulseIcons';
import GradientBanner from './components/GradientBanner';
import DottedLine from './components/DottedLine';
import BouncyCta from './components/BouncyCta';
import Confetti from './components/Confetti';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface EventDto { id: number; name: string; trainNumber?: string; source?: string; destination?: string; venue: string; description?: string; startTime: string; endTime: string; seatPrice: number; classType?: string; }
interface SeatDto { id: number; rowLabel: string; seatNumber: number; status: 'AVAILABLE' | 'RESERVED' | 'BOOKED'; }
interface CoachDto { id: number; code: string; classType: string; available: number; reserved: number; booked: number; total: number; }
interface CreateBookingResponse { bookingId: number; orderId: string; razorpayKeyId: string; amount: number; currency: string; }

function formatSeat(seat: SeatDto) { return `${seat.rowLabel}${seat.seatNumber}`; }
function classLabelToAcType(classType?: string) { if (!classType) return 'General'; const t = classType.toUpperCase(); return (['1A','2A','3A','EC','CC'].includes(t)) ? 'AC' : 'Non-AC'; }
function classCategoryOf(classType?: string) { if (!classType) return 'General'; const t = classType.toUpperCase(); if (['1A','2A','3A','EC','CC'].includes(t)) return 'AC'; if (['SL'].includes(t)) return 'Sleeper'; if (['GEN','2S'].includes(t)) return 'General'; return 'General'; }

// Major station list for professional autocomplete UX
const MAJOR_STATIONS = [
  { code: 'NDLS', name: 'New Delhi' },
  { code: 'BCT', name: 'Mumbai Central' },
  { code: 'HWH', name: 'Howrah Junction' },
  { code: 'MAS', name: 'Chennai Central' },
  { code: 'SBC', name: 'Bangalore City' },
  { code: 'ADI', name: 'Ahmedabad Junction' },
  { code: 'PNBE', name: 'Patna Junction' },
  { code: 'LKO', name: 'Lucknow Junction' },
  { code: 'JAI', name: 'Jaipur Junction' },
  { code: 'HYB', name: 'Hyderabad Deccan' },
];

export default function App() {
  const navigate = useNavigate();

  // Tabs and search state
  const [searchTab, setSearchTab] = useState(0);
  const [query, setQuery] = useState('');
  const [sourceCode, setSourceCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [journeyDate, setJourneyDate] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Advanced filters
  const [classType, setClassType] = useState('');
  const [sortBy, setSortBy] = useState<'departure' | 'arrival' | 'price'>('departure');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [favorites, setFavorites] = useState<number[]>([]);

  // Events/trains
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  // Coaches/seats
  const [coaches, setCoaches] = useState<CoachDto[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coachesError, setCoachesError] = useState<string | null>(null);
  const [selectedCoachId, setSelectedCoachId] = useState<number | null>(null);
  const [seats, setSeats] = useState<SeatDto[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatsError, setSeatsError] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  // Checkout
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  // Resolve station names for API
  const sourceName = MAJOR_STATIONS.find(s => s.code === sourceCode)?.name || '';
  const destinationName = MAJOR_STATIONS.find(s => s.code === destinationCode)?.name || '';

  // Fetch events from backend
  useEffect(() => {
    let active = true;
    setLoadingEvents(true);
    setEventsError(null);
    const id = setTimeout(() => {
      const params = new URLSearchParams();
      if (sourceName && destinationName) { params.set('source', sourceName); params.set('destination', destinationName); }
      else if (query) { params.set('q', query); }
      const qs = params.toString();
      apiGet<EventDto[]>(`/api/events${qs ? `?${qs}` : ''}`)
        .then((data) => { if (!active) return; setEvents(data); })
        .catch((err) => { if (!active) return; setEventsError(err.message || 'Failed to load trains'); })
        .finally(() => { if (!active) return; setLoadingEvents(false); });
    }, 300);
    return () => { active = false; clearTimeout(id); };
  }, [query, sourceName, destinationName]);

  // Pre-select via URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdParam = params.get('eventId');
    if (eventIdParam && events.length > 0) {
      const found = events.find(e => String(e.id) === eventIdParam);
      if (found) setSelectedEvent(found);
    }
  }, [events]);

  // Load coaches or fallback to overall seats
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

  // Load seats for coach
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

  // Poll seats for live updates
  useEffect(() => {
    if (!selectedCoachId) return;
    const timer = setInterval(() => { apiGet<SeatDto[]>(`/api/events/coaches/${selectedCoachId}/seats`).then(setSeats).catch(() => {}); }, 5000);
    return () => clearInterval(timer);
  }, [selectedCoachId]);

  // Filtered events by date, class, price and sort
  const filteredEvents = useMemo(() => {
    let list = events.slice();

    if (journeyDate) {
      list = list.filter(ev => dayjs(ev.startTime).format('YYYY-MM-DD') === journeyDate);
    }

    if (classType) {
      list = list.filter(ev => (ev.classType || '').toUpperCase() === classType.toUpperCase());
    }

    // Price range filter
    list = list.filter(ev => ev.seatPrice >= priceRange[0] && ev.seatPrice <= priceRange[1]);

    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'arrival':
          return dayjs(a.endTime).valueOf() - dayjs(b.endTime).valueOf();
        case 'price':
          return a.seatPrice - b.seatPrice;
        case 'departure':
        default:
          return dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf();
      }
    });

    return list;
  }, [events, journeyDate, classType, priceRange, sortBy]);

  const total = useMemo(() => { if (!selectedEvent) return 0; return selectedSeatIds.length * selectedEvent.seatPrice; }, [selectedSeatIds, selectedEvent]);
  function toggleSeat(id: number) { setSelectedSeatIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]); }

  // Favorites
  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  async function createBooking() {
    if (!selectedEvent || selectedSeatIds.length === 0) return;
    if (!getToken()) { setToast('Please login or register first'); return; }
    setCreating(true);
    try {
      const resp = await apiPost<any, CreateBookingResponse>('/api/bookings', { eventId: selectedEvent.id, seatIds: selectedSeatIds, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone });
      await launchRazorpay(resp);
    } catch (e: any) { setToast(e.message || 'Failed to create booking'); } finally { setCreating(false); }
  }

  async function launchRazorpay(data: CreateBookingResponse) {
    if (!(window as any).Razorpay) {
      await new Promise<void>((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Failed to load Razorpay')); document.body.appendChild(script); });
    }
    const options = { key: data.razorpayKeyId, amount: Math.round(data.amount * 100), currency: data.currency, name: 'IRCTC Train Booking', description: 'Seat booking', order_id: data.orderId, prefill: { name: customer.name, email: customer.email, contact: customer.phone }, modal: { ondismiss: () => setToast('Payment dismissed') }, handler: async (response: any) => { await apiPost('/api/bookings/verify', { bookingId: data.bookingId, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature, }); navigate(`/ticket/${data.bookingId}`); } } as any;
    const rz = new (window as any).Razorpay(options); rz.open();
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center">🚂 IRCTC Train Booking</Typography>
          <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>Search by source/destination or train name/number. Filter by date, class, and price.</Typography>
          <AnimatedClouds />
          <PulseIcons />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={searchTab} onChange={(_, v) => setSearchTab(v)} sx={{ mb: 2 }}>
            <Tab label="Quick Search" icon={<SearchIcon />} />
            <Tab label="Advanced Search" icon={<FilterIcon />} />
            <Tab label="Popular Routes" icon={<TrainIcon />} />
          </Tabs>

          {searchTab === 0 && (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <Autocomplete
                options={MAJOR_STATIONS}
                getOptionLabel={(o) => `${o.name} (${o.code})`}
                renderInput={(p) => <TextField {...p} label="From Station" />}
                value={MAJOR_STATIONS.find(s => s.code === sourceCode) || null}
                onChange={(_, v) => setSourceCode(v?.code || '')}
                sx={{ minWidth: { xs: '100%', md: 260 } }}
              />
              <Autocomplete
                options={MAJOR_STATIONS}
                getOptionLabel={(o) => `${o.name} (${o.code})`}
                renderInput={(p) => <TextField {...p} label="To Station" />}
                value={MAJOR_STATIONS.find(s => s.code === destinationCode) || null}
                onChange={(_, v) => setDestinationCode(v?.code || '')}
                sx={{ minWidth: { xs: '100%', md: 260 } }}
              />
              <DatePicker 
                label="Journey Date" 
                value={journeyDate ? dayjs(journeyDate) : null} 
                onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')} 
                slotProps={{ textField: { sx: { minWidth: { xs: '100%', md: 200 } } } }} 
              />
              <TextField label="Search trains or stations" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ minWidth: { xs: '100%', md: 280 }, flex: 1 }} />
              <Button variant="contained" size="large" startIcon={<SearchIcon />} sx={{ minWidth: { xs: '100%', md: 160 } }}>Search</Button>
            </Stack>
          )}

          {searchTab === 1 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Stack spacing={2}>
                  <Autocomplete
                    options={MAJOR_STATIONS}
                    getOptionLabel={(o) => `${o.name} (${o.code})`}
                    renderInput={(p) => <TextField {...p} label="From Station" />}
                    value={MAJOR_STATIONS.find(s => s.code === sourceCode) || null}
                    onChange={(_, v) => setSourceCode(v?.code || '')}
                  />
                  <Autocomplete
                    options={MAJOR_STATIONS}
                    getOptionLabel={(o) => `${o.name} (${o.code})`}
                    renderInput={(p) => <TextField {...p} label="To Station" />}
                    value={MAJOR_STATIONS.find(s => s.code === destinationCode) || null}
                    onChange={(_, v) => setDestinationCode(v?.code || '')}
                  />
                  <DatePicker 
                    label="Journey Date" 
                    value={journeyDate ? dayjs(journeyDate) : null} 
                    onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')} 
                    slotProps={{ textField: { fullWidth: true } }} 
                  />
                </Stack>
              </Box>
              <Box>
                <Stack spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select value={classType} onChange={(e) => setClassType(e.target.value)} label="Class">
                      <MenuItem value="">All Classes</MenuItem>
                      <MenuItem value="1A">First AC</MenuItem>
                      <MenuItem value="2A">Second AC</MenuItem>
                      <MenuItem value="3A">Third AC</MenuItem>
                      <MenuItem value="SL">Sleeper</MenuItem>
                      <MenuItem value="CC">Chair Car</MenuItem>
                      <MenuItem value="2S">Second Sitting</MenuItem>
                      <MenuItem value="GEN">General</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} label="Sort By">
                      <MenuItem value="departure">Departure Time</MenuItem>
                      <MenuItem value="arrival">Arrival Time</MenuItem>
                      <MenuItem value="price">Price</MenuItem>
                    </Select>
                  </FormControl>
                  <Box>
                    <Typography gutterBottom>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</Typography>
                    <Slider value={priceRange} onChange={(_, v) => setPriceRange(v as any)} valueLabelDisplay="auto" min={0} max={10000} step={50} />
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}

          {searchTab === 2 && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              {[
                { from: 'NDLS', to: 'BCT', name: 'Delhi - Mumbai' },
                { from: 'NDLS', to: 'HWH', name: 'Delhi - Kolkata' },
                { from: 'BCT', to: 'MAS', name: 'Mumbai - Chennai' },
                { from: 'NDLS', to: 'SBC', name: 'Delhi - Bangalore' }
              ].map((route) => (
                <Box key={route.name}>
                  <Card 
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                    onClick={() => { setSourceCode(route.from); setDestinationCode(route.to); setSearchTab(0); }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{route.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {MAJOR_STATIONS.find(s => s.code === route.from)?.name} → {MAJOR_STATIONS.find(s => s.code === route.to)?.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {loadingEvents && (<Stack gap={1} mb={2}><Skeleton variant="rounded" height={36} /><Skeleton variant="rounded" height={36} width="80%" /><Skeleton variant="rounded" height={36} width="60%" /></Stack>)}
      {eventsError && <Alert severity="error">{eventsError}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 2 }}>
        {filteredEvents.map((ev) => (
          <Card key={ev.id} className="parallax-card" variant={selectedEvent?.id === ev.id ? 'outlined' : undefined} sx={{ borderColor: selectedEvent?.id === ev.id ? 'primary.main' : undefined }}>
            <CardActionArea onClick={() => { setSelectedEvent(ev); setSelectedSeatIds([]); }}>
              <CardContent>
                <Stack gap={0.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={700}>{ev.trainNumber ? `${ev.trainNumber} — ${ev.name}` : ev.name}</Typography>
                    <Tooltip title={favorites.includes(ev.id) ? 'Remove from favorites' : 'Add to favorites'}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleFavorite(ev.id); }}>
                        {favorites.includes(ev.id) ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{ev.source || ev.venue} → {ev.destination || 'Destination'}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" label={`Dep: ${new Date(ev.startTime).toLocaleString()}`} />
                    <Chip size="small" label={`Arr: ${new Date(ev.endTime).toLocaleString()}`} />
                    <Chip size="small" color={classLabelToAcType(ev.classType) === 'AC' ? 'primary' : 'default'} label={`${ev.classType || 'GEN'} • ${classLabelToAcType(ev.classType)}`} />
                    <Chip size="small" color="success" label={`Fare: ₹${ev.seatPrice.toFixed(2)}`} />
                  </Stack>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {selectedEvent && (
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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <TextField label="Name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} fullWidth />
              <TextField label="Email" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} fullWidth />
              <TextField label="Phone" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} fullWidth />
              <BouncyCta onClick={() => { setConfetti(true); createBooking(); setTimeout(() => setConfetti(false), 1500); }} disabled={selectedSeatIds.length === 0 || creating}>{creating ? 'Creating…' : 'Pay with Razorpay'}</BouncyCta>
            </Stack>
          </CardContent>
        </Card>
      )}

      {toast && (<Box position="fixed" right={16} bottom={16}><Alert severity="info" onClose={() => setToast(null)}>{toast}</Alert></Box>)}
      <Confetti fire={confetti} />
    </Box>
  );
}
