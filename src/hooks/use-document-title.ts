import { useEffect } from 'react';

/**
 * Dynamically updates the browser tab title and Open Graph title meta tag for SEO.
 * Automatically appends the branding suffix.
 * 
 * @param title The title of the specific page/route.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const fullTitle = `${title} | Smart FPMS - CCIS`;
    document.title = fullTitle;
    
    // Dynamically update the Open Graph title tag if it exists
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }
  }, [title]);
}
