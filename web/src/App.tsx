import { Link, Route, Routes } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Header } from './components/organisms/Header';
import { DashboardPage } from './pages/DashboardPage';
import { FarmDetailPage } from './pages/FarmDetailPage';
import { ProducerDetailPage } from './pages/ProducerDetailPage';
import { ProducersPage } from './pages/ProducersPage';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    background: ${({ theme }) => theme.color.bg};
    color: ${({ theme }) => theme.color.text};
  }
`;

const Page = styled.main`
  padding: ${({ theme }) => theme.space.lg};
`;

const Status = styled.p`
  color: ${({ theme }) => theme.color.muted};
  margin: 0;
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.color.accent};
`;

function NotFound() {
  return (
    <Page>
      <Status>Não encontrado</Status>
      <BackLink to="/producers">Produtores</BackLink>
    </Page>
  );
}

export function App() {
  return (
    <>
      <GlobalStyle />
      <Header />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/producers" element={<ProducersPage />} />
        <Route path="/producers/:id" element={<ProducerDetailPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
