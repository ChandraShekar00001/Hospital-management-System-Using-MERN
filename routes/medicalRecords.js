const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

router.get('/',  async (req, res) => {
  try {
    // Find doctor profile for the logged-in user
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Fetch all records belonging to this doctor
    const records = await MedicalRecord.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .sort('-createdAt');

    res.json(records);
  } catch (error) {
    console.error('Get doctor medical records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/medical-records/patient/:patientId
// @desc    Get medical records for a patient
// @access  Private (Doctor or Patient can view their own records)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Check if user is authorized to view these records
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || patient._id.toString() !== patientId) {
        return res.status(403).json({ message: 'Not authorized to view these records' });
      }
    }

    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort('-createdAt');

    res.json(records);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/medical-records
// @desc    Create a new medical record
// @access  Private (Doctor only)
router.post('/', authorize('doctor'), async (req, res) => {
  try {
    const {
      patientId,
      diagnosis,
      treatment,
      prescription,
      notes,
      vitalSigns,
      followUpDate
    } = req.body;

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const medicalRecord = new MedicalRecord({
      patientId,
      doctorId: doctor._id,
      diagnosis,
      treatment,
      prescription,
      notes,
      vitalSigns,
      followUpDate
    });

    await medicalRecord.save();

    const populatedRecord = await MedicalRecord.findById(medicalRecord._id).populate({
        path: 'doctorId',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      });

    res.status(201).json(populatedRecord);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/medical-records/:recordId
// @desc    Update a medical record
// @access  Private (Doctor only)
router.put('/:recordId', authorize('doctor'), async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = req.body;

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find the record and verify doctor owns it
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    if (record.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this record' });
    }
     m       
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      recordId,
      { ...updateData, updatedAt: Date.now() },
      { new: true }
    ).populate({
       path: 'doctorId',
       populate: {
         path: 'user',
         select: 'firstName lastName'
       }
     });

    res.json(updatedRecord);
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/medical-records/:recordId
// @desc    Delete a medical record
// @access  Private (Doctor only)
router.delete('/:recordId', authorize('doctor'), async (req, res) => {
  try {
    const { recordId } = req.params;

    // Get doctor profile
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Find the record and verify doctor owns it
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Medical record not found' });
    }

    if (record.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await MedicalRecord.findByIdAndDelete(recordId);
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
