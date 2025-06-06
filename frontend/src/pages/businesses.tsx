// components/BusinessDetail.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import Layout from "../components/Layout";
import useStore from "../store";
import Lightbox from "../components/LightBox";

// TypeScript interfaces
interface Business {
  id: string | number;
  branch_name: string;
  address: string;
  targeted_gender: "male" | "female" | "all";
  opening_days: string;
  start_hour: string;
  close_hour: string;
  email: string;
  phone_number: string;
  hot_line: string;
  cover_photo?: string;
  profile_photo?: string;
  photos?: string;
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

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
  padding-right: 1rem;
`;

const CloseButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
`;

const QRCodeImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const QRCodePlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const OfferDescription = styled.p`
  color: #555;
  line-height: 1.6;
  margin-bottom: 1rem;
  text-align: center;
`;

const OfferDates = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const DateItem = styled.div`
  margin: 0.25rem 0;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }

  &.secondary {
    background: #6b7280;
    
    &:hover {
      background: #4b5563;
    }
  }

  &.success {
    background: #059669;
    
    &:hover {
      background: #047857;
    }
  }
`;

// Existing styled components (keeping all the original ones)
const GallerySection = styled.section`
  margin: 3rem 0;
`;

const GalleryTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
  position: relative;
  padding-bottom: 0.5rem;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: #4f46e5;
    border-radius: 3px;
  }
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.2rem;
  margin-top: 1rem;
`;

const GalleryItem = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  aspect-ratio: 1 / 1;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);

    &::after {
      opacity: 1;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${GalleryItem}:hover & {
    transform: scale(1.05);
  }
`;

const EmptyGallery = styled.div`
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 12px;
  color: #6c757d;
  font-size: 1.1rem;
`;

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
  background-image: url(${(props) => props.src});
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
  ${(props) => {
    switch (props.gender) {
      case "male":
        return "background: #e3f2fd; color: #1976d2;";
      case "female":
        return "background: #fce4ec; color: #c2185b;";
      default:
        return "background: #f3e5f5; color: #7b1fa2;";
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
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

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
  color: #333;
`;

const OfferDescriptionCard = styled.p`
  color: #555;
  margin-bottom: 0.5rem;
  line-height: 1.6;
`;

const OfferDatesCard = styled.div`
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
  const { token } = useStore();

  // Lightbox states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setLightboxOpen(true);
  };

  const openOfferModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOffer(null);
    setCopySuccess(false);
  };

  const copyOfferLink = async () => {
    if (!selectedOffer) return;
    
    const offerLink = `${window.location.origin}/offer/${selectedOffer.id}`;
    
    try {
      await navigator.clipboard.writeText(offerLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = offerLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBusinessDetails(id);
      fetchBusinessOffers(id);
    }
  }, [id]);

  const fetchBusinessOffers = async (businessId: string) => {
    try {
      setOffersLoading(true);
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/offers/business/${businessId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch offers");
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
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/businesses/${businessId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch business details");
      }
      const data: Business = await response.json();
      setBusiness(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath?: string): string => {
    console.log(imagePath);
    if (!imagePath) return "/default-profile.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${"http://localhost:8000"}${imagePath}`;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ): void => {
    const target = e.target as HTMLImageElement;
    target.src = "/default-profile.jpg";
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
          <ErrorMessage>Error loading business details: {error}</ErrorMessage>
        </Container>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <Container>
          <ErrorMessage>Business not found</ErrorMessage>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <BackButton onClick={() => navigate(-1)}>← Back to Home</BackButton>
        <BusinessHeader>
          <ImageSection>
            <CoverImage src={getImageUrl(business.cover_photo)}>
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
                  {business.opening_days}
                  <br />
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
            offers.map((offer) => (
              <OfferCard key={offer.id} onClick={() => openOfferModal(offer)}>
                {offer.photo && (
                  <OfferImage
                    src={
                      offer.photo.startsWith("http")
                        ? offer.photo
                        : `http://localhost:8000${offer.photo}`
                    }
                    alt={offer.name}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "/default-offer.jpg")
                    }
                  />
                )}
                <OfferDetails>
                  <OfferTitle>{offer.name}</OfferTitle>
                  <OfferDescriptionCard>{offer.description}</OfferDescriptionCard>
                  <OfferDatesCard>
                    From: {new Date(offer.start_date).toLocaleDateString()}{" "}
                    <br />
                    To: {new Date(offer.end_date).toLocaleDateString()}
                  </OfferDatesCard>
                </OfferDetails>
              </OfferCard>
            ))
          )}
        </OffersSection>

        <GallerySection>
          <GalleryTitle>Photo Gallery</GalleryTitle>
          {business.photos ? (
            <GalleryGrid>
              {business.photos.split(",").map(
                (photoUrl, index) =>
                  photoUrl.trim() && (
                    <GalleryItem
                      key={index}
                      onClick={() => openLightbox(index)}
                    >
                      <GalleryImage
                        src={`http://localhost:8000${photoUrl.trim()}`}
                        alt={`Business photo ${index + 1}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-gallery.jpg";
                        }}
                      />
                    </GalleryItem>
                  )
              )}
            </GalleryGrid>
          ) : (
            <EmptyGallery>No photos available for this business</EmptyGallery>
          )}
        </GallerySection>

        {lightboxOpen && business.photos && (
          <Lightbox
            photos={business.photos.split(",").filter((url) => url.trim())}
            initialIndex={selectedImage}
            onClose={() => setLightboxOpen(false)}
          />
        )}

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

      {/* Offer Modal */}
      {modalOpen && selectedOffer && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedOffer.name}</ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>

            <OfferDescription>{selectedOffer.description}</OfferDescription>

            <OfferDates>
              <DateItem>
                <strong>🗓️ Valid From:</strong>{" "}
                {new Date(selectedOffer.start_date).toLocaleDateString()}
              </DateItem>
              <DateItem>
                <strong>📅 Valid Until:</strong>{" "}
                {new Date(selectedOffer.end_date).toLocaleDateString()}
              </DateItem>
            </OfferDates>

            <QRCodeContainer>
              {selectedOffer.qr_code_path ? (
                <QRCodeImage
                  src={
                    selectedOffer.qr_code_path.startsWith("http")
                      ? selectedOffer.qr_code_path
                      : `http://localhost:8000${selectedOffer.qr_code_path}`
                  }
                  alt={`QR Code for ${selectedOffer.name}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <QRCodePlaceholder>
                  📱
                  <br />
                  QR Code not available
                </QRCodePlaceholder>
              )}
            </QRCodeContainer>

            <ActionButtons>
              <ActionButton
                onClick={copyOfferLink}
                className={copySuccess ? "success" : ""}
              >
                {copySuccess ? "✓ Copied!" : "🔗 Copy Link"}
              </ActionButton>
              <ActionButton onClick={closeModal} className="secondary">
                Close
              </ActionButton>
            </ActionButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
};

export default BusinessDetail;