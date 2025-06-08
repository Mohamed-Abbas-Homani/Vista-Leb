import { useState } from "react";
import styled from "styled-components";
import Layout from "../components/Layout";
import axios from "axios";

const ContactWrapper = styled.div`
  max-width: 800px;
  margin: 4rem auto;
  padding: 3rem 3.5rem;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primaryDark});
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
  text-align: center;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: #666;
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 1.1rem;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  background-color: #fff;
  color: #000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}22, 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #f8f8f8;
    cursor: not-allowed;
    transform: none;
  }

  &::placeholder {
    color: #999;
    font-weight: 400;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem 1.2rem;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  min-height: 140px;
  background-color: #fff;
  color: #000;
  resize: vertical;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.primary}22, 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #f8f8f8;
    cursor: not-allowed;
    transform: none;
  }

  &::placeholder {
    color: #999;
    font-weight: 400;
  }
`;

const Button = styled.button<{ loading?: boolean }>`
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primaryDark});
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 56px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.primary}33;
  letter-spacing: 0.02em;
  margin-top: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.primary}44;
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  ${({ loading }) =>
    loading &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid transparent;
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 1.2rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  background-color: ${({ type }) => (type === 'success' ? '#d4edda' : '#f8d7da')};
  color: ${({ type }) => (type === 'success' ? '#155724' : '#721c24')};
  border: 2px solid ${({ type }) => (type === 'success' ? '#c3e6cb' : '#f5c6cb')};
  box-shadow: 0 4px 12px ${({ type }) => (type === 'success' ? '#c3e6cb' : '#f5c6cb')}33;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ApiResponse {
  message: string;
  status: string;
  contact_name: string;
}

const ContactUs = () => {
  const [formData, setFormData] = useState<FormData>({ 
    name: "", 
    email: "", 
    subject: "",
    message: "" 
  });
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any previous messages when user starts typing
    if (responseMessage) {
      setResponseMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponseMessage(null);

    try {
      // Update the API endpoint to match your FastAPI backend
      const response = await axios.post<ApiResponse>("http://127.0.0.1:8000/api/v1/mail/contact-us", formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle successful response
      if (response.data.status === 'success') {
        setResponseMessage({
          text: `Thank you, ${response.data.contact_name}! ${response.data.message}`,
          type: 'success'
        });
        
        // Reset form
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error('Unexpected response status');
      }

    } catch (err: any) {
      // Handle different types of errors
      let errorMessage = "Failed to send message. Please try again.";
      
      if (err.response?.data?.detail) {
        // FastAPI error response
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          // Validation errors
          errorMessage = err.response.data.detail
            .map((error: any) => error.msg || error.message)
            .join(', ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setResponseMessage({
        text: errorMessage,
        type: 'error'
      });

      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ContactWrapper>
        <Title>Get In Touch</Title>
        <Subtitle>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</Subtitle>
        
        {responseMessage && (
          <Message type={responseMessage.type}>
            {responseMessage.text}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <FormRow>
            <InputGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </InputGroup>
          </FormRow>
          
          <InputGroup>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              name="subject"
              placeholder="What's this about?"
              value={formData.subject}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="message">Message</Label>
            <TextArea
              id="message"
              name="message"
              placeholder="Tell us more about your inquiry..."
              value={formData.message}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </InputGroup>
          
          <Button type="submit" disabled={loading} loading={loading}>
            {loading ? "Sending Message..." : "Send Message"}
          </Button>
        </Form>
      </ContactWrapper>
    </Layout>
  );
};

export default ContactUs;