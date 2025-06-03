import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import useStore from "../store";
import { User } from "../types/user";
import axios from "axios";
import Layout from "../components/Layout";
import ProfileOffers from "../components/ProfileOffers";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem 1rem;
  background: ${({ theme }) => theme.bodyBg};
`;

const Card = styled.div`
  position: relative;
  background: ${({ theme }) => theme.cardBg};
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 2.5rem;
  max-width: 960px;
  width: 100%;
  overflow: hidden;
`;

const CoverPhotoContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 240px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover::after {
    content: "Change Cover";
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
  }
`;

const CoverPhoto = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarWrapper = styled.div`
  text-align: center;
  margin: 6rem 0 2rem;
  position: relative;
  z-index: 10;
`;

const Header = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1.8rem;
  font-weight: bold;
  z-index: 1000;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Avatar = styled.img`
  width: 144px;
  height: 144px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textColor};
  transition: border 0.3s ease;

  &:focus {
    border-color: #4f46e5;
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: ${({ theme }) => theme.inputBg};
  color: ${({ theme }) => theme.textColor};
  transition: border 0.3s ease;
  resize: vertical;
  min-height: 100px;

  &:focus {
    border-color: #4f46e5;
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 0.3rem;
  color: ${({ theme }) => theme.textColor};
`;

const SaveButton = styled.button`
  background-color: #4f46e5;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-top: 2rem;
  display: block;
  width: 200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);

  &:hover {
    background-color: #3c38b4;
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(79, 70, 229, 0.4);
  }

  &:disabled {
    background-color: #a5b4fc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const AddOffersButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  margin-top: 1rem;
  display: block;
  width: 200px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4);
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #888;
`;

const SectionTitle = styled.h3`
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e7ff;
  color: #4f46e5;
`;

// Modal Styles
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
  background: ${({ theme }) => theme.cardBg};
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e7ff;
`;

const ModalTitle = styled.h2`
  color: #4f46e5;
  font-size: 1.5rem;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.3s ease;

  &:hover {
    color: #374151;
  }
`;

const ModalFormGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: #6b7280;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const PhotoUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ theme }) => theme.inputBg};

  &:hover {
    border-color: #4f46e5;
    background: rgba(79, 70, 229, 0.05);
  }
`;

const PhotoPreview = styled.img`
  width: 100%;
  max-width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 1rem;
`;

interface OfferFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  photo: File | null;
}
const storedData = localStorage.getItem("vista-store");

const ProfilePage = () => {
  const { id } = useParams();
  const { user, setUser, token } = useStore();
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const offerPhotoInputRef = useRef<HTMLInputElement>(null);

  const [offerFormData, setOfferFormData] = useState<OfferFormData>({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    photo: null,
  });

  useEffect(() => {
    if (user && user.id === id) {
      setFormData(user);
      // Fetch business ID if user is a business
      if (user.id) {
        console.log("Fetching business ID for user:", user.id);
        fetchBusinessId(user.id);
      }
    }
  }, []);

  const fetchBusinessId = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/businesses/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBusinessId(response.data.business_id);
    } catch (error) {
      console.error("Failed to fetch business ID:", error);
      toast.error("Failed to fetch business information.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOfferInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOfferFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOfferPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOfferFormData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      const response = await axios.put(
        `http://localhost:8000/api/v1/users/${id}?is_business=${!!formData.business}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setUser(response.data);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
  if (!offerFormData.name || !offerFormData.start_date || !offerFormData.end_date) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!businessId) {
    toast.error("Business ID not found. Please try refreshing the page.");
    return;
  }

  // Helper to convert date to naive ISO string without timezone (remove trailing 'Z')
  const formatNaiveDatetime = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:MM:SS"
  };

  setOfferLoading(true);
  try {
    let photoPath = null;

    // Step 1: Upload Photo if selected
    if (offerFormData.photo) {
      const photoFormData = new FormData();
      photoFormData.append("file", offerFormData.photo);
      photoFormData.append("photo_type", "offer");

      try {
        const photoResponse = await axios.post(
          `http://127.0.0.1:8000/api/v1/offers/upload-photo-offer`,
          photoFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        photoPath = photoResponse.data?.file_path;
      } catch (err) {
        toast.error("Failed to upload offer photo.");
        console.error("Photo upload error:", err);
        return; // Exit if photo upload fails
      }
    }

    // Step 2: Create the Offer with naive datetime strings
    const offerPayload = {
      business_id: businessId,
      name: offerFormData.name,
      description: offerFormData.description || null,
      start_date: formatNaiveDatetime(offerFormData.start_date),
      end_date: formatNaiveDatetime(offerFormData.end_date),
      photo: photoPath,
    };

    await axios.post(`http://localhost:8000/api/v1/offers/`, offerPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    toast.success("Offer created successfully!");
    setIsModalOpen(false);
    resetOfferForm();
  } catch (error) {
    toast.error("Failed to create offer.");
    console.error("Error creating offer:", error);
  } finally {
    setOfferLoading(false);
  }
};



  const resetOfferForm = () => {
    setOfferFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      photo: null,
    });
    setPhotoPreview(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const uploadPhoto = async (file: File, type: "avatar" | "cover") => {
    if (!id) return;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("photo_type", type);

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/users/upload-photo`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const photo = res.data.file_path;

      if (type === "avatar") {
        if (user) setUser({ ...user, profile_photo: photo });
        setFormData((prev) => prev && { ...prev, profile_photo: photo });
      } else {
        if (user)
          setUser({
            ...user,
            business: { ...user.business, cover_photo: photo },
          });
        setFormData(
          (prev) =>
            prev && {
              ...prev,
              business: { ...prev.business, cover_photo: photo },
            }
        );
      }

      toast.success(
        `${type === "avatar" ? "Profile" : "Cover"} photo updated!`
      );
    } catch {
      toast.error(`Failed to upload ${type} photo.`);
    }
  };

  const handlePhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadPhoto(file, type);
    e.target.value = ""; // Reset input
  };

  if (!formData) return <Loading>Loading profile...</Loading>;

  const isBusiness = !!formData.business;
  const isCustomer = !!formData.customer;

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={3000} />
      <Container>
        <Card>
          {isBusiness && (
            <CoverPhotoContainer onClick={handleCoverClick}>
              {formData.business?.cover_photo ? (
                <CoverPhoto
                  src={`http://localhost:8000${formData.business.cover_photo}`}
                  alt="Cover"
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    background:
                      "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                  }}
                />
              )}
              <HiddenInput
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, "cover")}
              />
            </CoverPhotoContainer>
          )}
          <Header style={{ color: `${isBusiness ? "white" : "black"}` }}>
            Profile
          </Header>

          <AvatarWrapper>
            <Avatar
              src={
                formData.profile_photo
                  ? `http://localhost:8000${formData.profile_photo}`
                  : "https://via.placeholder.com/150?text=Avatar"
              }
              alt="Profile"
              onClick={handleAvatarClick}
            />
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e, "avatar")}
            />
          </AvatarWrapper>

          <FormGrid>
            <div>
              <Label>Username</Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </FormGrid>

          {isCustomer && (
            <>
              <SectionTitle>Customer Info</SectionTitle>
              <FormGrid>
                <div>
                  <Label>Gender</Label>
                  <Input
                    name="gender"
                    value={formData.customer?.gender || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            customer: {
                              ...prev.customer,
                              gender: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    name="age"
                    type="number"
                    value={formData.customer?.age || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            customer: {
                              ...prev.customer,
                              age: Number(e.target.value),
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Marital Status</Label>
                  <Input
                    name="marital_status"
                    value={formData.customer?.marital_status || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            customer: {
                              ...prev.customer,
                              marital_status: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Price Range</Label>
                  <Input
                    name="price_range"
                    value={formData.customer?.price_range || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            customer: {
                              ...prev.customer,
                              price_range: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
              </FormGrid>
            </>
          )}

          {isBusiness && (
            <>
              <SectionTitle>Business Info</SectionTitle>
              <FormGrid>
                <div>
                  <Label>Branch Name</Label>
                  <Input
                    name="branch_name"
                    value={formData.business?.branch_name || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            business: {
                              ...prev.business,
                              branch_name: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Hotline</Label>
                  <Input
                    name="hot_line"
                    value={formData.business?.hot_line || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            business: {
                              ...prev.business,
                              hot_line: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Start Hour</Label>
                  <Input
                    name="start_hour"
                    type="time"
                    value={formData.business?.start_hour?.slice(0, 5) || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            business: {
                              ...prev.business,
                              start_hour: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Close Hour</Label>
                  <Input
                    name="close_hour"
                    type="time"
                    value={formData.business?.close_hour?.slice(0, 5) || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            business: {
                              ...prev.business,
                              close_hour: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Opening Days</Label>
                  <Input
                    name="opening_days"
                    value={formData.business?.opening_days || ""}
                    onChange={(e) =>
                      setFormData(
                        (prev) =>
                          prev && {
                            ...prev,
                            business: {
                              ...prev.business,
                              opening_days: e.target.value,
                            },
                          }
                      )
                    }
                  />
                </div>
              </FormGrid>
            </>
          )}

          <SaveButton onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </SaveButton>

          {isBusiness && (
            <AddOffersButton onClick={() => setIsModalOpen(true)}>
              Add Offers
            </AddOffersButton>
          )}
        </Card>
      </Container>

      {/* Add Offers Modal */}
      <ModalOverlay isOpen={isModalOpen} onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsModalOpen(false);
          resetOfferForm();
        }
      }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Add New Offer</ModalTitle>
            <CloseButton onClick={() => {
              setIsModalOpen(false);
              resetOfferForm();
            }}>
              ×
            </CloseButton>
          </ModalHeader>

          <ModalFormGrid>
            <div>
              <Label>Offer Name *</Label>
              <Input
                name="name"
                value={offerFormData.name}
                onChange={handleOfferInputChange}
                placeholder="Enter offer name"
              />
            </div>

            <FullWidthField>
              <Label>Description</Label>
              <TextArea
                name="description"
                value={offerFormData.description}
                onChange={handleOfferInputChange}
                placeholder="Describe your offer..."
              />
            </FullWidthField>

            <div>
              <Label>Start Date *</Label>
              <Input
                name="start_date"
                type="datetime-local"
                value={offerFormData.start_date}
                onChange={handleOfferInputChange}
              />
            </div>

            <div>
              <Label>End Date *</Label>
              <Input
                name="end_date"
                type="datetime-local"
                value={offerFormData.end_date}
                onChange={handleOfferInputChange}
              />
            </div>

            <FullWidthField>
              <Label>Offer Photo</Label>
              <PhotoUploadContainer onClick={() => offerPhotoInputRef.current?.click()}>
                {photoPreview ? (
                  <PhotoPreview src={photoPreview} alt="Offer preview" />
                ) : (
                  <div>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📷</div>
                    <p>Click to upload offer photo</p>
                    <small style={{ color: "#6b7280" }}>PNG, JPG up to 10MB</small>
                  </div>
                )}
              </PhotoUploadContainer>
              <HiddenInput
                ref={offerPhotoInputRef}
                type="file"
                accept="image/*"
                onChange={handleOfferPhotoChange}
              />
            </FullWidthField>
          </ModalFormGrid>

          <ButtonGroup>
            <CancelButton onClick={() => {
              setIsModalOpen(false);
              resetOfferForm();
            }}>
              Cancel
            </CancelButton>
            <SubmitButton onClick={handleCreateOffer} disabled={offerLoading}>
              {offerLoading ? "Creating..." : "Create Offer"}
            </SubmitButton>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
      {businessId && (
        <ProfileOffers businessId={businessId} token={token} condition={offerFormData} />
      )}
    </Layout>
  );
};

export default ProfilePage;