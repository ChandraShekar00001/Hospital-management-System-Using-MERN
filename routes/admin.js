const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const PatientDischargeDetails = require('../models/PatientDischargeDetails');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'firstName lastName').sort('-createdAt');
    const patients = await Patient.find().populate('user', 'firstName lastName').sort('-createdAt');
    
    const doctorCount = await Doctor.countDocuments({ status: true });
    const pendingDoctorCount = await Doctor.countDocuments({ status: false });
    
    const patientCount = await Patient.countDocuments({ status: true });
    const pendingPatientCount = await Patient.countDocuments({ status: false });
    
    const appointmentCount = await Appointment.countDocuments({ status: true });
    const pendingAppointmentCount = await Appointment.countDocuments({ status: false });

    res.json({
      doctors,
      patients,
      doctorCount,
      pendingDoctorCount,
      patientCount,
      pendingPatientCount,
      appointmentCount,
      pendingAppointmentCount
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/doctors
// @desc    Get all doctors
// @access  Private (Admin only)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'firstName lastName email');
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/doctors/approved
// @desc    Get approved doctors
// @access  Private (Admin only)
router.get('/doctors/approved', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: true }).populate('user', 'firstName lastName email');
    res.json(doctors);
  } catch (error) {
    console.error('Get approved doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/doctors/pending
// @desc    Get pending doctors
// @access  Private (Admin only)
router.get('/doctors/pending', async (req, res) => {
  try {
    const doctors = await Doctor.find({ status: false }).populate('user', 'firstName lastName email');
    res.json(doctors);
  } catch (error) {
    console.error('Get pending doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/doctors
// @desc    Add a new doctor
// @access  Private (Admin only)
router.post('/doctors', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, address, mobile, department } = req.body;

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role: 'doctor'
    });
    await user.save();

    // Create doctor profile
    const doctor = new Doctor({
      user: user._id,
      address,
      mobile,
      department,
      status: true
    });
    await doctor.save();

    res.status(201).json({
      message: 'Doctor added successfully',
      doctor: await doctor.populate('user', 'firstName lastName email')
    });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/doctors/:id
// @desc    Update doctor
// @access  Private (Admin only)
router.put('/doctors/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, address, mobile, department } = req.body;
    
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update user
    await User.findByIdAndUpdate(doctor.user._id, {
      firstName,
      lastName,
      email
    });

    // Update doctor
    doctor.address = address;
    doctor.mobile = mobile;
    doctor.department = department;
    await doctor.save();

    res.json({
      message: 'Doctor updated successfully',
      doctor: await doctor.populate('user', 'firstName lastName email')
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/doctors/:id
// @desc    Delete doctor
// @access  Private (Admin only)
router.delete('/doctors/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/doctors/:id/approve
// @desc    Approve doctor
// @access  Private (Admin only)
router.put('/doctors/:id/approve', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { status: true },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({
      message: 'Doctor approved successfully',
      doctor
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/patients
// @desc    Get all patients
// @access  Private (Admin only)
router.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find().populate('user', 'firstName lastName email');
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/patients/approved
// @desc    Get approved patients
// @access  Private (Admin only)
router.get('/patients/approved', async (req, res) => {
  try {
    const patients = await Patient.find({ status: true }).populate('user', 'firstName lastName email');
    res.json(patients);
  } catch (error) {
    console.error('Get approved patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/patients/pending
// @desc    Get pending patients
// @access  Private (Admin only)
router.get('/patients/pending', async (req, res) => {
  try {
    const patients = await Patient.find({ status: false }).populate('user', 'firstName lastName email');
    res.json(patients);
  } catch (error) {
    console.error('Get pending patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/patients
// @desc    Add a new patient
// @access  Private (Admin only)
router.post('/patients', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, address, mobile, symptoms, assignedDoctorId } = req.body;

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role: 'patient'
    });
    await user.save();

    // Create patient profile
    const patient = new Patient({
      user: user._id,
      address,
      mobile,
      symptoms,
      assignedDoctorId,
      status: true
    });
    await patient.save();

    res.status(201).json({
      message: 'Patient added successfully',
      patient: await patient.populate('user', 'firstName lastName email')
    });
  } catch (error) {
    console.error('Add patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/patients/:id
// @desc    Update patient
// @access  Private (Admin only)
router.put('/patients/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, address, mobile, symptoms, assignedDoctorId } = req.body;
    
    const patient = await Patient.findById(req.params.id).populate('user');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Update user
    await User.findByIdAndUpdate(patient.user._id, {
      firstName,
      lastName,
      email
    });

    // Update patient
    patient.address = address;
    patient.mobile = mobile;
    patient.symptoms = symptoms;
    patient.assignedDoctorId = assignedDoctorId;
    await patient.save();

    res.json({
      message: 'Patient updated successfully',
      patient: await patient.populate('user', 'firstName lastName email')
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/patients/:id
// @desc    Delete patient
// @access  Private (Admin only)
router.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await User.findByIdAndDelete(patient.user);
    await Patient.findByIdAndDelete(req.params.id);

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/patients/:id/approve
// @desc    Approve patient
// @access  Private (Admin only)
router.put('/patients/:id/approve', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { status: true },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({
      message: 'Patient approved successfully',
      patient
    });
  } catch (error) {
    console.error('Approve patient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

// User Management Routes

// @route   GET /api/admin/users
// @desc    Get all users with their profiles
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    // Enrich with profile data
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      let profile = null;
      
      if (user.role === 'doctor') {
        profile = await Doctor.findOne({ user: user._id });
      } else if (user.role === 'patient') {
        profile = await Patient.findOne({ user: user._id });
      }
      
      return {
        ...user.toObject(),
        profile
      };
    }));
    
    res.json(enrichedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/users', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role, address, mobile, department, symptoms } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role
    });

    await user.save();

    // Create role-specific profile
    if (role === 'doctor') {
      const doctor = new Doctor({
        user: user._id,
        address: address || '',
        mobile: mobile || '',
        department: department || 'Cardiologist',
        status: true
      });
      await doctor.save();
    } else if (role === 'patient') {
      const patient = new Patient({
        user: user._id,
        address: address || '',
        mobile: mobile || '',
        symptoms: symptoms || '',
        status: true
      });
      await patient.save();
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update a user
// @access  Private (Admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, role, address, mobile, department, symptoms } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email/username is already taken by another user
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }],
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email or username already taken' });
      }
    }

    // Update user
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.username = username || user.username;
    user.email = email || user.email;
    
    if (password) {
      user.password = password;
    }

    await user.save();

    // Update role-specific profile
    if (role === 'doctor') {
      await Doctor.findOneAndUpdate(
        { user: user._id },
        {
          address: address || '',
          mobile: mobile || '',
          department: department || 'Cardiologist'
        },
        { upsert: true }
      );
    } else if (role === 'patient') {
      await Patient.findOneAndUpdate(
        { user: user._id },
        {
          address: address || '',
          mobile: mobile || '',
          symptoms: symptoms || ''
        },
        { upsert: true }
      );
    }

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting the current admin
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete associated profiles
    if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ user: user._id });
    } else if (user.role === 'patient') {
      await Patient.findOneAndDelete({ user: user._id });
      // Also delete patient's appointments and medical records
      await Appointment.deleteMany({ patientId: { $exists: true } });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 