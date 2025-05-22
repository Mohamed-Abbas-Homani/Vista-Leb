import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import useStore from "../store";
import { User } from "../types/user";
import axios from "axios";
import Layout from "../components/Layout";

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
`;

const AvatarWrapper = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
`;

const Header = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  z-index: 1000;
`;

const Avatar = styled.img`
  width: 144px;
  height: 144px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
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
  border: 1px solid #ccc;
`;

const Label = styled.label`
  font-weight: bold;
  display: block;
  margin-bottom: 0.3rem;
`;

const SaveButton = styled.button`
  background-color: #4f46e5;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
  margin-top: 2rem;

  &:hover {
    background-color: #3c38b4;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #888;
`;

const ProfilePage = () => {
  const { id } = useParams();
  const { user, setUser, token } = useStore();
  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && user.id === id) {
      setFormData(user);
    }
  }, [id, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      // alert("Profile updated!");
      toast.success("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/users/profile-picture`,
        uploadData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const photo = res.data.profile_photo;

      if (user) setUser({ ...user, profile_photo: photo });
      setFormData((prev) => prev && { ...prev, profile_photo: photo });
    } catch {
      alert("Failed to upload photo.");
    }
  };

  if (!formData) return <Loading>Loading profile...</Loading>;

  const isBusiness = !!formData.business;
  const isCustomer = !!formData.customer;

  return (
    <Layout>
      <ToastContainer />
      <Container>
        <Card>
          <Header>Profile</Header>

          <AvatarWrapper>
            <Avatar
              src={
                formData.profile_photo
                  ? `http://localhost:8000${formData.profile_photo}`
                  : "https://via.placeholder.com/100"
              }
              alt="Profile"
              onClick={handleAvatarClick}
            />
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
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
              <h3>Customer Info</h3>
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
              <h3>Business Info</h3>
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
        </Card>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
