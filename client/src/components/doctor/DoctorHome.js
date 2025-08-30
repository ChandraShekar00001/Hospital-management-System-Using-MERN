import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { FaUserInjured, FaCalendarAlt, FaUserCheck } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorHome = () => {
  const [dashboardData, setDashboardData] = useState({
    patientCount: 0,
    appointmentCount: 0,
    patientDischarged: 0,
    appointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/doctor/dashboard');
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
      <h2 className="mb-4">Doctor Dashboard</h2>
      
      {/* Dashboard Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaUserInjured />
            </div>
            <div className="card-number">{dashboardData.patientCount}</div>
            <div className="card-title">My Patients</div>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-number">{dashboardData.appointmentCount}</div>
            <div className="card-title">Appointments</div>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaUserCheck />
            </div>
            <div className="card-number">{dashboardData.patientDischarged}</div>
            <div className="card-title">Discharged Patients</div>
          </Card>
        </Col>
      </Row>

      {/* Recent Appointments */}
      <Row>
        <Col md={12}>
          <Card className="panel">
            <div className="panel-heading">
              <h6 className="panel-title">Recent Appointments</h6>
            </div>
            <Table responsive>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Symptoms</th>
                  <th>Appointment Date</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.appointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      {appointment.patientId?.user?.firstName && appointment.patientId?.user?.lastName 
                        ? `${appointment.patientId.user.firstName} ${appointment.patientId.user.lastName}`
                        : appointment.patientName || 'Unknown Patient'}
                    </td>
                    <td>{appointment.patientId?.symptoms || 'N/A'}</td>
                    <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                    <td>{appointment.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorHome; 