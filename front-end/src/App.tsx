import { Route, Routes } from 'react-router';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { LandingLayout } from './components/layout/LandingLayout';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { CreateCharacterPage } from './pages/CreateCharacterPage';
import { FightPage } from './pages/FightPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';
import { SkillsPage } from './pages/SkillsPage';
import { StyleguidePage } from './pages/StyleguidePage';

/** All routes of the app in one place. */
export function App() {
  return (
    <Routes>
      {/* Public: the landing page (logged-in players are redirected from here). */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Public: login and register share the auth layout. */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Logged in only: ProtectedRoute checks, AppLayout adds the top bar. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/characters/new" element={<CreateCharacterPage />} />
          <Route path="/characters/:characterId" element={<CharacterDetailPage />} />
          <Route path="/characters/:characterId/fight" element={<FightPage />} />
          <Route path="/characters/:characterId/skills" element={<SkillsPage />} />
        </Route>
      </Route>

      {/* Development only: token and component preview. */}
      {import.meta.env.DEV && <Route path="/styleguide" element={<StyleguidePage />} />}

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
