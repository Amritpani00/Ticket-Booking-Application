import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Compare as CompareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Train as TrainIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

interface FareInfo {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: {
    code: string;
    name: string;
    fare: number;
    available: number;
    features: string[];
  }[];
}

interface Station {
  code: string;
  name: string;
  city: string;
}

const MAJOR_STATIONS: Station[] = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi' },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai' },
  { code: 'SBC', name: 'Bangalore City', city: 'Bangalore' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna' },
  { code: 'LKO', name: 'Lucknow Junction', city: 'Lucknow' },
  { code: 'JAI', name: 'Jaipur Junction', city: 'Jaipur' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad' }
];

const SAMPLE_FARES: FareInfo[] = [
  {
    trainNumber: '12951',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Mumbai Central',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    classes: [
      { code: '1A', name: 'First AC', fare: 2500, available: 20, features: ['AC', 'Bedding', 'Food', 'Priority'] },
      { code: '2A', name: 'Second AC', fare: 1500, available: 45, features: ['AC', 'Bedding', 'Food'] },
      { code: '3A', name: 'Third AC', fare: 1000, available: 72, features: ['AC', 'Bedding'] },
      { code: 'SL', name: 'Sleeper', fare: 400, available: 120, features: ['Bedding'] }
    ]
  },
  {
    trainNumber: '12019',
    trainName: 'Shatabdi Express',
    source: 'New Delhi',
    destination: 'Bhopal Junction',
    departureTime: '06:00',
    arrivalTime: '14:30',
    duration: '8h 30m',
    classes: [
      { code: 'CC', name: 'Chair Car', fare: 800, available: 60, features: ['AC', 'Food'] },
      { code: '2S', name: 'Second Sitting', fare: 200, available: 180, features: ['Basic'] }
    ]
  },
  {
    trainNumber: '12301',
    trainName: 'Rajdhani Express',
    source: 'New Delhi',
    destination: 'Howrah Junction',
    departureTime: '16:55',
    arrivalTime: '10:00',
    duration: '17h 5m',
    classes: [
      { code: '1A', name: 'First AC', fare: 2800, available: 18, features: ['AC', 'Bedding', 'Food', 'Priority'] },
      { code: '2A', name: 'Second AC', fare: 1700, available: 42, features: ['AC', 'Bedding', 'Food'] },
      { code: '3A', name: 'Third AC', fare: 1200, available: 68, features: ['AC', 'Bedding'] },
      { code: 'SL', name: 'Sleeper', fare: 450, available: 110, features: ['Bedding'] }
    ]
  }
];

export default function Fare() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [journeyDate, setJourneyDate] = useState<string>('');
  const [classType, setClassType] = useState('');
  const [fares, setFares] = useState<FareInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleSearch = () => {
    if (!source || !destination || !journeyDate) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setFares(SAMPLE_FARES);
      setLoading(false);
    }, 1000);
  };

  const toggleFavorite = (trainNumber: string) => {
    setFavorites(prev => 
      prev.includes(trainNumber) 
        ? prev.filter(t => t !== trainNumber)
        : [...prev, trainNumber]
    );
  };

  const getLowestFare = (classes: FareInfo['classes']) => {
    return Math.min(...classes.map(c => c.fare));
  };

  const getHighestFare = (classes: FareInfo['classes']) => {
    return Math.max(...classes.map(c => c.fare));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            🚂 Train Fare Checker
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>
            Check fares, compare prices, and find the best deals for your journey
          </Typography>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Fares
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="From Station"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                {MAJOR_STATIONS.map((station) => (
                  <MenuItem key={station.code} value={station.code}>
                    {station.name} ({station.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="To Station"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {MAJOR_STATIONS.map((station) => (
                  <MenuItem key={station.code} value={station.code}>
                    {station.name} ({station.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <DatePicker
                label="Journey Date"
                value={journeyDate ? dayjs(journeyDate) : null}
                onChange={(d) => setJourneyDate(d ? d.format('YYYY-MM-DD') : '')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Class Type</InputLabel>
                <Select value={classType} onChange={(e) => setClassType(e.target.value)}>
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
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={!source || !destination || !journeyDate}
                sx={{ py: 1.5 }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Fare Comparison */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Fare Comparison
          </Typography>
          <Grid container spacing={2}>
            {[
              { from: 'NDLS', to: 'BCT', name: 'Delhi - Mumbai' },
              { from: 'NDLS', to: 'HWH', name: 'Delhi - Kolkata' },
              { from: 'BCT', to: 'MAS', name: 'Mumbai - Chennai' },
              { from: 'NDLS', to: 'SBC', name: 'Delhi - Bangalore' }
            ].map((route) => (
              <Grid item xs={12} sm={6} md={3} key={route.name}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 2 }
                  }}
                  onClick={() => {
                    setSource(route.from);
                    setDestination(route.to);
                    setJourneyDate(dayjs().add(1, 'day').format('YYYY-MM-DD'));
                  }}
                >
                  <Typography variant="h6" gutterBottom>{route.name}</Typography>
                  <Typography variant="h4" color="primary" fontWeight={700}>
                    ₹{Math.floor(Math.random() * 2000) + 500}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Starting from
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Search Results */}
      {fares.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Fare Results ({fares.length} trains found)
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<CompareIcon />}
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </Button>
              </Stack>
            </Box>

            {fares.map((fare, index) => (
              <Box key={fare.trainNumber}>
                <Paper sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrainIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>
                          {fare.trainNumber} - {fare.trainName}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => toggleFavorite(fare.trainNumber)}
                          sx={{ ml: 1 }}
                        >
                          {favorites.includes(fare.trainNumber) ? 
                            <FavoriteIcon color="error" /> : 
                            <FavoriteBorderIcon />
                          }
                        </IconButton>
                      </Box>
                      
                      <Grid container spacing={3} sx={{ mb: 1 }}>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary" fontWeight={600}>
                              {fare.departureTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {fare.source}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center">
                            <Typography variant="h6" color="primary" fontWeight={600}>
                              {fare.arrivalTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {fare.destination}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Typography variant="body2" color="text.secondary">
                        Duration: {fare.duration}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" color="primary" fontWeight={700}>
                          ₹{getLowestFare(fare.classes)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Starting from
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Up to ₹{getHighestFare(fare.classes)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Class-wise Fares */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Class-wise Fares
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Class</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Fare (₹)</TableCell>
                          <TableCell align="center">Available</TableCell>
                          <TableCell>Features</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fare.classes
                          .filter(cls => !classType || cls.code === classType)
                          .map((cls) => (
                            <TableRow key={cls.code}>
                              <TableCell>
                                <Chip label={cls.code} size="small" color="primary" />
                              </TableCell>
                              <TableCell>{cls.name}</TableCell>
                              <TableCell align="right">
                                <Typography variant="h6" color="primary" fontWeight={600}>
                                  ₹{cls.fare}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={cls.available} 
                                  size="small" 
                                  color={cls.available > 0 ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                  {cls.features.map((feature, idx) => (
                                    <Chip 
                                      key={idx} 
                                      label={feature} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ mb: 0.5 }}
                                    />
                                  ))}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
                {index < fares.length - 1 && <Divider />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Fare Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Fare Information & Policies
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Dynamic Pricing
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Fares may vary based on demand, seasonality, and availability. 
                    Early booking often results in better prices.
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Cancellation Charges
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Cancellation charges apply based on time before departure:
                    <br />• 48+ hours: ₹60
                    <br />• 12-48 hours: ₹120
                    <br />• Less than 12 hours: ₹180
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Class Features
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    <strong>AC Classes:</strong> Air conditioning, bedding, food service
                    <br /><strong>Sleeper:</strong> Basic bedding, no AC
                    <br /><strong>General:</strong> Basic seating, no reserved seats
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Concessions
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    Special discounts available for:
                    <br />• Senior citizens (40% off)
                    <br />• Students (25% off)
                    <br />• Divyangjan (75% off)
                    <br />• War widows (75% off)
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

