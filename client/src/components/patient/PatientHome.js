import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { FaUserMd, FaPhone, FaMapMarkerAlt, FaStethoscope } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatientHome = () => {
  const [dashboardData, setDashboardData] = useState({
    patient: null,
    doctorName: 'Not Assigned',
    doctorMobile: 'N/A',
    doctorAddress: 'N/A',
    symptoms: '',
    doctorDepartment: 'N/A',
    admitDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/patient/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Patient Dashboard</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>My Information</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {dashboardData.patient?.user?.firstName} {dashboardData.patient?.user?.lastName}</p>
              <p><strong>Email:</strong> {dashboardData.patient?.user?.email}</p>
              <p><strong>Mobile:</strong> {dashboardData.patient?.mobile}</p>
              <p><strong>Address:</strong> {dashboardData.patient?.address}</p>
              <p><strong>Admit Date:</strong> {dashboardData.admitDate ? new Date(dashboardData.admitDate).toLocaleDateString() : 'N/A'}</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Assigned Doctor</h5>
            </Card.Header>
            <Card.Body>
              <p><FaUserMd className="me-2" /><strong>Name:</strong> {dashboardData.doctorName}</p>
              <p><FaPhone className="me-2" /><strong>Mobile:</strong> {dashboardData.doctorMobile}</p>
              <p><FaMapMarkerAlt className="me-2" /><strong>Address:</strong> {dashboardData.doctorAddress}</p>
              <p><FaStethoscope className="me-2" /><strong>Department:</strong> {dashboardData.doctorDepartment}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>Medical Information</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Symptoms:</strong> {dashboardData.symptoms}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PatientHome; 