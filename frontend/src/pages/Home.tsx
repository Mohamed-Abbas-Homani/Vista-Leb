import React, { useEffect, useState } from "react";
import styled from "styled-components";
// import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ImageCarousel from "../components/ImageCarousel";
import { useNavigate } from "react-router-dom";
import useStore from "../store";


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
  photos?:string;
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

// Search Components
const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto 3rem;
  position: relative;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3.5rem;
  font-size: 1.1rem;
  border: 2px solid #e5e7eb;
  border-radius: 50px;
  background: white;
  color: #374151;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 8px 25px rgba(79, 70, 229, 0.15);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: #9ca3af;
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 0.875rem 0.875rem 3rem;
    font-size: 1rem;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  transition: color 0.3s ease;
  
  ${SearchInputWrapper}:focus-within & {
    color: #4f46e5;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    left: 1rem;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #374151;
    background: #f3f4f6;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SearchResults = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.95rem;
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

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const NoResultsText = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
`;

const NoResultsSubtext = styled.p`
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

// Modal Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${({ isOpen }) => (isOpen ? "fadeIn 0.3s ease" : "none")};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
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

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
`;

const ModalMessage = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 2rem;
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ModalButton = styled.button`
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LoginButton = styled(ModalButton)`
  background: #4f46e5;
  color: white;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);

  &:hover {
    background: #3c38b4;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(79, 70, 229, 0.4);
  }
`;

const SignupButton = styled(ModalButton)`
  background: #10b981;
  color: white;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);

  &:hover {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4);
  }
`;

const HeroSection = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 32px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideDown 0.8s ease-out;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="%23cbd5e1" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
    pointer-events: none;
    animation: float 8s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`;

const MainTitle = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.8rem;
  letter-spacing: -0.01em;
  animation: fadeInScale 1s ease-out 0.2s both;
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  animation: fadeInUp 1s ease-out 0.4s both;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
  animation: fadeInStagger 1s ease-out 0.6s both;
  
  @keyframes fadeInStagger {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatItem = styled.div`
  text-align: center;
  color: #475569;
  padding: 0.5rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 0.8);
  }
`;

const StatNumber = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #3b82f6;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
`;

// Alternative option - Modern animated header
const AnimatedHeader = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: linear-gradient(45deg, #f0f9ff, #e0f2fe);
  position: relative;
`;

const AnimatedTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
  margin-bottom: 1rem;
  
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const AnimatedSubtitle = styled.p`
  font-size: 1.2rem;
  color: #64748b;
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease 0.5s both;
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FloatingIcons = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  
  &::before,
  &::after {
    content: '✨';
    position: absolute;
    font-size: 2rem;
    animation: float 6s ease-in-out infinite;
  }
  
  &::before {
    top: 20%;
    left: 15%;
    animation-delay: 0s;
  }
  
  &::after {
    top: 60%;
    right: 20%;
    animation-delay: 3s;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
`;

// Constants
const API_BASE_URL = "http://localhost:8000";

// Main component
const Home: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const {token} = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBusinesses(businesses);
    } else {
      const filtered = businesses.filter(business =>
        business.branch_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBusinesses(filtered);
    }
  }, [searchTerm, businesses]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleBusinessClick = (business: Business): void => {
    if (token) {
      navigate(`/business/${business.id}`);
      console.log("Clicked:", business.branch_name);
    } else {
      setSelectedBusiness(business);
      setShowAuthModal(true);
    }
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate("/login", {
      state: { redirect: `/business/${selectedBusiness?.id}` }
    });
  };

  const handleSignupRedirect = () => {
    setShowAuthModal(false);
    navigate("/signup", {
      state: { redirect: `/business/${selectedBusiness?.id}` }
    });
  };

  useEffect(() => {
    const fetchBusinesses = async (): Promise<Business[]> => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/v1/businesses/`);
        if (!response.ok) throw new Error('Failed to fetch businesses');
        return await response.json();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Unknown error occurred');
      }
    };

    const loadBusinesses = async () => {
      try {
        setLoading(true);
        const data = await fetchBusinesses();
        setBusinesses(data);
        setFilteredBusinesses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load businesses');
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

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
        <HeroSection>
          <HeroContent>
            <MainTitle>Discover Amazing Businesses</MainTitle>
            <Subtitle>
              Connect with top-rated local businesses and services in your area. 
              From beauty salons to restaurants, find exactly what you're looking for.
            </Subtitle>
            <StatsContainer>
              <StatItem>
                <StatNumber>{businesses.length}+</StatNumber>
                <StatLabel>Businesses</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>5★</StatNumber>
                <StatLabel>Average Rating</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>24/7</StatNumber>
                <StatLabel>Support</StatLabel>
              </StatItem>
            </StatsContainer>
          </HeroContent>
        </HeroSection>
        <ImageCarousel />

        <BusinessSection>
          {/* <SectionTitle>Featured Businesses</SectionTitle> */}
          
          {/* Search Section */}
          <SearchContainer>
            <SearchInputWrapper>
              <SearchIcon>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search businesses by name..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <ClearButton onClick={clearSearch}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </ClearButton>
              )}
            </SearchInputWrapper>
            
            {searchTerm && (
              <SearchResults>
                {filteredBusinesses.length === 1 
                  ? `Found 1 business matching "${searchTerm}"`
                  : `Found ${filteredBusinesses.length} businesses matching "${searchTerm}"`
                }
              </SearchResults>
            )}
          </SearchContainer>

          {/* Business Grid */}
          {filteredBusinesses.length > 0 ? (
            <BusinessGrid>
              {filteredBusinesses.map((business: Business) => (
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
          ) : (
            <NoResults>
              <NoResultsIcon>🔍</NoResultsIcon>
              <NoResultsText>No businesses found</NoResultsText>
              <NoResultsSubtext>
                {searchTerm 
                  ? `We couldn't find any businesses matching "${searchTerm}". Try a different search term.`
                  : "No businesses available at the moment."
                }
              </NoResultsSubtext>
            </NoResults>
          )}
        </BusinessSection>

        {/* Auth Modal */}
        {showAuthModal && (
          <ModalOverlay isOpen={showAuthModal} onClick={() => setShowAuthModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Authentication Required</ModalTitle>
              <ModalMessage>
                You need to sign up or log in to view business details.
              </ModalMessage>
              
              <ModalActions>
                <LoginButton onClick={handleLoginRedirect}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  Log In
                </LoginButton>
                <SignupButton onClick={handleSignupRedirect}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  Sign Up
                </SignupButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Layout>
  );
};

export default Home;