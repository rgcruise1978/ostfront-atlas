import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { articleBySlug } from '../content/articles.js';
const origin = (import.meta.env.VITE_SITE_ORIGIN || 'https://ostfront-atlas.netlify.app').replace(/\/$/,'');
const launched = import.meta.env.VITE_LAUNCH_READY === 'true' && origin === 'https://ostfrontatlas.com';
export default function Metadata() {
  const {pathname: rawPath, search} = useLocation();
  const pathname = rawPath.replace(/\/+$/, '') || '/';
  useEffect(() => {
    const study = pathname.startsWith('/articles/') ? articleBySlug(pathname.slice(10)) : null;
    const known = ['/', '/about', '/about-the-author', '/guide', '/collections', '/articles', '/sources', '/campaigns/poland-1939', '/campaigns/barbarossa-1941', '/atlases/poland-1939', '/atlases/barbarossa-1941'].includes(pathname) || Boolean(study);
    const params = new URLSearchParams(search), canonical = new URL(pathname,origin);
    if (pathname.startsWith('/atlases/')) for (const key of ['date','phase']) { if(params.has(key)) canonical.searchParams.set(key,params.get(key)); }
    if (pathname.startsWith('/campaigns/') && params.has('phase')) canonical.searchParams.set('phase',params.get('phase'));
    const descriptions = {'/about':'About Ostfront Atlas: an independent historical atlas connecting dated maps, historical studies, and traceable evidence.','/guide':'How to use Ostfront Atlas: choose dates and layers, explore historical maps, read studies, and follow their sources.','/about-the-author':'R.G. Cruise, author of the historical studies collected in Ostfront Atlas.'};
    const description = study?.summary || study?.subtitle || descriptions[pathname] || 'Explore the Eastern Front through dated interactive maps, historical studies, and documented sources. Collections cover Poland in 1939 and five Barbarossa phases through 5 December 1941; Phase V full studies and military maps are in preparation.';
    const meta = (key,value,property=false) => { const attr=property?'property':'name';let el=document.head.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.content=value; };
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);}link.href=canonical.href;
    if(study)meta('author',study.author || 'R.G. Cruise');else document.head.querySelector('meta[name="author"]')?.remove();
    meta('description',description);meta('robots',launched && known && (!study || study.status==='published')?'index, follow':'noindex, follow');
    meta('og:url',canonical.href,true);meta('og:description',description,true);meta('og:site_name','Ostfront Atlas',true);meta('og:type',study?'article':'website',true);meta('twitter:card','summary');meta('twitter:description',description);
    // Page renderers set titles in their own effects; sync after those effects.
    const updateTitle=()=>{meta('og:title',document.title,true);meta('twitter:title',document.title);};
    const observer=new MutationObserver(updateTitle);observer.observe(document.head.querySelector('title'),{childList:true});updateTitle();
    return ()=>observer.disconnect();
  }, [pathname,search]);
  return null;
}
