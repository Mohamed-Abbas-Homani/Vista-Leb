import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  min-height: 100vh;
`;

const Nav = styled.nav`
  background: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const Main = styled.main`
  padding: 2rem;
`;

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Wrapper>
      <Nav>
        <Link to="/">MyApp</Link>
        <div>
          <Link to="/login" style={{ marginRight: "1rem" }}>Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      </Nav>
      <Main>{children}</Main>
    </Wrapper>
  );
}
