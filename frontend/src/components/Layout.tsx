import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import defaultAvatar from "../assets/default-avatar.png";
import useStore from "../store";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const Nav = styled.nav`
  background: white;
  height: 72px;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TitleLink = styled(Link)`
  text-decoration: none;
  font-weight: bold;
  font-size: 1.4rem;
  color: black;
`;

const NavButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const NavLinkButton = styled(Link)`
  background: #ffffff;
  color: #333;
  padding: 0.5rem 1.2rem;
  border-radius: 9999px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  border: 1px solid #ddd;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: all 0.25s ease;

  &:hover {
    background: #f2f6f9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const PrimaryNavButton = styled(NavLinkButton)`
  background: #10b981;
  color: white;
  border: none;

  &:hover {
    background: #0f9d76;
    box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
  }
`;

const Avatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  background-color: rgb(233, 8, 173);
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #c0392b;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(192, 57, 43, 0.4);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.5);
  }
`;

const Main = styled.main`
  padding: 2rem 4rem;
  flex-grow: 1;
`;

const Footer = styled.footer`
  background-color: #f9f9f9;
  color: #333;
  padding: 1.5rem 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  font-size: 0.85rem;
  border-top: 1px solid #e0e0e0;
  margin-top: 2rem;

  a {
    color: #333;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FooterTitle = styled.h4`
  margin-bottom: 1rem;
  color: #fff;
`;

const FooterBottom = styled.div`
  margin-top: 2rem;
  text-align: center;
  width: 100%;
  font-size: 0.8rem;
  color: #aaa;
  border-top: 1px solid #333;
  padding-top: 1rem;
`;

interface User {
  username: string;
  profile_photo?: string;
}

export default function Layout({ children }: { children: ReactNode }) {
  const {user, setUser} = useStore()
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  return (
    <Wrapper>
      <Nav>
        <TitleLink to="/">VISTA LEB</TitleLink>
        {user ? (
          <UserSection>
            <Avatar src={user.profile_photo || defaultAvatar} alt="avatar" />
            <span>{user.username}</span>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserSection>
        ) : (
          <NavButtons>
            <NavLinkButton to="/about-us">About</NavLinkButton>
            <NavLinkButton to="/login">Login</NavLinkButton>
            <PrimaryNavButton to="/signup">Signup</PrimaryNavButton>
          </NavButtons>
        )}
      </Nav>

      <Main>{children}</Main>

      <Footer>
        <div>
          <strong>VISTA LEB</strong><br />
          Empowering local visibility and connection.
        </div>
        <div>
          <strong>Contact</strong><br />
          Email: support@vistaleb.com<br />
          Phone: +961 1 234 567
        </div>
        <div>
          <strong>Links</strong><br />
          <a href="/about-us">About Us</a><br />
          <a href="/privacy">Privacy Policy</a><br />
          <a href="/terms">Terms of Service</a>
        </div>
      </Footer>
    </Wrapper>
  );
}
