// components/BusinessDetail.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import Layout from "../components/Layout";
import useStore from "../store";

// TypeScript interfaces
interface Business {
  id: string | number;
  branch_name: string;
  address: string;
  targeted_gender: 'male' | 'female' | 'all';
  opening_days: string;
  start_hour: string;
  close_hour: string;
  email: string;
  phone_number: string;
  hot_line: string;
  cover_photo?: string;
  profile_photo?: string;
}

interface Offer {
  id: string;
  business_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  photo?: string;
  qr_code_path?: string;
}


interface GenderBadgeProps {
  gender: string;
}

interface CoverImageProps {
  src?: string;
}

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
  }
`;

const BusinessHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

const ImageSection = styled.div`
  flex: 1;
  max-width: 500px;
`;

const CoverImage = styled.div<CoverImageProps>`
  width: 100%;
  height: 300px;
  background-image: url(${props => props.src ? `${'http://localhost:3001'}${props.src}` : '/default-cover.jpg'});
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  background-color: #f0f0f0;
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  position: absolute;
  bottom: -40px;
  left: 20px;
  object-fit: cover;
  background: white;
`;

const InfoSection = styled.div`
  flex: 1;
  padding-top: 2rem;

  @media (min-width: 768px) {
    padding-top: 0;
    padding-left: 2rem;
  }
`;

const BusinessName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
`;

const GenderBadge = styled.span<GenderBadgeProps>`
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: capitalize;
  ${props => {
    switch(props.gender) {
      case 'male':
        return 'background: #e3f2fd; color: #1976d2;';
      case 'female':
        return 'background: #fce4ec; color: #c2185b;';
      default:
        return 'background: #f3e5f5; color: #7b1fa2;';
    }
  }}
`;

const ContactSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
`;

const ContactTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const ContactInfo = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  font-size: 0.95rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
  margin: 2rem 0;
`;

const OffersSection = styled.div`
  margin-top: 3rem;
`;

const OfferCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 2rem;
  }
`;

const OfferImage = styled.img`
  width: 100%;
  max-width: 200px;
  border-radius: 8px;
  object-fit: cover;
`;

const OfferDetails = styled.div`
  flex: 1;
`;

const OfferTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const OfferDescription = styled.p`
  color: #555;
  margin-bottom: 0.5rem;
`;

const OfferDates = styled.div`
  font-size: 0.9rem;
  color: #888;
`;


const BusinessDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState<boolean>(true);
  const { user, setUser, token } = useStore();
  


  useEffect(() => {
  if (id) {
    fetchBusinessDetails(id);
    fetchBusinessOffers(id);
  }
}, [id]);

    const fetchBusinessOffers = async (businessId: string) => {
    try {

        setOffersLoading(true);
        const res = await fetch(`http://127.0.0.1:8000/api/v1/offers/business/${businessId}`,{
        method: "GET", // or "POST" depending on your API
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
        });
        if (!res.ok) throw new Error('Failed to fetch offers');
        const data: Offer[] = await res.json();
        setOffers(data);
    } catch (err) {
        console.error("Error fetching offers:", err);
    } finally {
        setOffersLoading(false);
    }
    };


  const fetchBusinessDetails = async (businessId: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/v1/businesses/${businessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch business details');
      }
      const data: Business = await response.json();
      setBusiness(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath?: string): string => {
    if (!imagePath) return '/default-profile.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${'http://localhost:8000'}${imagePath}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    target.src = '/default-profile.jpg';
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <LoadingSpinner>Loading business details...</LoadingSpinner>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container>
          <ErrorMessage>
            Error loading business details: {error}
          </ErrorMessage>
        </Container>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <Container>
          <ErrorMessage>
            Business not found
          </ErrorMessage>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <BackButton onClick={() => navigate(-1)}>
          ← Back to Home
        </BackButton>

        <BusinessHeader>
          <ImageSection>
            <CoverImage src={business.cover_photo}>
              <ProfileImage 
                src={getImageUrl(business.profile_photo)}
                alt={business.branch_name}
                onError={handleImageError}
              />
            </CoverImage>
          </ImageSection>

          <InfoSection>
            <BusinessName>{business.branch_name}</BusinessName>
            
            <InfoGrid>
              <InfoCard>
                <InfoTitle>📍 Location</InfoTitle>
                <InfoValue>{business.address}</InfoValue>
              </InfoCard>

              <InfoCard>
                <InfoTitle>👥 Target Audience</InfoTitle>
                <InfoValue>
                  <GenderBadge gender={business.targeted_gender}>
                    {business.targeted_gender}
                  </GenderBadge>
                </InfoValue>
              </InfoCard>

              <InfoCard>
                <InfoTitle>🕒 Operating Hours</InfoTitle>
                <InfoValue>
                  {business.opening_days}<br/>
                  {business.start_hour} - {business.close_hour}
                </InfoValue>
              </InfoCard>
            </InfoGrid>
          </InfoSection>
        </BusinessHeader>

        <OffersSection>
        <h2>Available Offers</h2>
        {offersLoading ? (
            <LoadingSpinner>Loading offers...</LoadingSpinner>
        ) : offers.length === 0 ? (
            <p>No current offers for this business.</p>
        ) : (
            offers.map(offer => (
            <OfferCard key={offer.id}>
                {offer.photo && (
                <OfferImage
                    src={
                    offer.photo.startsWith("http")
                        ? offer.photo
                        : `http://localhost:8000${offer.photo}`
                    }
                    alt={offer.name}
                    onError={(e) =>
                    ((e.target as HTMLImageElement).src = '/default-offer.jpg')
                    }
                />
                )}
                <OfferDetails>
                <OfferTitle>{offer.name}</OfferTitle>
                <OfferDescription>{offer.description}</OfferDescription>
                <OfferDates>
                    From: {new Date(offer.start_date).toLocaleDateString()} <br />
                    To: {new Date(offer.end_date).toLocaleDateString()}
                </OfferDates>
                </OfferDetails>
            </OfferCard>
            ))
        )}
        </OffersSection>


        <ContactSection>
          <ContactTitle>Contact Information</ContactTitle>
          <ContactInfo>
            <ContactItem>
              📧 <strong>Email:</strong> {business.email}
            </ContactItem>
            <ContactItem>
              📞 <strong>Phone:</strong> {business.phone_number}
            </ContactItem>
            <ContactItem>
              🔥 <strong>Hotline:</strong> {business.hot_line}
            </ContactItem>
            <ContactItem>
              🏢 <strong>Address:</strong> {business.address}
            </ContactItem>
          </ContactInfo>
        </ContactSection>
      </Container>
    </Layout>
  );
};

export default BusinessDetail;