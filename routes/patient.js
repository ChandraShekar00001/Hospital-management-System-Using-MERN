const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const PatientDischargeDetails = require('../models/PatientDischargeDetails');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('patient'));

// @route   GET /api/patient/dashboard
// @desc    Get patient dashboard data
// @access  Private (Patient only)
router.get('/dashboard', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate('user', 'firstName lastName email');
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    let doctor = null;
    if (patient.assignedDoctorId) {
      doctor = await Doctor.findById(patient.assignedDoctorId).populate('user', 'firstName lastName');
    }

    res.json({
      patient,
      doctorName: doctor ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'Not Assigned',
      doctorMobile: doctor ? doctor.mobile : 'N/A',
      doctorAddress: doctor ? doctor.address : 'N/A',
      symptoms: patient.symptoms,
      doctorDepartment: doctor ? doctor.department : 'N/A',
      admitDate: patient.admitDate
    });
  } catch (error) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patient/doctors
// @desc    Get all approved doctors
// @access  Private (Patient only)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: true }).populate('user', 'firstName lastName email');
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patient/doctors/search
// @desc    Search doctors by department or name
// @access  Private (Patient only)
router.get('/doctors/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    const doctors = await Doctor.find({
      status: true,
      $or: [
        { department: { $regex: query, $options: 'i' } },
        { 'user.firstName': { $regex: query, $options: 'i' } },
        { 'user.lastName': { $regex: query, $options: 'i' } }
      ]
    }).populate('user', 'firstName lastName email');

    res.json(doctors);
  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patient/appointments
// @desc    Get patient's appointments
// @access  Private (Patient only)
router.get('/appointments', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      })
      .sort('-createdAt');

    res.json(appointments);
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/patient/appointments
// @desc    Book a new appointment
// @access  Private (Patient only)
router.post('/appointments', async (req, res) => {
  try {
    const { doctorId, description } = req.body;
    
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const appointment = new Appointment({
      doctorId,
      patientId: patient._id,
      doctorName: `${doctor.user.firstName} ${doctor.user.lastName}`,
      patientName: `${req.user.firstName} ${req.user.lastName}`,
      description,
      status: false
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: await appointment.populate([
        { path: 'doctorId', populate: { path: 'user' } },
        { path: 'patientId', populate: { path: 'user' } }
      ])
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/patient/discharge
// @desc    Get patient discharge details
// @access  Private (Patient only)
router.get('/discharge', async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const dischargeDetails = await PatientDischargeDetails.findOne({
      patientId: patient._id
    }).sort('-createdAt');

    if (!dischargeDetails) {
      return res.json({
        isDischarged: false,
        patient
      });
    }

    res.json({
      isDischarged: true,
      patient,
      patientId: patient._id,
      patientName: patient.name,
      assignedDoctorName: dischargeDetails.assignedDoctorName,
      address: patient.address,
      mobile: patient.mobile,
      symptoms: patient.symptoms,
      admitDate: patient.admitDate,
      releaseDate: dischargeDetails.releaseDate,
      daySpent: dischargeDetails.daySpent,
      medicineCost: dischargeDetails.medicineCost,
      roomCharge: dischargeDetails.roomCharge,
      doctorFee: dischargeDetails.doctorFee,
      otherCharge: dischargeDetails.otherCharge,
      total: dischargeDetails.total
    });
  } catch (error) {
    console.error('Get discharge details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/patient/profile
// @desc    Update patient profile
// @access  Private (Patient only)
router.put('/profile', async (req, res) => {
  try {
    const { address, mobile, symptoms } = req.body;
    
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    patient.address = address || patient.address;
    patient.mobile = mobile || patient.mobile;
    patient.symptoms = symptoms || patient.symptoms;
    
    await patient.save();

    res.json({
      message: 'Profile updated successfully',
      patient
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 