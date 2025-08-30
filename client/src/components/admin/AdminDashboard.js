import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import AdminHome from './AdminHome';
import AdminDoctors from './AdminDoctors';
import AdminPatients from './AdminPatients';
import AdminAppointments from './AdminAppointments';
import AdminDischarge from './AdminDischarge';
import AdminUserManagement from './AdminUserManagement';
import AdminProfile from './AdminProfile';

const AdminDashboard = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="sidebar">
          <AdminSidebar />
        </Col>
        <Col md={9} lg={10} className="p-4">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/doctors" element={<AdminDoctors />} />
            <Route path="/patients" element={<AdminPatients />} />
            <Route path="/appointments" element={<AdminAppointments />} />
            <Route path="/discharge" element={<AdminDischarge />} />
            <Route path="/users" element={<AdminUserManagement />} />
            <Route path="/profile" element={<AdminProfile />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 