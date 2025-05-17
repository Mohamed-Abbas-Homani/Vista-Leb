import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import defaultAvatar from "../assets/default-avatar.png";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const Nav = styled.nav`
  background: white;
  height: 64px;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const Main = styled.main`
  padding: 0rem;
`;

const Avatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.1rem;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
const LogoutButton = styled.button`
  background-color:rgb(233, 8, 173);  /* nice red */
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: #c0392b;  /* darker red on hover */
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.5);
  }
`;


interface User {
  username: string;
  profile_photo?: string;
}

export default function Layout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <Wrapper>
      <Nav>
        <Link to="/">VISTA LEB</Link>
        {user ? (
          <UserSection>
            <Avatar src={user.profile_photo || defaultAvatar} alt="avatar" />
            <span>{user.username}</span>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </UserSection>
        ) : (
          <div>
            <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
            <Link to="/signup" style={{ marginRight: "1rem" }}>Signup</Link>
            <Link to="/about-us">About Us</Link>
          </div>
        )}
      </Nav>
      <Main>{children}</Main>
    </Wrapper>
  );
}
