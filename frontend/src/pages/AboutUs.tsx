import styled from "styled-components";
import Layout from "../components/Layout";

const AboutWrapper = styled.div`
  max-width: 700px;
  margin: 3rem auto;
  padding: 2rem 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    margin: 1.5rem 1rem;
    padding: 1.5rem 1.5rem;
    max-width: 100%;
    border-radius: 12px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }
`;

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.65;
  color: #444;
  margin-bottom: 1.25rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const AboutUs = () => {
  return (
    <Layout>
      <AboutWrapper>
        <Title>About Us</Title>
        <Paragraph>
          Welcome to our platform! We are dedicated to providing the best services
          to our customers and businesses. Our mission is to connect users with
          quality services and foster strong business relationships.
        </Paragraph>
        <Paragraph>
          Founded in 2025, we strive to innovate and adapt to the latest
          technologies to offer seamless user experiences. Our team is passionate
          about creating solutions that empower communities and help businesses grow.
        </Paragraph>
        <Paragraph>
          Whether you are a customer looking for trusted businesses or a business
          seeking to expand your reach, we are here to support you every step of
          the way.
        </Paragraph>
        <Paragraph>
          Thank you for choosing us. We look forward to serving you!
        </Paragraph>
      </AboutWrapper>
    </Layout>
  );
};

export default AboutUs;
