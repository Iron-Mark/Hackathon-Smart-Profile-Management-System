export const DEFAULT_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';

export const SITE_TITLE = 'Smart Profile Management System | Public Demo';
export const SITE_DESCRIPTION =
  'Restored UMak CCIS hackathon demo for browser-local faculty credential uploads, admin review, and sample document approvals.';

export function normalizeSiteUrl(value?: string) {
  const siteUrl = value?.trim() || DEFAULT_SITE_URL;
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
export const SOCIAL_IMAGE_URL = `${SITE_URL}og-image.png`;

