const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
  department: {
    type: String,
    enum: [
      'Cardiologist',
      'Dermatologists',
      'Emergency Medicine Specialists',
      'Allergists/Immunologists',
      'Anesthesiologists',
      'Colon and Rectal Surgeons'
    ],
    default: 'Cardiologist'
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

// Virtual for doctor name
doctorSchema.virtual('name').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for doctor ID
doctorSchema.virtual('doctorId').get(function() {
  return this.user ? this.user._id : null;
});

module.exports = mongoose.model('Doctor', doctorSchema); 