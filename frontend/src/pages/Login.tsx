import styled from "styled-components";
import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useStore from "../store";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f9fc;
  padding: 2rem;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const Form = styled.form`
  background: #ffffff;
  border-radius: 20px;
  padding: 2.5rem 3rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;

  @media (max-width: 480px) {
    padding: 2rem 2rem;
    max-width: 100%;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  color: #222222;
  margin-bottom: 1rem;
  letter-spacing: 1.2px;

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 1.2rem;
  pointer-events: none;
  transition: color 0.3s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  border-radius: 14px;
  border: 1.8px solid #d1d9e6;
  font-size: 1rem;
  color: #333333;
  background: #fafafa;
  transition: border-color 0.3s ease, background-color 0.3s ease;

  &::placeholder {
    color: #b0b9c4;
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #ffffff;
  }

  &:focus + ${Icon} {
    color: #4a90e2;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  margin-top: 1.5rem;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ disabled }) => (disabled ? "#999999" : "#ffffff")};
  background: ${({ disabled }) => (disabled ? "#cccccc" : "#4a90e2")};
  border: none;
  border-radius: 18px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  box-shadow: ${({ disabled }) =>
    disabled ? "none" : "0 6px 15px rgba(74, 144, 226, 0.6)"};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ disabled }) => (disabled ? "#cccccc" : "#357ABD")};
    box-shadow: ${({ disabled }) =>
      disabled ? "none" : "0 8px 20px rgba(53, 122, 189, 0.8)"};
    transform: ${({ disabled }) => (disabled ? "none" : "scale(1.05)")};
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {setToken, setUser} = useStore()
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

      const res = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/login",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
        }
      );

      console.log("Login success:", res.data);
      toast.success("Login successful!");
      setToken(res.data.access_token)
      setUser(res.data.user)
      
      navigate("/");
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
        <Form onSubmit={handleSubmit} noValidate>
          <Title>Welcome Back</Title>
          <InputWrapper>
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Icon>
              <FaEnvelope />
            </Icon>
          </InputWrapper>

          <InputWrapper>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Icon>
              <FaLock />
            </Icon>
          </InputWrapper>

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </Button>
        </Form>
      </Container>
    </Layout>
  );
}
