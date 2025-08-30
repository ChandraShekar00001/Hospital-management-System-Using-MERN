import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/admin/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doctorId) => {
    try {
      await axios.put(`/api/admin/doctors/${doctorId}/approve`);
      toast.success('Doctor approved successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to approve doctor');
    }
  };

  const handleDelete = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`/api/admin/doctors/${doctorId}`);
        toast.success('Doctor deleted successfully');
        fetchDoctors();
      } catch (error) {
        toast.error('Failed to delete doctor');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Manage Doctors</h2>
      <Card>
        <Card.Header>
          <h5>All Doctors</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.user?.firstName} {doctor.user?.lastName}</td>
                  <td>{doctor.user?.email}</td>
                  <td>{doctor.department}</td>
                  <td>{doctor.mobile}</td>
                  <td>
                    {doctor.status ? (
                      <Badge bg="success">Approved</Badge>
                    ) : (
                      <Badge bg="warning">Pending</Badge>
                    )}
                  </td>
                  <td>
                    {!doctor.status && (
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => handleApprove(doctor._id)}
                        className="me-2"
                      >
                        Approve
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDelete(doctor._id)}
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

export default AdminDoctors; 