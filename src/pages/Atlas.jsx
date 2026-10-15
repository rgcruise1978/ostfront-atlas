import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Link,useNavigate,useSearchParams} from 'react-router-dom';
import AtlasMap from '../map/AtlasMap.jsx';
import {campaigns,campaignById,selectedPhase,phaseForDate,parseMapView} from '../data/campaigns.js';
import {articleBySlug} from '../content/articles.js';
import {collectionForDate} from '../data/collections.js';
import {relevantLegend} from '../map/temporalGeography.js';
import {actorColors,coalitionColors,movementKinds,controlColors,territorialCategories} from '../map/cartography.js';
import capitals from '../data/capitals.json';
import {capitalStatus} from '../data/capitalStatus.js';
import sources from '../data/sources.json';
import snapshots from '../data/map-snapshot-index.json';
import changes from '../data/territorial-changes.json';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import '../map-workstation.css';
const defaults={control:true,countries:true,neighbors:true,boundary:true,movements:true,formations:true,fronts:true,alignment:true,logistics:false,capitals:true,places:true,rivers:true,relief:true,changes:false,civilian:false,reference:false};
const layerLabels={countries:'Country names',control:'Territorial shading & occupation',neighbors:'Territory & administration borders',boundary:'1939 sovereign borders & demarcation',alignment:'Alliances & political alignment',formations:'Formations & commanders',movements:'Advances, retreats & plans',fronts:'Approximate operational contact',logistics:'Historical transport & supply',capitals:'Capitals & administrative seats',places:'Cities & towns',rivers:'Rivers & lakes',relief:'Physical relief',changes:'Changes since previous date',civilian:'Civilians, evacuation & occupation',reference:'Preinvasion political reference'};
const presets={'Operations':defaults,'Political & control':{...defaults,movements:false,formations:false,fronts:false},'Logistics':{...defaults,logistics:true,formations:false,movements:false},'Presentation':{...defaults,boundary:true,formations:true}};
const fold=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const listIds=v=>Array.isArray(v)?v:typeof v==='string'?JSON.parse(v):[];
export default function Atlas({campaignId='poland-1939'}){
 const navigate=useNavigate(),[params,setParams]=useSearchParams();
 const campaign=campaignById(campaignId),phase=selectedPhase(campaign,params),timeline=campaign.timeline;
 const requested=params.get('date'),active=timeline.find(e=>e.date===requested)||phase?.timeline[0]||timeline[0],index=timeline.indexOf(active);
 const collection=collectionForDate(campaign,active.date),mapRef=useRef(null);
 const referenceOnly=active.snapshotStatus==='geographic-reference-only';
 const region=campaign.views.find(v=>v.id===params.get('region'))||campaign.views.find(v=>v.id===active.defaultView)||campaign.views[0];
 const [layers,setLayers]=useState(defaults),[preset,setPreset]=useState('Operations'),[presenting,setPresenting]=useState(false),[query,setQuery]=useState(''),[tab,setTab]=useState('formations'),[selected,setSelected]=useState(null),[inventory,setInventory]=useState(null),[camera,setCamera]=useState(null),[exporting,setExporting]=useState(false),[message,setMessage]=useState('');
 const [viewRequest,setViewRequest]=useState(()=>parseMapView(params.get('view'))||{bounds:region.bounds});
 const previousRegion=useRef('');
 useEffect(()=>{const key=campaign.id+':'+region.id+':'+(params.get('view')||'');if(previousRegion.current!==key){setViewRequest(parseMapView(params.get('view'))||{bounds:region.bounds});previousRegion.current=key;}setSelected(null);},[campaign.id,region.id,params.get('view')]);
 useEffect(()=>{setSelected(null);},[active.date]);
 useEffect(()=>{if(presenting)setViewRequest({bounds:region.bounds});},[presenting]);
 useEffect(()=>{const key=e=>{if(e.key==='Escape')setPresenting(false);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const changeDate=date=>{const next=new URLSearchParams(params);next.set('date',date);const p=phaseForDate(campaign,date);if(p)next.set('phase',p.id);setParams(next,{replace:true});};
 const changeRegion=id=>{const next=new URLSearchParams(params);next.set('region',id);next.delete('view');setParams(next,{replace:true});};
 const toggle=key=>{setLayers(v=>({...v,[key]:!v[key]}));setPreset('Custom');};
 const choosePreset=name=>{setPreset(name);setLayers({...presets[name]});};
 const onInventory=useCallback(value=>setInventory(value),[]);
 const choose=useCallback(feature=>{setSelected({...feature,sourceIds:listIds(feature.sourceIds||(feature.sourceId?[feature.sourceId]:[]))});},[]);
 const allRecords=useMemo(()=>{
  if(!inventory)return [];
  const from=(features,type)=>features.map(f=>({...f.properties,kind:type,title:f.properties.title||f.properties.displayName||f.properties.name,coordinates:f.geometry.type==='Point'?f.geometry.coordinates:f.properties.labelCoordinates,geometryType:f.geometry.type}));
  return [...from(inventory.formations,'formation'),...from(inventory.countries,'territory'),...capitals.filter(c=>c.startDate<=active.date&&active.date<=c.endDate).map(c=>({...c,kind:'capital',title:c.name+' · '+c.capitalOf,note:capitalStatus(c,active.date)})),...from(inventory.operations.filter(f=>f.properties.category!=='civilian'&&f.properties.domain!=='civilian'),'operation'),...from(inventory.operations.filter(f=>f.properties.category==='civilian'||f.properties.domain==='civilian'),'civilian'),...from(inventory.logistics,'logistics'),...from(inventory.places,'place')];
 },[inventory,active.date]);
 const visibleRecords=useMemo(()=>{
  const q=fold(query);const filtered=allRecords.filter(r=>q?fold([r.title,r.countryName,r.commander,r.actor,r.name,r.displayName,r.parentFormation,r.modernName,r.displayName,r.note].join(' ')).includes(q):tab==='formations'?r.kind==='formation':tab==='countries'?r.kind==='territory':tab==='capitals'?r.kind==='capital':tab==='operations'?r.kind==='operation':tab==='civilian'?r.kind==='civilian':r.kind==='logistics');
  return filtered.slice(0,query?70:100);
 },[allRecords,query,tab]);
 const selectRecord=r=>{choose(r);if(r.coordinates){setViewRequest({coordinates:r.coordinates,zoom:r.kind==='territory'?4.7:r.kind==='formation'?6:r.kind==='civilian'&&r.eventKind?.startsWith('massacre')?8.8:6.4});}if(r.kind==='formation')setLayers(v=>({...v,formations:true}));if(r.kind==='civilian')setLayers(v=>({...v,civilian:true}));if(r.kind==='operation')setLayers(v=>({...v,movements:true}));};
 const study=articleBySlug(active.articleSlug),studyParams=new URLSearchParams({mapRegion:region.id});if(camera)studyParams.set('mapView',`${camera.coordinates.join(',')},${camera.zoom}`);
 const share=async()=>{const link=new URL(location.href);if(camera)link.searchParams.set('view',`${camera.coordinates.join(',')},${camera.zoom}`);await navigator.clipboard.writeText(link.toString());setMessage('Link copied with the date, region and map position.');};
 const exportMap=async()=>{setExporting(true);setMessage('Preparing a 2560 × 1440 map image…');try{await mapRef.current.exportMap({title:campaign.title,label:active.label,preset});setMessage('Presentation image saved with date, legend, scale and source credit.');}catch(e){setMessage('The image could not be saved: '+e.message);}finally{setExporting(false);}};
 const actorSet=new Set([...(inventory?.formations||[]),...(inventory?.operations||[])].map(f=>f.properties.actor));
 const unitSource=selected?.sourceIds?.length?selected.sourceIds:[];
 const selectedLocators=typeof selected?.sourceLocators==='string'?JSON.parse(selected.sourceLocators):selected?.sourceLocators||{};
 const activeMovementKinds=new Set((inventory?.operations||[]).filter(f=>f.properties.domain!=='civilian').map(f=>f.properties.movementType));
 return <div className={`page atlas-page map-workstation ${presenting?'is-presenting':''}`}>
  <div className="atlas-site-context"><Breadcrumbs items={[{label:'Collections',href:'/collections'},{label:collection.phase?`${collection.title} · Phase ${collection.phase.id}`:collection.title,href:collection.introPath},{label:active.label}]}/>
   <div className="atlas-heading"><div><p className="eyebrow">Historical atlas · {phase?.range||campaign.studyRange}</p><h1>{campaign.title}</h1><p className="section-lead">{phase?.title||'Invasion, partition and occupation · 1939'}</p></div><Link to={collection.introPath}>Read the collection →</Link></div>
  </div>
  <div className="atlas-topbar">
   <label>Collection<select aria-label="Map collection" value={campaignId} onChange={e=>navigate(campaignById(e.target.value).mapPath)}>{campaigns.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
   {phase&&<label>Phase<select aria-label="Campaign phase" value={phase.id} onChange={e=>changeDate(campaign.phases.find(p=>p.id===e.target.value).timeline[0].date)}>{campaign.phases.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>}
   <div className="date-navigation"><button aria-label="Previous historical date" disabled={index===0} onClick={()=>changeDate(timeline[index-1].date)}>←</button><label>Situation date<select aria-label="Historical date" value={active.date} onChange={e=>changeDate(e.target.value)}>{(phase?.timeline||timeline).map(e=><option key={e.id} value={e.date}>{e.label}</option>)}</select></label><button aria-label="Next historical date" disabled={index===timeline.length-1} onClick={()=>changeDate(timeline[index+1].date)}>→</button></div>
   <label>Region<select aria-label="Map region" value={region.id} onChange={e=>changeRegion(e.target.value)}>{campaign.views.map(v=><option key={v.id} value={v.id}>{v.label}</option>)}</select></label>
  </div>
  <div className="atlas-layout">
   <div className="map-column">
    <div className="map-commandbar"><div className="map-presets" role="group" aria-label="Map view presets">{Object.keys(presets).map(name=><button key={name} aria-pressed={preset===name} onClick={()=>choosePreset(name)}>{name}</button>)}</div><div className="map-actions"><button onClick={()=>setViewRequest({bounds:region.bounds})}>Reset view</button><button onClick={share}>Copy map link</button><button aria-pressed={presenting} onClick={()=>setPresenting(v=>!v)}>{presenting?'Exit presentation':'Present'}</button><button disabled={exporting} onClick={exportMap}>{exporting?'Saving…':'Save PNG'}</button></div></div>
    <div className="presentation-title"><span>{campaign.title}</span><strong>{active.label}</strong><small>{snapshots[active.date]?.timeConvention||'Dated historical situation'}</small></div>
    {referenceOnly&&<p className="map-reading-note" role="status"><strong>Geographic reference view.</strong> Political and physical geography provides orientation. Military control, fronts, formations and movements have not yet been reconstructed for {active.label}; no earlier military layer is carried forward.</p>}
    <AtlasMap ref={mapRef} campaign={campaign} date={active.date} operationRegion={region.id} viewRequest={viewRequest} layers={layers} onViewChange={setCamera} onFeatureSelect={choose} onInventory={onInventory}/>
    <div className="map-key" aria-label="Map legend">
     <strong>{active.label}</strong>
     {referenceOnly?<span><i className="pattern" style={{background:'#E6D1CD'}}/>Preinvasion Soviet political reference · September control pending</span>:<>{layers.control&&<><span><i style={{background:controlColors.Germany}}/>German authority</span><span><i style={{background:controlColors['Soviet Union']}}/>Soviet authority</span><span><i className="pattern" style={{background:territorialCategories.operational.color}}/>Hatched: occupation / forward reach</span><span><i style={{background:territorialCategories.contested.color}}/>Contested / resistance</span></>}{active.date>='1941-08-29'&&layers.control&&<span><i className="pattern" style={{background:'#9BB29D'}}/>Finnish forward reach</span>}{layers.movements&&<>{Object.entries(movementKinds).filter(([key])=>activeMovementKinds.has(key)).map(([key,value])=><span key={key}><svg width="35" height="12" aria-hidden="true"><line x1="0" y1="6" x2="29" y2="6" stroke="currentColor" strokeWidth="2" strokeDasharray={value.dash.map(n=>n*2).join(' ')}/><path d="M27 2 L33 6 L27 10" fill="none" stroke="currentColor"/></svg>{value.label}</span>)}<span><i style={{background:'#B56D2E',borderRadius:'50%'}}/>Checked / stalled · ⇢ Sea passage</span></>}{layers.formations&&<span>XXXXX Group/front · XXXX Army · XXX Corps · XX Division · ⚓ Fleet</span>}</>}
     {layers.civilian&&<span>○ Civilian / occupation · violet ring and dashed route</span>}{layers.changes&&<span>Yellow: new reach · Blue: withdrawn / revised reach</span>}{layers.capitals&&<span>★ Capital · ◆ Administrative seat</span>}
     {layers.boundary&&<span>┄ Historical border · ━┄ Demarcation</span>}
     {layers.fronts&&!referenceOnly&&<span>┄ Approximate operational contact</span>}
     {layers.logistics&&<span><i style={{background:'#665475'}}/>Rail/road corridor · sea route</span>}
     {layers.alignment&&Object.entries(coalitionColors).filter(([k])=>['axis','allied','cobelligerent','neutral'].includes(k)).map(([k,c])=><span key={k}><i style={{background:c}}/>{({axis:'Axis authority / partner',allied:'Allied belligerent / guarantee',cobelligerent:'Co-belligerent',neutral:'Neutral / non-belligerent'})[k]}</span>)}
    </div>
    <p className="map-reading-note">{referenceOnly?'Faint eastern hatching locates preinvasion Soviet territory and disputed incorporations. It does not establish control on this Phase III date. The 1939 borders, country names, capitals and physical geography provide orientation.': 'Country names identify historical territories. Shading distinguishes authority and occupation; light hatching marks approximate forward reach. Arrows distinguish movement from ordered objectives.'} <Link to="/sources#atlas-period-communications">Sources and precision notes →</Link></p>
    <p className="map-status-message" role="status">{message}</p>
    <details className="map-layer-panel"><summary>Layers, country colours and map notes</summary><div className="layer-toggles">{Object.entries(layerLabels).map(([key,label])=><label key={key}><input type="checkbox" checked={layers[key]} onChange={()=>toggle(key)}/>{label}</label>)}</div><div className="country-colour-key">{inventory?.countries.filter((c,i,a)=>a.findIndex(x=>x.properties.countryName===c.properties.countryName)===i).map(f=><button key={f.properties.id} onClick={()=>selectRecord({...f.properties,kind:'territory',title:f.properties.name,coordinates:f.properties.labelCoordinates})}><i style={{background:f.properties.color}}/>{f.properties.countryName}</button>)}</div><p>Historical reference borders use 23 August 1939. Occupation and disputed incorporation retain separate country identities. Detailed formations appear at closer zoom and are always available in the list. Communication lines are schematic period corridors, not claims about operational railheads, gauge or uninterrupted service.</p><p>{snapshots[active.date]?.precision} {!referenceOnly&&active.date>='1941-08-06'&&'Regional operational envelopes combine published reports and named localities. Connecting edges outside well-documented sectors have lower confidence; they are not a surveyed front.'}</p></details>
    {layers.changes&&<section className="territorial-change-list"><h3>Changes since the previous selected date</h3>{changes.filter(c=>c.snapshotDate===active.date).map(c=><p key={c.id}><b>{c.territory}:</b> {c.description}</p>)}</section>}
   </div>
   <aside className="atlas-panel">
    <section className="atlas-finder"><p className="eyebrow">Find on the map</p><label className="sr-only" htmlFor="atlas-search">Search countries, capitals, units and commanders</label><input id="atlas-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Country, city, unit or commander…"/>
     <div className="finder-tabs" role="group" aria-label="Map feature lists">{['formations','operations','countries','capitals','logistics','civilian'].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>{setTab(t);setQuery('');}}>{t[0].toUpperCase()+t.slice(1)}</button>)}</div>
     <p className="finder-count">{visibleRecords.length} {query?'matching features':'dated records'} · {active.label}</p><div className="finder-results">{visibleRecords.length?visibleRecords.map((r,i)=><button key={(r.id||r.title)+i} onClick={()=>selectRecord(r)}><span>{r.title}</span>{r.commander&&<small>{r.commander}</small>}{r.parentFormation&&<small>{r.parentFormation}</small>}{r.kind==='territory'&&<small>{r.alignmentLabel}</small>}</button>):<p>No matching feature on this date.</p>}</div>
    </section>
    {selected&&<section className="feature-detail" aria-live="polite"><div className="feature-heading"><p className="eyebrow">Selected map feature</p><button aria-label="Close feature details" onClick={()=>setSelected(null)}>×</button></div><h2>{selected.title}</h2><dl>{[['Reference period',selected.referenceOnly?selected.referencePeriod:undefined],['Situation date',selected.referenceOnly?undefined:selected.selectedDate||selected.observationDate||active.date],['Observed / reported date',selected.observationDate],['Movement interval',selected.movementStart?`${selected.movementStart} to ${selected.movementEnd}`:undefined],['Outcome',selected.outcome],['Reporting time',selected.reportingTime],['Commander',selected.commander],['Formation',selected.echelon],['Parent command',selected.parentFormation],['Actor',selected.actor],['Position means',selected.locationType],['Evidence',selected.evidenceStatus],['Authority',selected.militaryControl],['Sovereignty',selected.sovereigntyStatus],['Administration',selected.occupationAdministration],['Claim',selected.annexationClaim],['Alignment',selected.alignmentLabel||selected.politicalAlignment]].filter(([,v])=>v).map(([k,v])=><React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl><p>{selected.note}</p>{selected.uncertainty&&<p className="accuracy-note">{selected.uncertainty}</p>}{unitSource.length>0&&<><h3>Feature sources</h3><ul>{unitSource.map(id=>{const s=sources.find(x=>x.id===id);return s&&<li key={id}><a href={s.url} target="_blank" rel="noreferrer">{s.institution}: {s.title} ↗</a>{selectedLocators[id]?.length>0&&<p className="source-locators">{selectedLocators[id].join(' · ')}</p>}</li>;})}</ul></>}</section>}
    <details className="atlas-date-study" open><summary>{active.label} · {study?.status==='ready-for-review'?'review draft':study?.status==='research-brief'?'research brief':'historical study'}</summary><h2>{active.title}</h2><p>{active.summary}</p><Link to={`/articles/${active.articleSlug}?${studyParams}`}>{study?.status==='ready-for-review'?'Read the full review draft':study?.status==='research-brief'?'Read the research brief':'Read the historical study'} →</Link><h3>Sources for this date</h3><ul>{active.sourceIds.map(id=>{const s=sources.find(x=>x.id===id);return s&&<li key={id}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a></li>;})}</ul></details>
   </aside>
  </div>
 </div>;
}
