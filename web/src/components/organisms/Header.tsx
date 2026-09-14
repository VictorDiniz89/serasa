import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.space.md};
  padding: ${({ theme }) => theme.space.md};
  background: ${({ theme }) => theme.color.surface};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`;

const Link = styled(NavLink)`
  color: ${({ theme }) => theme.color.text};
  text-decoration: none;

  &.active {
    color: ${({ theme }) => theme.color.accent};
  }
`;

export function Header() {
  return (
    <Nav>
      <Link to="/" end>
        Dashboard
      </Link>
      <Link to="/producers">Produtores</Link>
    </Nav>
  );
}
