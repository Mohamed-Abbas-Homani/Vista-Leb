import styled from "styled-components";
import Layout from "../components/Layout";
import ImageCarousel from "../components/ImageCarousel";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2rem;
  gap: 2rem;
`;




const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
`;

export default function Home() {
  return (
    <Layout>
      <Container>
        <Title>Welcome to the Home Page</Title>
        <ImageCarousel />
      </Container>
    </Layout>
  );
}
