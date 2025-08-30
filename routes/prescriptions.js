const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor)
router.post('/', authorize('doctor'), async (req, res) => {
  try {
    const { 
      patientId, 
      appointmentId, 
      medications, 
      diagnosis, 
      symptoms, 
      notes, 
      followUpDate 
    } = req.body;

    // Get doctor ID from user
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = new Prescription({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId,
      medications,
      diagnosis,
      symptoms,
      notes,
      followUpDate
    });

    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: 'patient',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctor',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate description');

    res.status(201).json(populatedPrescription);
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/my
// @desc    Get prescriptions for current doctor
// @access  Private (Doctor)
router.get('/my', authorize('doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescriptions = await Prescription.find({ doctor: doctor._id })
      .populate({
        path: 'patient',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctor',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate description')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    console.error('Get doctor prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get prescriptions for a patient
// @access  Private
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate({
        path: 'doctor',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate description')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/my-prescriptions
// @desc    Get prescriptions for current patient
// @access  Private (Patient)
router.get('/my-prescriptions', authorize('patient'), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({
        path: 'patient',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctor',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate description')
      .sort('-createdAt');

    res.json(prescriptions);
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/prescriptions/:prescriptionId
// @desc    Get prescription by ID
// @access  Private
router.get('/:prescriptionId', async (req, res) => {
  try {
    const { prescriptionId } = req.params;

    const prescription = await Prescription.findById(prescriptionId)
      .populate({
        path: 'patient',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctor',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate description');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/prescriptions/:prescriptionId
// @desc    Update prescription
// @access  Private (Doctor)
router.put('/:prescriptionId', authorize('doctor'), async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const updates = req.body;

    // Get doctor ID from user
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Only the doctor who created it can update
    if (prescription.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.keys(updates).forEach(key => {
      prescription[key] = updates[key];
    });

    await prescription.save();

    const updatedPrescription = await Prescription.findById(prescriptionId)
      .populate({
        path: 'patient',
        select: 'user symptoms',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate({
        path: 'doctor',
        select: 'user department',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .populate('appointment', 'appointmentDate description');

    res.json(updatedPrescription);
  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
