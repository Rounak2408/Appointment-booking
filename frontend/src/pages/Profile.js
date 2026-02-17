import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

/**
 * Profile Page
 * Allows users to view and update their profile information
 */
const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
});

const passwordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isUpdatingProfile },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema)
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isChangingPassword },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema)
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        location: user.location || ''
      });
    }
  }, [user, resetProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      setUser(response.data.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const onProfileSubmit = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      setUser(response.data.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await api.put('/auth/profile/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      resetPassword();
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="empty-state">
        <p>Failed to load profile</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '20px', paddingBottom: '40px' }}>
      <h1 className="page-title">My Profile</h1>
      <div className="form-container">
        <div className="card" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '30px',
            borderBottom: '2px solid #333'
          }}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: '8px 8px 0 0',
                marginBottom: '-2px',
                borderBottom: activeTab === 'profile' ? '2px solid #667eea' : 'none'
              }}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ 
                borderRadius: '8px 8px 0 0',
                marginBottom: '-2px',
                borderBottom: activeTab === 'password' ? '2px solid #667eea' : 'none'
              }}
            >
              Change Password
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  {...registerProfile('name')}
                  className={profileErrors.name ? 'error' : ''}
                />
                {profileErrors.name && (
                  <span className="error-message">{profileErrors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  {...registerProfile('email')}
                  className={profileErrors.email ? 'error' : ''}
                />
                {profileErrors.email && (
                  <span className="error-message">{profileErrors.email.message}</span>
                )}
              </div>

              {authUser?.role === 'admin' && (
                <>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      {...registerProfile('phone')}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      {...registerProfile('location')}
                      placeholder="Enter your location"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUpdatingProfile}
                style={{ width: '100%' }}
              >
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  {...registerPassword('currentPassword')}
                  placeholder="Enter your current password"
                  className={passwordErrors.currentPassword ? 'error' : ''}
                />
                {passwordErrors.currentPassword && (
                  <span className="error-message">{passwordErrors.currentPassword.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  placeholder="Enter new password (min 8 characters)"
                  className={passwordErrors.newPassword ? 'error' : ''}
                />
                {passwordErrors.newPassword && (
                  <span className="error-message">{passwordErrors.newPassword.message}</span>
                )}
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  placeholder="Confirm new password"
                  className={passwordErrors.confirmPassword ? 'error' : ''}
                />
                {passwordErrors.confirmPassword && (
                  <span className="error-message">{passwordErrors.confirmPassword.message}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isChangingPassword}
                style={{ width: '100%' }}
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
