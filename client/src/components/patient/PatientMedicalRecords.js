import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStethoscope, FaPrescriptionBottleAlt, FaStickyNote } from 'react-icons/fa';

const PatientMedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    fetchPatientInfo();
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchMedicalRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchPatientInfo = async () => {
    try {
      const response = await axios.get('/api/patient/dashboard');
      setPatientId(response.data.patient._id);
    } catch (error) {
      console.error('Error fetching patient info:', error);
      toast.error('Failed to load patient information');
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get(`/api/medical-records/patient/${patientId}`);
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">My Medical Records</h2>
      
      {records.length === 0 ? (
        <Alert variant="info">
          <Alert.Heading>No Medical Records Found</Alert.Heading>
          <p>You don't have any medical records yet. Your doctor will add records after appointments and examinations.</p>
        </Alert>
      ) : (
        <div>
          {records.map((record) => (
            <Card key={record._id} className="mb-4">
              <Card.Header className="bg-primary text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    <FaStethoscope className="me-2" />
                    Dr. {record.doctorId?.user?.firstName} {record.doctorId?.user?.lastName}
                  </h6>
                  <small>{formatDate(record.createdAt)}</small>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <h6><strong>Diagnosis:</strong></h6>
                    <p className="text-muted">{record.diagnosis}</p>
                    
                    <h6><strong>Treatment:</strong></h6>
                    <p className="text-muted">{record.treatment}</p>
                    
                    {record.prescription && (
                      <>
                        <h6><FaPrescriptionBottleAlt className="me-2" /><strong>Prescription:</strong></h6>
                        <p className="text-muted">{record.prescription}</p>
                      </>
                    )}
                  </div>
                  
                  <div className="col-md-6">
                    {record.vitalSigns && (
                      <>
                        <h6><strong>Vital Signs:</strong></h6>
                        <Table size="sm" bordered>
                          <tbody>
                            {record.vitalSigns.bloodPressure && (
                              <tr>
                                <td><strong>Blood Pressure:</strong></td>
                                <td>{record.vitalSigns.bloodPressure}</td>
                              </tr>
                            )}
                            {record.vitalSigns.heartRate && (
                              <tr>
                                <td><strong>Heart Rate:</strong></td>
                                <td>{record.vitalSigns.heartRate} bpm</td>
                              </tr>
                            )}
                            {record.vitalSigns.temperature && (
                              <tr>
                                <td><strong>Temperature:</strong></td>
                                <td>{record.vitalSigns.temperature}°F</td>
                              </tr>
                            )}
                            {record.vitalSigns.weight && (
                              <tr>
                                <td><strong>Weight:</strong></td>
                                <td>{record.vitalSigns.weight} lbs</td>
                              </tr>
                            )}
                            {record.vitalSigns.height && (
                              <tr>
                                <td><strong>Height:</strong></td>
                                <td>{record.vitalSigns.height}</td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </>
                    )}
                    
                    {record.followUpDate && (
                      <>
                        <h6><strong>Follow-up Date:</strong></h6>
                        <Badge bg="warning" text="dark">
                          {new Date(record.followUpDate).toLocaleDateString()}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                
                {record.notes && (
                  <div className="mt-3 pt-3 border-top">
                    <h6><FaStickyNote className="me-2" /><strong>Doctor's Notes:</strong></h6>
                    <p className="text-muted">{record.notes}</p>
                  </div>
                )}
                
                <div className="mt-2">
                  <small className="text-muted">
                    Last updated: {formatDate(record.updatedAt)}
                  </small>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientMedicalRecords;
