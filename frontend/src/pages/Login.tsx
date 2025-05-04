import styled from "styled-components";
import Layout from "../components/Layout";

const Form = styled.form`
  max-width: 400px;
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
`;

export default function Login() {
  return (
    <Layout>
      <h2>Login</h2>
      <Form>
        <Input type="email" placeholder="Email" />
        <Input type="password" placeholder="Password" />
        <Button type="submit">Login</Button>
      </Form>
    </Layout>
  );
}
