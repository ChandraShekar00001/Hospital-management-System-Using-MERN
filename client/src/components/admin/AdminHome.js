import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { FaUserMd, FaUserInjured, FaCalendarAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminHome = () => {
  const [dashboardData, setDashboardData] = useState({
    doctors: [],
    patients: [],
    doctorCount: 0,
    pendingDoctorCount: 0,
    patientCount: 0,
    pendingPatientCount: 0,
    appointmentCount: 0,
    pendingAppointmentCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
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
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {/* Dashboard Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaUserMd />
            </div>
            <div className="card-number">{dashboardData.doctorCount}</div>
            <div className="card-title">Approved Doctors</div>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaClock />
            </div>
            <div className="card-number">{dashboardData.pendingDoctorCount}</div>
            <div className="card-title">Pending Doctors</div>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaUserInjured />
            </div>
            <div className="card-number">{dashboardData.patientCount}</div>
            <div className="card-title">Admitted Patients</div>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="dashboard-card">
            <div className="card-icon">
              <FaCalendarAlt />
            </div>
            <div className="card-number">{dashboardData.appointmentCount}</div>
            <div className="card-title">Approved Appointments</div>
          </Card>
        </Col>
      </Row>

      {/* Recent Data Tables */}
      <Row>
        <Col md={6}>
          <Card className="panel">
            <div className="panel-heading">
              <h6 className="panel-title">Recent Doctors</h6>
            </div>
            <Table responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Mobile</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.doctors.slice(0, 5).map((doctor) => (
                  <tr key={doctor._id}>
                    <td>{doctor.user?.firstName} {doctor.user?.lastName}</td>
                    <td>{doctor.department}</td>
                    <td>{doctor.mobile}</td>
                    <td>
                      {doctor.status ? (
                        <span className="label label-primary">Permanent</span>
                      ) : (
                        <span className="label label-success">On Hold</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="panel">
            <div className="panel-heading">
              <h6 className="panel-title">Recent Patients</h6>
            </div>
            <Table responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Symptoms</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.patients.slice(0, 5).map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.user?.firstName} {patient.user?.lastName}</td>
                    <td>{patient.symptoms}</td>
                    <td>{patient.mobile}</td>
                    <td>{patient.address}</td>
                    <td>
                      {patient.status ? (
                        <span className="label label-primary">Admitted</span>
                      ) : (
                        <span className="label label-success">On Hold</span>
                      )}
                    </td>
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

export default AdminHome; 