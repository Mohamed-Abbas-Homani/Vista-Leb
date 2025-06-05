import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ImageCarousel from "../components/ImageCarousel";
import { useNavigate } from "react-router-dom";


// Type definitions
interface Business {
  id: string;
  email: string;
  branch_name: string;
  phone_number: string;
  hot_line: string;
  address: string;
  targeted_gender: "male" | "female" | "all";
  cover_photo: string;
  profile_photo: string;
  start_hour: string;
  close_hour: string;
  opening_days: string;
  categories: string[];
}

interface StyledProps {
  src?: string;
  gender?: "male" | "female" | "all";
}

// Styled components
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

const BusinessSection = styled.section`
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const BusinessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const BusinessCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CoverImage = styled.div<StyledProps>`
  width: 100%;
  height: 180px;
  background-image: url(${({ src }) => src || "/default-cover.jpg"});
  background-size: cover;
  background-position: center;
  position: relative;
  background-color: #f0f0f0;
`;

const ProfileImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid white;
  position: absolute;
  bottom: -30px;
  left: 20px;
  object-fit: cover;
  background: white;
`;

const CardContent = styled.div`
  padding: 40px 20px 20px;
`;

const BusinessName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const BusinessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1rem;
`;

const InfoItem = styled.span`
  font-size: 0.85rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GenderBadge = styled.span<StyledProps>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  ${({ gender }) => {
    switch (gender) {
      case "male":
        return "background: #e3f2fd; color: #1976d2;";
      case "female":
        return "background: #fce4ec; color: #c2185b;";
      default:
        return "background: #f3e5f5; color: #7b1fa2;";
    }
  }}
`;

const HoursInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.8rem;
  color: #666;
`;

// Constants
const API_BASE_URL = "http://localhost:8000";



// Main component
const Home: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const naivigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async (): Promise<Business[]> => {
      try {
        // Replace with actual API call
        const response = await fetch(`http://127.0.0.1:8000/api/v1/businesses/`);
        if (!response.ok) throw new Error('Failed to fetch businesses');
        return await response.json();
        
        // Simulate API delay
        
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const data = await fetchBusinesses();
        setBusinesses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const handleBusinessClick = (business: Business): void => {
    // Navigate to business detail page
    // router.push(`/business/${business.id}`);
    naivigate(`/business/${business.id}`);
    console.log("Clicked:", business.branch_name);
  };

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return "/default-profile.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    event.currentTarget.src = "/default-profile.jpg";
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <Title>Loading...</Title>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <Title>Error: {error}</Title>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Title>Welcome to the Home Page</Title>
        <ImageCarousel />

        <BusinessSection>
          <SectionTitle>Featured Businesses</SectionTitle>
          <BusinessGrid>
            {businesses.map((business: Business) => (
              <BusinessCard
                key={business.id}
                onClick={() => handleBusinessClick(business)}
              >
                <CoverImage src={getImageUrl(business.cover_photo)}>
                  <ProfileImage
                    src={getImageUrl(business.profile_photo)}
                    alt={`${business.branch_name} profile`}
                    onError={handleImageError}
                  />
                </CoverImage>

                <CardContent>
                  <BusinessName>{business.branch_name}</BusinessName>

                  <BusinessInfo>
                    <InfoItem>📍 {business.address}</InfoItem>
                    <InfoItem>📞 {business.hot_line}</InfoItem>
                    <InfoItem>
                      <GenderBadge gender={business.targeted_gender}>
                        {business.targeted_gender}
                      </GenderBadge>
                    </InfoItem>
                  </BusinessInfo>

                  <HoursInfo>
                    <span>{business.opening_days}</span>
                    <span>
                      {business.start_hour} - {business.close_hour}
                    </span>
                  </HoursInfo>
                </CardContent>
              </BusinessCard>
            ))}
          </BusinessGrid>
        </BusinessSection>
      </Container>
    </Layout>
  );
};

export default Home;