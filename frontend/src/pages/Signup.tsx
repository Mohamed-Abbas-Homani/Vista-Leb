import styled from "styled-components";
import Layout from "../components/Layout";
import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

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
  cover_photo?: string;
  start_hour?: string;
  close_hour?: string;
  opening_days?: string;
  age?: number;
  marital_status?: string;
  price_range?: string;
  gender?: string;
}

const FormWrapper = styled.div`
  max-width: 420px;
  margin: 2rem auto;
  padding: 2rem 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    margin: 1rem 1rem;
    padding: 1.5rem 1.5rem;
    max-width: 100%;
    border-radius: 12px;
  }
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.6rem;
  color: #222;
  margin-bottom: 1.5rem;
  font-weight: 700;

  @media (max-width: 480px) {
    font-size: 1.4rem;
  }
`;

const Switcher = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const SwitchButton = styled.button<{ active: boolean }>`
  background-color: ${({ active, theme }) => (active ? theme.primary : "#eee")};
  color: ${({ active }) => (active ? "#fff" : "#444")};
  border: none;
  padding: 0.5rem 1.2rem;
  margin: 0 0.4rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: ${({ active }) =>
    active ? "0 5px 15px rgba(74, 144, 226, 0.4)" : "none"};
  transition: background-color 0.3s, color 0.3s;
  user-select: none;

  &:hover {
    background-color: ${({ active, theme }) =>
      active ? theme.primary : "#dcdcdc"};
  }

  @media (max-width: 480px) {
    padding: 0.45rem 1rem;
    font-size: 0.9rem;
    margin: 0 0.25rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.7rem 1rem;
  border: 1.6px solid #ccc;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #333;
  background: #fafafa;
  transition: border-color 0.3s ease, background-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    background: #fff;
  }

  &::placeholder {
    color: #999;
    font-style: italic;
  }

  @media (max-width: 480px) {
    padding: 0.6rem 0.9rem;
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  margin-top: 1.5rem;
  padding: 0.85rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #fff;
  background-color: ${({ theme }) => theme.primary};
  border: none;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 7px 18px rgba(74, 144, 226, 0.55);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background-color: #357abd;
    box-shadow: 0 8px 25px rgba(53, 122, 189, 0.8);
    transform: scale(1.04);
  }

  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 1rem;
  }
`;

export default function Signup() {
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
              cover_photo: formData.cover_photo,
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
      await axios.post("http://127.0.0.1:8000/api/v1/auth/signup", userPayload, {
        params: { is_business: accountType === "business" },
      });
      alert("Signup successful!");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <Layout>
      <FormWrapper>
        <Title>Sign Up</Title>
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
          <Input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <Input
            name="phone_number"
            placeholder="Phone Number"
            onChange={handleChange}
          />
          <Input name="address" placeholder="Address" onChange={handleChange} />

          {accountType === "business" ? (
            <>
              <Input
                name="branch_name"
                placeholder="Branch Name"
                onChange={handleChange}
                required
              />
              <Input
                name="hot_line"
                placeholder="Hot Line"
                onChange={handleChange}
              />
              <Input
                name="targeted_gender"
                placeholder="Targeted Gender"
                onChange={handleChange}
              />
              <Input
                name="cover_photo"
                placeholder="Cover Photo URL"
                onChange={handleChange}
              />
              <Input
                name="start_hour"
                type="time"
                placeholder="Start Hour"
                onChange={handleChange}
              />
              <Input
                name="close_hour"
                type="time"
                placeholder="Close Hour"
                onChange={handleChange}
              />
              <Input
                name="opening_days"
                placeholder="Opening Days"
                onChange={handleChange}
              />
            </>
          ) : (
            <>
              <Input
                name="age"
                type="number"
                placeholder="Age"
                onChange={handleChange}
              />
              <Input
                name="marital_status"
                placeholder="Marital Status"
                onChange={handleChange}
              />
              <Input
                name="price_range"
                placeholder="Price Range"
                onChange={handleChange}
              />
              <Input
                name="gender"
                placeholder="Gender"
                onChange={handleChange}
              />
            </>
          )}

          <Button type="submit">Sign Up</Button>
        </Form>
      </FormWrapper>
    </Layout>
  );
}
