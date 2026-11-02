import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  /** Accessible name. Without it the icon is decorative and hidden from screen readers. */
  title?: string;
};

/**
 * Base for all icons: 24×24 line icons that take their color from the text color
 * (stroke="currentColor") and their size from a class (default size-5 = 1.25rem).
 */
export function Icon({ title, className = 'size-5', children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}
