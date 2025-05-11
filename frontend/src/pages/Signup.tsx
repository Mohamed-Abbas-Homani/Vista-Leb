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
  max-width: 600px;
  margin: auto;
  padding: 2rem;
`;

const Switcher = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const SwitchButton = styled.button<{ active: boolean }>`
  background-color: ${({ active, theme }) => active ? theme.primary : "#eee"};
  color: ${({ active }) => (active ? "white" : "black")};
  border: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

export default function Signup() {
  const [accountType, setAccountType] = useState<"customer" | "business">("customer");
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
      [accountType]: accountType === "business"
        ? {
            branch_name: formData.branch_name,
            hot_line: formData.hot_line,
            targeted_gender: formData.targeted_gender,
            cover_photo: formData.cover_photo,
            start_hour: formData.start_hour,
            close_hour: formData.close_hour,
            opening_days: formData.opening_days
          }
        : {
            age: Number(formData.age),
            marital_status: formData.marital_status,
            price_range: formData.price_range,
            gender: formData.gender
          }
    };

    try {
      await axios.post("http://localhost:9000/api/v1/auth/signup", userPayload, {
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
        <h2>Sign Up</h2>
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
          <Input name="username" placeholder="Username" onChange={handleChange} />
          <Input name="email" type="email" placeholder="Email" onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
          <Input name="phone_number" placeholder="Phone Number" onChange={handleChange} />
          <Input name="address" placeholder="Address" onChange={handleChange} />

          {accountType === "business" ? (
            <>
              <Input name="branch_name" placeholder="Branch Name" onChange={handleChange} required />
              <Input name="hot_line" placeholder="Hot Line" onChange={handleChange} />
              <Input name="targeted_gender" placeholder="Targeted Gender" onChange={handleChange} />
              <Input name="cover_photo" placeholder="Cover Photo URL" onChange={handleChange} />
              <Input name="start_hour" type="time" placeholder="Start Hour" onChange={handleChange} />
              <Input name="close_hour" type="time" placeholder="Close Hour" onChange={handleChange} />
              <Input name="opening_days" placeholder="Opening Days" onChange={handleChange} />
            </>
          ) : (
            <>
              <Input name="age" type="number" placeholder="Age" onChange={handleChange} />
              <Input name="marital_status" placeholder="Marital Status" onChange={handleChange} />
              <Input name="price_range" placeholder="Price Range" onChange={handleChange} />
              <Input name="gender" placeholder="Gender" onChange={handleChange} />
            </>
          )}

          <Button type="submit">Sign Up</Button>
        </Form>
      </FormWrapper>
    </Layout>
  );
}