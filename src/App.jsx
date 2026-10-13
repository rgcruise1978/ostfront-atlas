import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { NavLink, Route, Routes, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Articles from './pages/Articles.jsx';
import Article from './pages/Article.jsx';
import Sources from './pages/Sources.jsx';
import Campaign from './pages/Campaign.jsx';
import { campaigns } from './data/campaigns.js';

const links = [['/', 'Home'], ['/articles', 'Historical Articles'], ['/sources', 'Primary Sources']];
const Atlas = lazy(() => import('./pages/Atlas.jsx'));

export default function App() {
  const [atlasMenuOpen, setAtlasMenuOpen] = useState(false);
  const menuSummary = useRef(null);
  const location = useLocation();
  const viewingAtlas = location.pathname.startsWith('/atlases/') || location.pathname.startsWith('/campaigns/');
  useEffect(() => {
    if (!atlasMenuOpen) return;
    const closeOutside = event => { if (!event.target.closest('.atlas-menu')) setAtlasMenuOpen(false); };
    const closeEscape = event => { if (event.key === 'Escape') { setAtlasMenuOpen(false); menuSummary.current?.focus(); } };
    document.addEventListener('click', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('click', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [atlasMenuOpen]);
  return <div className="site-shell">
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Ostfront Atlas, home">
          <strong>OSTFRONT <span>ATLAS</span></strong>
          <small>The Eastern Front, 1939–1945</small>
        </Link>
        <nav aria-label="Primary navigation">
          <NavLink to="/" end onClick={() => setAtlasMenuOpen(false)}>Home</NavLink>
          <details className="atlas-menu" open={atlasMenuOpen} onToggle={event => setAtlasMenuOpen(event.currentTarget.open)}>
            <summary ref={menuSummary} className={viewingAtlas ? 'active' : undefined}>Atlases</summary>
            <div className="atlas-menu-items">{campaigns.map(campaign => <NavLink key={campaign.id} to={campaign.mapPath} onClick={() => setAtlasMenuOpen(false)}><strong>{campaign.title}</strong><small>{campaign.phase && `${campaign.phase} · `}{campaign.range}</small></NavLink>)}</div>
          </details>
          {links.slice(1).map(([to, label]) => <NavLink key={to} to={to} onClick={() => setAtlasMenuOpen(false)}>{label}</NavLink>)}
        </nav>
      </div>
    </header>
    <main id="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/atlases/poland-1939" element={<Suspense fallback={<div className="page narrow" role="status">Loading atlas…</div>}><Atlas key="poland-1939" campaignId="poland-1939" /></Suspense>} />
        <Route path="/campaigns/barbarossa-1941" element={<Campaign />} />
        <Route path="/atlases/barbarossa-1941" element={<Suspense fallback={<div className="page narrow" role="status">Loading atlas…</div>}><Atlas key="barbarossa-1941" campaignId="barbarossa-1941" /></Suspense>} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<Article />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="*" element={<div className="page narrow"><p className="eyebrow">Page not found</p><h1>There is no page at this address.</h1><Link to="/">Return home</Link></div>} />
      </Routes>
    </main>
    <footer className="site-footer"><div className="footer-inner"><span>OSTFRONT ATLAS</span><span>Historical research in development · 1939–1945</span><Link to="/sources">Source library</Link></div></footer>
  </div>;
}
