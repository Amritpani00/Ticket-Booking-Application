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
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControlLabel,
  Checkbox,
  Grid,
  Autocomplete,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { apiGet } from '../api';

interface Station {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  category: string;
}

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

interface AdvancedTrainSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  filters: SearchFilters;
}

export default function AdvancedTrainSearch({ onSearch, onClear, filters }: AdvancedTrainSearchProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [zones, setStates] = useState<string[]>([]);
  const [trainTypes, setTrainTypes] = useState<string[]>([]);
  const [trainCategories, setTrainCategories] = useState<string[]>([]);
  const [trainOperators, setTrainOperators] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      setLoading(true);
      const [filtersData, stationsData] = await Promise.all([
        apiGet('/api/train-search/filters'),
        apiGet('/api/stations')
      ]);
      
      setTrainTypes(filtersData.trainTypes || []);
      setTrainCategories(filtersData.trainCategories || []);
      setTrainOperators(filtersData.trainOperators || []);
      setCities(filtersData.cities || []);
      setStates(filtersData.states || []);
      setStations(stationsData);
    } catch (error) {
      console.error('Failed to load filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    onClear();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    // This will be handled by the parent component
    console.log('Filter change:', key, value);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
            Advanced Train Search
          </Typography>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            size="small"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
        </Box>

        {/* Basic Search */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={stations}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="From Station"
                  placeholder="Search station or city"
                  fullWidth
                />
              )}
              onChange={(_, value) => handleFilterChange('source', value?.name || '')}
              value={stations.find(s => s.name === filters.source) || null}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Autocomplete
              options={stations}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="To Station"
                  placeholder="Search station or city"
                  fullWidth
                />
              )}
              onChange={(_, value) => handleFilterChange('destination', value?.name || '')}
              value={stations.find(s => s.name === filters.destination) || null}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Journey Date"
              value={filters.journeyDate ? dayjs(filters.journeyDate) : null}
              onChange={(date) => handleFilterChange('journeyDate', date ? date.format('YYYY-MM-DD') : '')}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Class Type</InputLabel>
              <Select
                value={filters.classType}
                label="Class Type"
                onChange={(e) => handleFilterChange('classType', e.target.value)}
              >
                <MenuItem value="">All Classes</MenuItem>
                <MenuItem value="1A">1A - First AC</MenuItem>
                <MenuItem value="2A">2A - Second AC</MenuItem>
                <MenuItem value="3A">3A - Third AC</MenuItem>
                <MenuItem value="SL">SL - Sleeper</MenuItem>
                <MenuItem value="2S">2S - Second Sitting</MenuItem>
                <MenuItem value="CC">CC - Chair Car</MenuItem>
                <MenuItem value="EC">EC - Executive Chair</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Search Button */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? 'Searching...' : 'Search Trains'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </Button>
        </Box>

        {/* Advanced Filters */}
        {showAdvanced && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={500}>
                Advanced Filters
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Train Type & Category */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Train Type</InputLabel>
                    <Select
                      value={filters.trainType}
                      label="Train Type"
                      onChange={(e) => handleFilterChange('trainType', e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      {trainTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Train Category</InputLabel>
                    <Select
                      value={filters.trainCategory}
                      label="Train Category"
                      onChange={(e) => handleFilterChange('trainCategory', e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {trainCategories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* AC & Operator */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>AC Availability</InputLabel>
                    <Select
                      value={filters.hasAC === null ? '' : filters.hasAC.toString()}
                      label="AC Availability"
                      onChange={(e) => handleFilterChange('hasAC', e.target.value === '' ? null : e.target.value === 'true')}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">AC Only</MenuItem>
                      <MenuItem value="false">Non-AC Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Train Operator</InputLabel>
                    <Select
                      value={filters.trainOperator}
                      label="Train Operator"
                      onChange={(e) => handleFilterChange('trainOperator', e.target.value)}
                    >
                      <MenuItem value="">All Operators</MenuItem>
                      {trainOperators.map((operator) => (
                        <MenuItem key={operator} value={operator}>{operator}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Speed & Fare Range */}
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Minimum Speed (km/h)</Typography>
                  <Slider
                    value={filters.minSpeed}
                    onChange={(_, value) => handleFilterChange('minSpeed', value)}
                    min={0}
                    max={200}
                    step={10}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 100, label: '100' },
                      { value: 200, label: '200' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Maximum Fare (₹)</Typography>
                  <Slider
                    value={filters.maxFare}
                    onChange={(_, value) => handleFilterChange('maxFare', value)}
                    min={0}
                    max={10000}
                    step={500}
                    marks={[
                      { value: 0, label: '₹0' },
                      { value: 5000, label: '₹5000' },
                      { value: 10000, label: '₹10000' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Grid>

                {/* Sorting Options */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="Sort By"
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <MenuItem value="startTime">Departure Time</MenuItem>
                      <MenuItem value="fare">Fare</MenuItem>
                      <MenuItem value="duration">Journey Duration</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      label="Sort Order"
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                      <MenuItem value="asc">Ascending</MenuItem>
                      <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Popular Routes */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Popular Routes:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {[
              { source: 'New Delhi', destination: 'Mumbai Central' },
              { source: 'Mumbai Central', destination: 'New Delhi' },
              { source: 'Kolkata', destination: 'New Delhi' },
              { source: 'Chennai Central', destination: 'Bangalore City' }
            ].map((route, index) => (
              <Chip
                key={index}
                label={`${route.source} → ${route.destination}`}
                variant="outlined"
                size="small"
                onClick={() => {
                  handleFilterChange('source', route.source);
                  handleFilterChange('destination', route.destination);
                }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}