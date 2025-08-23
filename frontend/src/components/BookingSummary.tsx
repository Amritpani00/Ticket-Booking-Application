import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Stack,
  Button,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Train as TrainIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { apiGet } from '../api';

interface TrainInfo {
  id: number;
  name: string;
  trainNumber?: string;
  source?: string;
  destination?: string;
  startTime: string;
  endTime: string;
  seatPrice: number;
  classType?: string;
  platformNumber?: string;
  journeyDurationMinutes?: number;
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

interface SeatInfo {
  id: number;
  rowLabel: string;
  seatNumber: number;
  coachCode: string;
  classType: string;
}

interface FareBreakdown {
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  tatkalCharge: number;
  gst: number;
  dynamicPricing: number;
  farePerPassenger: number;
  totalFare: number;
}

interface BookingSummaryProps {
  train: TrainInfo;
  selectedSeats: SeatInfo[];
  passengers: PassengerInfo[];
  journeyDate: string;
  onProceedToPayment: () => void;
  onAddToWaitlist: () => void;
}

export default function BookingSummary({
  train,
  selectedSeats,
  passengers,
  journeyDate,
  onProceedToPayment,
  onAddToWaitlist
}: BookingSummaryProps) {
  const [fareBreakdown, setFareBreakdown] = useState<FareBreakdown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay'>('razorpay');
  const [scriptReady, setScriptReady] = useState<boolean>(Boolean((window as any).Razorpay));

  useEffect(() => {
    if (!(window as any).Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptReady(true);
      script.onerror = () => setError('Failed to load payment SDK. Please retry.');
      document.body.appendChild(script);
    } else {
      setScriptReady(true);
    }
  }, []);

  useEffect(() => {
    if (selectedSeats.length > 0 && passengers.length > 0) {
      fetchFareBreakdown();
    }
  }, [selectedSeats, passengers]);

  const fetchFareBreakdown = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet<FareBreakdown>(`/api/train-search/fare-enquiry?eventId=${train.id}&classType=${selectedSeats[0].classType}&journeyDate=${journeyDate}&numberOfPassengers=${passengers.length}`);
      
      setFareBreakdown(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch fare details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJourneyDuration = () => {
    if (train.journeyDurationMinutes) {
      const hours = Math.floor(train.journeyDurationMinutes / 60);
      const minutes = train.journeyDurationMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
    return 'N/A';
  };

  const getClassTypeLabel = (classType: string) => {
    const labels: { [key: string]: string } = {
      '1A': 'First AC',
      '2A': 'Second AC',
      '3A': 'Third AC',
      'SL': 'Sleeper',
      '2S': 'Second Sitting',
      'CC': 'Chair Car',
      'EC': 'Executive Chair',
      'GEN': 'General'
    };
    return labels[classType] || classType;
  };

  const getPassengerTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'Adult': 'Adult',
      'Child': 'Child (5-12 years)',
      'Senior Citizen': 'Senior Citizen (60+)',
      'Student': 'Student'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Booking Summary
        </Typography>

        {/* Train Information */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <TrainIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              {train.trainNumber || 'N/A'} — {train.name}
            </Typography>
            
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>From:</strong> {train.source || 'TBD'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body1">
                      <strong>To:</strong> {train.destination || 'TBD'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              
              <Grid xs={12} md={6}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Departure:</strong> {formatTime(train.startTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body1">
                      <strong>Arrival:</strong> {formatTime(train.endTime)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Journey Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {formatDate(journeyDate)}
                </Typography>
              </Grid>
              
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {getJourneyDuration()}
                </Typography>
              </Grid>
              
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Class
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {train.classType ? getClassTypeLabel(train.classType) : 'N/A'}
                </Typography>
              </Grid>
              
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Platform
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {train.platformNumber || 'TBD'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Passenger Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Passenger Details ({passengers.length})
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Passenger</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>ID Proof</TableCell>
                    <TableCell>Contact</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {passengers.map((passenger, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {passenger.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{passenger.age} years</TableCell>
                      <TableCell>{passenger.gender}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getPassengerTypeLabel(passenger.passengerType)} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">
                          {passenger.idProofType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {passenger.idProofNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>{passenger.contactNumber}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Seat Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Seat Details ({selectedSeats.length})
            </Typography>
            
            <Grid container spacing={2}>
              {selectedSeats.map((seat, index) => (
                <Grid xs={6} md={3} key={seat.id}>
                  <Chip
                    label={`${seat.coachCode} - ${seat.rowLabel}${seat.seatNumber}`}
                    color="primary"
                    variant="outlined"
                    sx={{ width: '100%' }}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Fare Breakdown */}
        {fareBreakdown && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Fare Breakdown
              </Typography>
              
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Base Fare (per passenger):</Typography>
                      <Typography>₹{fareBreakdown.baseFare.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Reservation Charge:</Typography>
                      <Typography>₹{fareBreakdown.reservationCharge.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Superfast Charge:</Typography>
                      <Typography>₹{fareBreakdown.superfastCharge.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Tatkal Charge:</Typography>
                      <Typography>₹{fareBreakdown.tatkalCharge.toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>GST (5%):</Typography>
                      <Typography>₹{fareBreakdown.gst.toFixed(2)}</Typography>
                    </Box>
                    {fareBreakdown.dynamicPricing > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Dynamic Pricing:</Typography>
                        <Typography>₹{fareBreakdown.dynamicPricing.toFixed(2)}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                
                <Grid xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Total Amount
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      ₹{fareBreakdown.totalFare.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {passengers.length} passenger(s) × ₹{fareBreakdown.farePerPassenger.toFixed(2)} each
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Payment Section */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Payment
            </Typography>
            <Stack spacing={2}>
              <RadioGroup
                row
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
              >
                <FormControlLabel value="razorpay" control={<Radio />} label="Razorpay (UPI / Card / NetBanking)" />
                {/* Future methods can be enabled here */}
              </RadioGroup>
              {!scriptReady && (
                <Alert severity="info">Loading payment SDK…</Alert>
              )}
              {fareBreakdown && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Payable Now</Typography>
                  <Typography variant="h6" fontWeight={800}>₹{fareBreakdown.totalFare.toFixed(2)}</Typography>
                </Box>
              )}
              <Button
                variant="contained"
                size="large"
                onClick={onProceedToPayment}
                disabled={!fareBreakdown || passengers.length === 0}
                sx={{ minWidth: 200, alignSelf: 'center' }}
              >
                Pay Now
              </Button>
            </Stack>
          </CardContent>
        </Card>
        {/* Important Notes */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Important Notes:
          </Typography>
          <Typography variant="body2" component="div">
            • Please verify all passenger details before proceeding
            • Names must match exactly with ID proof documents
            • Keep your PNR number safe for future reference
            • Arrive at least 30 minutes before departure
            • Carry original ID proof documents during journey
            • Cancellation charges apply as per railway rules
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}