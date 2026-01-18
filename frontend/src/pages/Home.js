import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Home Page - Impressive Landing Page
 */
const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ paddingTop: '20px', paddingBottom: '60px', background: '#000000', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div className="hero-section" style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="page-title" style={{ fontSize: '56px', marginBottom: '20px' }}>
          Book Your Appointments Online
        </h1>
        <p style={{ 
          fontSize: '22px', 
          color: 'rgba(255, 255, 255, 0.9)',
          maxWidth: '700px',
          margin: '0 auto 40px',
          lineHeight: '1.6',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
        }}>
          Schedule your appointments with ease. Choose your preferred date and time, 
          make secure payments, and manage all your bookings in one place.
        </p>
        {!isAuthenticated && (
          <div className="hero-buttons" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary" style={{ 
              padding: '16px 40px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ 
              padding: '16px 40px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Login
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <div>
            <Link to="/book-appointment" className="btn btn-primary" style={{ 
              padding: '16px 40px', 
              fontSize: '18px',
              fontWeight: '600'
            }}>
              Book Appointment Now
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-grid" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '30px',
        padding: '0 20px'
      }}>
        {/* Feature 1 */}
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>📅</div>
          <h3 style={{
            fontSize: '24px',
            marginBottom: '15px',
            color: '#333',
            fontWeight: '700'
          }}>
            Easy Scheduling
          </h3>
          <p style={{
            color: '#666',
            lineHeight: '1.6',
            fontSize: '16px'
          }}>
            Book appointments in just a few clicks. Select your preferred date and time slot instantly.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>💳</div>
          <h3 style={{
            fontSize: '24px',
            marginBottom: '15px',
            color: '#333',
            fontWeight: '700'
          }}>
            Secure Payments
          </h3>
          <p style={{
            color: '#666',
            lineHeight: '1.6',
            fontSize: '16px'
          }}>
            Make secure online payments using Razorpay. Multiple payment options available.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="card" style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px'
          }}>📱</div>
          <h3 style={{
            fontSize: '24px',
            marginBottom: '15px',
            color: '#333',
            fontWeight: '700'
          }}>
            Manage Bookings
          </h3>
          <p style={{
            color: '#666',
            lineHeight: '1.6',
            fontSize: '16px'
          }}>
            View, reschedule, or cancel your appointments anytime from your dashboard.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '60px auto 0',
        padding: '0 20px'
      }}>
        <div className="card" style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '36px',
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '700'
          }}>
            Available Services
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏥</div>
              <h4 style={{ color: '#333', fontWeight: '600', marginBottom: '5px' }}>Consultation</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>Medical consultation services</p>
            </div>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
              <h4 style={{ color: '#333', fontWeight: '600', marginBottom: '5px' }}>Checkup</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>Regular health checkups</p>
            </div>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
              <h4 style={{ color: '#333', fontWeight: '600', marginBottom: '5px' }}>Follow-up</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>Follow-up appointments</p>
            </div>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(102, 126, 234, 0.2)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🚨</div>
              <h4 style={{ color: '#333', fontWeight: '600', marginBottom: '5px' }}>Emergency</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>Emergency appointments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      {!isAuthenticated && (
        <div style={{ 
          maxWidth: '800px', 
          margin: '60px auto 0',
          padding: '0 20px',
          textAlign: 'center'
        }}>
          <div className="card" style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '32px',
              marginBottom: '20px',
              color: '#333',
              fontWeight: '700'
            }}>
              Why Choose Us?
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              textAlign: 'left',
              marginTop: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div>
                  <strong style={{ color: '#333' }}>24/7 Availability</strong>
                  <p style={{ color: '#666', marginTop: '5px' }}>Book appointments anytime, anywhere</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div>
                  <strong style={{ color: '#333' }}>Instant Confirmation</strong>
                  <p style={{ color: '#666', marginTop: '5px' }}>Get immediate confirmation of your bookings</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div>
                  <strong style={{ color: '#333' }}>Secure & Reliable</strong>
                  <p style={{ color: '#666', marginTop: '5px' }}>Your data is safe with encrypted transactions</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <div>
                  <strong style={{ color: '#333' }}>Easy Management</strong>
                  <p style={{ color: '#666', marginTop: '5px' }}>Manage all your appointments from one dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
