const Appointment = require('../models/Appointment');

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { serviceType, date, timeSlot, amount } = req.body;
    const userId = req.user.id;

    // Check if appointment already exists for this date and timeSlot
    const existingAppointment = await Appointment.findOne({
      date: new Date(date),
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Check if Razorpay is configured
    const hasRazorpayKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
    
    // Create appointment
    // If Razorpay is not configured, mark payment as paid (skip payment)
    const appointment = await Appointment.create({
      userId,
      serviceType,
      date: new Date(date),
      timeSlot,
      amount: amount || 500, // Default amount if not provided
      paymentStatus: hasRazorpayKeys ? 'pending' : 'paid' // Skip payment if Razorpay not configured
    });

    // Determine success message based on payment status
    const message = hasRazorpayKeys 
      ? 'Appointment created successfully. Please complete payment.'
      : 'Appointment created successfully. Payment skipped (Razorpay not configured).';

    res.status(201).json({
      success: true,
      message: message,
      data: { appointment }
    });
  } catch (error) {
    // Handle duplicate key error (double booking)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    next(error);
  }
};

/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Get current user's appointments
 * @access  Private
 */
exports.getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment by ID
 * @access  Private
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('userId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user owns this appointment or is admin
    if (appointment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Cancel appointment (user can cancel their own)
 * @access  Private
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

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
        message: 'Not authorized to cancel this appointment'
      });
    }

    // Check if already cancelled or completed
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (Admin only)
 * @access  Private/Admin
 */
exports.getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status (Admin only)
 * @access  Private/Admin
 */
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    console.log('Update status request:', { appointmentId: req.params.id, newStatus: status });
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Valid statuses
    const validStatuses = ['booked', 'accepted', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
      console.log('Invalid status:', status, 'Valid statuses:', validStatuses);
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log('Updating appointment status from', appointment.status, 'to', status);
    appointment.status = status;
    
    await appointment.save();
    console.log('Appointment status updated successfully');

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Update status error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`
      });
    }
    
    next(error);
  }
};

/**
 * @route   PUT /api/appointments/:id/accept
 * @desc    Accept appointment by admin using admin's profile details (Admin only)
 * @access  Private/Admin
 */
exports.acceptAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    console.log('Accept appointment request:', { appointmentId, adminId: req.user.id || req.user._id });

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      console.log('Appointment not found:', appointmentId);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    console.log('Appointment found:', {
      id: appointment._id,
      status: appointment.status,
      userId: appointment.userId
    });

    // Get admin details from database to ensure we have latest data including phone and location
    const User = require('../models/User');
    // req.user is already the user object from auth middleware, but we need to fetch fresh data with phone/location
    const adminId = req.user._id || req.user.id;
    const admin = await User.findById(adminId);
    
    if (!admin) {
      console.log('Admin user not found:', adminId);
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    console.log('Admin found:', {
      id: admin._id,
      name: admin.name,
      phone: admin.phone,
      location: admin.location,
      role: admin.role
    });

    // Validate admin has required fields
    const adminPhone = admin.phone ? admin.phone.toString().trim() : '';
    const adminLocation = admin.location ? admin.location.toString().trim() : '';
    
    if (!adminPhone || !adminLocation) {
      console.log('Admin profile incomplete:', { 
        phone: adminPhone || 'MISSING', 
        location: adminLocation || 'MISSING',
        adminId: admin._id,
        adminRole: admin.role
      });
      return res.status(400).json({
        success: false,
        message: `Admin profile is incomplete!\n\nPhone: ${adminPhone || '❌ Missing'}\nLocation: ${adminLocation || '❌ Missing'}\n\nPlease sign up again as Admin with Phone and Location, or update your profile.`
      });
    }

    // Check if appointment is already cancelled or completed
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept a cancelled appointment'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept a completed appointment'
      });
    }

    if (appointment.status === 'accepted') {
      const acceptedAdminName = appointment.adminName || 'Another admin';
      return res.status(400).json({
        success: false,
        message: `Appointment is already accepted by ${acceptedAdminName}. Only one admin can accept an appointment.`
      });
    }

    // Update appointment with admin details from profile
    appointment.status = 'accepted';
    appointment.acceptedBy = admin._id;
    appointment.adminName = admin.name;
    appointment.adminPhone = adminPhone;
    appointment.adminLocation = adminLocation;
    appointment.acceptedAt = new Date();

    await appointment.save();
    console.log('Appointment updated successfully:', {
      id: appointment._id,
      status: appointment.status,
      adminName: appointment.adminName,
      adminPhone: appointment.adminPhone,
      adminLocation: appointment.adminLocation
    });

    // Populate user details for response
    await appointment.populate('userId', 'name email');

    res.json({
      success: true,
      message: 'Appointment accepted successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Accept appointment error:', error);
    next(error);
  }
};
