const mongoose = require('mongoose');

const patientDischargeDetailsSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    maxlength: 40
  },
  assignedDoctorName: {
    type: String,
    required: true,
    maxlength: 40
  },
  address: {
    type: String,
    required: true,
    maxlength: 40
  },
  mobile: {
    type: String,
    required: true,
    maxlength: 20
  },
  symptoms: {
    type: String,
    required: true,
    maxlength: 100
  },
  admitDate: {
    type: Date,
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  daySpent: {
    type: Number,
    required: true
  },
  roomCharge: {
    type: Number,
    required: true
  },
  medicineCost: {
    type: Number,
    required: true
  },
  doctorFee: {
    type: Number,
    required: true
  },
  otherCharge: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PatientDischargeDetails', patientDischargeDetailsSchema); 