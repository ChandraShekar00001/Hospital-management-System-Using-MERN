import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaDownload, FaCalendarAlt, FaFileInvoiceDollar, FaPlus } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { useAuth } from '../../contexts/AuthContext';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    description: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchInvoices();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/patient/appointments');
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/patient/doctors');
      setDoctors(response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const fetchInvoices = async () => {
    try {
      const patientId = user.patientId || user._id;
      const response = await axios.get(`/api/invoices/patient/${patientId}`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const generateAppointmentPDF = (appointment) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 123, 255);
      doc.text('HOSPITAL MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Appointment Confirmation', pageWidth / 2, 35, { align: 'center' });
      
      // Patient Info
      doc.setFontSize(12);
      doc.text('Patient Information:', 20, 55);
      doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 65);
      doc.text(`Email: ${user.email}`, 20, 75);
      
      // Doctor Info
      doc.text('Doctor Information:', 20, 95);
      const doctorName = appointment.doctorId?.user?.firstName 
        ? `Dr. ${appointment.doctorId.user.firstName} ${appointment.doctorId.user.lastName}`
        : 'N/A';
      doc.text(`Doctor: ${doctorName}`, 20, 105);
      doc.text(`Department: ${appointment.doctorId?.department || 'N/A'}`, 20, 115);
      
      // Appointment Details
      doc.text('Appointment Details:', 20, 135);
      doc.text(`Date: ${new Date(appointment.createdAt).toLocaleDateString()}`, 20, 145);
      doc.text(`Status: ${appointment.status}`, 20, 155);
      doc.text(`Description: ${appointment.description}`, 20, 165);
      
      // Footer
      doc.setFontSize(10);
      doc.text('Generated on: ' + new Date().toLocaleString(), 20, 280);
      
      doc.save(`appointment-${appointment._id}.pdf`);
      toast.success('Appointment PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const generateInvoicePDF = (invoice) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(0, 123, 255);
      doc.text('HOSPITAL MANAGEMENT SYSTEM', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('INVOICE', pageWidth / 2, 35, { align: 'center' });
      
      // Invoice Info
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, 55);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 65);
      doc.text(`Status: ${invoice.status}`, 20, 75);
      
      // Patient Info
      doc.text('Patient Information:', 20, 95);
      doc.text(`Name: ${user.firstName} ${user.lastName}`, 20, 105);
      doc.text(`Email: ${user.email}`, 20, 115);
      
      // Services
      doc.text('Services:', 20, 135);
      let yPosition = 145;
      invoice.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.description}: ₹${item.amount}`, 30, yPosition);
        yPosition += 10;
      });
      
      // Total
      doc.setFontSize(14);
      doc.text(`Subtotal: ₹${invoice.subtotal}`, 20, yPosition + 10);
      doc.text(`Tax: ₹${invoice.tax}`, 20, yPosition + 20);
      doc.text(`Total: ₹${invoice.total}`, 20, yPosition + 30);
      
      // Footer
      doc.setFontSize(10);
      doc.text('Generated on: ' + new Date().toLocaleString(), 20, 280);
      
      doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      toast.error('Failed to generate invoice PDF');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/patient/appointments', formData);
      toast.success('Appointment booked successfully');
      setShowModal(false);
      setFormData({ doctorId: '', description: '' });
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to book appointment');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><FaCalendarAlt className="me-2" />My Appointments</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Book New Appointment
        </Button>
      </div>

      {appointments.length === 0 ? (
        <Alert variant="info">
          <FaCalendarAlt className="me-2" />
          You have no appointments yet. Book your first appointment!
        </Alert>
      ) : (
        <Card>
          <Card.Header>
            <h5>All Appointments</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => {
                  const relatedInvoice = invoices.find(inv => inv.appointmentId === appointment._id);
                  const doctorName = appointment.doctorId?.user?.firstName 
                    ? `Dr. ${appointment.doctorId.user.firstName} ${appointment.doctorId.user.lastName}`
                    : 'N/A';
                  const department = appointment.doctorId?.department || 'N/A';
                  
                  return (
                    <tr key={appointment._id}>
                      <td>{doctorName}</td>
                      <td>{department}</td>
                      <td>{new Date(appointment.appointmentDate || appointment.createdAt).toLocaleDateString()}</td>
                      <td>{appointment.description}</td>
                      <td>
                        <Badge bg={appointment.status ? 'success' : 'warning'}>
                          {appointment.status ? 'Approved' : 'Pending'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => generateAppointmentPDF(appointment)}
                            title="Download Appointment Confirmation"
                          >
                            <FaDownload className="me-1" />
                            Appointment
                          </Button>
                          {relatedInvoice && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => generateInvoicePDF(relatedInvoice)}
                              title="Download Invoice"
                            >
                              <FaFileInvoiceDollar className="me-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Book Appointment Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book New Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Doctor</Form.Label>
              <Form.Select
                name="doctorId"
                value={formData.doctorId}
                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                required
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user?.firstName} {doctor.user?.lastName} - {doctor.department}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                placeholder="Describe your symptoms or reason for appointment"
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Book Appointment
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PatientAppointments; 