import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointment');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      await axios.put(`/api/appointment/${appointmentId}/approve`);
      toast.success('Appointment approved successfully');
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleDelete = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`/api/appointment/${appointmentId}`);
        toast.success('Appointment deleted successfully');
        fetchAppointments();
      } catch (error) {
        toast.error('Failed to delete appointment');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Manage Appointments</h2>
      <Card>
        <Card.Header>
          <h5>All Appointments</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.patientName}</td>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.description}</td>
                  <td>{new Date(appointment.appointmentDate).toLocaleDateString()}</td>
                  <td>
                    {appointment.status ? (
                      <Badge bg="success">Approved</Badge>
                    ) : (
                      <Badge bg="warning">Pending</Badge>
                    )}
                  </td>
                  <td>
                    {!appointment.status && (
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleApprove(appointment._id)}
                        className="me-2"
                      >
                        Approve
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(appointment._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminAppointments; 