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
`;

const TextArea = styled.textarea`
  padding: 0.8rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: ${({ theme }) => theme.primaryDark};
  }
`;

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/contact", formData);
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      alert("Failed to send message.");
    }
  };

  return (
    <Layout>
      <ContactWrapper>
        <Title>Contact Us</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextArea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
          />
          <Button type="submit">Send Message</Button>
        </Form>
      </ContactWrapper>
    </Layout>
  );
};

export default ContactUs;
