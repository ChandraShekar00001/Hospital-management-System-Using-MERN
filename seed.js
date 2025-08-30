const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});

    console.log('Cleared existing data');

    // Create Admin User
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create Doctor Users
    const doctorUsers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        username: 'drjohn',
        email: 'john.smith@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        username: 'drsarah',
        email: 'sarah.johnson@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        username: 'drmichael',
        email: 'michael.brown@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      }
    ];

    const doctors = [];
    for (let doctorData of doctorUsers) {
      const user = new User(doctorData);
      await user.save();
      
      const doctor = new Doctor({
        user: user._id,
        address: '123 Medical Center Dr',
        mobile: '+1234567890',
        department: doctorData.firstName === 'John' ? 'Cardiologist' : 
                   doctorData.firstName === 'Sarah' ? 'Dermatologists' : 'Emergency Medicine Specialists',
        status: true
      });
      await doctor.save();
      doctors.push(doctor);
    }
    console.log('Doctor users and profiles created');

    // Create Patient Users
    const patientUsers = [
      {
        firstName: 'Alice',
        lastName: 'Wilson',
        username: 'alice',
        email: 'alice.wilson@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        firstName: 'Bob',
        lastName: 'Davis',
        username: 'bob',
        email: 'bob.davis@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        firstName: 'Carol',
        lastName: 'Miller',
        username: 'carol',
        email: 'carol.miller@email.com',
        password: 'patient123',
        role: 'patient'
      }
    ];

    const patients = [];
    for (let i = 0; i < patientUsers.length; i++) {
      const patientData = patientUsers[i];
      const user = new User(patientData);
      await user.save();
      
      const patient = new Patient({
        user: user._id,
        address: '456 Patient St',
        mobile: '+0987654321',
        symptoms: patientData.firstName === 'Alice' ? 'Chest pain and shortness of breath' :
                 patientData.firstName === 'Bob' ? 'Skin rash and itching' : 'Severe headaches',
        assignedDoctorId: doctors[i % doctors.length]._id,
        status: true,
        admitDate: new Date()
      });
      await patient.save();
      patients.push(patient);
    }
    console.log('Patient users and profiles created');

    // Create Sample Appointments
    const appointments = [
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        patientName: 'Alice Wilson',
        doctorName: 'Dr. John Smith',
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        description: 'Regular checkup for chest pain',
        status: true
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[1]._id,
        patientName: 'Bob Davis',
        doctorName: 'Dr. Sarah Johnson',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        description: 'Skin consultation',
        status: false
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[2]._id,
        patientName: 'Carol Miller',
        doctorName: 'Dr. Michael Brown',
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Three days from now
        description: 'Emergency consultation for headaches',
        status: true
      }
    ];

    for (let appointmentData of appointments) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
    }
    console.log('Sample appointments created');

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
    console.log('\nLogin Credentials:');
    console.log('ADMIN: username=admin, password=admin123');
    console.log('DOCTOR: username=drjohn, password=doctor123');
    console.log('PATIENT: username=alice, password=patient123');
    console.log('\nOther users:');
    console.log('DOCTORS: drsarah/doctor123, drmichael/doctor123');
    console.log('PATIENTS: bob/patient123, carol/patient123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
