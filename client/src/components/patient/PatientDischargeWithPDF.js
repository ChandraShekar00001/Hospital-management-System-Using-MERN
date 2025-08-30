import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaFileInvoiceDollar, FaCalendarAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';

const PatientDischargeWithPDF = () => {
  const [dischargeData, setDischargeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDischargeData();
  }, []);

  const fetchDischargeData = async () => {
    try {
      const response = await axios.get('/api/patient/discharge');
      setDischargeData(response.data);
    } catch (error) {
      console.error('Error fetching discharge data:', error);
      toast.error('Failed to load discharge information');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!dischargeData || !dischargeData.isDischarged) {
      toast.error('No discharge data available for PDF generation');
      return;
    }

    try {
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 123, 255);
    doc.text('HOSPITAL MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('PATIENT DISCHARGE SUMMARY', pageWidth / 2, 35, { align: 'center' });

    // Patient Information
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text('Patient Information:', 20, 55);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${dischargeData.patientName}`, 20, 70);
    doc.text(`Patient ID: ${dischargeData.patientId}`, 20, 80);
    doc.text(`Address: ${dischargeData.address}`, 20, 90);
    doc.text(`Mobile: ${dischargeData.mobile}`, 20, 100);
    doc.text(`Symptoms: ${dischargeData.symptoms}`, 20, 110);

    // Doctor Information
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text('Attending Doctor:', 20, 130);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Doctor: ${dischargeData.assignedDoctorName}`, 20, 145);

    // Admission & Discharge Dates
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text('Treatment Duration:', 20, 165);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Admit Date: ${new Date(dischargeData.admitDate).toLocaleDateString()}`, 20, 180);
    doc.text(`Release Date: ${new Date(dischargeData.releaseDate).toLocaleDateString()}`, 20, 190);
    doc.text(`Days Spent: ${dischargeData.daySpent} days`, 20, 200);

    // Billing Information
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text('Billing Summary:', 20, 220);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const billY = 235;
    doc.text(`Room Charges: $${dischargeData.roomCharge}`, 20, billY);
    doc.text(`Medicine Cost: $${dischargeData.medicineCost}`, 20, billY + 10);
    doc.text(`Doctor Fee: $${dischargeData.doctorFee}`, 20, billY + 20);
    doc.text(`Other Charges: $${dischargeData.otherCharge}`, 20, billY + 30);
    
    // Total
    doc.setFontSize(14);
    doc.setTextColor(255, 0, 0);
    doc.text(`Total Amount: $${dischargeData.total}`, 20, billY + 50);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    doc.text('Thank you for choosing our hospital services!', pageWidth / 2, 290, { align: 'center' });

    // Save the PDF
    doc.save(`discharge-summary-${dischargeData.patientName.replace(/\s+/g, '-')}.pdf`);
    toast.success('PDF downloaded successfully!');
    
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading discharge information...</div>;
  }

  if (!dischargeData.isDischarged) {
    return (
      <div>
        <h2 className="mb-4">Discharge Information</h2>
        <Alert variant="info">
          <FaCalendarAlt className="me-2" />
          You have not been discharged yet. This section will be available once you are discharged from the hospital.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Discharge Summary</h2>
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaFileInvoiceDollar className="me-2" />
            Discharge Details
          </h5>
          <Button variant="primary" onClick={generatePDF}>
            <FaDownload className="me-2" />
            Download PDF
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-6">
              <h6>Patient Information</h6>
              <p><strong>Name:</strong> {dischargeData.patientName}</p>
              <p><strong>Address:</strong> {dischargeData.address}</p>
              <p><strong>Mobile:</strong> {dischargeData.mobile}</p>
              <p><strong>Symptoms:</strong> {dischargeData.symptoms}</p>
            </div>
            <div className="col-md-6">
              <h6>Treatment Details</h6>
              <p><strong>Attending Doctor:</strong> {dischargeData.assignedDoctorName}</p>
              <p><strong>Admit Date:</strong> {new Date(dischargeData.admitDate).toLocaleDateString()}</p>
              <p><strong>Release Date:</strong> {new Date(dischargeData.releaseDate).toLocaleDateString()}</p>
              <p><strong>Days Spent:</strong> <Badge bg="info">{dischargeData.daySpent} days</Badge></p>
            </div>
          </div>

          <h6>Billing Summary</h6>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Service</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Charges</td>
                <td>${dischargeData.roomCharge}</td>
              </tr>
              <tr>
                <td>Medicine Cost</td>
                <td>${dischargeData.medicineCost}</td>
              </tr>
              <tr>
                <td>Doctor Fee</td>
                <td>${dischargeData.doctorFee}</td>
              </tr>
              <tr>
                <td>Other Charges</td>
                <td>${dischargeData.otherCharge}</td>
              </tr>
              <tr className="table-danger">
                <th>Total Amount</th>
                <th>${dischargeData.total}</th>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PatientDischargeWithPDF;
