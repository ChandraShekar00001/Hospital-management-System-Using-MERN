import React, { useState, useEffect } from 'react';
import { Table, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/doctor/patients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">My Patients</h2>
      <Card>
        <Card.Header>
          <h5>Assigned Patients</h5>
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
                <th>Admit Date</th>
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
                  <td>{new Date(patient.admitDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorPatients; 