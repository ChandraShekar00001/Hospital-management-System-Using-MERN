const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    instructions: {
      type: String
    }
  }],
  diagnosis: {
    type: String,
    required: true
  },
  symptoms: {
    type: String
  },
  notes: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  prescriptionNumber: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate prescription number
prescriptionSchema.pre('save', async function(next) {
  if (!this.prescriptionNumber) {
    const count = await mongoose.models.Prescription.countDocuments();
    this.prescriptionNumber = `RX-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
