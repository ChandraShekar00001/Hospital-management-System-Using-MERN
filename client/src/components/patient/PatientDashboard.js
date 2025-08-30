import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import PatientSidebar from './PatientSidebar';
import PatientHome from './PatientHome';
import PatientAppointments from './PatientAppointments';
import PatientDoctors from './PatientDoctors';
import PatientDischargeWithPDF from './PatientDischargeWithPDF';
import PatientMedicalRecords from './PatientMedicalRecords';
import PatientMessages from './PatientMessages';
import PatientProfile from './PatientProfile';
import PatientPrescriptions from './PatientPrescriptions';

const PatientDashboard = () => {
  return (
    <Container fluid>
      <Row>
        <Col md={3} lg={2} className="sidebar">
          <PatientSidebar />
        </Col>
        <Col md={9} lg={10} className="p-4">
          <Routes>
            <Route path="/" element={<PatientHome />} />
            <Route path="/appointments" element={<PatientAppointments />} />
            <Route path="/doctors" element={<PatientDoctors />} />
            <Route path="/medical-records" element={<PatientMedicalRecords />} />
            <Route path="/discharge" element={<PatientDischargeWithPDF />} />
            <Route path="/messages" element={<PatientMessages />} />
            <Route path="/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/profile" element={<PatientProfile />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientDashboard; 