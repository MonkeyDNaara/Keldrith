import { useParams } from 'react-router';
import { PlaceholderPage } from '../components/ui/PlaceholderPage';
import { t } from '../i18n';

// TODO(#14): stats, XP, skill points, rename, delete.
export function CharacterDetailPage() {
  const { characterId } = useParams();
  return (
    <PlaceholderPage title={t.pages.characterDetail.title}>
      <p className="text-sm text-faint">characterId: {characterId}</p>
    </PlaceholderPage>
  );
}
