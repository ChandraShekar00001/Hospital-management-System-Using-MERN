import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserMd, FaEdit, FaSave } from 'react-icons/fa';

const DoctorProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    mobile: '',
    department: 'Cardiologist'
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const departments = [
    'Cardiologist',
    'Dermatologists',
    'Emergency Medicine Specialists',
    'Allergists/Immunologists',
    'Anesthesiologists',
    'Colon and Rectal Surgeons'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/doctor/dashboard');
      const { doctor } = response.data;
      setProfile({
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        address: doctor.address,
        mobile: doctor.mobile,
        department: doctor.department
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update user details
      await axios.put('/api/auth/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email
      });

      // Update doctor-specific details
      await axios.put('/api/doctor/profile', {
        address: profile.address,
        mobile: profile.mobile,
        department: profile.department
      });

      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">My Profile</h2>
      
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaUserMd className="me-2" />
            Doctor Profile Information
          </h5>
          <Button
            variant={editing ? "success" : "outline-primary"}
            onClick={() => setEditing(!editing)}
          >
            {editing ? <FaSave className="me-2" /> : <FaEdit className="me-2" />}
            {editing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="mobile"
                    value={profile.mobile}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={profile.department}
                    onChange={handleChange}
                    disabled={!editing}
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!editing}
                required
              />
            </Form.Group>

            {editing && (
              <div className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  <FaSave className="me-2" />
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DoctorProfile;
