# Hospital Management System

A comprehensive, full-stack hospital management system built with Node.js, Express, MongoDB, and React. This application provides role-based access for patients, doctors, and admins to manage hospital operations efficiently.

## Tech Stack

### Backend:
- **Node.js** with Express for the server
- **MongoDB** with Mongoose for the database
- **JSON Web Tokens (JWT)** for authentication
- **Socket.io** for real-time WebSocket messaging
- **bcrypt** for secure password hashing
- **PDFKit** for generating PDF documents
- **dotenv** for managing environment variables
- **multer** for handling file uploads
- **cors** for cross-origin resource sharing

### Frontend:
- **React 18** with modern hooks
- **React Router** for client-side routing
- **React Bootstrap** for UI components
- **Axios** for HTTP requests
- **Socket.io Client** for real-time communication
- **jsPDF** for client-side PDF generation
- **React Toastify** for notifications

## Features

### User Authentication
- Secure sign-up and login system with JWT
- Role-based access control with middleware protection
- Password encryption using bcrypt

### Role-Based Access Control

#### **Patient Dashboard:**
- View and update personal profile
- Book appointments with doctors
- View assigned doctor information
- Access medical records and prescription history
- Download prescription PDFs
- Real-time messaging with healthcare providers
- View discharge details and invoices

#### **Doctor Dashboard:**
- Manage patient appointments (approve/reject)
- View assigned patients and their medical history
- Create and manage medical records
- Write and manage prescriptions with PDF generation
- Real-time messaging with patients
- Update professional profile

#### **Admin Dashboard:**
- Complete user management (create, update, delete users)
- Approve doctor and patient registrations
- Manage all appointments system-wide
- Handle patient discharge processes
- Generate and manage invoices
- System-wide oversight and control

### Advanced Features
- **Prescription Management:** Create detailed prescriptions with medication lists and PDF export
- **Medical Records:** Comprehensive patient history tracking with vital signs
- **Real-time Messaging:** Socket.io powered communication between users
- **PDF Generation:** Automated generation of prescriptions, discharge summaries, and invoices
- **Invoice System:** Automated billing for appointments and medical services
- **Discharge Management:** Complete patient discharge workflow with billing

## Project Structure

```
.
├── client/                          # React frontend application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/              # Admin-specific components
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── AdminHome.js
│   │   │   │   ├── AdminDoctors.js
│   │   │   │   ├── AdminPatients.js
│   │   │   │   ├── AdminAppointments.js
│   │   │   │   ├── AdminDischarge.js
│   │   │   │   ├── AdminUserManagement.js
│   │   │   │   ├── AdminProfile.js
│   │   │   │   └── AdminSidebar.js
│   │   │   ├── doctor/             # Doctor-specific components
│   │   │   │   ├── DoctorDashboard.js
│   │   │   │   ├── DoctorHome.js
│   │   │   │   ├── DoctorPatients.js
│   │   │   │   ├── DoctorAppointments.js
│   │   │   │   ├── DoctorPrescriptions.js
│   │   │   │   ├── DoctorMedicalRecords.js
│   │   │   │   ├── DoctorMessages.js
│   │   │   │   ├── DoctorProfile.js
│   │   │   │   └── DoctorSidebar.js
│   │   │   ├── patient/            # Patient-specific components
│   │   │   │   ├── PatientDashboard.js
│   │   │   │   ├── PatientHome.js
│   │   │   │   ├── PatientAppointments.js
│   │   │   │   ├── PatientDoctors.js
│   │   │   │   ├── PatientPrescriptions.js
│   │   │   │   ├── PatientMedicalRecords.js
│   │   │   │   ├── PatientMessages.js
│   │   │   │   ├── PatientDischargeWithPDF.js
│   │   │   │   ├── PatientProfile.js
│   │   │   │   └── PatientSidebar.js
│   │   │   ├── auth/               # Authentication components
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── layout/             # Layout components
│   │   │   │   └── Navbar.js
│   │   │   ├── pages/              # Public pages
│   │   │   │   └── Home.js
│   │   │   └── common/             # Shared components
│   │   │       └── LoadingSpinner.js
│   │   ├── contexts/               # React contexts
│   │   │   └── AuthContext.js      # Authentication state management
│   │   ├── App.js                  # Main React component
│   │   ├── index.js               # React entry point
│   │   └── index.css              # Global styles
│   ├── package.json
│   └── .gitignore
├── middleware/                      # Express middleware
│   └── auth.js                     # JWT authentication middleware
├── models/                         # MongoDB schemas
│   ├── User.js                     # User account model
│   ├── Doctor.js                   # Doctor profile model
│   ├── Patient.js                  # Patient profile model
│   ├── Appointment.js              # Appointment booking model
│   ├── Prescription.js             # Prescription model
│   ├── MedicalRecord.js           # Medical records model
│   ├── Message.js                  # Messaging model
│   ├── Invoice.js                  # Billing model
│   └── PatientDischargeDetails.js # Discharge model
├── routes/                         # Express routes
│   ├── auth.js                     # Authentication routes
│   ├── admin.js                    # Admin-specific routes
│   ├── doctor.js                   # Doctor-specific routes
│   ├── patient.js                  # Patient-specific routes
│   ├── appointment.js              # Appointment management routes
│   ├── prescriptions.js            # Prescription routes
│   ├── medicalRecords.js          # Medical records routes
│   ├── messages.js                 # Messaging routes
│   ├── invoices.js                 # Invoice routes
│   └── discharge.js                # Discharge routes
├── .env                           # Environment variables
├── .gitignore
├── package.json
├── seed.js                        # Database seeding script
└── server.js                      # Express server entry point
```

## Setup and Installation (Windows)

To run this project locally on Windows, follow these steps:

### Prerequisites:
- **Node.js** (Download from [nodejs.org](https://nodejs.org/))
- **MongoDB** (Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community))
- **Git** (Download from [git-scm.com](https://git-scm.com/download/win))

### 1. Clone the repository:
Open Command Prompt or PowerShell and run:
```
git clone <repository-url>
cd Hospital
```

### 2. Install backend dependencies:
```
npm install
```

### 3. Install frontend dependencies:
```
cd client
npm install
cd ..
```

### 4. Set up environment variables:
Create a `.env` file in the root directory using Notepad or any text editor:
```
# Open Command Prompt in the project root and run:
echo. > .env
```
Then edit the `.env` file and add:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-environment-2024
```

### 5. Start MongoDB service:
**Option 1 - Using MongoDB Compass (Recommended for Windows):**
- Install MongoDB Compass from the official website
- Start MongoDB Compass and connect to `mongodb://localhost:27017`

**Option 2 - Using Command Line:**
Open Command Prompt as Administrator and run:
```
net start MongoDB
```

### 6. Seed the database (optional):
In Command Prompt or PowerShell:
```
node seed.js
```

### 7. Start the application:
```
# Start both backend and frontend concurrently
npm run dev

# Or start them separately in different Command Prompt windows:
# Backend only:
npm run server

# Frontend only:
npm run client
```

### 8. Open the application:
Open your web browser and navigate to [http://localhost:3000](http://localhost:3000).

**Note for Windows Users:**
- If you encounter permission issues, run Command Prompt or PowerShell as Administrator
- Make sure Windows Defender or antivirus software isn't blocking Node.js
- If MongoDB connection fails, check if MongoDB service is running in Windows Services (services.msc)

## Troubleshooting (Windows)

### Common Issues:

**MongoDB Connection Error:**
- Ensure MongoDB service is running: Open Services (Win + R, type `services.msc`)
- Look for "MongoDB Server" and start it if stopped
- Alternative: Use MongoDB Compass for easier management

**Port Already in Use:**
- Check if ports 3000 or 5000 are being used by other applications
- Use `netstat -ano | findstr :3000` to check port usage
- Kill process if needed: `taskkill /PID <process_id> /F`

**Permission Denied Errors:**
- Run Command Prompt or PowerShell as Administrator
- Check folder permissions in the project directory

**Node Modules Issues:**
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- For client: `cd client`, delete `node_modules`, run `npm install`

After running the seed script, you can use these credentials:

### Admin:
- **Username:** `admin`
- **Password:** `admin123`

### Doctor:
- **Username:** `drjohn`
- **Password:** `doctor123`

### Patient:
- **Username:** `alice`
- **Password:** `patient123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/doctors` - Manage doctors
- `GET /api/admin/patients` - Manage patients
- `POST /api/admin/users` - Create new users

### Doctor Routes
- `GET /api/doctor/dashboard` - Doctor dashboard data
- `GET /api/doctor/patients` - View assigned patients
- `GET /api/doctor/appointments` - Manage appointments
- `PUT /api/doctor/profile` - Update doctor profile

### Patient Routes
- `GET /api/patient/dashboard` - Patient dashboard data
- `GET /api/patient/doctors` - View available doctors
- `POST /api/patient/appointments` - Book appointments
- `PUT /api/patient/profile` - Update patient profile

### Additional Features
- `GET /api/prescriptions/*` - Prescription management
- `GET /api/messages/*` - Real-time messaging
- `GET /api/medical-records/*` - Medical records
- `GET /api/invoices/*` - Invoice management
- `GET /api/discharge/*` - Discharge management

## How to Use

1. **Register Users:** Create accounts for patients, doctors, and admins through the registration page.

2. **Admin Setup:** The first admin user can be created by running the seed script or by manually registering and updating the user role in the database.

3. **Patient Workflow:**
   - Register and login as a patient
   - Complete profile information
   - Browse available doctors
   - Book appointments
   - View medical records and prescriptions
   - Communicate with healthcare providers

4. **Doctor Workflow:**
   - Register and login as a doctor
   - Wait for admin approval
   - Manage patient appointments
   - Create medical records and prescriptions
   - Communicate with patients

5. **Admin Workflow:**
   - Approve doctor and patient registrations
   - Manage all system users
   - Oversee appointments and discharges
   - Generate system reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
