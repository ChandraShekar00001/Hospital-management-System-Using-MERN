import React, { useState, useEffect } from 'react';
import { Table, Card, Form } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/patient/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchDoctors();
      return;
    }

    try {
      const response = await axios.get(`/api/patient/doctors/search?query=${searchQuery}`);
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to search doctors');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Available Doctors</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Search by department or doctor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5>All Doctors</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td>{doctor.user?.firstName} {doctor.user?.lastName}</td>
                  <td>{doctor.department}</td>
                  <td>{doctor.user?.email}</td>
                  <td>{doctor.mobile}</td>
                  <td>{doctor.address}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PatientDoctors; 