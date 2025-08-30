import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import DoctorHome from './DoctorHome';
import DoctorPatients from './DoctorPatients';
import DoctorAppointments from './DoctorAppointments';
import DoctorMedicalRecords from './DoctorMedicalRecords';
import DoctorMessages from './DoctorMessages';
import DoctorProfile from './DoctorProfile';
import DoctorPrescriptions from './DoctorPrescriptions';

const DoctorDashboard = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="sidebar">
          <DoctorSidebar />
        </Col>
        <Col md={9} lg={10} className="p-4">
          <Routes>
            <Route path="/" element={<DoctorHome />} />
            <Route path="/patients" element={<DoctorPatients />} />
            <Route path="/appointments" element={<DoctorAppointments />} />
            <Route path="/medical-records" element={<DoctorMedicalRecords />} />
            <Route path="/messages" element={<DoctorMessages />} />
            <Route path="/prescriptions" element={<DoctorPrescriptions />} />
            <Route path="/profile" element={<DoctorProfile />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard; 