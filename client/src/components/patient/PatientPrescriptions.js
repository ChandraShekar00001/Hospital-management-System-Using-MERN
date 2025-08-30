import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaPrescriptionBottleAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/prescriptions/my-prescriptions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
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
      <h2 className="mb-4">My Prescriptions</h2>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FaPrescriptionBottleAlt className="me-2" />
            Prescription History
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
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Diagnosis</th>
                  <th>Date</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id}>
                    <td>
                      <Badge bg="primary">{prescription.prescriptionNumber}</Badge>
                    </td>
                    <td>Dr. {prescription.doctor?.user?.firstName} {prescription.doctor?.user?.lastName}</td>
                    <td>{prescription.doctor?.department}</td>
                    <td>{prescription.diagnosis}</td>
                    <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                    <td>
                      {prescription.followUpDate ? (
                        <Badge bg="warning">
                          {new Date(prescription.followUpDate).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge bg="secondary">None</Badge>
                      )}
                    </td>
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
    </div>
  );
};

export default PatientPrescriptions;
