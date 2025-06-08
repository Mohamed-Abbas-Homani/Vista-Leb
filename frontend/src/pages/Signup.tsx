import styled from "styled-components";
import Layout from "../components/Layout";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface FormData {
  [key: string]: string | number | undefined;
  username?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  address?: string;
  branch_name?: string;
  hot_line?: string;
  targeted_gender?: string;
  start_hour?: string;
  close_hour?: string;
  opening_days?: string;
  age?: number;
  marital_status?: string;
  price_range?: string;
  gender?: string;
}

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

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const FormWrapper = styled.div`
  max-width: 1200px;
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
  min-height: 600px;

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
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  &::before {
    content: '👋';
    font-size: 2rem;
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

const Title = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  color: #222;
  margin-bottom: 2rem;
  font-weight: 700;
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

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Switcher = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  background: #f5f5f5;
  border-radius: 50px;
  padding: 4px;
  position: relative;
  animation: fadeInUp 0.8s ease-out 0.4s both;
`;

const SwitchButton = styled.button<{ active: boolean }>`
  background-color: ${({ active }) => (active ? "#4a90e2" : "transparent")};
  color: ${({ active }) => (active ? "#fff" : "#666")};
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  flex: 1;
  text-align: center;

  &:hover {
    transform: ${({ active }) => (active ? "none" : "scale(1.05)")};
    color: ${({ active }) => (active ? "#fff" : "#333")};
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  animation: fadeInUp 0.8s ease-out 0.5s both;
`;

const InputGroup = styled.div`
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 0.95rem;
  color: #333;
  background: #fafafa;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background: #fff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.15);
  }

  &::placeholder {
    color: #999;
    font-style: italic;
    transition: all 0.3s ease;
  }

  &:focus::placeholder {
    transform: translateY(-2px);
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 1rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #fff;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
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

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px rgba(74, 144, 226, 0.4);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 0.9rem;
    font-size: 1rem;
  }
`;

const FormSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export default function Signup() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<"customer" | "business">(
    "customer"
  );
  const [formData, setFormData] = useState<FormData>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const userPayload = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone_number: formData.phone_number,
      address: formData.address,
      categories: [],
      [accountType]:
        accountType === "business"
          ? {
              branch_name: formData.branch_name,
              hot_line: formData.hot_line,
              targeted_gender: formData.targeted_gender,
              start_hour: formData.start_hour,
              close_hour: formData.close_hour,
              opening_days: formData.opening_days,
            }
          : {
              age: Number(formData.age),
              marital_status: formData.marital_status,
              price_range: formData.price_range,
              gender: formData.gender,
            },
    };

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/signup",
        userPayload,
        {
          params: { is_business: accountType === "business" },
        }
      );
      alert("Signup successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <Layout>
      <Container>
        <FormWrapper>
          <FormContent>
            <LeftSection>
              <WelcomeTitle>Welcome!</WelcomeTitle>
              <IconWrapper />
              <WelcomeSubtitle>
                Join our community and discover amazing opportunities. Create your account to get started on your journey with us.
              </WelcomeSubtitle>
            </LeftSection>
            
            <RightSection>
              <Title>Create Account</Title>
              <Switcher>
                <SwitchButton
                  type="button"
                  active={accountType === "customer"}
                  onClick={() => setAccountType("customer")}
                >
                  Customer
                </SwitchButton>
                <SwitchButton
                  type="button"
                  active={accountType === "business"}
                  onClick={() => setAccountType("business")}
                >
                  Business
                </SwitchButton>
              </Switcher>
              
              <Form onSubmit={handleSubmit}>
                <FormSection>
                  <InputGroup>
                    <Input
                      name="username"
                      placeholder="Username"
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </FormSection>
                
                <FormSection>
                  <InputGroup>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Input
                      name="phone_number"
                      placeholder="Phone Number"
                      onChange={handleChange}
                    />
                  </InputGroup>
                </FormSection>

                <InputGroup>
                  <Input name="address" placeholder="Address" onChange={handleChange} />
                </InputGroup>

                {accountType === "business" ? (
                  <>
                    <FormSection>
                      <InputGroup>
                        <Input
                          name="branch_name"
                          placeholder="Branch Name"
                          onChange={handleChange}
                          required
                        />
                      </InputGroup>
                      <InputGroup>
                        <Input
                          name="hot_line"
                          placeholder="Hot Line"
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </FormSection>
                    
                    <InputGroup>
                      <Input
                        name="targeted_gender"
                        placeholder="Targeted Gender"
                        onChange={handleChange}
                      />
                    </InputGroup>
                    
                    <FormSection>
                      <InputGroup>
                        <Input
                          name="start_hour"
                          type="time"
                          placeholder="Start Hour"
                          onChange={handleChange}
                        />
                      </InputGroup>
                      <InputGroup>
                        <Input
                          name="close_hour"
                          type="time"
                          placeholder="Close Hour"
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </FormSection>
                    
                    <InputGroup>
                      <Input
                        name="opening_days"
                        placeholder="Opening Days"
                        onChange={handleChange}
                      />
                    </InputGroup>
                  </>
                ) : (
                  <>
                    <FormSection>
                      <InputGroup>
                        <Input
                          name="age"
                          type="number"
                          placeholder="Age"
                          onChange={handleChange}
                        />
                      </InputGroup>
                      <InputGroup>
                        <Input
                          name="marital_status"
                          placeholder="Marital Status"
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </FormSection>
                    
                    <FormSection>
                      <InputGroup>
                        <Input
                          name="price_range"
                          placeholder="Price Range"
                          onChange={handleChange}
                        />
                      </InputGroup>
                      <InputGroup>
                        <Input
                          name="gender"
                          placeholder="Gender"
                          onChange={handleChange}
                        />
                      </InputGroup>
                    </FormSection>
                  </>
                )}

                <Button type="submit">Create Account</Button>
              </Form>
            </RightSection>
          </FormContent>
        </FormWrapper>
      </Container>
    </Layout>
  );
}