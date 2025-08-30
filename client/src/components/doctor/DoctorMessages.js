import React, { useState, useEffect } from 'react';
import { Card, Form, Button, ListGroup, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaUser, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const DoctorMessages = () => {
  const [messages, setMessages] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    fetchPatients();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
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
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedReceiver || !newMessage.trim()) {
      toast.error('Please select a recipient and enter a message');
      return;
    }

    try {
      await axios.post('/api/messages', {
        receiverId: selectedReceiver,
        message: newMessage.trim(),
        messageType: 'text'
      });

      setNewMessage('');
      setSelectedReceiver('');
      fetchMessages();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getSelectedPatientName = () => {
    if (!selectedReceiver) return '';
    const patient = patients.find(p => p.user._id === selectedReceiver);
    return patient ? `${patient.user.firstName} ${patient.user.lastName}` : '';
  };

  const getFilteredMessages = () => {
    if (!selectedReceiver) return messages;
    return messages.filter(message => 
      (message.sender._id === user.id && message.receiver._id === selectedReceiver) ||
      (message.sender._id === selectedReceiver && message.receiver._id === user.id)
    );
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await axios.delete(`/api/messages/${messageId}`);
      fetchMessages();
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div>
      <h2 className="mb-4">Messages</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Send New Message</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={sendMessage}>
                <Form.Group className="mb-3">
                  <Form.Label>Send to Patient</Form.Label>
                  <Form.Select
                    value={selectedReceiver}
                    onChange={(e) => setSelectedReceiver(e.target.value)}
                    required
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient._id} value={patient.user._id}>
                        {patient.user.firstName} {patient.user.lastName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary">
                  <FaPaperPlane className="me-2" />
                  Send Message
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>
                {selectedReceiver 
                  ? `Conversation with ${getSelectedPatientName()}` 
                  : 'Message History'
                }
              </h5>
            </Card.Header>
            <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {selectedReceiver ? (
                getFilteredMessages().length === 0 ? (
                  <Alert variant="info">No messages in this conversation yet.</Alert>
                ) : (
                  <ListGroup variant="flush">
                    {getFilteredMessages().map((message) => (
                      <ListGroup.Item key={message._id} className="px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <FaUser className="me-2 text-muted" />
                              <strong>
                                {`${message.sender?.role === 'doctor' ? 'Dr. ' : ''}${message.sender?.firstName || 'Unknown'} ${message.sender?.lastName || ''} → ${message.receiver?.role === 'doctor' ? 'Dr. ' : ''}${message.receiver?.firstName || 'Unknown'} ${message.receiver?.lastName || ''}`}
                              </strong>
                            </div>
                            <p className="mb-1">{message.message}</p>
                            <small className="text-muted">{formatDate(message.createdAt)}</small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteMessage(message._id)}
                            className="ms-2"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )
              ) : (
                messages.length === 0 ? (
                  <Alert variant="info">No messages yet. Start a conversation!</Alert>
                ) : (
                  <ListGroup variant="flush">
                    {messages.map((message) => (
                      <ListGroup.Item key={message._id} className="px-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <FaUser className="me-2 text-muted" />
                              <strong>
                                {`${message.sender?.role === 'doctor' ? 'Dr. ' : ''}${message.sender?.firstName || 'Unknown'} ${message.sender?.lastName || ''} → ${message.receiver?.role === 'doctor' ? 'Dr. ' : ''}${message.receiver?.firstName || 'Unknown'} ${message.receiver?.lastName || ''}`}
                              </strong>
                            </div>
                            <p className="mb-1">{message.message}</p>
                            <small className="text-muted">{formatDate(message.createdAt)}</small>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteMessage(message._id)}
                            className="ms-2"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorMessages;
