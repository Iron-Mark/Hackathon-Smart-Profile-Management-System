const DEFAULT_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';

const SITE_TITLE = 'Smart Profile Management System | Public Demo';
const SITE_DESCRIPTION =
  'Restored 7th CCIS Hackathon demo for browser-local faculty credential uploads, admin review, sample document approvals, and profile proofing.';
const DEFAULT_OG_IMAGE = 'og-image.png';
const DEFAULT_OG_ALT =
  'CCIS Smart Faculty Profile Management System public demo with the college seal and landing page';

function normalizeSiteUrl(value?: string) {
  const siteUrl = value?.trim() || DEFAULT_SITE_URL;
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL);
export const SOCIAL_IMAGE_URL = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

export type RouteSeoMeta = {
  pattern: RegExp;
  title: string;
  description: string;
  indexable: boolean;
  image: string;
  imageAlt: string;
};

const ROUTE_SEO_META: RouteSeoMeta[] = [
  {
    pattern: /^\/?$/,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    indexable: true,
    image: DEFAULT_OG_IMAGE,
    imageAlt: DEFAULT_OG_ALT,
  },
  {
    pattern: /^\/auth\/login\/?$/,
    title: 'Login | Smart Profile Management System',
    description: 'Sign in to the browser-local Smart Profile Management System public demo.',
    indexable: false,
    image: 'og/login.png',
    imageAlt: 'Seeded faculty and admin demo login for the CCIS public showcase',
  },
  {
    pattern: /^\/auth\/register\/?$/,
    title: 'Register | Smart Profile Management System',
    description: 'Create a browser-local faculty account for the Smart Profile Management System public demo.',
    indexable: false,
    image: 'og/register.png',
    imageAlt: 'Browser-local faculty registration for the CCIS public showcase',
  },
  {
    pattern: /^\/faculty\/uploaded/,
    title: 'Uploaded Files | Smart Profile Management System',
    description: 'Review, recategorize, or remove sample credentials stored in this browser-local demo.',
    indexable: false,
    image: 'og/uploaded-files.png',
    imageAlt: 'Faculty uploaded-files table with status chips and row actions',
  },
  {
    pattern: /^\/faculty\/profile/,
    title: 'Faculty Profile | Smart Profile Management System',
    description: 'Edit professional details and draft a biography from approved sample credentials.',
    indexable: false,
    image: 'og/profile.png',
    imageAlt: 'Faculty profile builder and biography draft from approved credentials',
  },
  {
    pattern: /^\/faculty\//,
    title: 'Faculty Workspace | Smart Profile Management System',
    description: 'Browser-local faculty dashboard, profile builder, and sample credential upload workspace.',
    indexable: false,
    image: 'og/faculty.png',
    imageAlt: 'Faculty workspace with metrics and smart upload for Dr. Maria Santos',
  },
  {
    pattern: /^\/admin\/approvals/,
    title: 'Approvals | Smart Profile Management System',
    description: 'Preview, approve, or return generated sample credentials in the browser-local queue.',
    indexable: false,
    image: 'og/approvals.png',
    imageAlt: 'Admin approval queue with Approve, Return, and View actions',
  },
  {
    pattern: /^\/admin\//,
    title: 'Admin Workspace | Smart Profile Management System',
    description: 'Browser-local admin review dashboard for sample credential approvals and reports.',
    indexable: false,
    image: 'og/admin.png',
    imageAlt: 'Admin reviewer dashboard with metrics, charts, and pending submissions',
  },
  {
    pattern: /^\/demo-storage(?:\/|$)/,
    title: 'Demo File Preview | Smart Profile Management System',
    description: 'Browser-local demo file preview for generated sample credential uploads.',
    indexable: false,
    image: 'og/preview.png',
    imageAlt: 'Demo file preview for generated sample credentials',
  },
];

const NOT_FOUND_META: RouteSeoMeta = {
  pattern: /.*/,
  title: 'Page Not Found | Smart Profile Management System',
  description: 'The requested Smart Profile Management System public demo route was not found.',
  indexable: false,
  image: DEFAULT_OG_IMAGE,
  imageAlt: DEFAULT_OG_ALT,
};

export function getRouteSeoMeta(pathname: string): RouteSeoMeta {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return ROUTE_SEO_META.find((route) => route.pattern.test(normalizedPathname)) ?? NOT_FOUND_META;
}

export function socialImageUrlFor(pathname: string) {
  return `${SITE_URL}${getRouteSeoMeta(pathname).image}`;
}
