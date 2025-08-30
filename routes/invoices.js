const express = require('express');
const { auth } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/invoices/generate
// @desc    Generate invoice for appointment
// @access  Private (Admin/Doctor)
router.post('/generate', async (req, res) => {
  try {
    const { appointmentId, additionalCharges = [] } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patient')
      .populate('doctor');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if invoice already exists
    const existingInvoice = await Invoice.findOne({ appointment: appointmentId });
    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this appointment' });
    }

    const appointmentFee = 100;
    const consultationFee = appointment.status === 'completed' ? 200 : 0;
    
    let items = [
      { description: 'Appointment Fee', amount: appointmentFee }
    ];

    if (consultationFee > 0) {
      items.push({ description: 'Consultation Fee', amount: consultationFee });
    }

    // Add additional charges
    additionalCharges.forEach(charge => {
      items.push(charge);
    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const invoice = new Invoice({
      appointment: appointmentId,
      patient: appointment.patient._id,
      doctor: appointment.doctor._id,
      items,
      subtotal,
      tax,
      total,
      appointmentFee,
      consultationFee,
      additionalCharges
    });

    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate('patient')
      .populate('doctor')
      .populate('appointment');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices/patient/:patientId
// @desc    Get invoices for a patient
// @access  Private
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const invoices = await Invoice.find({ patient: patientId })
      .populate('doctor', 'firstName lastName department')
      .populate('appointment', 'appointmentDate appointmentTime')
      .sort('-createdAt');

    res.json(invoices);
  } catch (error) {
    console.error('Get patient invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invoices/:invoiceId
// @desc    Get invoice by ID
// @access  Private
router.get('/:invoiceId', async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId)
      .populate('patient')
      .populate('doctor', 'firstName lastName department')
      .populate('appointment');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/invoices/:invoiceId/add-charges
// @desc    Add additional charges to invoice
// @access  Private (Doctor/Admin)
router.put('/:invoiceId/add-charges', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { charges } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Add new charges
    charges.forEach(charge => {
      invoice.items.push(charge);
      invoice.additionalCharges.push(charge);
    });

    // Recalculate totals
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    invoice.tax = invoice.subtotal * 0.1;
    invoice.total = invoice.subtotal + invoice.tax;

    await invoice.save();

    const updatedInvoice = await Invoice.findById(invoiceId)
      .populate('patient')
      .populate('doctor', 'firstName lastName department')
      .populate('appointment');

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Add charges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/invoices/:invoiceId/status
// @desc    Update invoice status
// @access  Private (Admin)
router.put('/:invoiceId/status', async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { status, paymentDate } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = status;
    if (status === 'paid' && paymentDate) {
      invoice.paymentDate = paymentDate;
    }

    await invoice.save();

    res.json({ message: 'Invoice status updated successfully' });
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
