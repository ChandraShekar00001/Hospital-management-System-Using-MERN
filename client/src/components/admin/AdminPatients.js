import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/admin/patients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (patientId) => {
    try {
      await axios.put(`/api/admin/patients/${patientId}/approve`);
      toast.success('Patient approved successfully');
      fetchPatients();
    } catch (error) {
      toast.error('Failed to approve patient');
    }
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`/api/admin/patients/${patientId}`);
        toast.success('Patient deleted successfully');
        fetchPatients();
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Manage Patients</h2>
      <Card>
        <Card.Header>
          <h5>All Patients</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Symptoms</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.user?.firstName} {patient.user?.lastName}</td>
                  <td>{patient.user?.email}</td>
                  <td>{patient.symptoms}</td>
                  <td>{patient.mobile}</td>
                  <td>{patient.address}</td>
                  <td>
                    {patient.status ? (
                      <Badge bg="success">Admitted</Badge>
                    ) : (
                      <Badge bg="warning">Pending</Badge>
                    )}
                  </td>
                  <td>
                    {!patient.status && (
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleApprove(patient._id)}
                        className="me-2"
                      >
                        Approve
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(patient._id)}
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

export default AdminPatients; 