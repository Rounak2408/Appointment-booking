import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';

/**
 * Signup Page with Form Validation
 */
const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['user', 'admin'], 'Role must be either user or admin'),
  phone: yup.string().when('role', {
    is: 'admin',
    then: (schema) => schema
      .required('Phone number is required for admin')
      .matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
    otherwise: (schema) => schema
  }),
  location: yup.string().when('role', {
    is: 'admin',
    then: (schema) => schema
      .required('Location is required for admin')
      .min(3, 'Location must be at least 3 characters'),
    otherwise: (schema) => schema
  })
});

const Signup = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.phone || '',
        userData.location || ''
      );
      
      if (result.success) {
        toast.success('Registration successful!');
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/my-appointments');
        }
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="form-container">
      <div className="signup-form">
        <h2 className="form-title">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Enter your name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              {...register('password')}
              placeholder="Enter your password (min 8 characters)"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              {...register('confirmPassword')}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'error' : ''}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select {...register('role')} className={errors.role ? 'error' : ''}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <span className="error-message">{errors.role.message}</span>
            )}
          </div>
          
          {/* Admin specific fields */}
          {role === 'admin' && (
            <>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="Enter your phone number (10 digits)"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone.message}</span>
                )}
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  {...register('location')}
                  placeholder="Enter your location"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && (
                  <span className="error-message">{errors.location.message}</span>
                )}
              </div>
            </>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting} 
            style={{ width: '100%' }}
          >
            {isSubmitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: '15px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
