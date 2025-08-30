const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    maxlength: 40
  },
  doctorName: {
    type: String,
    required: true,
    maxlength: 40
  },
  appointmentDate: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema); 