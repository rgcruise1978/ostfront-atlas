import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

export default function Guide() {
  return <div className="page narrow guide-page"><Breadcrumbs items={[{label:'How to use the atlas'}]}/><p className="eyebrow">A reader’s guide</p><h1>How to use the atlas</h1>
    <section><h2>Choose a collection</h2><p>The <Link to="/collections">collection index</Link> brings together the Partition of Poland and both Barbarossa phases. Each collection links to its map, studies and first reading entry.</p></section>
    <section><h2>Follow a date or a region</h2><p>Use the map’s date selector or previous and next buttons to move through the chronology. Barbarossa’s July 9 and July 10 entries connect across the phase boundary. The region selector changes the view while retaining your date. Capital buttons locate a city; “Return to region” restores the regional view.</p></section>
    <section><h2>Read the map key</h2><p>German territory uses gray and Soviet territory uses red. Other colours and patterns distinguish different authorities and claims. Hatched military areas indicate qualified operational reach or contested ground. An arrow shows a sourced direction, not secure control of every area behind it. Read the displayed date and reference notice together.</p><p>Phase II currently shows a clearly labelled 21 June territorial reference. Its later military situations are in preparation. Capital stars identify a city’s capital or historic capital role; they do not establish sovereignty or military control.</p></section>
    <section><h2>Open the historical information</h2><p>Select a map feature to see its explanation, source references and limitations. The historical information panel also provides a text account of the selected date. On phones, the information and map-key panels can be expanded when needed.</p></section>
    <section><h2>Move between map and study</h2><p>A map entry links to the corresponding study or research brief. Its return link retains the date, region and saved map position. Studies also provide previous and next reading links and breadcrumbs to their collection.</p></section>
    <section><h2>Follow the evidence</h2><p>Numbered superscripts lead to an article’s references. “Return to text” takes you back to the citation. The <Link to="/sources">source register</Link> can be searched and filtered; it includes documents, scholarship, institutional histories and geographic datasets, each with its relevance, limitations and reuse information.</p></section>
    <section><h2>Recognize work in preparation</h2><p>Published studies contain completed narratives. Research briefs set out the subjects and references for future writing. A dated entry can be available before its military reconstruction is finished; its status is stated beside the map.</p></section>
    <Link className="button-link" to="/collections">Choose a collection →</Link>
  </div>;
}
