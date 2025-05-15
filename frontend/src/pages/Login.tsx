// pages/Login.tsx
import styled from "styled-components";
import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eef2f3, #8e9eab);
  width: 100%;
  height: 100%;
`;

const Form = styled.form`
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;

  &:focus {
    border-color: #007bff;
    outline: none;
    background-color: #fff;
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#aaa" : "#007bff")};
  color: white;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#aaa" : "#0056b3")};
  }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("grant_type", "password");
      params.append("username", email);
      params.append("password", password);
      params.append("scope", "");
      params.append("client_id", "string");
      params.append("client_secret", "string");

      const res = await axios.post("http://127.0.0.1:8000/api/v1/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
      });

      console.log("Login success:", res.data);
      toast.success("Login successful!");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Form onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>
          <InputWrapper>
            <Icon>
              <FaEnvelope />
            </Icon>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputWrapper>

          <InputWrapper>
            <Icon>
              <FaLock />
            </Icon>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputWrapper>

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>
      </Container>
    </Layout>
  );
}
