import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Grid,
  Paper,
  IconButton,
  Collapse,
  Fade,
  Zoom,
  Slide,
  useTheme,
  useMediaQuery,
  Autocomplete,
  InputAdornment,
  Tooltip,
  Alert,
  Skeleton,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  Train as TrainIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

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

interface InteractiveTrainSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  filters: SearchFilters;
  loading?: boolean;
}

export default function InteractiveTrainSearch({
  onSearch,
  onClear,
  filters,
  loading = false
}: InteractiveTrainSearchProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [popularRoutes] = useState([
    { source: 'New Delhi', destination: 'Mumbai Central', code: 'NDLS-BCT', popular: true },
    { source: 'Mumbai Central', destination: 'New Delhi', code: 'BCT-NDLS', popular: true },
    { source: 'Kolkata', destination: 'New Delhi', code: 'HWH-NDLS', popular: true },
    { source: 'Chennai Central', destination: 'Bangalore City', code: 'MAS-SBC', popular: false },
    { source: 'Bangalore City', destination: 'Chennai Central', code: 'SBC-MAS', popular: false },
    { source: 'New Delhi', destination: 'Ahmedabad Junction', code: 'NDLS-ADI', popular: false },
    { source: 'New Delhi', destination: 'Hyderabad Deccan', code: 'NDLS-HYB', popular: false },
    { source: 'Mumbai Central', destination: 'Chennai Central', code: 'BCT-MAS', popular: false }
  ]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    onSearch(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({
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
    onClear();
  };

  const handlePopularRoute = (route: any) => {
    setLocalFilters(prev => ({
      ...prev,
      source: route.source,
      destination: route.destination
    }));
  };

  const handleSwapStations = () => {
    setLocalFilters(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  const isSearchDisabled = !localFilters.source || !localFilters.destination || !localFilters.journeyDate;

  return (
    <Card 
      elevation={3}
      sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Find Your Perfect Train
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search across 13+ premium trains with advanced filters
            </Typography>
          </Box>
        </Box>

        {/* Main Search Form */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Source Station */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={[]}
              freeSolo
              value={localFilters.source}
              onChange={(_, newValue) => handleFilterChange('source', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="From Station"
                  placeholder="Enter source station"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Swap Button */}
          <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title="Swap Stations">
              <IconButton
                onClick={handleSwapStations}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  transform: 'rotate(90deg)',
                  transition: 'all 0.3s ease'
                }}
              >
                <TrendingUpIcon />
              </IconButton>
            </Tooltip>
          </Grid>

          {/* Destination Station */}
          <Grid item xs={12} md={4}>
            <Autocomplete
              options={[]}
              freeSolo
              value={localFilters.destination}
              onChange={(_, newValue) => handleFilterChange('destination', newValue || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="To Station"
                  placeholder="Enter destination station"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="success" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Journey Date */}
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Journey Date"
              value={localFilters.journeyDate ? dayjs(localFilters.journeyDate) : null}
              onChange={(date) => handleFilterChange('journeyDate', date ? date.format('YYYY-MM-DD') : '')}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon color="primary" />
                      </InputAdornment>
                    )
                  },
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }
                    }
                  }
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Popular Routes */}
        <Fade in={true} timeout={800}>
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'rgba(255, 255, 255, 0.6)' }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <StarIcon sx={{ mr: 1, color: 'warning.main' }} />
              Popular Routes
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {popularRoutes.map((route, index) => (
                <Zoom in={true} timeout={800 + index * 100} key={route.code}>
                  <Chip
                    label={`${route.source} → ${route.destination}`}
                    variant={route.popular ? "filled" : "outlined"}
                    color={route.popular ? "primary" : "default"}
                    onClick={() => handlePopularRoute(route)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { transform: 'scale(1.05)' },
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </Zoom>
              ))}
            </Box>
          </Paper>
        </Fade>

        {/* Advanced Options Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </Button>
          <Divider sx={{ flexGrow: 1, mx: 2 }} />
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </Box>

        {/* Advanced Options */}
        <Collapse in={showAdvanced}>
          <Slide direction="up" in={showAdvanced} timeout={400}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Train Type</InputLabel>
                  <Select
                    value={localFilters.trainType}
                    label="Train Type"
                    onChange={(e) => handleFilterChange('trainType', e.target.value)}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="Rajdhani">Rajdhani Express</MenuItem>
                    <MenuItem value="Duronto">Duronto Express</MenuItem>
                    <MenuItem value="Shatabdi">Shatabdi Express</MenuItem>
                    <MenuItem value="Superfast">Superfast Express</MenuItem>
                    <MenuItem value="Express">Express</MenuItem>
                    <MenuItem value="Passenger">Passenger</MenuItem>
                    <MenuItem value="Local">Local</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Train Category</InputLabel>
                  <Select
                    value={localFilters.trainCategory}
                    label="Train Category"
                    onChange={(e) => handleFilterChange('trainCategory', e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Premium">Premium</MenuItem>
                    <MenuItem value="Regular">Regular</MenuItem>
                    <MenuItem value="Economy">Economy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>AC Availability</InputLabel>
                  <Select
                    value={localFilters.hasAC === null ? '' : localFilters.hasAC}
                    label="AC Availability"
                    onChange={(e) => handleFilterChange('hasAC', e.target.value === '' ? null : e.target.value === 'true')}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">AC Only</MenuItem>
                    <MenuItem value="false">Non-AC Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Class Type</InputLabel>
                  <Select
                    value={localFilters.classType}
                    label="Class Type"
                    onChange={(e) => handleFilterChange('classType', e.target.value)}
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    <MenuItem value="1A">First AC (1A)</MenuItem>
                    <MenuItem value="2A">Second AC (2A)</MenuItem>
                    <MenuItem value="3A">Third AC (3A)</MenuItem>
                    <MenuItem value="SL">Sleeper (SL)</MenuItem>
                    <MenuItem value="2S">Second Sitting (2S)</MenuItem>
                    <MenuItem value="CC">Chair Car (CC)</MenuItem>
                    <MenuItem value="GEN">General (GEN)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Slide>
        </Collapse>

        {/* Advanced Filters */}
        <Collapse in={showFilters}>
          <Slide direction="up" in={showFilters} timeout={400}>
            <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'rgba(255, 255, 255, 0.6)' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
                Advanced Filters
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 1, color: 'info.main' }} />
                    Minimum Speed (km/h)
                  </Typography>
                  <Slider
                    value={localFilters.minSpeed}
                    onChange={(_, value) => handleFilterChange('minSpeed', value)}
                    min={0}
                    max={120}
                    step={5}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 60, label: '60' },
                      { value: 120, label: '120' }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ color: 'info.main' }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                    Maximum Fare (₹)
                  </Typography>
                  <Slider
                    value={localFilters.maxFare}
                    onChange={(_, value) => handleFilterChange('maxFare', value)}
                    min={100}
                    max={10000}
                    step={100}
                    marks={[
                      { value: 100, label: '₹100' },
                      { value: 5000, label: '₹5000' },
                      { value: 10000, label: '₹10000' }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{ color: 'success.main' }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={localFilters.sortBy}
                      label="Sort By"
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <MenuItem value="startTime">Departure Time</MenuItem>
                      <MenuItem value="fare">Fare</MenuItem>
                      <MenuItem value="duration">Journey Duration</MenuItem>
                      <MenuItem value="speed">Speed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort Order</InputLabel>
                    <Select
                      value={localFilters.sortOrder}
                      label="Sort Order"
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          </Slide>
        </Collapse>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <Skeleton width={20} height={20} /> : <SearchIcon />}
            onClick={handleSearch}
            disabled={isSearchDisabled || loading}
            sx={{
              minWidth: 200,
              height: 48,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              boxShadow: 3,
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                transform: 'translateY(-2px)',
                boxShadow: 6
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Searching...' : 'Search Trains'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={loading}
            sx={{
              minWidth: 150,
              height: 48,
              borderRadius: 3,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Clear All
          </Button>
        </Box>

        {/* Search Status */}
        {isSearchDisabled && (
          <Fade in={true} timeout={500}>
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              Please fill in source, destination, and journey date to search for trains.
            </Alert>
          </Fade>
        )}
      </CardContent>
    </Card>
  );
}