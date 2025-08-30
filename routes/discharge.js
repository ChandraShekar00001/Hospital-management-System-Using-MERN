const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const PatientDischargeDetails = require('../models/PatientDischargeDetails');
const PDFDocument = require('pdfkit');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('admin'));

// @route   GET /api/discharge/patients
// @desc    Get patients for discharge
// @access  Private (Admin only)
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find({ status: true }).populate('user', 'firstName lastName');
    res.json(patients);
  } catch (error) {
    console.error('Get discharge patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/discharge/:patientId
// @desc    Discharge a patient
// @access  Private (Admin only)
router.post('/:patientId', async (req, res) => {
  try {
    const { roomCharge, medicineCost, doctorFee, otherCharge } = req.body;
    
    const patient = await Patient.findById(req.params.patientId).populate('user');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const doctor = await Doctor.findById(patient.assignedDoctorId).populate('user');
    if (!doctor) {
      return res.status(404).json({ message: 'Assigned doctor not found' });
    }

    const releaseDate = new Date();
    const daySpent = Math.ceil((releaseDate - patient.admitDate) / (1000 * 60 * 60 * 24));
    
    const total = (parseInt(roomCharge) * daySpent) + 
                  parseInt(medicineCost) + 
                  parseInt(doctorFee) + 
                  parseInt(otherCharge);

    const dischargeDetails = new PatientDischargeDetails({
      patientId: patient._id,
      patientName: `${patient.user.firstName} ${patient.user.lastName}`,
      assignedDoctorName: `${doctor.user.firstName} ${doctor.user.lastName}`,
      address: patient.address,
      mobile: patient.mobile,
      symptoms: patient.symptoms,
      admitDate: patient.admitDate,
      releaseDate,
      daySpent,
      roomCharge: parseInt(roomCharge) * daySpent,
      medicineCost: parseInt(medicineCost),
      doctorFee: parseInt(doctorFee),
      otherCharge: parseInt(otherCharge),
      total
    });

    await dischargeDetails.save();

    res.json({
      message: 'Patient discharged successfully',
      dischargeDetails
    });
  } catch (error) {
    console.error('Discharge patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/discharge/:patientId/pdf
// @desc    Generate PDF bill for discharged patient
// @access  Private (Admin only)
router.get('/:patientId/pdf', async (req, res) => {
  try {
    const dischargeDetails = await PatientDischargeDetails.findOne({
      patientId: req.params.patientId
    }).sort('-createdAt');

    if (!dischargeDetails) {
      return res.status(404).json({ message: 'Discharge details not found' });
    }

    // Create PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${dischargeDetails.patientName}.pdf`);
    
    // Pipe PDF to response 
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text('HOSPITAL BILL', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Patient Name: ${dischargeDetails.patientName}`);
    doc.text(`Assigned Doctor: ${dischargeDetails.assignedDoctorName}`);
    doc.text(`Address: ${dischargeDetails.address}`);
    doc.text(`Mobile: ${dischargeDetails.mobile}`);
    doc.text(`Symptoms: ${dischargeDetails.symptoms}`);
    doc.moveDown();
    
    doc.text(`Admit Date: ${dischargeDetails.admitDate.toDateString()}`);
    doc.text(`Release Date: ${dischargeDetails.releaseDate.toDateString()}`);
    doc.text(`Days Spent: ${dischargeDetails.daySpent}`);
    doc.moveDown();
    
    doc.fontSize(14).text('BILL DETAILS', { underline: true });
    doc.fontSize(12);
    doc.text(`Room Charge (${dischargeDetails.daySpent} days): $${dischargeDetails.roomCharge}`);
    doc.text(`Medicine Cost: $${dischargeDetails.medicineCost}`);
    doc.text(`Doctor Fee: $${dischargeDetails.doctorFee}`);
    doc.text(`Other Charges: $${dischargeDetails.otherCharge}`);
    doc.moveDown();
    
    doc.fontSize(16).text(`TOTAL: $${dischargeDetails.total}`, { align: 'right' });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/discharge/details/:patientId
// @desc    Get discharge details for a patient
// @access  Private (Admin only)
router.get('/details/:patientId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).populate('user');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const doctor = await Doctor.findById(patient.assignedDoctorId).populate('user');
    const releaseDate = new Date();
    const daySpent = Math.ceil((releaseDate - patient.admitDate) / (1000 * 60 * 60 * 24));

    const patientData = {
      patientId: patient._id,
      name: `${patient.user.firstName} ${patient.user.lastName}`,
      mobile: patient.mobile,
      address: patient.address,
      symptoms: patient.symptoms,
      admitDate: patient.admitDate,
      todayDate: releaseDate,
      day: daySpent,
      assignedDoctorName: doctor ? `${doctor.user.firstName} ${doctor.user.lastName}` : 'Not Assigned'
    };

    res.json(patientData);
  } catch (error) {
    console.error('Get discharge details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 