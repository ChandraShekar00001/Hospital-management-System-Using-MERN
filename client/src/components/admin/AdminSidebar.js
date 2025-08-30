import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserMd, FaUserInjured, FaCalendarAlt, FaFileInvoiceDollar, FaUsers, FaUserShield, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === `/admin${path}`;
  };

  return (
    <div className="sidebar">
      <div className="p-3">
        <h4 className="text-white mb-4">Admin Panel</h4>
        <Nav className="flex-column">
          <Nav.Link 
            as={Link} 
            to="/admin" 
            className={isActive('') ? 'active' : ''}
          >
            <FaHome className="me-2" />
            Dashboard
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/doctors" 
            className={isActive('/doctors') ? 'active' : ''}
          >
            <FaUserMd className="me-2" />
            Doctors
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/patients" 
            className={isActive('/patients') ? 'active' : ''}
          >
            <FaUserInjured className="me-2" />
            Patients
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/appointments" 
            className={isActive('/appointments') ? 'active' : ''}
          >
            <FaCalendarAlt className="me-2" />
            Appointments
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/discharge" 
            className={isActive('/discharge') ? 'active' : ''}
          >
            <FaFileInvoiceDollar className="me-2" />
            Discharge
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/users" 
            className={isActive('/users') ? 'active' : ''}
          >
            <FaUsers className="me-2" />
            User Management
          </Nav.Link>
          
          <Nav.Link 
            as={Link} 
            to="/admin/profile" 
            className={isActive('/profile') ? 'active' : ''}
          >
            <FaUserShield className="me-2" />
            Profile
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

export default AdminSidebar; 