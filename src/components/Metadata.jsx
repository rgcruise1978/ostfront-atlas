import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
const origin = (import.meta.env.VITE_SITE_ORIGIN || 'https://ostkrieg.com').replace(/\/$/,'');
const launched = import.meta.env.VITE_LAUNCH_READY === 'true' && origin === 'https://ostkrieg.com';
export default function Metadata() {
  const {pathname: rawPath, search} = useLocation();
  const pathname = rawPath.replace(/\/+$/, '') || '/';
  useEffect(() => {
    const study = pathname.startsWith('/articles/') ? articleBySlug(pathname.slice(10)) : null;
    const known = ['/', '/about', '/about-the-author', '/guide', '/collections', '/articles', '/sources', '/campaigns/poland-1939', '/campaigns/barbarossa-1941', '/atlases/poland-1939', '/atlases/barbarossa-1941'].includes(pathname) || Boolean(study);
    const params = new URLSearchParams(search), canonical = new URL(pathname,origin);
    if (pathname.startsWith('/atlases/')) for (const key of ['date','phase']) { if(params.has(key)) canonical.searchParams.set(key,params.get(key)); }
    if (pathname.startsWith('/campaigns/') && params.has('phase')) canonical.searchParams.set('phase',params.get('phase'));
    const descriptions = {'/about':'About Ostkrieg: an independent historical atlas connecting dated maps, historical studies, and traceable evidence.','/guide':'How to use Ostkrieg: choose dates and layers, explore historical maps, read studies, and follow their sources.','/about-the-author':'Robert M. Dobo, author of the historical studies collected in Ostkrieg.'};
    const description = study?.summary || study?.subtitle || descriptions[pathname] || 'Explore the Eastern Front through dated interactive maps, historical studies, and documented sources. Collections cover Poland in 1939 and five Barbarossa phases through 5 December 1941; All five phases include published studies and dated military maps with linked sources.';
    const meta = (key,value,property=false) => { const attr=property?'property':'name';let el=document.head.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.content=value; };
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);}link.href=canonical.href;
    if(study)meta('author',study.author || 'Robert M. Dobo');else document.head.querySelector('meta[name="author"]')?.remove();
    meta('description',description);meta('robots',launched && known && (!study || study.status==='published')?'index, follow':'noindex, follow');
    meta('og:locale','en_CA',true);meta('og:url',canonical.href,true);meta('og:description',description,true);meta('og:site_name','Ostkrieg',true);meta('og:type',study?'article':'website',true);meta('twitter:card','summary_large_image');meta('twitter:description',description);
    meta('og:image',origin+'/brand/ostkrieg-social.jpg',true);meta('og:image:width','1200',true);meta('og:image:height','630',true);meta('og:image:alt','Ostkrieg — The Eastern Front, 1939–1945',true);meta('twitter:image',origin+'/brand/ostkrieg-social.jpg');meta('twitter:image:alt','Ostkrieg — The Eastern Front, 1939–1945');
    // Page renderers set titles in their own effects; sync after those effects.
    const updateTitle=()=>{meta('og:title',document.title,true);meta('twitter:title',document.title);};
    const observer=new MutationObserver(updateTitle);observer.observe(document.head.querySelector('title'),{childList:true});updateTitle();
    return ()=>observer.disconnect();
  }, [pathname,search]);
  return null;
}
