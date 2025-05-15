import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;




const Nav = styled.nav`
  background: white;
  height: 64px; // 🔥 fixed height
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;


const Main = styled.main`
  padding: 0rem;
`;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <Nav>
        <Link to="/">VISTA LEB</Link>
        <div>
          <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
          <Link to="/signup">Signup</Link>
          <Link to="/about-us">About Us</Link>
        </div>
      </Nav>
      <Main>{children}</Main>
    </Wrapper>
  );
}
