const Razorpay = require('razorpay');
const crypto = require('crypto');
const Appointment = require('../models/Appointment');

/**
 * Get Razorpay instance (lazy initialization)
 * Only initializes when needed and checks for environment variables
 */
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

/**
 * @route   POST /api/payments/create-order
 * @desc    Create Razorpay order for appointment payment
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user owns this appointment
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this appointment'
      });
    }

    // Check if already paid
    if (appointment.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this appointment'
      });
    }

    // Check if appointment is cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled appointment'
      });
    }

    // Check if Razorpay is configured
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check for dummy/invalid keys
    if (!keyId || !keySecret || 
        keyId === 'rzp_test_dummy' || 
        keyId === 'rzp_test_your_key_id_here' ||
        keySecret === 'dummy_secret' ||
        keySecret === 'your_razorpay_key_secret_here' ||
        keyId.includes('your_key') ||
        keySecret.includes('your_')) {
      // Razorpay not configured - mark payment as paid automatically
      appointment.paymentStatus = 'paid';
      await appointment.save();

      return res.json({
        success: true,
        message: 'Payment skipped (Razorpay not configured). Appointment confirmed.',
        data: {
          orderId: null,
          amount: appointment.amount * 100,
          currency: 'INR',
          keyId: null,
          paymentSkipped: true
        }
      });
    }

    // Get Razorpay instance
    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (error) {
      // If Razorpay initialization fails, skip payment
      appointment.paymentStatus = 'paid';
      await appointment.save();

      return res.json({
        success: true,
        message: 'Payment skipped (Razorpay configuration error). Appointment confirmed.',
        data: {
          orderId: null,
          amount: appointment.amount * 100,
          currency: 'INR',
          keyId: null,
          paymentSkipped: true
        }
      });
    }

    // Create Razorpay order
    const options = {
      amount: appointment.amount * 100, // Amount in paise (multiply by 100)
      currency: 'INR',
      receipt: `appointment_${appointmentId}`,
      notes: {
        appointmentId: appointmentId.toString(),
        userId: req.user.id,
        serviceType: appointment.serviceType
      }
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorpayError) {
      console.error('Razorpay API error:', razorpayError);
      
      // Check if it's an authentication error
      const isAuthError = razorpayError.statusCode === 401 || 
                         (razorpayError.error && razorpayError.error.code === 'BAD_REQUEST_ERROR') ||
                         razorpayError.message?.includes('Authentication failed');
      
      // If Razorpay API fails (authentication error, etc.), skip payment
      appointment.paymentStatus = 'paid';
      await appointment.save();

      return res.json({
        success: true,
        message: isAuthError 
          ? 'Payment skipped (Razorpay authentication failed - invalid keys). Appointment confirmed.'
          : 'Payment skipped (Razorpay API error). Appointment confirmed.',
        data: {
          orderId: null,
          amount: appointment.amount * 100,
          currency: 'INR',
          keyId: null,
          paymentSkipped: true
        }
      });
    }

    // Update appointment with order ID
    appointment.razorpayOrderId = order.id;
    await appointment.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay payment and update appointment
 * @access  Private
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user owns this appointment
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to verify payment for this appointment'
      });
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Update appointment payment status
    appointment.paymentStatus = 'paid';
    appointment.razorpayPaymentId = razorpay_payment_id;
    appointment.status = 'booked'; // Ensure status is booked after payment
    await appointment.save();

    res.json({
      success: true,
      message: 'Payment verified and appointment confirmed successfully',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};
