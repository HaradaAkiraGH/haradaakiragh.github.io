// Роутинг: AuthProvider вокруг всего, Guard смотрит на контекст, ленивые страницы
import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

const Layout = lazy(() => import('./components/layout/Layout').then((m) => ({ default: m.Layout })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const BuildPage = lazy(() => import('./pages/BuildPage').then((m) => ({ default: m.BuildPage })));
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const CharactersPage = lazy(() => import('./pages/CharactersPage').then((m) => ({ default: m.CharactersPage })));
const CharacterPage = lazy(() => import('./pages/CharacterPage').then((m) => ({ default: m.CharacterPage })));
const TrainerPage = lazy(() => import('./pages/TrainerPage').then((m) => ({ default: m.TrainerPage })));
const PullsPage = lazy(() => import('./pages/PullsPage').then((m) => ({ default: m.PullsPage })));
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })));
const MetaPage = lazy(() => import('./pages/MetaPage').then((m) => ({ default: m.MetaPage })));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage').then((m) => ({ default: m.CalculatorPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NewsPage = lazy(() => import('./pages/NewsPage').then((m) => ({ default: m.NewsPage })));
const GuidesPage = lazy(() => import('./pages/GuidesPage').then((m) => ({ default: m.GuidesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-bg">
    <div className="w-10 h-10 rounded-full border-2 border-glass-border border-t-accent animate-spin" aria-label="Загрузка" />
  </div>
);

const Guard = () => {
  const { user, ready } = useAuth();
  if (!ready) return <PageLoader />;
  return user ? <Layout /> : <Navigate to="/login" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/build/:code" element={<BuildPage />} />
            <Route path="/" element={<Guard />}>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<HomePage />} />
              <Route path="characters" element={<CharactersPage />} />
              <Route path="characters/:id" element={<CharacterPage />} />
              <Route path="trainer/:teamId" element={<TrainerPage />} />
              <Route path="pulls" element={<PullsPage />} />
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}