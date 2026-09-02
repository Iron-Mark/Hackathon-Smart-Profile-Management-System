import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getRouteSeoMeta, SITE_URL, socialImageUrlFor } from '@/lib/seo';

const INDEXABLE_ROBOTS = 'index,follow,max-image-preview:large';
const NOINDEX_ROBOTS = 'noindex,nofollow';

function upsertMetaByName(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertMetaByProperty(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function SeoRouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const routeMeta = getRouteSeoMeta(pathname);
    const robots = routeMeta.indexable ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS;
    const imageUrl = socialImageUrlFor(pathname);

    document.title = routeMeta.title;
    upsertCanonical(SITE_URL);
    upsertMetaByName('robots', robots);
    upsertMetaByName('description', routeMeta.description);
    upsertMetaByProperty('og:title', routeMeta.title);
    upsertMetaByProperty('og:description', routeMeta.description);
    upsertMetaByProperty('og:url', SITE_URL);
    upsertMetaByProperty('og:image', imageUrl);
    upsertMetaByProperty('og:image:secure_url', imageUrl);
    upsertMetaByProperty('og:image:alt', routeMeta.imageAlt);
    upsertMetaByName('twitter:title', routeMeta.title);
    upsertMetaByName('twitter:description', routeMeta.description);
    upsertMetaByName('twitter:image', imageUrl);
    upsertMetaByName('twitter:image:alt', routeMeta.imageAlt);
  }, [pathname]);

  return null;
}
