import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Table, Badge, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaStethoscope } from 'react-icons/fa';

const DoctorMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    followUpDate: ''
  });

  useEffect(() => {
    fetchMedicalRecords();
    fetchPatients();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get('/api/medical-records');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/doctor/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await axios.put(`/api/medical-records/${editingRecord._id}`, formData);
        toast.success('Medical record updated successfully');
      } else {
        await axios.post('/api/medical-records', formData);
        toast.success('Medical record created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error saving medical record:', error);
      toast.error('Failed to save medical record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      patientId: record.patientId._id,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescription: record.prescription || '',
      notes: record.notes || '',
      vitalSigns: record.vitalSigns || {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await axios.delete(`/api/medical-records/${recordId}`);
        toast.success('Medical record deleted successfully');
        fetchMedicalRecords();
      } catch (error) {
        console.error('Error deleting medical record:', error);
        toast.error('Failed to delete medical record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      notes: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      followUpDate: ''
    });
    setEditingRecord(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vitalSigns.')) {
      const vitalSign = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vitalSigns: {
          ...prev.vitalSigns,
          [vitalSign]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Medical Records Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Add New Record
        </Button>
      </div>

      {records.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No Medical Records Found</Alert.Heading>
          <p>You haven't created any medical records yet. Start by adding a record for your patients.</p>
        </Alert>
      ) : (
        <div>
          {records.map((record) => (
            <Card key={record._id} className="mb-4">
              <Card.Header className="bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <FaStethoscope className="me-2" />
                    {record.patientId?.user?.firstName} {record.patientId?.user?.lastName}
                  </h6>
                  <div>
                    <Button 
                      variant="outline-light" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEdit(record)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(record._id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
                <small>{formatDate(record.createdAt)}</small>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6><strong>Diagnosis:</strong></h6>
                    <p className="text-muted">{record.diagnosis}</p>
                    
                    <h6><strong>Treatment:</strong></h6>
                    <p className="text-muted">{record.treatment}</p>
                    
                    {record.prescription && (
                      <>
                        <h6><strong>Prescription:</strong></h6>
                        <p className="text-muted">{record.prescription}</p>
                      </>
                    )}
                  </Col>
                  
                  <Col md={6}>
                    {record.vitalSigns && Object.values(record.vitalSigns).some(val => val) && (
                      <>
                        <h6><strong>Vital Signs:</strong></h6>
                        <Table size="sm" bordered>
                          <tbody>
                            {record.vitalSigns.bloodPressure && (
                              <tr><td>Blood Pressure:</td><td>{record.vitalSigns.bloodPressure}</td></tr>
                            )}
                            {record.vitalSigns.heartRate && (
                              <tr><td>Heart Rate:</td><td>{record.vitalSigns.heartRate} bpm</td></tr>
                            )}
                            {record.vitalSigns.temperature && (
                              <tr><td>Temperature:</td><td>{record.vitalSigns.temperature}°F</td></tr>
                            )}
                            {record.vitalSigns.weight && (
                              <tr><td>Weight:</td><td>{record.vitalSigns.weight} lbs</td></tr>
                            )}
                            {record.vitalSigns.height && (
                              <tr><td>Height:</td><td>{record.vitalSigns.height}</td></tr>
                            )}
                          </tbody>
                        </Table>
                      </>
                    )}
                    
                    {record.followUpDate && (
                      <>
                        <h6><strong>Follow-up Date:</strong></h6>
                        <Badge bg="warning" text="dark">
                          {formatDate(record.followUpDate)}
                        </Badge>
                      </>
                    )}
                  </Col>
                </Row>
                
                {record.notes && (
                  <div className="mt-3 pt-3 border-top">
                    <h6><strong>Notes:</strong></h6>
                    <p className="text-muted">{record.notes}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Medical Record Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingRecord ? 'Edit Medical Record' : 'Add New Medical Record'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Patient *</Form.Label>
                  <Form.Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleInputChange}
                    required
                    disabled={editingRecord}
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.user?.firstName} {patient.user?.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Diagnosis *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Treatment *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Prescription</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <h6>Vital Signs</h6>
                <Form.Group className="mb-2">
                  <Form.Label>Blood Pressure</Form.Label>
                  <Form.Control
                    name="vitalSigns.bloodPressure"
                    value={formData.vitalSigns.bloodPressure}
                    onChange={handleInputChange}
                    placeholder="e.g., 120/80"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Heart Rate (bpm)</Form.Label>
                  <Form.Control
                    name="vitalSigns.heartRate"
                    value={formData.vitalSigns.heartRate}
                    onChange={handleInputChange}
                    placeholder="e.g., 75"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Temperature (°F)</Form.Label>
                  <Form.Control
                    name="vitalSigns.temperature"
                    value={formData.vitalSigns.temperature}
                    onChange={handleInputChange}
                    placeholder="e.g., 98.6"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Weight (lbs)</Form.Label>
                  <Form.Control
                    name="vitalSigns.weight"
                    value={formData.vitalSigns.weight}
                    onChange={handleInputChange}
                    placeholder="e.g., 150"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Height</Form.Label>
                  <Form.Control
                    name="vitalSigns.height"
                    value={formData.vitalSigns.height}
                    onChange={handleInputChange}
                    placeholder="e.g., 5'8&quot;"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Follow-up Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Additional Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingRecord ? 'Update Record' : 'Create Record'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default DoctorMedicalRecords;
