import { t } from '../../i18n';

/** Credits line at the bottom of every layout. */
export function Footer() {
  return (
    <footer className="border-t border-line px-4 py-4 text-center text-sm">
      <p className="text-muted">{t.footer.madeBy}</p>
      <p className="text-faint">{t.footer.project}</p>
    </footer>
  );
}
