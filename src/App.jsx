import React, { lazy, Suspense } from 'react';
import { NavLink, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Articles from './pages/Articles.jsx';
import Article from './pages/Article.jsx';
import Sources from './pages/Sources.jsx';

const links = [
  ['/', 'Home'], ['/atlases/poland-1939', 'Interactive Atlases'],
  ['/articles', 'Historical Articles'], ['/sources', 'Primary Sources']
];
const Atlas = lazy(() => import('./pages/Atlas.jsx'));

export default function App() {
  return <div className="site-shell">
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Ostfront Atlas, home">
          <strong>OSTFRONT <span>ATLAS</span></strong>
          <small>The Eastern Front, 1939–1945</small>
        </Link>
        <nav aria-label="Primary navigation">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        </nav>
      </div>
    </header>
    <main id="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/atlases/poland-1939" element={<Suspense fallback={<div className="page narrow" role="status">Loading atlas…</div>}><Atlas /></Suspense>} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<Article />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="*" element={<div className="page narrow"><p className="eyebrow">Page not found</p><h1>There is no page at this address.</h1><Link to="/">Return home</Link></div>} />
      </Routes>
    </main>
    <footer className="site-footer"><div className="footer-inner"><span>OSTFRONT ATLAS</span><span>Historical research in development · 1939–1945</span><Link to="/sources">Source library</Link></div></footer>
  </div>;
}
