import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaDownload, FaPrescriptionBottleAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    diagnosis: '',
    symptoms: '',
    notes: '',
    followUpDate: '',
    medications: [
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchAppointments();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('/api/prescriptions/my');
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/doctor/appointments/approved');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index][field] = value;
    setFormData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      const updatedMedications = formData.medications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medications: updatedMedications
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/prescriptions', formData);
      setShowModal(false);
      resetForm();
      fetchPrescriptions();
      toast.success('Prescription created successfully');
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const resetForm = () => {
    setFormData({
      appointmentId: '',
      patientId: '',
      diagnosis: '',
      symptoms: '',
      notes: '',
      followUpDate: '',
      medications: [
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
      ]
    });
  };

  const generatePrescriptionPDF = (prescription) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(0, 123, 255);
      doc.text('HOSPITAL MANAGEMENT SYSTEM', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('PRESCRIPTION', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Prescription Info
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Prescription No: ${prescription.prescriptionNumber || 'N/A'}`, 20, yPosition);
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, pageWidth - 80, yPosition);
      yPosition += 15;

      // Patient Information
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0);
      doc.text('Patient Information:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const patientName = `${prescription.patient?.user?.firstName || ''} ${prescription.patient?.user?.lastName || ''}`.trim() || 'N/A';
      doc.text(`Name: ${patientName}`, 25, yPosition);
      yPosition += 8;
      
      if (prescription.patient?.symptoms) {
        doc.text(`Symptoms: ${prescription.patient.symptoms}`, 25, yPosition);
        yPosition += 8;
      }
      yPosition += 10;

      // Doctor Information
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0);
      doc.text('Prescribed by:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const doctorName = `Dr. ${prescription.doctor?.user?.firstName || ''} ${prescription.doctor?.user?.lastName || ''}`.trim() || 'Dr. N/A';
      doc.text(doctorName, 25, yPosition);
      yPosition += 8;
      doc.text(`Department: ${prescription.doctor?.department || 'N/A'}`, 25, yPosition);
      yPosition += 15;

      // Diagnosis
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0);
      doc.text('Diagnosis:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const diagnosisLines = doc.splitTextToSize(prescription.diagnosis || 'N/A', pageWidth - 40);
      doc.text(diagnosisLines, 25, yPosition);
      yPosition += (diagnosisLines.length * 6) + 10;

      // Medications
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0);
      doc.text('Medications:', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      if (prescription.medications && prescription.medications.length > 0) {
        prescription.medications.forEach((med, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(`${index + 1}. ${med.name || 'N/A'}`, 25, yPosition);
          yPosition += 6;
          doc.text(`   Dosage: ${med.dosage || 'N/A'}`, 25, yPosition);
          yPosition += 6;
          doc.text(`   Frequency: ${med.frequency || 'N/A'}`, 25, yPosition);
          yPosition += 6;
          doc.text(`   Duration: ${med.duration || 'N/A'}`, 25, yPosition);
          yPosition += 6;
          if (med.instructions) {
            const instructionLines = doc.splitTextToSize(`   Instructions: ${med.instructions}`, pageWidth - 50);
            doc.text(instructionLines, 25, yPosition);
            yPosition += (instructionLines.length * 6);
          }
          yPosition += 8;
        });
      } else {
        doc.text('No medications prescribed', 25, yPosition);
        yPosition += 10;
      }

      // Notes
      if (prescription.notes) {
        yPosition += 5;
        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0);
        doc.text('Notes:', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const notesLines = doc.splitTextToSize(prescription.notes, pageWidth - 40);
        doc.text(notesLines, 25, yPosition);
        yPosition += (notesLines.length * 6) + 10;
      }

      // Follow-up date
      if (prescription.followUpDate) {
        doc.setFontSize(11);
        doc.setTextColor(255, 0, 0);
        doc.text(`Follow-up Date: ${new Date(prescription.followUpDate).toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 10);
      doc.text('Hospital Management System', pageWidth - 60, pageHeight - 10);

      // Save the PDF
      const fileName = `prescription-${prescription.prescriptionNumber || 'unknown'}.pdf`;
      doc.save(fileName);
      toast.success('Prescription PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      toast.error('Failed to generate prescription PDF. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading prescriptions...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Prescriptions</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          New Prescription
        </Button>
      </div>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FaPrescriptionBottleAlt className="me-2" />
            My Prescriptions
          </h5>
        </Card.Header>
        <Card.Body>
          {prescriptions.length === 0 ? (
            <Alert variant="info">
              No prescriptions found.
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Prescription No</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id}>
                    <td>
                      <Badge bg="primary">{prescription.prescriptionNumber}</Badge>
                    </td>
                    <td>{prescription.patient?.user?.firstName} {prescription.patient?.user?.lastName}</td>
                    <td>{prescription.diagnosis}</td>
                    <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => generatePrescriptionPDF(prescription)}
                      >
                        <FaDownload className="me-1" />
                        Download PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* New Prescription Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Prescription</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Appointment</Form.Label>
              <Form.Select
                name="appointmentId"
                value={formData.appointmentId}
                onChange={(e) => {
                  const selectedAppointment = appointments.find(apt => apt._id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    appointmentId: e.target.value,
                    patientId: selectedAppointment?.patientId?._id || ''
                  }));
                }}
                required
              >
                <option value="">Select appointment...</option>
                {appointments.map(appointment => (
                  <option key={appointment._id} value={appointment._id}>
                    {appointment.patientId?.user?.firstName} {appointment.patientId?.user?.lastName} - {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Diagnosis</Form.Label>
              <Form.Control
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Symptoms</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Medications</Form.Label>
                <Button variant="outline-primary" size="sm" onClick={addMedication}>
                  <FaPlus /> Add Medication
                </Button>
              </div>
              
              {formData.medications.map((medication, index) => (
                <div key={index} className="border p-3 mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6>Medication {index + 1}</h6>
                    {formData.medications.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-2">
                        <Form.Label>Medicine Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-2">
                        <Form.Label>Dosage</Form.Label>
                        <Form.Control
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg"
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-2">
                        <Form.Label>Frequency</Form.Label>
                        <Form.Control
                          type="text"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          placeholder="e.g., Twice daily"
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-2">
                        <Form.Label>Duration</Form.Label>
                        <Form.Control
                          type="text"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days"
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Instructions</Form.Label>
                    <Form.Control
                      type="text"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take after meals"
                    />
                  </Form.Group>
                </div>
              ))}
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes or instructions"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Follow-up Date</Form.Label>
              <Form.Control
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                Create Prescription
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DoctorPrescriptions;
