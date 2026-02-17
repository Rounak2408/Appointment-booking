import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import api from '../services/api';

/**
 * Book Appointment Page with Form Validation
 */
const schema = yup.object().shape({
  serviceType: yup
    .string()
    .required('Service type is required'),
  date: yup
    .string()
    .required('Date is required')
    .test('future-date', 'Date must be today or in the future', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  timeSlot: yup
    .string()
    .required('Time slot is required'),
  amount: yup
    .number()
    .required('Amount is required')
    .min(0, 'Amount must be positive')
    .typeError('Amount must be a number')
});

const BookAppointment = () => {
  const navigate = useNavigate();

  // Generate time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      amount: 500
    }
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/appointments', data);
      const appointment = response.data.data.appointment;
      
      toast.success('Appointment created successfully!');
      
      // Redirect to payment page after a short delay
      setTimeout(() => {
        navigate(`/my-appointments?payment=${appointment._id}`);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create appointment';
      toast.error(errorMessage);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '20px', paddingBottom: '40px' }}>
      <h1 className="page-title">Book Appointment</h1>
      <div className="form-container">
        <div className="card" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Service Type</label>
              <select
                {...register('serviceType')}
                className={errors.serviceType ? 'error' : ''}
              >
                <option value="">Select a service</option>
                <option value="Consultation">Consultation</option>
                <option value="Checkup">Checkup</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
              {errors.serviceType && (
                <span className="error-message">{errors.serviceType.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                {...register('date')}
                min={today}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && (
                <span className="error-message">{errors.date.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Time Slot</label>
              <select
                {...register('timeSlot')}
                className={errors.timeSlot ? 'error' : ''}
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {errors.timeSlot && (
                <span className="error-message">{errors.timeSlot.message}</span>
              )}
            </div>

            <div className="form-group">
              <label>Amount (INR)</label>
              <input
                type="number"
                {...register('amount')}
                min="0"
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && (
                <span className="error-message">{errors.amount.message}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting} 
              style={{ width: '100%' }}
            >
              {isSubmitting ? 'Creating...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
