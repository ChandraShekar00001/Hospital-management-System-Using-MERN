const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profilePic: {
    type: String,
    default: null
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
  assignedDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },
  admitDate: {
    type: Date,
    default: Date.now
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

// Virtual for patient name
patientSchema.virtual('name').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for patient ID
patientSchema.virtual('patientId').get(function() {
  return this.user ? this.user._id : null;
});

module.exports = mongoose.model('Patient', patientSchema); 