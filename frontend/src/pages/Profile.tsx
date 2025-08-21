import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Train as TrainIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { getToken, getRole } from '../auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    pushNotifications: boolean;
    language: string;
    theme: 'light' | 'dark';
  };
  stats: {
    totalBookings: number;
    completedJourneys: number;
    loyaltyPoints: number;
    memberSince: string;
    favoriteRoutes: number;
  };
}

const SAMPLE_PROFILE: UserProfile = {
  id: 'USR001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  address: '123 Main Street, Apartment 4B',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  dateOfBirth: '1990-05-15',
  gender: 'male',
  preferences: {
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    pushNotifications: true,
    language: 'English',
    theme: 'light'
  },
  stats: {
    totalBookings: 25,
    completedJourneys: 18,
    loyaltyPoints: 1250,
    memberSince: '2020-03-15',
    favoriteRoutes: 5
  }
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(SAMPLE_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(SAMPLE_PROFILE);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Simulate password change
    console.log('Password changed successfully');
    setShowPasswordDialog(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return { tier: 'Platinum', color: 'primary' as const };
    if (points >= 1000) return { tier: 'Gold', color: 'warning' as const };
    if (points >= 500) return { tier: 'Silver', color: 'default' as const };
    return { tier: 'Bronze', color: 'default' as const };
  };

  const loyaltyTier = getLoyaltyTier(profile.stats.loyaltyPoints);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            👤 User Profile
          </Typography>
          <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>
            Manage your personal information, preferences, and account settings
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} lg={8}>
          {/* Personal Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={isEditing ? editedProfile.name : profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={isEditing ? editedProfile.email : profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={isEditing ? editedProfile.phone : profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={2}
                    value={isEditing ? editedProfile.address : profile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={isEditing ? editedProfile.city : profile.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={isEditing ? editedProfile.state : profile.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={isEditing ? editedProfile.pincode : profile.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    disabled={!isEditing}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Preferences
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isEditing ? editedProfile.preferences.notifications : profile.preferences.notifications}
                        onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="Enable Notifications"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isEditing ? editedProfile.preferences.emailUpdates : profile.preferences.emailUpdates}
                        onChange={(e) => handlePreferenceChange('emailUpdates', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="Email Updates"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isEditing ? editedProfile.preferences.smsUpdates : profile.preferences.smsUpdates}
                        onChange={(e) => handlePreferenceChange('smsUpdates', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="SMS Updates"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isEditing ? editedProfile.preferences.pushNotifications : profile.preferences.pushNotifications}
                        onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="Push Notifications"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Security
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Stats & Quick Actions */}
        <Grid item xs={12} lg={4}>
          {/* Profile Summary */}
          <Card sx={{ mb: 3, textAlign: 'center' }}>
            <CardContent>
              <Avatar
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {profile.name.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {profile.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member since {new Date(profile.stats.memberSince).toLocaleDateString()}
              </Typography>
              
              <Chip
                label={loyaltyTier.tier}
                color={loyaltyTier.color}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h4" color="primary" fontWeight={700}>
                {profile.stats.loyaltyPoints}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loyalty Points
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Quick Stats
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrainIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.stats.totalBookings}
                    secondary="Total Bookings"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <HistoryIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.stats.completedJourneys}
                    secondary="Completed Journeys"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FavoriteIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.stats.favoriteRoutes}
                    secondary="Favorite Routes"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ReceiptIcon />}
                  sx={{ py: 1.5 }}
                >
                  View Bookings
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<FavoriteIcon />}
                  sx={{ py: 1.5 }}
                >
                  Manage Favorites
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<NotificationsIcon />}
                  sx={{ py: 1.5 }}
                >
                  Notification Settings
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<StarIcon />}
                  sx={{ py: 1.5 }}
                >
                  Loyalty Program
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Change Password
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
              }
              label="Show Password"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handlePasswordChange}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

