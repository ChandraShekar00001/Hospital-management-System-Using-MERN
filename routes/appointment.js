const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   GET /api/appointment
// @desc    Get all appointments (admin) or user-specific appointments
// @access  Private
router.get('/', async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'admin') {
      appointments = await Appointment.find()
        .populate('patientId', 'user')
        .populate('doctorId', 'user')
        .sort('-createdAt');
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      appointments = await Appointment.find({ doctorId: doctor._id })
        .populate('patientId', 'user')
        .sort('-createdAt');
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      appointments = await Appointment.find({ patientId: patient._id })
        .populate('doctorId', 'user')
        .sort('-createdAt');
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointment/approved
// @desc    Get approved appointments
// @access  Private
router.get('/approved', async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'admin') {
      appointments = await Appointment.find({ status: true })
        .populate('patientId', 'user')
        .populate('doctorId', 'user')
        .sort('-createdAt');
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      appointments = await Appointment.find({ doctorId: doctor._id, status: true })
        .populate('patientId', 'user')
        .sort('-createdAt');
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      appointments = await Appointment.find({ patientId: patient._id, status: true })
        .populate('doctorId', 'user')
        .sort('-createdAt');
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get approved appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/appointment/pending
// @desc    Get pending appointments
// @access  Private
router.get('/pending', async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'admin') {
      appointments = await Appointment.find({ status: false })
        .populate('patientId', 'user')
        .populate('doctorId', 'user')
        .sort('-createdAt');
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      appointments = await Appointment.find({ doctorId: doctor._id, status: false })
        .populate('patientId', 'user')
        .sort('-createdAt');
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      appointments = await Appointment.find({ patientId: patient._id, status: false })
        .populate('doctorId', 'user')
        .sort('-createdAt');
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get pending appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/appointment
// @desc    Create a new appointment
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, description } = req.body;

    // Get doctor and patient details
    const doctor = await Doctor.findById(doctorId).populate('user');
    const patient = await Patient.findById(patientId).populate('user');

    if (!doctor || !patient) {
      return res.status(404).json({ message: 'Doctor or patient not found' });
    }

    const appointment = new Appointment({
      doctorId,
      patientId,
      doctorName: `${doctor.user.firstName} ${doctor.user.lastName}`,
      patientName: `${patient.user.firstName} ${patient.user.lastName}`,
      description,
      status: req.user.role === 'admin' ? true : false
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: await appointment.populate([
        { path: 'doctorId', populate: { path: 'user' } },
        { path: 'patientId', populate: { path: 'user' } }
      ])
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointment/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { description, status } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const previousStatus = appointment.status;

    // Only admin can update status
    if (req.user.role === 'admin' && status !== undefined) {
      appointment.status = status;
    }

    if (description) {
      appointment.description = description;
    }

    await appointment.save();

    // Auto-generate invoice when appointment is confirmed (status changes from false to true)
    if (req.user.role === 'admin' && status === true && previousStatus === false) {
      try {
        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ appointment: appointment._id });
        
        if (!existingInvoice) {
          const appointmentFee = 100;
          const items = [
            { description: 'Appointment Fee', amount: appointmentFee }
          ];
          
          const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
          const tax = subtotal * 0.1; // 10% tax
          const total = subtotal + tax;

          const invoice = new Invoice({
            appointment: appointment._id,
            patient: appointment.patientId,
            doctor: appointment.doctorId,
            items,
            subtotal,
            tax,
            total,
            appointmentFee
          });

          await invoice.save();
        }
      } catch (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        // Don't fail the appointment update if invoice creation fails
      }
    }

    res.json({
      message: 'Appointment updated successfully',
      appointment: await appointment.populate([
        { path: 'doctorId', populate: { path: 'user' } },
        { path: 'patientId', populate: { path: 'user' } }
      ])
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/appointment/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only admin and doctor can delete appointments
    if (req.user.role === 'patient') {
      return res.status(403).json({ message: 'Not authorized to delete appointments' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/appointment/:id/approve
// @desc    Approve appointment (admin only)
// @access  Private (Admin only)
router.put('/:id/approve', authorize('admin'), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: true },
      { new: true }
    ).populate([
      { path: 'doctorId', populate: { path: 'user' } },
      { path: 'patientId', populate: { path: 'user' } }
    ]);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({
      message: 'Appointment approved successfully',
      appointment
    });
  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 