import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/**
 * User Dashboard
 * Comprehensive dashboard showing statistics, upcoming appointments, and all appointments
 */
const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentAppointmentId = searchParams.get('payment');

  useEffect(() => {
    fetchAppointments();
    
    // If payment parameter exists, initiate payment
    if (paymentAppointmentId) {
      handlePayment(paymentAppointmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentAppointmentId, statusFilter, dateFilter, search]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (search) params.append('search', search);
      
      const queryString = params.toString();
      const url = `/appointments/my-appointments${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      setAppointments(response.data.data.appointments);
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      // Create Razorpay order
      const orderResponse = await api.post('/payments/create-order', {
        appointmentId
      });

      const { orderId, amount, keyId, paymentSkipped } = orderResponse.data.data;

      // If payment is skipped, just refresh appointments
      if (paymentSkipped || !orderId || !keyId) {
        alert('Payment skipped. Appointment confirmed!');
        fetchAppointments();
        window.history.replaceState({}, '', '/my-appointments');
        return;
      }

      // Load Razorpay script if not already loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
          if (window.Razorpay) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay script'));
          document.body.appendChild(script);
        });
      };

      try {
        await loadRazorpayScript();
        
        const options = {
          key: keyId,
          amount: amount,
          currency: 'INR',
          name: 'Appointment Booking',
          description: 'Appointment Payment',
          order_id: orderId,
          handler: async function (response) {
            // Verify payment
            try {
              await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentId
              });
              
              alert('Payment successful! Appointment confirmed.');
              fetchAppointments(); // Refresh appointments
              window.history.replaceState({}, '', '/my-appointments'); // Remove payment param
            } catch (err) {
              alert('Payment verification failed: ' + (err.response?.data?.message || 'Unknown error'));
            }
          },
          prefill: {
            name: 'User',
            email: 'user@example.com'
          },
          theme: {
            color: '#007bff'
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (scriptError) {
        alert('Failed to load payment gateway: ' + scriptError.message);
      }
    } catch (err) {
      alert('Failed to initiate payment: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      alert('Appointment cancelled successfully');
      fetchAppointments();
    } catch (err) {
      alert('Failed to cancel appointment: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      booked: { class: 'badge-success', text: 'Booked' },
      accepted: { class: 'badge-info', text: 'Accepted' },
      cancelled: { class: 'badge-danger', text: 'Cancelled' },
      completed: { class: 'badge-info', text: 'Completed' }
    };
    const badge = badges[status] || badges.booked;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  const getPaymentBadge = (status) => {
    return status === 'paid' ? (
      <span className="badge badge-success">Paid</span>
    ) : (
      <span className="badge badge-warning">Pending</span>
    );
  };

  // Calculate statistics
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return aptDate >= today && apt.status === 'booked';
    }).length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    pendingPayment: appointments.filter(apt => apt.paymentStatus === 'pending' && apt.status !== 'cancelled').length,
    accepted: appointments.filter(apt => apt.status === 'accepted').length
  };

  // Get upcoming appointments (next 7 days) - including accepted ones
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return aptDate >= today && aptDate <= nextWeek && (apt.status === 'booked' || apt.status === 'accepted');
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);


  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div style={{ 
      paddingTop: '20px',
      paddingBottom: '40px',
      minHeight: '100vh',
      background: '#000000'
    }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '10px', color: 'white' }}>
          Welcome back, {user?.name}! 👋
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px' }}>
          Manage your appointments and track your bookings
        </p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Total Appointments */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.total}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Total Appointments</p>
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>⏰</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.upcoming}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Upcoming</p>
        </div>

        {/* Completed */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.completed}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Completed</p>
        </div>

        {/* Pending Payment */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💳</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.pendingPayment}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Pending Payment</p>
        </div>

        {/* Accepted Appointments */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.accepted}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Accepted</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="card" style={{ 
        marginBottom: '30px', 
        background: '#1a1a1a', 
        border: '1px solid #333',
        padding: '20px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '20px' }}>🔍 Search & Filter</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff', marginBottom: '8px', display: 'block' }}>Search</label>
            <input
              type="text"
              placeholder="Search by service type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#2a2a2a',
                color: '#fff'
              }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff', marginBottom: '8px', display: 'block' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#2a2a2a',
                color: '#fff'
              }}
            >
              <option value="all">All Status</option>
              <option value="booked">Booked</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: '#fff', marginBottom: '8px', display: 'block' }}>Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#2a2a2a',
                color: '#fff'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFilter('');
              }}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Link to="/book-appointment" className="btn btn-primary" style={{
          padding: '16px 40px',
          fontSize: '18px',
          fontWeight: '600'
        }}>
          ➕ Book New Appointment
        </Link>
      </div>

      {/* Upcoming Appointments Section */}
      {upcomingAppointments.length > 0 && (
        <div className="card" style={{ marginBottom: '30px', background: '#1a1a1a', border: '1px solid #333' }}>
          <h2 style={{
            fontSize: '24px',
            marginBottom: '20px',
            color: '#fff',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📋</span> Upcoming Appointments
          </h2>
          <div className="upcoming-appointments" style={{ display: 'grid', gap: '15px' }}>
            {upcomingAppointments.map((appointment) => (
              <div key={appointment._id} className="appointment-card" style={{
                padding: '20px',
                background: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div className="appointment-card-info" style={{ flex: '1', minWidth: '200px' }}>
                  <h3 style={{ color: '#fff', fontWeight: '600', marginBottom: '8px', fontSize: '18px' }}>
                    {appointment.serviceType}
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#ccc', fontSize: '14px' }}>
                    <span>📅 {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>⏰ {appointment.timeSlot}</span>
                    <span>💰 ₹{appointment.amount}</span>
                  </div>
                  {appointment.status === 'accepted' && (
                    <div style={{ 
                      marginTop: '15px', 
                      padding: '15px', 
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)', 
                      borderRadius: '10px',
                      border: '2px solid rgba(102, 126, 234, 0.5)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
                    }}>
                      <div style={{ 
                        color: '#fff', 
                        fontWeight: '700', 
                        marginBottom: '10px', 
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '20px' }}>✅</span>
                        <span>Your Appointment Has Been Accepted!</span>
                      </div>
                      <div style={{ 
                        padding: '10px', 
                        background: 'rgba(0, 0, 0, 0.3)', 
                        borderRadius: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{ color: '#fff', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                          📞 Contact Your Admin:
                        </div>
                        {appointment.adminName ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px', color: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>👤</span>
                              <span><strong>Name:</strong> {appointment.adminName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>📞</span>
                              <span><strong>Phone:</strong> <a href={`tel:${appointment.adminPhone}`} style={{ color: '#4facfe', textDecoration: 'none' }}>{appointment.adminPhone}</a></span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>📍</span>
                              <span><strong>Location:</strong> {appointment.adminLocation}</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: '#ffd700', fontSize: '13px' }}>
                            Admin details are being processed. Please check back soon.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {getPaymentBadge(appointment.paymentStatus)}
                  {getStatusBadge(appointment.status)}
                  {appointment.paymentStatus === 'pending' && appointment.status !== 'cancelled' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handlePayment(appointment._id)}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Pay Now
                    </button>
                  )}
                  {appointment.status === 'booked' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancel(appointment._id)}
                      style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Appointments Table */}
      <div className="card" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
        <h2 style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#fff',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>📊</span> All Appointments
        </h2>
        
        {appointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
            <h3 style={{ fontSize: '24px', marginBottom: '10px', color: '#fff' }}>No appointments found</h3>
            <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '16px' }}>
              You haven't booked any appointments yet.
            </p>
            <Link to="/book-appointment" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table responsive-table">
              <thead>
                <tr>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Accepted By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td data-label="" style={{ fontWeight: '600' }}>{appointment.serviceType}</td>
                    <td data-label="Date:">{new Date(appointment.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</td>
                    <td data-label="Time:">{appointment.timeSlot}</td>
                    <td data-label="Amount:" style={{ fontWeight: '600', color: '#667eea' }}>₹{appointment.amount}</td>
                    <td data-label="Payment:">{getPaymentBadge(appointment.paymentStatus)}</td>
                    <td data-label="Status:">{getStatusBadge(appointment.status)}</td>
                    <td data-label="Accepted By:">
                      {appointment.status === 'accepted' ? (
                        appointment.adminName ? (
                          <div style={{ fontSize: '13px', color: '#fff', padding: '12px', background: 'rgba(102, 126, 234, 0.2)', borderRadius: '8px', width: '100%', marginTop: '5px' }}>
                            <div style={{ color: '#fff', fontWeight: '700', marginBottom: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              ✅ Accepted
                            </div>
                            <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ color: '#fff' }}>👤 {appointment.adminName}</strong>
                            </div>
                            <div style={{ marginBottom: '6px', color: '#4facfe', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              📞 <a href={`tel:${appointment.adminPhone}`} style={{ color: '#4facfe', textDecoration: 'none', fontWeight: '600' }}>{appointment.adminPhone}</a>
                            </div>
                            <div style={{ color: '#ccc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              📍 {appointment.adminLocation}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '13px', color: '#ffd700' }}>
                            ⏳ Processing...
                          </div>
                        )
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td data-label="Actions:">
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                        {appointment.paymentStatus === 'pending' && appointment.status !== 'cancelled' && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handlePayment(appointment._id)}
                            style={{ padding: '6px 12px', fontSize: '13px', flex: '1', minWidth: '100px' }}
                          >
                            💳 Pay Now
                          </button>
                        )}
                        {appointment.status === 'booked' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleCancel(appointment._id)}
                            style={{ padding: '6px 12px', fontSize: '13px', flex: '1', minWidth: '100px' }}
                          >
                            ❌ Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
