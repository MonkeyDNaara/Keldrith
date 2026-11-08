import { useAuth } from '../auth/authContext';
import { FeatureSection } from '../components/landing/FeatureSection';
import { HeroSection } from '../components/landing/HeroSection';
import { PageSpinner } from '../components/ui/PageSpinner';
import { HomeRedirect } from './HomeRedirect';

/**
 * "/" for everyone: visitors see the landing page, logged-in players are sent on
 * to their hero (or to the character wizard) exactly as before.
 */
export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  // Only a saved token needs checking, so visitors without one never see this spinner.
  if (isLoading) {
    return <PageSpinner />;
  }

  if (isAuthenticated) {
    return <HomeRedirect />;
  }

  return (
    <>
      <HeroSection />
      <FeatureSection />
    </>
  );
}
