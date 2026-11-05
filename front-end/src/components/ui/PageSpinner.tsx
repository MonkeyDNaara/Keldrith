import { t } from '../../i18n';

/** Centered spinner while a page waits for its data. */
export function PageSpinner() {
  return (
    <div className="grid flex-1 place-items-center">
      <span
        role="status"
        className="loading loading-lg loading-spinner text-primary"
        aria-label={t.common.loading}
      />
    </div>
  );
}
