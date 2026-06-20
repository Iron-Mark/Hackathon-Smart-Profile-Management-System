export const DEFAULT_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';

export const SITE_TITLE = 'Smart Profile Management System | Public Demo';
export const SITE_DESCRIPTION =
  'Restored UMak CCIS hackathon demo for browser-local faculty credential uploads, admin review, sample document approvals, and profile proofing.';

export function normalizeSiteUrl(value?: string) {
  const siteUrl = value?.trim() || DEFAULT_SITE_URL;
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
export const SOCIAL_IMAGE_URL = `${SITE_URL}og-image.png`;

export type RouteSeoMeta = {
  pattern: RegExp;
  title: string;
  description: string;
  indexable: boolean;
};

export const ROUTE_SEO_META: RouteSeoMeta[] = [
  {
    pattern: /^\/?$/,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    indexable: true,
  },
  {
    pattern: /^\/auth\/login\/?$/,
    title: 'Login | Smart Profile Management System',
    description: 'Sign in to the browser-local Smart Profile Management System public demo.',
    indexable: false,
  },
  {
    pattern: /^\/auth\/register\/?$/,
    title: 'Register | Smart Profile Management System',
    description: 'Create a browser-local faculty account for the Smart Profile Management System public demo.',
    indexable: false,
  },
  {
    pattern: /^\/faculty\//,
    title: 'Faculty Workspace | Smart Profile Management System',
    description: 'Browser-local faculty dashboard, profile builder, and sample credential upload workspace.',
    indexable: false,
  },
  {
    pattern: /^\/admin\//,
    title: 'Admin Workspace | Smart Profile Management System',
    description: 'Browser-local admin review dashboard for sample credential approvals and reports.',
    indexable: false,
  },
  {
    pattern: /^\/demo-storage(?:\/|$)/,
    title: 'Demo File Preview | Smart Profile Management System',
    description: 'Browser-local demo file preview for generated sample credential uploads.',
    indexable: false,
  },
];

export function getRouteSeoMeta(pathname: string): RouteSeoMeta {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return (
    ROUTE_SEO_META.find((route) => route.pattern.test(normalizedPathname)) ?? {
      pattern: /.*/,
      title: 'Page Not Found | Smart Profile Management System',
      description: 'The requested Smart Profile Management System public demo route was not found.',
      indexable: false,
    }
  );
}

