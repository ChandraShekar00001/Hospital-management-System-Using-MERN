const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const PatientDischargeDetails = require('../models/PatientDischargeDetails');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('doctor'));

// @route   GET /api/doctor/dashboard
// @desc    Get doctor dashboard data
// @access  Private (Doctor only)
router.get('/dashboard', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const patientCount = await Patient.countDocuments({ 
      status: true, 
      assignedDoctorId: doctor._id 
    });
    
    const appointmentCount = await Appointment.countDocuments({ 
      status: true, 
      doctorId: doctor._id 
    });
    
    const patientDischarged = await PatientDischargeDetails.countDocuments({ 
      assignedDoctorName: `${req.user.firstName} ${req.user.lastName}` 
    });

    // Get recent appointments with patient details
    const appointments = await Appointment.find({ 
      status: true, 
      doctorId: doctor._id 
    })
    .populate({
      path: 'patientId',
      select: 'user symptoms',
      populate: {
        path: 'user',
        select: 'firstName lastName'
      }
    })
    .sort('-createdAt')
    .limit(10);

    res.json({
      patientCount,
      appointmentCount,
      patientDischarged,
      appointments,
      doctor
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctor/patients
// @desc    Get patients assigned to doctor
// @access  Private (Doctor only)
router.get('/patients', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const patients = await Patient.find({ 
      status: true, 
      assignedDoctorId: doctor._id 
    }).populate('user', 'firstName lastName email');

    res.json(patients);
  } catch (error) {
    console.error('Get doctor patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctor/patients/search
// @desc    Search patients by symptoms or name
// @access  Private (Doctor only)
router.get('/patients/search', async (req, res) => {
  try {
    const { query } = req.query;
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const patients = await Patient.find({
      status: true,
      assignedDoctorId: doctor._id,
      $or: [
        { symptoms: { $regex: query, $options: 'i' } },
        { 'user.firstName': { $regex: query, $options: 'i' } },
        { 'user.lastName': { $regex: query, $options: 'i' } }
      ]
    }).populate('user', 'firstName lastName email');

    res.json(patients);
  } catch (error) {
    console.error('Search patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctor/discharged-patients
// @desc    Get discharged patients
// @access  Private (Doctor only)
router.get('/discharged-patients', async (req, res) => {
  try {
    const dischargedPatients = await PatientDischargeDetails.find({
      assignedDoctorName: `${req.user.firstName} ${req.user.lastName}`
    }).sort('-createdAt');

    res.json(dischargedPatients);
  } catch (error) {
    console.error('Get discharged patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctor/appointments
// @desc    Get doctor's appointments
// @access  Private (Doctor only)
router.get('/appointments', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .sort('-createdAt');

    res.json(appointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctor/appointments/approved
// @desc    Get doctor's approved appointments
// @access  Private (Doctor only)
router.get('/appointments/approved', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ 
      doctorId: doctor._id, 
      status: true 
    })
      .populate({
        path: 'patientId',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort('-createdAt');

    res.json(appointments);
  } catch (error) {
    console.error('Get approved appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doctor/appointments/pending
// @desc    Get doctor's pending appointments
// @access  Private (Doctor only)
router.get('/appointments/pending', async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ 
      doctorId: doctor._id, 
      status: false 
    })
      .populate({
        path: 'patientId',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort('-createdAt');

    res.json(appointments);
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doctor/profile
// @desc    Update doctor profile
// @access  Private (Doctor only)
router.put('/profile', async (req, res) => {
  try {
    const { address, mobile, department } = req.body;
    
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.address = address || doctor.address;
    doctor.mobile = mobile || doctor.mobile;
    doctor.department = department || doctor.department;
    
    await doctor.save();

    res.json({
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;