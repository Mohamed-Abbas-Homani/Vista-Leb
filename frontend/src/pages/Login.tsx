import styled from "styled-components";
import Layout from "../components/Layout";
import { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock, FaUserCircle } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import useStore from "../store";

const Container = styled.div`
  min-height: 100vh;
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FormWrapper = styled.div`
  max-width: 900px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: 16px;
  }
`;

const FormContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 500px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const LeftSection = styled.div`
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.3;
  }

  @media (max-width: 768px) {
    padding: 2rem;
    min-height: 200px;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: slideInLeft 0.8s ease-out;

  @keyframes slideInLeft {
    from {
      transform: translateX(-50px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 300px;
  animation: slideInLeft 0.8s ease-out 0.2s both;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  animation: bounce 2s infinite;
  font-size: 2.5rem;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`;

const RightSection = styled.div`
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  animation: fadeInUp 0.8s ease-out 0.3s both;

  @keyframes fadeInUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  color: #222222;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
  animation: fadeInUp 0.8s ease-out 0.4s both;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 1.2rem;
  transform: translateY(-50%);
  color: #a0a0a0;
  font-size: 1.2rem;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1.2rem 1.1rem 3.8rem;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  font-size: 1rem;
  color: #333333;
  background: #fafafa;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::placeholder {
    color: #999;
    font-style: italic;
    transition: all 0.3s ease;
  }

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background-color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.15);
    
    &::placeholder {
      transform: translateY(-2px);
      opacity: 0.7;
    }
  }

  &:focus + ${Icon} {
    color: #4a90e2;
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 1rem 1rem 1rem 3.5rem;
  }
`;

const Button = styled.button<{ disabled?: boolean }>`
  margin-top: 1.5rem;
  padding: 1.1rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ disabled }) => (disabled ? "#999999" : "#ffffff")};
  background: ${({ disabled }) => 
    disabled ? "#cccccc" : "linear-gradient(135deg, #4a90e2 0%, #357abd 100%)"};
  border: none;
  border-radius: 12px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(74, 144, 226, 0.4);
    
    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #ffffff;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ForgotPassword = styled.a`
  text-align: center;
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    color: #357abd;
    transform: translateY(-1px);
  }
`;

const LoginStats = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatItem = styled.div`
  text-align: center;
  animation: fadeInUp 0.8s ease-out 0.6s both;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useStore();

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

      toast.success("Login successful!");
      setToken(res.data.access_token);
      setUser(res.data.user);
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
        <FormWrapper>
          <FormContent>
            <LeftSection>
              <WelcomeTitle>Welcome Back!</WelcomeTitle>
              <IconWrapper>
                <FaUserCircle />
              </IconWrapper>
              <WelcomeSubtitle>
                Sign in to your account and continue your journey with us. We're excited to have you back!
              </WelcomeSubtitle>
              
              <LoginStats>
                <StatItem>
                  <StatNumber>10K+</StatNumber>
                  <StatLabel>Active Users</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>99.9%</StatNumber>
                  <StatLabel>Uptime</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>24/7</StatNumber>
                  <StatLabel>Support</StatLabel>
                </StatItem>
              </LoginStats>
            </LeftSection>
            
            <RightSection>
              <Form onSubmit={handleSubmit} noValidate>
                <Title>Sign In</Title>
                
                <InputWrapper>
                  <Input
                    type="email"
                    placeholder="Username"
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
                  {loading && <LoadingSpinner />}
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
                
                <ForgotPassword>
                  Forgot your password?
                </ForgotPassword>
              </Form>
            </RightSection>
          </FormContent>
        </FormWrapper>
      </Container>
    </Layout>
  );
}