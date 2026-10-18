import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Articles from './pages/Articles.jsx';
import Article from './pages/Article.jsx';
import Sources from './pages/Sources.jsx';
import Campaign from './pages/Campaign.jsx';
import { campaigns, selectedPhase, phaseForDate } from './data/campaigns.js';
import { collections } from './data/collections.js';
import { articleBySlug } from './content/articles.js';
import Collections from './pages/Collections.jsx';
import Guide from './pages/Guide.jsx';
import About from './pages/About.jsx';
import Author from './pages/Author.jsx';
import Metadata from './components/Metadata.jsx';
import { informationPages } from './data/informationPages.js';

const links = [['/', 'Home'], ['/articles', 'Historical Studies'], ['/sources', 'Sources']];
const Atlas = lazy(() => import('./pages/Atlas.jsx'));

export default function App() {
  const [atlasMenuOpen, setAtlasMenuOpen] = useState(false);
  const menuSummary = useRef(null);
  const rawLocation = useLocation();
  const location = { ...rawLocation, pathname: rawLocation.pathname.replace(/\/+$/, '') || '/' };
  const activeArticle = articleBySlug(location.pathname.replace('/articles/', ''));
  const activeCampaign = campaigns.find(c => [c.mapPath,c.introPath].includes(location.pathname)) || campaigns.find(c=>c.id===activeArticle?.campaignId);
  const activePhase = activeArticle ? phaseForDate(activeCampaign || {},activeArticle.historicalDate) : activeCampaign && selectedPhase(activeCampaign,new URLSearchParams(location.search));
  const viewingAtlas = Boolean(activeCampaign) || location.pathname === '/collections';
  useEffect(()=>{if(location.pathname.startsWith('/articles/'))return;const titles={'/':'The Eastern Front','/collections':'Collections','/articles':'Historical Studies','/sources':'Sources','/guide':'How to Use this Site','/about':'About','/about-the-author':'About the Author'};document.title=`${titles[location.pathname] || (activeCampaign ? `${activeCampaign.title}${activePhase ? ` · Phase ${activePhase.id}` : ''}` : 'Page not found')} | Ostkrieg`;},[location.pathname,location.search,activeCampaign,activePhase]);
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!atlasMenuOpen) return;
    const closeOutside = event => { if (!event.target.closest('.atlas-menu')) setAtlasMenuOpen(false); };
    const closeEscape = event => { if (event.key === 'Escape') { setAtlasMenuOpen(false); menuSummary.current?.focus(); } };
    document.addEventListener('click', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('click', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [atlasMenuOpen]);
  return <div className="site-shell">
    <Metadata />
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <div className="archive-strip"><span>Independent historical atlas</span><span>Europe · 1939—1945</span><span>Maps / chronology / evidence</span></div>
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Ostkrieg, home">
          <img className="brand-emblem" src="/brand/ost-krieg-128.webp" srcSet="/brand/ost-krieg-128.webp 128w, /brand/ost-krieg-256.webp 256w, /brand/ost-krieg-384.webp 384w" sizes="(max-width: 750px) 76px, 112px" width="112" height="112" alt="" fetchPriority="high" />
          <span className="brand-wordmark"><strong>OST<span>KRIEG</span></strong><small>The Eastern Front, 1939–1945</small></span>
        </Link>
        <p className="masthead-note">An independent historical atlas<br /><span>Maps · chronology · evidence</span></p>
      </div>
      <div className="navigation-band"><div className="navigation-inner">
        <nav aria-label="Primary navigation">
          <NavLink to="/" end onClick={() => setAtlasMenuOpen(false)}>Home</NavLink>
          <details className="atlas-menu" open={atlasMenuOpen}>
            <summary ref={menuSummary} aria-expanded={atlasMenuOpen} onClick={event => { event.preventDefault(); setAtlasMenuOpen(open => !open); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setAtlasMenuOpen(false); menuSummary.current?.focus(); } }} className={viewingAtlas ? 'active' : undefined}>Collections</summary>
            <div className="atlas-menu-items"><Link to="/collections" onClick={()=>setAtlasMenuOpen(false)}>All collections →</Link>{campaigns.map(campaign => campaign.phases ? <div className="atlas-menu-campaign" key={campaign.id}><p>{campaign.title}<small>{campaign.range}</small></p>{campaign.phases.map(phase => <Link key={phase.id} to={`${campaign.introPath}?phase=${phase.id}`} className={activeCampaign?.id===campaign.id && activePhase?.id===phase.id ? "active" : undefined} aria-current={activeCampaign?.id===campaign.id && activePhase?.id===phase.id ? "location" : undefined} onClick={() => setAtlasMenuOpen(false)}><strong>{phase.title}</strong><small>{phase.range}</small></Link>)}</div> : <Link key={campaign.id} to={campaign.introPath} className={activeCampaign?.id===campaign.id ? "active" : undefined} aria-current={activeCampaign?.id===campaign.id ? "location" : undefined} onClick={() => setAtlasMenuOpen(false)}><strong>{campaign.title}</strong><small>{campaign.range}</small></Link>)}</div>
          </details>
          {links.slice(1).map(([to, label]) => <NavLink key={to} to={to} onClick={() => setAtlasMenuOpen(false)}>{label}</NavLink>)}
        </nav>
      <nav className="secondary-navigation" aria-label="Information navigation">{informationPages.map(page => <NavLink key={page.path} to={page.path} onClick={() => setAtlasMenuOpen(false)}>{page.label}</NavLink>)}</nav>
      </div></div>
    </header>
    <div className="print-identity">OSTKRIEG · The Eastern Front, 1939–1945</div>
    <main id="main-content" tabIndex={-1}>
      <Routes>
        <Route path="/" element={<Home />} />
        {campaigns.map(campaign => <Route key={campaign.id} path={campaign.mapPath} element={<Suspense fallback={<div className="page narrow" role="status">Loading Ostkrieg atlas…</div>}><Atlas key={campaign.id} campaignId={campaign.id} /></Suspense>} />)}
        <Route path="/collections" element={<Collections />} />
        <Route path="/about" element={<About />} />
        <Route path="/about-the-author" element={<Author />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/campaigns/poland-1939" element={<Campaign campaignId="poland-1939" />} />
        <Route path="/campaigns/barbarossa-1941" element={<Campaign />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<Article />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="*" element={<div className="page narrow"><p className="eyebrow">Page not found</p><h1>There is no page at this address.</h1><Link to="/">Return home</Link></div>} />
      </Routes>
    </main>
    <footer className="site-footer"><div className="footer-inner"><span className="footer-wordmark">OSTKRIEG</span><span>An independent historical atlas · 1939–1945</span><nav className="footer-navigation" aria-label="Footer navigation"><div><strong>Explore</strong><Link to="/">Home</Link><Link to="/collections">All collections</Link><Link to="/articles">Historical Studies</Link></div><div><strong>Collections</strong>{collections.map(c=><Link key={c.key} to={c.introPath}>{c.title}{c.phase?` · Phase ${c.phase.id}`:""}</Link>)}</div><div><strong>Evidence and guidance</strong><Link to="/sources">Sources</Link>{informationPages.map(page => <Link key={page.path} to={page.path}>{page.label}</Link>)}</div></nav></div></footer>
  </div>;
}
