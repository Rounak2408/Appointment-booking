import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

/**
 * Admin Dashboard Page
 * Professional admin dashboard with statistics and appointment management
 */
const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'users'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
    // Refresh user data to ensure phone and location are available
    refreshUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter, search]);

  const refreshUserData = async () => {
    try {
      await api.get('/auth/me');
      // Update user context if needed - the useAuth hook should handle this
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (search) params.append('search', search);
      
      const queryString = params.toString();
      const url = `/appointments${queryString ? `?${queryString}` : ''}`;
      const response = await api.get(url);
      setAppointments(response.data.data.appointments);
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      console.log('Updating appointment status:', { appointmentId, newStatus });
      
      // Find the appointment to check current status
      const appointment = appointments.find(apt => apt._id === appointmentId);
      
      // Prevent changing from accepted to booked
      if (appointment && appointment.status === 'accepted' && newStatus === 'booked') {
        alert('⚠️ This appointment is already accepted by ' + (appointment.adminName || 'another admin') + '. Cannot change back to booked status.');
        return;
      }
      
      // If trying to set status to 'accepted', use the accept endpoint instead
      if (newStatus === 'accepted') {
        if (appointment) {
          // Check if already accepted
          if (appointment.status === 'accepted') {
            alert('⚠️ This appointment is already accepted by ' + (appointment.adminName || 'another admin') + '. Only one admin can accept an appointment.');
            return;
          }
          
          // Check if appointment is completed
          if (appointment.status === 'completed') {
            alert('⚠️ Cannot accept a completed appointment.\n\nCompleted appointments cannot be accepted or modified.');
            return;
          }
          
          // Check if appointment is cancelled
          if (appointment.status === 'cancelled') {
            alert('⚠️ Cannot accept a cancelled appointment.\n\nCancelled appointments cannot be accepted.');
            return;
          }
          
          await handleAcceptClick(appointment);
          return;
        }
      }
      
      const response = await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      console.log('Status update response:', response.data);
      
      // Refresh both appointments and users
      await fetchAppointments();
      await fetchUsers();
      
      // Show success message
      const message = `Appointment status updated to ${newStatus} successfully!`;
      alert(message);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      console.error('Status update error:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status
      });
      alert('Failed to update status: ' + errorMessage);
    }
  };

  const handleAcceptClick = async (appointment) => {
    try {
      console.log('Accepting appointment:', appointment._id);
      
      // Check if appointment is already accepted
      if (appointment.status === 'accepted') {
        const acceptedBy = appointment.adminName || 'Another admin';
        alert(`⚠️ This appointment is already accepted by ${acceptedBy}.\n\nOnly one admin can accept an appointment.`);
        return;
      }
      
      // Check if appointment is completed
      if (appointment.status === 'completed') {
        alert('⚠️ Cannot accept a completed appointment.\n\nCompleted appointments cannot be accepted or modified.');
        return;
      }
      
      // Check if appointment is cancelled
      if (appointment.status === 'cancelled') {
        alert('⚠️ Cannot accept a cancelled appointment.\n\nCancelled appointments cannot be accepted.');
        return;
      }
      
      // First, refresh user data to ensure we have latest phone and location
      const userResponse = await api.get('/auth/me');
      const currentUser = userResponse.data.data.user;
      
      console.log('Current admin user:', {
        name: currentUser.name,
        phone: currentUser.phone,
        location: currentUser.location,
        role: currentUser.role
      });

      // Check if admin has required profile details
      const adminPhone = currentUser.phone ? currentUser.phone.toString().trim() : '';
      const adminLocation = currentUser.location ? currentUser.location.toString().trim() : '';
      
      if (!adminPhone || !adminLocation) {
        alert(`⚠️ Admin Profile Incomplete!\n\nPhone: ${adminPhone || '❌ Missing'}\nLocation: ${adminLocation || '❌ Missing'}\n\nTo fix this:\n1. Sign up again as Admin with Phone and Location\n2. Or run: node backend/scripts/createAdmin.js\n\nWithout phone and location, you cannot accept appointments.`);
        return;
      }

      // Confirm acceptance
      const confirmAccept = window.confirm(
        `Accept appointment for ${appointment.serviceType}?\n\n` +
        `Date: ${new Date(appointment.date).toLocaleDateString()}\n` +
        `Time: ${appointment.timeSlot}\n` +
        `User: ${appointment.userId?.name || 'N/A'}\n\n` +
        `Your details will be shared with the user:\n` +
        `Name: ${currentUser.name}\n` +
        `Phone: ${currentUser.phone}\n` +
        `Location: ${currentUser.location}\n\n` +
        `⚠️ Note: Once accepted, no other admin can claim this appointment.\n\n` +
        `Do you want to accept this appointment?`
      );

      if (!confirmAccept) {
        console.log('User cancelled acceptance');
        return;
      }

      console.log('Calling accept endpoint...');
      // Call accept endpoint
      const response = await api.put(`/appointments/${appointment._id}/accept`);
      console.log('Accept response:', response.data);
      
      // Refresh appointments and users
      await fetchAppointments();
      await fetchUsers();
      
      alert('✅ Appointment accepted successfully! User will now see your contact details.\n\n⚠️ No other admin can accept this appointment now.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      const statusCode = err.response?.status;
      
      console.error('Accept appointment error:', {
        error: err,
        response: err.response?.data,
        status: statusCode,
        appointmentId: appointment._id,
        fullError: err
      });
      
      // Show detailed error message
      let alertMessage = '❌ Failed to accept appointment:\n\n' + errorMessage;
      
      if (statusCode === 400 && errorMessage.includes('incomplete')) {
        alertMessage += '\n\n💡 Solution:\n1. Make sure you signed up as Admin with Phone and Location\n2. Or use the admin creation script: node backend/scripts/createAdmin.js';
      }
      
      alert(alertMessage + '\n\nPlease check the browser console (F12) for more details.');
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
    booked: appointments.filter(apt => apt.status === 'booked').length,
    accepted: appointments.filter(apt => apt.status === 'accepted').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    pendingPayment: appointments.filter(apt => apt.paymentStatus === 'pending' && apt.status !== 'cancelled').length,
    paid: appointments.filter(apt => apt.paymentStatus === 'paid').length,
    today: appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    }).length
  };

  // Get recent appointments (last 5)
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div style={{ background: '#000000', minHeight: '100vh', paddingTop: '20px', paddingBottom: '40px' }}>
      {/* Welcome Section */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '42px', marginBottom: '10px', color: 'white' }}>
          Admin Dashboard 👨‍💼
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px' }}>
          Welcome, {user?.name || 'Admin'}. Manage all appointments and track system statistics.
        </p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

      {/* Statistics Cards */}
        <div className="stats-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
        {/* Total Appointments */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.total}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Total Appointments</p>
        </div>

        {/* Today's Appointments */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📅</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.today}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Today's Appointments</p>
        </div>

        {/* Booked */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.booked}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Booked</p>
        </div>

        {/* Accepted */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✔️</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.accepted}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Accepted</p>
        </div>

        {/* Completed */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🎯</div>
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

        {/* Paid */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>💰</div>
          <h3 style={{ fontSize: '32px', marginBottom: '5px', fontWeight: '700' }}>{stats.paid}</h3>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>Paid</p>
        </div>
      </div>

      {/* Recent Appointments Section */}
      {recentAppointments.length > 0 && (
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
            <span>🕐</span> Recent Appointments
          </h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {recentAppointments.map((appointment) => (
              <div key={appointment._id} style={{
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
                <div style={{ flex: '1', minWidth: '250px' }}>
                  <h3 style={{ color: '#fff', fontWeight: '600', marginBottom: '8px', fontSize: '18px' }}>
                    {appointment.serviceType} - {appointment.userId?.name || 'N/A'}
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', color: '#ccc', fontSize: '14px' }}>
                    <span>📅 {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span>⏰ {appointment.timeSlot}</span>
                    <span>💰 ₹{appointment.amount}</span>
                    <span>👤 {appointment.userId?.email || 'N/A'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {getPaymentBadge(appointment.paymentStatus)}
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      {/* Search and Filter Section - Only show for appointments tab */}
      {activeTab === 'appointments' && (
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
                placeholder="Search by service type or admin name..."
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
      )}

      <div className="admin-tabs" style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px',
        borderBottom: '2px solid #333'
      }}>
        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'appointments' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : '#2a2a2a',
            color: '#fff',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          📋 Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'users' 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : '#2a2a2a',
            color: '#fff',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          👥 Users ({users.length})
        </button>
      </div>

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="card" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>All Appointments ({appointments.length})</h2>
        {appointments.length === 0 ? (
          <div className="empty-state">
            <h3>No appointments found</h3>
          </div>
        ) : (
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Service Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Accepted By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>
                    {appointment.userId?.name || 'N/A'}
                    <br />
                    <small style={{ color: '#ccc' }}>{appointment.userId?.email || ''}</small>
                  </td>
                  <td style={{ color: '#fff' }}>{appointment.serviceType}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>{appointment.timeSlot}</td>
                  <td>₹{appointment.amount}</td>
                    <td>{getPaymentBadge(appointment.paymentStatus)}</td>
                    <td>{getStatusBadge(appointment.status)}</td>
                    <td>
                      {appointment.status === 'accepted' && appointment.adminName ? (
                        <div style={{ fontSize: '12px', color: '#fff' }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{appointment.adminName}</div>
                          <div style={{ color: '#ccc', fontSize: '11px' }}>📞 {appointment.adminPhone}</div>
                          <div style={{ color: '#ccc', fontSize: '11px' }}>📍 {appointment.adminLocation}</div>
                        </div>
                      ) : (
                        <span style={{ color: '#666' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {appointment.status === 'booked' && (
                          <button
                            onClick={() => handleAcceptClick(appointment)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                              color: '#000',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            ✅ Accept
                          </button>
                        )}
                        {appointment.status === 'accepted' && appointment.adminName && (
                          <div style={{
                            padding: '6px 12px',
                            background: 'rgba(102, 126, 234, 0.2)',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#fff',
                            border: '1px solid rgba(102, 126, 234, 0.3)'
                          }}>
                            ✅ Accepted by: {appointment.adminName}
                          </div>
                        )}
                        <select
                          value={appointment.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            
                            // Prevent changing from accepted to booked
                            if (appointment.status === 'accepted' && newStatus === 'booked') {
                              alert('⚠️ This appointment is already accepted by ' + (appointment.adminName || 'another admin') + '. Cannot change back to booked status.');
                              return;
                            }
                            
                            // Prevent accepting completed appointments
                            if (appointment.status === 'completed' && newStatus === 'accepted') {
                              alert('⚠️ Cannot accept a completed appointment.\n\nCompleted appointments cannot be accepted or modified.');
                              return;
                            }
                            
                            // Prevent accepting cancelled appointments
                            if (appointment.status === 'cancelled' && newStatus === 'accepted') {
                              alert('⚠️ Cannot accept a cancelled appointment.\n\nCancelled appointments cannot be accepted.');
                              return;
                            }
                            
                            handleStatusUpdate(appointment._id, newStatus);
                          }}
                          className="form-group"
                          style={{ padding: '5px', fontSize: '14px', minWidth: '120px' }}
                        >
                          <option value="booked">Booked</option>
                          <option 
                            value="accepted" 
                            disabled={appointment.status === 'accepted' || appointment.status === 'completed' || appointment.status === 'cancelled'}
                          >
                            Accepted {
                              appointment.status === 'accepted' ? '(Already Accepted)' : 
                              appointment.status === 'completed' ? '(Cannot Accept Completed)' : 
                              appointment.status === 'cancelled' ? '(Cannot Accept Cancelled)' : 
                              ''
                            }
                          </option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
          <h2 style={{ color: '#fff', marginBottom: '20px', fontSize: '24px' }}>All Users ({users.length})</h2>
          {users.length === 0 ? (
            <div className="empty-state">
              <h3>No users found</h3>
            </div>
          ) : (
            <table className="table responsive-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Total Appointments</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => {
                  const userId = userItem.id || userItem._id;
                  const userAppointments = appointments.filter(apt => {
                    const aptUserId = apt.userId?._id || apt.userId?.id || apt.userId;
                    return String(aptUserId) === String(userId);
                  });
                  return (
                    <tr key={userId}>
                      <td style={{ color: '#fff', fontWeight: '600' }}>
                        {userItem.name}
                        {userItem.role === 'admin' && (
                          <span style={{
                            marginLeft: '10px',
                            padding: '4px 8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#fff'
                          }}>ADMIN</span>
                        )}
                      </td>
                      <td style={{ color: '#fff' }}>{userItem.email}</td>
                      <td>
                        <span className={`badge ${userItem.role === 'admin' ? 'badge-info' : 'badge-success'}`}>
                          {userItem.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td style={{ color: '#ccc' }}>
                        {userItem.createdAt 
                          ? new Date(userItem.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          : 'N/A'}
                      </td>
                      <td style={{ color: '#fff', fontWeight: '600' }}>{userAppointments.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
