import React, { useState } from 'react';
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
  Grid,
  IconButton,
  Stack,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

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

interface PassengerDetailsFormProps {
  numberOfSeats: number;
  onPassengersChange: (passengers: PassengerInfo[]) => void;
  passengers: PassengerInfo[];
}

export default function PassengerDetailsForm({ 
  numberOfSeats, 
  onPassengersChange, 
  passengers 
}: PassengerDetailsFormProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const addPassenger = () => {
    if (passengers.length < numberOfSeats) {
      const newPassenger: PassengerInfo = {
        name: '',
        age: '',
        gender: '',
        idProofType: '',
        idProofNumber: '',
        passengerType: 'Adult',
        contactNumber: '',
        email: ''
      };
      onPassengersChange([...passengers, newPassenger]);
    }
  };

  const removePassenger = (index: number) => {
    const newPassengers = passengers.filter((_, i) => i !== index);
    onPassengersChange(newPassengers);
  };

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    onPassengersChange(newPassengers);
    
    // Clear error for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const validatePassengers = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    passengers.forEach((passenger, index) => {
      if (!passenger.name.trim()) {
        newErrors[`${index}-name`] = 'Name is required';
      }
      
      if (!passenger.age.trim()) {
        newErrors[`${index}-age`] = 'Age is required';
      } else if (isNaN(Number(passenger.age)) || Number(passenger.age) < 1 || Number(passenger.age) > 120) {
        newErrors[`${index}-age`] = 'Age must be between 1 and 120';
      }
      
      if (!passenger.gender) {
        newErrors[`${index}-gender`] = 'Gender is required';
      }
      
      if (!passenger.idProofType) {
        newErrors[`${index}-idProofType`] = 'ID proof type is required';
      }
      
      if (!passenger.idProofNumber.trim()) {
        newErrors[`${index}-idProofNumber`] = 'ID proof number is required';
      }
      
      if (!passenger.contactNumber.trim()) {
        newErrors[`${index}-contactNumber`] = 'Contact number is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getError = (index: number, field: string): string => {
    return errors[`${index}-${field}`] || '';
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Passenger Details ({passengers.length}/{numberOfSeats})
          </Typography>
        </Box>

        {passengers.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Please add passenger details for each seat you've selected.
          </Alert>
        )}

        {passengers.map((passenger, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`Passenger ${index + 1}`} 
                color="primary" 
                variant="outlined"
                sx={{ mr: 2 }}
              />
              {passengers.length > 1 && (
                <IconButton 
                  onClick={() => removePassenger(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name *"
                  value={passenger.name}
                  onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                  fullWidth
                  error={!!getError(index, 'name')}
                  helperText={getError(index, 'name')}
                  placeholder="Enter full name as per ID proof"
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  label="Age *"
                  value={passenger.age}
                  onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                  fullWidth
                  type="number"
                  error={!!getError(index, 'age')}
                  helperText={getError(index, 'age')}
                  inputProps={{ min: 1, max: 120 }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth error={!!getError(index, 'gender')}>
                  <InputLabel>Gender *</InputLabel>
                  <Select
                    value={passenger.gender}
                    label="Gender *"
                    onChange={(e) => updatePassenger(index, 'gender', e.target.value)}
                  >
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!getError(index, 'passengerType')}>
                  <InputLabel>Passenger Type</InputLabel>
                  <Select
                    value={passenger.passengerType}
                    label="Passenger Type"
                    onChange={(e) => updatePassenger(index, 'passengerType', e.target.value)}
                  >
                    <MenuItem value="Adult">Adult</MenuItem>
                    <MenuItem value="Child">Child (5-12 years)</MenuItem>
                    <MenuItem value="Senior Citizen">Senior Citizen (60+ years)</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth error={!!getError(index, 'idProofType')}>
                  <InputLabel>ID Proof Type *</InputLabel>
                  <Select
                    value={passenger.idProofType}
                    label="ID Proof Type *"
                    onChange={(e) => updatePassenger(index, 'idProofType', e.target.value)}
                  >
                    <MenuItem value="Aadhar">Aadhar Card</MenuItem>
                    <MenuItem value="PAN">PAN Card</MenuItem>
                    <MenuItem value="Driving License">Driving License</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                    <MenuItem value="Voter ID">Voter ID</MenuItem>
                    <MenuItem value="Student ID">Student ID</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="ID Proof Number *"
                  value={passenger.idProofNumber}
                  onChange={(e) => updatePassenger(index, 'idProofNumber', e.target.value)}
                  fullWidth
                  error={!!getError(index, 'idProofNumber')}
                  helperText={getError(index, 'idProofNumber')}
                  placeholder="Enter ID number"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Number *"
                  value={passenger.contactNumber}
                  onChange={(e) => updatePassenger(index, 'contactNumber', e.target.value)}
                  fullWidth
                  error={!!getError(index, 'contactNumber')}
                  helperText={getError(index, 'contactNumber')}
                  placeholder="10-digit mobile number"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={passenger.email}
                  onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                  fullWidth
                  type="email"
                  placeholder="Optional - for updates"
                />
              </Grid>
            </Grid>

            {index < passengers.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}

        {passengers.length < numberOfSeats && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addPassenger}
            sx={{ mt: 2 }}
          >
            Add Passenger
          </Button>
        )}

        {passengers.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Important Notes:
            </Typography>
            <Typography variant="body2" color="text.secondary" component="div">
              • All fields marked with * are mandatory
              • Name should match exactly with ID proof
              • Children below 5 years travel free (no seat required)
              • Senior citizens get fare concessions
              • Student ID holders get special discounts
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}