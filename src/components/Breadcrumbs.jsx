import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><ol><li><Link to="/">Home</Link></li>{items.map((item,index) => <li key={`${item.label}-${index}`}>{item.href ? <Link to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
