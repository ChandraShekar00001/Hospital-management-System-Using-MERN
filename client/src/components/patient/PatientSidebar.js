import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaUserMd, FaFileInvoiceDollar, FaFileAlt, FaComments, FaUser, FaPrescriptionBottleAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const PatientSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === `/patient${path}`;
  };

  return (
    <div className="sidebar">
      <div className="p-3">
        <h4 className="text-white mb-4">Patient Panel</h4>
        <Nav className="flex-column">
          <Nav.Link 
            as={Link} 
            to="/patient" 
            className={isActive('') ? 'active' : ''}
          >
            <FaHome className="me-2" />
            Dashboard
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/appointments" 
            className={isActive('/appointments') ? 'active' : ''}
          >
            <FaCalendarAlt className="me-2" />
            My Appointments
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/doctors" 
            className={isActive('/doctors') ? 'active' : ''}
          >
            <FaUserMd className="me-2" />
            View Doctors
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/medical-records" 
            className={isActive('/medical-records') ? 'active' : ''}
          >
            <FaFileAlt className="me-2" />
            Medical Records
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/discharge" 
            className={isActive('/discharge') ? 'active' : ''}
          >
            <FaFileInvoiceDollar className="me-2" />
            Discharge Details
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/messages" 
            className={isActive('/messages') ? 'active' : ''}
          >
            <FaComments className="me-2" />
            Messages
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/prescriptions" 
            className={isActive('/prescriptions') ? 'active' : ''}
          >
            <FaPrescriptionBottleAlt className="me-2" />
            Prescriptions
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/patient/profile" 
            className={isActive('/profile') ? 'active' : ''}
          >
            <FaUser className="me-2" />
            My Profile
          </Nav.Link>
          
          <Nav.Link 
            onClick={logout} 
            style={{ cursor: 'pointer' }}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </Nav.Link>
        </Nav>
      </div>
    </div>
  );
};

export default PatientSidebar; 