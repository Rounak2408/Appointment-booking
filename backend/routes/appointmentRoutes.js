const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointment,
  cancelAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  acceptAppointment
} = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  validateCreateAppointment,
  validateUpdateStatus
} = require('../validators/appointmentValidators');

// User routes
router.post('/', auth, validateCreateAppointment, createAppointment);
router.get('/my-appointments', auth, getMyAppointments);
router.get('/:id', auth, getAppointment);
router.put('/:id/cancel', auth, cancelAppointment);

// Admin routes
router.get('/', auth, admin, getAllAppointments);
router.put('/:id/status', auth, admin, validateUpdateStatus, updateAppointmentStatus);
router.put('/:id/accept', auth, admin, acceptAppointment);

module.exports = router;
