import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Modal, Badge , Form  } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDischarge = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [formData, setFormData] = useState({
    roomCharge: '',
    medicineCost: '',
    doctorFee: '',
    otherCharge: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/discharge/patients');
      setPatients(response.data);
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = (patientId) => {
    setSelectedPatientId(patientId);
    setFormData({
      roomCharge: '',
      medicineCost: '',
      doctorFee: '',
      otherCharge: ''
    });
    setShowModal(true);
  };

  // Submit discharge form
  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/discharge/${selectedPatientId}`, formData);
      toast.success('Patient discharged successfully ✅');
      setShowModal(false);
      fetchPatients(); // refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Discharge failed ❌');
    }
  };

  const handleDownloadPDF = async (patientId) => {
    try {
      const response = await axios.get(`/api/discharge/${patientId}/pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill-${patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="mb-4">Patient Discharge</h2>
      <Card>
        <Card.Header>
          <h5>Patients for Discharge</h5>
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
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={() => handleDischarge(patient._id)}
                      className="me-2"
                    >
                      Discharge
                    </Button>
                    <Button 
                      size="sm" 
                      variant="info" 
                      onClick={() => handleDownloadPDF(patient._id)}
                    >
                      Download PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    {/* Discharge Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Discharge Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDischargeSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Room Charge (per day)</Form.Label>
              <Form.Control
                type="number"
                name="roomCharge"
                value={formData.roomCharge}
                onChange={(e) =>
                  setFormData({ ...formData, roomCharge: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Medicine Cost</Form.Label>
              <Form.Control
                type="number"
                name="medicineCost"
                value={formData.medicineCost}
                onChange={(e) =>
                  setFormData({ ...formData, medicineCost: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Doctor Fee</Form.Label>
              <Form.Control
                type="number"
                name="doctorFee"
                value={formData.doctorFee}
                onChange={(e) =>
                  setFormData({ ...formData, doctorFee: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Other Charges</Form.Label>
              <Form.Control
                type="number"
                name="otherCharge"
                value={formData.otherCharge}
                onChange={(e) =>
                  setFormData({ ...formData, otherCharge: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button variant="success" type="submit">
              Confirm Discharge
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDischarge;