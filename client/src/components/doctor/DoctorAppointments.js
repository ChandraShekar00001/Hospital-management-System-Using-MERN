import React, { useState, useEffect } from 'react';
import { Table, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/doctor/appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">My Appointments</h2>
      <Card>
        <Card.Header>
          <h5>All Appointments</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Symptoms</th>
                <th>Appointment Date</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => {
                const patientName = appointment.patientId?.user?.firstName 
                  ? `${appointment.patientId.user.firstName} ${appointment.patientId.user.lastName}`
                  : 'N/A';
                const symptoms = appointment.patientId?.symptoms || 'N/A';
                
                return (
                  <tr key={appointment._id}>
                    <td>{patientName}</td>
                    <td>{symptoms}</td>
                  <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                  <td>{appointment.description}</td>
                  <td>
                    {appointment.status ? (
                      <span className="label label-primary">Approved</span>
                    ) : (
                      <span className="label label-success">Pending</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorAppointments; 