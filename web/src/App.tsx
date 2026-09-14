import { Route, Routes } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
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
      </Routes>
    </>
  );
}
