import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
export default function Author() {
  return <div className="page narrow guide-page information-page">
    <Breadcrumbs items={[{label:'About the Author'}]}/><p className="eyebrow">Authorship</p><h1>R.G. Cruise</h1>
    <p className="section-lead">Author of the historical studies collected in Ostfront Atlas.</p>
    <section><h2>History through narrative and geography</h2><p>The studies bring military operations, political decisions, and civilian experiences into a connected account. Each can be read independently or alongside its dated map, with chronological links guiding readers through the collection.</p><p>The approach is evidence-led: trace claims to identifiable sources, distinguish contemporary reporting from later interpretation, and make uncertainty explicit. Maps and prose should help readers understand both an event and the limits of what can be reconstructed.</p></section>
    <section><h2>Explore the work</h2><p>Begin with the <Link to="/articles">Historical Studies</Link>, browse the <Link to="/collections">collections</Link>, or examine the <Link to="/sources">source register</Link>. The <Link to="/about">About page</Link> explains the project's scope and research principles.</p></section>
  </div>;
}
