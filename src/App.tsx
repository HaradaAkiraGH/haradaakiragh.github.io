// Роутинг: публичные /login и /build, остальное под защитой
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { BuildPage } from './pages/BuildPage';
import { HomePage } from './pages/HomePage';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterPage } from './pages/CharacterPage';
import { TrainerPage } from './pages/TrainerPage';
import { MapPage } from './pages/MapPage';
import { MetaPage } from './pages/MetaPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NewsPage } from './pages/NewsPage';
import { GuidesPage } from './pages/GuidesPage';
import { NotFoundPage } from './pages/NotFoundPage';

const isAuthed = () => !!localStorage.getItem('ww_auth');

const Guard = () => (isAuthed() ? <Layout /> : <Navigate to="/login" replace />);

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/build/:code" element={<BuildPage />} />
        <Route path="/" element={<Guard />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="characters" element={<CharactersPage />} />
          <Route path="characters/:id" element={<CharacterPage />} />
          <Route path="trainer/:teamId" element={<TrainerPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="meta" element={<MetaPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="guides" element={<GuidesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}