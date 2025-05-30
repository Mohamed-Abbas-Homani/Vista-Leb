import { useState } from "react";
import styled from "styled-components";
import Layout from "../components/Layout";
import axios from "axios";

const ContactWrapper = styled.div`
  max-width: 700px;
  margin: 3rem auto;
  padding: 2rem 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #fff;
  color: #000;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  background-color: #fff;
  color: #000;
  resize: vertical;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Button = styled.button<{ loading?: boolean }>`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  min-height: 48px;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.primaryDark};
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }

  ${({ loading }) =>
    loading &&
    `
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      margin: auto;
      border: 2px solid transparent;
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 1s ease infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
`;

const Message = styled.div<{ type: 'success' | 'error' }>`
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
  background-color: ${({ type }) => (type === 'success' ? '#d4edda' : '#f8d7da')};
  color: ${({ type }) => (type === 'success' ? '#155724' : '#721c24')};
  border: 1px solid ${({ type }) => (type === 'success' ? '#c3e6cb' : '#f5c6cb')};
`;

interface FormData {
  name: string;
  email: string;
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
        setFormData({ name: "", email: "", message: "" });
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
        <Title>Contact Us</Title>
        
        {responseMessage && (
          <Message type={responseMessage.type}>
            {responseMessage.text}
          </Message>
        )}

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <TextArea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Button type="submit" disabled={loading} loading={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </Form>
      </ContactWrapper>
    </Layout>
  );
};

export default ContactUs;