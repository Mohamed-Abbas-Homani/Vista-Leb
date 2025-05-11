import styled from "styled-components";
import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";

const Form = styled.form`
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary || '#007bff'};
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.secondary || '#0056b3'};
  }
`;

const ErrorMsg = styled.p`
  color: red;
  font-size: 0.9rem;
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", email);
      params.append("password", password);
      params.append("scope", "");
      params.append("client_id", "string");
      params.append("client_secret", "string");

      const res = await axios.post("http://127.0.0.1:9000/api/v1/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
      });
      console.log("Login successful:", res.data);
      setError(null);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <Layout>
      <h2>Login</h2>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Button type="submit">Login</Button>
      </Form>
    </Layout>
  );
}
