import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  Button,
  Divider,
  Grid,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Train as TrainIcon,
  AccessTime as TimeIcon,
  Speed as SpeedIcon,
  AcUnit as ACIcon,
  Restaurant as PantryIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useState } from 'react';

interface TrainInfo {
  id: number;
  name: string;
  trainNumber: string;
  source: string;
  destination: string;
  startTime: string;
  endTime: string;
  seatPrice: number;
  classType: string;
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

interface EnhancedTrainCardProps {
  train: TrainInfo;
  isSelected: boolean;
  onSelect: (train: TrainInfo) => void;
  onViewDetails: (train: TrainInfo) => void;
}

export default function EnhancedTrainCard({ train, isSelected, onSelect, onViewDetails }: EnhancedTrainCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'on time':
        return 'success';
      case 'delayed':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getClassTypeColor = (classType?: string) => {
    if (!classType) return 'default';
    const type = classType.toUpperCase();
    if (['1A', '2A', '3A', 'EC', 'CC'].includes(type)) return 'primary';
    if (['SL'].includes(type)) return 'secondary';
    return 'default';
  };

  return (
    <Card 
      variant={isSelected ? 'outlined' : 'elevation'}
      sx={{ 
        borderColor: isSelected ? 'primary.main' : undefined,
        borderWidth: isSelected ? 2 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {train.trainNumber ? `${train.trainNumber} — ${train.name}` : train.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip 
                icon={<LocationIcon />} 
                label={`${train.source} → ${train.destination}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              {train.trainType && (
                <Chip label={train.trainType} size="small" color="secondary" />
              )}
              {train.trainCategory && (
                <Chip label={train.trainCategory} size="small" />
              )}
            </Stack>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h5" fontWeight={700} color="primary">
              ₹{train.seatPrice.toFixed(0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {train.classType || 'General'}
            </Typography>
          </Box>
        </Box>

        {/* Time and Duration */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatTime(train.startTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(train.startTime)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {train.source}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {getJourneyDuration()}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Journey Time
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600} color="primary">
                {formatTime(train.endTime)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(train.endTime)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {train.destination}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Train Details */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
          {train.platformNumber && (
            <Chip 
              icon={<ScheduleIcon />} 
              label={`Platform ${train.platformNumber}`} 
              size="small" 
              variant="outlined"
            />
          )}
          
          {train.hasAC && (
            <Tooltip title="AC Available">
              <Chip icon={<ACIcon />} label="AC" size="small" color="primary" />
            </Tooltip>
          )}
          
          {train.hasPantry && (
            <Tooltip title="Pantry Available">
              <Chip icon={<PantryIcon />} label="Pantry" size="small" color="secondary" />
            </Tooltip>
          )}
          
          {train.averageSpeed && (
            <Tooltip title={`Average Speed: ${train.averageSpeed} km/h`}>
              <Chip icon={<SpeedIcon />} label={`${train.averageSpeed} km/h`} size="small" />
            </Tooltip>
          )}
          
          {train.trainStatus && (
            <Chip 
              label={train.trainStatus} 
              size="small" 
              color={getStatusColor(train.trainStatus) as any}
            />
          )}
          
          {train.delayMinutes && train.delayMinutes > 0 && (
            <Chip 
              label={`Delayed ${train.delayMinutes}m`} 
              size="small" 
              color="warning"
            />
          )}
        </Stack>

        {/* Running Days */}
        {train.runningDays && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Running Days:
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {train.runningDays.split(',').map((day, index) => (
                <Chip 
                  key={index} 
                  label={day.trim()} 
                  size="small" 
                  variant="outlined"
                  color={train.isRunningToday ? 'success' : 'default'}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          <Button
            variant={isSelected ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => onSelect(train)}
            startIcon={<TrainIcon />}
            fullWidth
          >
            {isSelected ? 'Selected' : 'Select Train'}
          </Button>
          
          <IconButton 
            onClick={() => setExpanded(!expanded)}
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* Expandable Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            {train.intermediateStations && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Intermediate Stations:
                </Typography>
                <Typography variant="body2">
                  {train.intermediateStations}
                </Typography>
              </Grid>
            )}
            
            {train.totalCoaches && (
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Coaches:
                </Typography>
                <Typography variant="body2">{train.totalCoaches}</Typography>
              </Grid>
            )}
            
            {train.routeType && (
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Route Type:
                </Typography>
                <Typography variant="body2">{train.routeType}</Typography>
              </Grid>
            )}
            
            {train.trainOperator && (
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Operator:
                </Typography>
                <Typography variant="body2">{train.trainOperator}</Typography>
              </Grid>
            )}
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewDetails(train)}
              startIcon={<InfoIcon />}
              fullWidth
            >
              View Full Details
            </Button>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}