
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import {
  Sparkles, Plane, Utensils, ShoppingBag, WalletCards, Shirt, Wrench, Search,
  Send, Loader2, MapPin, Star, AlertTriangle, ExternalLink, History, Trash2,
  UserRound, Store, CalendarDays, SlidersHorizontal, Info, RotateCcw,
  CheckCircle2, ShieldCheck, Wand2, Target, ChevronRight, MapPinned, ArrowLeft,
  ClipboardCheck, FileText, Upload, ThumbsUp, ThumbsDown, Zap, MessageSquare, Eye
} from 'lucide-react';
import {
  categories, categoryConfig, defaultNeedFor, defaultProfile, initialForm,
  makePrompt, needsBuyingMap, popularLocations, scoreOptions, usesPrimaryMap,
  profileCompleteness, makeProfileTags, tripDayCount, addDaysISO
} from './engine.js';

const LS_PROFILE = 'secondself.profile.v30';
const LS_HISTORY = 'secondself.history.v30';
const LS_FORM = 'secondself.form.v30';
const LS_FEEDBACK = 'secondself.feedback.v30';
const iconMap = { travel: Plane, food: Utensils, shopping: ShoppingBag, money: WalletCards, style: Shirt, local: Wrench };
const TODAY_ISO = new Date().toISOString().slice(0,10);

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
function load(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v))}

const actionCards = [
  {id:'check', icon:ShieldCheck, title:'Check something', short:'Before I commit', text:'Paste or upload a quote, booking, product, provider, or plan. Get the safest next move.'},
  {id:'compare', icon:SlidersHorizontal, title:'Compare choices', short:'I have options', text:'Paste 2–5 choices. See the best fit, when to choose another, and what to verify.'},
  {id:'find', icon:Search, title:'Find options', short:'I need options', text:'Use this only when you do not have choices yet. Results should be checked before committing.'}
];
const actionCategoryMap = {
  find: ['travel','food','shopping','style','local'],
  compare: ['travel','food','shopping','style','local','money'],
  check: ['money','travel','shopping','local','style','food']
};
function actionTitle(a){return actionCards.find(x=>x.id===a)?.title || 'Choose action'}

function App(){
  const [tab,setTab]=useState('ask');
  const [flow,setFlow]=useState(()=>load(LS_FORM,{...initialForm, action:null, category:null}));
  const [profile,setProfile]=useState(()=>load(LS_PROFILE, defaultProfile));
  const [history,setHistory]=useState(()=>load(LS_HISTORY, []));
  const [feedback,setFeedback]=useState(()=>load(LS_FEEDBACK, []));
  const [result,setResult]=useState(null);
  const [selected,setSelected]=useState(0);
  const [selectedBuy,setSelectedBuy]=useState(0);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [locSuggestions,setLocSuggestions]=useState(popularLocations.slice(0,8));
  const [smartText,setSmartText]=useState('');

  const form = flow;
  const cfg = form.category ? categoryConfig[form.category] : null;
  const prompt = useMemo(()=> form.action && form.category ? makePrompt(form) : '', [form]);
  const completeness = profileCompleteness(profile);
  const profileMode = completeness >= 70 ? 'personalized' : completeness >= 35 ? 'partly personalized' : 'basic';
  const currentStep = !form.action ? 1 : !form.category ? 2 : 3;

  useEffect(()=>save(LS_FORM, flow),[flow]);
  useEffect(()=>save(LS_PROFILE, profile),[profile]);
  useEffect(()=>save(LS_HISTORY, history),[history]);
  useEffect(()=>save(LS_FEEDBACK, feedback),[feedback]);

  useEffect(()=>{
    let cancel=false;
    async function runSuggest(){
      const q=form.location?.trim();
      if(!q || q.length<2){ setLocSuggestions(popularLocations.slice(0,8)); return; }
      const local = popularLocations.filter(x=>x.toLowerCase().includes(q.toLowerCase())).slice(0,8);
      setLocSuggestions(local.length?local:popularLocations.slice(0,8));
      try{
        const r=await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        if(r.ok){ const data=await r.json(); if(!cancel && data.suggestions?.length) setLocSuggestions(data.suggestions); }
      }catch{}
    }
    const t=setTimeout(runSuggest,250); return ()=>{cancel=true; clearTimeout(t)};
  },[form.location]);

  function applySmartIntake(){
    const text = smartText.trim();
    if(!text){ setError('Type what you want help with first.'); return; }
    const s=text.toLowerCase();
    let action='find';
    if(/compare|option\s*a|option\s*b|\bvs\b| versus /.test(s)) action='compare';
    if(/check|audit|quote|invoice|bill|before i pay|before paying|is this fair|overpriced|inflated|should i book|should i buy|should i hire/.test(s)) action='check';
    let category='travel';
    if(/restaurant|food|dinner|lunch|brunch|cafe|coffee|eat/.test(s)) category='food';
    else if(/wear|outfit|style|clothes|shoes|dress|interview outfit|look/.test(s)) category='style';
    else if(/laptop|phone|buy|purchase|product|amazon|gift|suitcase|appliance/.test(s)) category='shopping';
    else if(/provider|technician|contractor|plumber|electrician|hvac|ac repair|cleaner|moving|service/.test(s)) category='local';
    else if(/quote|invoice|bill|estimate|repair cost|fee|warranty|itemized/.test(s)) category='money';
    else if(/hotel|trip|travel|destination|vacation|stay|resort|book/.test(s)) category='travel';
    let travelMode='hotel';
    if(/plan.*trip|itinerary|\d+\s*[- ]?day/.test(s)) travelMode='itinerary';
    if(/destination|where should we go|where to go/.test(s)) travelMode='destination';
    
    let shoppingMode=/store|mall|boutique|shopping places|nearby/.test(s)?'places':'products';
    let moneyMode= action==='find' || /find.*provider|technician|contractor|near me/.test(s) ? 'find':'review';
    let budget='balanced';
    if(/cheap|budget|least expensive|low cost|not expensive|affordable/.test(s)) budget='budget';
    if(/premium|nice|comfort|quality/.test(s)) budget='premium';
    if(/luxury|high end|best hotel|5 star|five star/.test(s)) budget='luxury';
    const foundLoc = popularLocations.find(l=>s.includes(l.toLowerCase()) || s.includes(l.split(',')[0].toLowerCase()));
    const locMatch = text.match(/(?:in|near|around)\s+([A-Za-z .'-]+?)(?:\s+for|\s+with|\s+that|\s+and|\?|,|$)/i);
    const location = foundLoc || (locMatch ? locMatch[1].trim() : initialForm.location);
    const vibe=[];
    const add=(word,rx)=>{ if(rx.test(s) && !vibe.includes(word)) vibe.push(word); };
    add('Quiet',/quiet|calm|not noisy|not too loud/);
    add('Walkable',/walkable|walking|near food|close to/);
    add('Family-friendly',/family|kids|children/);
    add('Good food nearby',/food nearby|restaurants nearby|good food/);
    add('Great value',/value|affordable|not expensive|budget/);
    add('Premium quality',/premium|quality|nice/);
    add('No surprise fees',/no surprise|hidden fees|transparent/);
    add('Written quote',/written quote|itemized|estimate/);
    add('Comfortable',/comfortable|comfort/);
    const days=s.match(/(\d+)\s*[- ]?day/);
    let need=defaultNeedFor(category, category==='travel'?travelMode:category==='shopping'?shoppingMode:category==='money'?moneyMode:undefined);
    if(category==='travel' && travelMode==='itinerary' && days) need=`${days[1]}-day trip plan`;
    if(category==='money' && /ac|hvac/.test(s)) need='AC repair quote';
    if(category==='local' && /ac|hvac/.test(s)) need='AC repair provider';
    const allowed=actionCategoryMap[action] || [];
    if(!allowed.includes(category)){
      if(category==='money' && action==='find') category='local';
      else if(action==='check' && category==='food') category='food';
      else if(action==='compare') category='shopping';
    }
    const cfg=categoryConfig[category];
    setFlow(prev=>({
      ...prev,
      action,
      category,
      travelMode,
      shoppingMode,
      moneyMode,
      need,
      location,
      budget,
      vibe: vibe.length ? vibe.slice(0,4) : (cfg?.chips||[]).slice(0,3),
      details: action==='compare' ? text : (action==='check' ? text : prev.details || '')
    }));
    setResult(null); setError('');
  }

  function resetHome(){ setFlow({...initialForm, action:null, category:null}); setResult(null); setSelected(0); setSelectedBuy(0); setTab('ask'); window.scrollTo({top:0,behavior:'smooth'}); }
  function selectAction(action){
    setFlow(prev=>{
      let next={...prev, action, category:null};
      if(action==='check') next={...next, moneyMode:'review', need:'quote or bill', details:''};
      if(action==='compare') next={...next, details:'Option A: \nOption B: '};
      return next;
    });
    setResult(null); setError('');
  }
  function selectCategory(id){
    const nextCfg=categoryConfig[id];
    setFlow(prev=>{
      let next={...prev, category:id, vibe:(nextCfg?.chips||[]).slice(0,3), details:prev.action==='compare'?'Option A: \nOption B: ':''};
      const mode = id==='travel' ? next.travelMode : id==='shopping' ? next.shoppingMode : id==='money' ? next.moneyMode : undefined;
      next.need = defaultNeedFor(id, mode);
      if(prev.action==='check' && id==='money') next.moneyMode='review';
      if(prev.action==='find' && id==='money') next.moneyMode='find';
      return next;
    });
    setResult(null); setError('');
  }
  function update(obj){ setFlow(prev=>({ ...prev, ...obj })); }
  function toggleChip(x){setFlow(p=>({ ...p, vibe:p.vibe.includes(x)?p.vibe.filter(v=>v!==x):[...p.vibe,x] }))}
  function goBack(){ if(currentStep===3){ setFlow(p=>({...p, category:null})); setResult(null); } else if(currentStep===2){ setFlow(p=>({...p, action:null, category:null})); } }
  function handleUpload(file){
    if(!file) return;
    const name=file.name;
    if(file.type.startsWith('text/') || name.toLowerCase().endsWith('.txt')){
      const reader=new FileReader();
      reader.onload=()=>update({details:`Uploaded quote/text: ${name}\n${reader.result}`});
      reader.readAsText(file);
    } else update({details:`Uploaded file: ${name}. Paste key details here: itemized charges, parts, labor, warranty, fees, provider notes.`});
  }
  function handleDateFrom(value){
    setFlow(p=>{
      const next={...p,dateFrom:value};
      if(p.category==='travel' && value && (!p.dateTo || p.dateTo < value)){
        const offset = p.travelMode==='itinerary' ? tripDayCount(p)-1 : 1;
        next.dateTo=addDaysISO(value, offset);
      } else if(p.dateTo && value && p.dateTo < value){ next.dateTo=value; }
      return next;
    });
  }
  function handleDateTo(value){ setFlow(p=>({...p, dateTo: p.dateFrom && value < p.dateFrom ? p.dateFrom : value })); }

  function missingRequiredDetails(){
    if(form.category === 'travel' && ['hotel','destination','itinerary'].includes(form.travelMode)){
      if(!form.dateFrom) return 'Please select a start date before running travel results.';
      if(!form.dateTo) return 'Please select an end date before running travel results.';
      if(form.dateTo < form.dateFrom) return 'End date cannot be before the start date.';
    }
    if(form.action === 'compare'){
      const raw = String(form.details||'').trim();
      const optionCount = (raw.match(/(?:^|\n)\s*(?:option\s*)?[A-Da-d1-6]\s*[:.)-]/g)||[]).length;
      const lineCount = raw.split(/\n|;|\|/).map(x=>x.trim()).filter(Boolean).length;
      if(!raw || Math.max(optionCount, lineCount) < 2) return 'Add at least two real options before comparing.';
    }
    if(form.action === 'check' && form.category === 'money' && form.moneyMode !== 'find'){
      const hasAmount = String(form.amount||'').trim().length > 0;
      const hasDetails = String(form.details||'').trim().length > 20;
      if(!hasAmount && !hasDetails) return 'Add the quote amount or paste/upload quote details before running Quote Audit.';
    }
    if((form.category === 'food' || form.category === 'local' || (form.category==='shopping' && form.shoppingMode==='places') || (form.category==='money' && form.moneyMode==='find')) && !String(form.location||'').trim()){
      return 'Add a location so map/place results can be relevant.';
    }
    return '';
  }

  async function run(){
    const validationMessage = missingRequiredDetails();
    if(validationMessage){ setError(validationMessage); return; }
    setLoading(true); setError(''); setResult(null);
    try{
      const r=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({form,prompt,profile})});
      const data=r.ok ? await r.json() : {error:'Search failed'};
      if(!r.ok) throw new Error(data.error || 'Search failed');
      const ranked=scoreOptions({form, options:data.options||[], profile});
      const buyPlaces=data.buyPlaces?.length ? scoreOptions({form:{...form, category:'local'}, options:data.buyPlaces, profile}) : [];
      const final={id:Date.now(), form, prompt, ranked, buyPlaces, live:data.live, buyLive:data.buyLive, placeMode:data.placeMode, flightNote:data.flightNote, note:data.note, profileMode, profileCompleteness: completeness, createdAt:new Date().toISOString()};
      setResult(final); setSelected(0); setSelectedBuy(0); setHistory(h=>[final,...h].slice(0,30));
      setTimeout(()=>document.getElementById('results')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    }catch(e){setError(e.message||'Something went wrong')}
    finally{setLoading(false)}
  }
  function loadHist(item){setFlow(item.form); setResult(item); setSelected(0); setSelectedBuy(0); setTab('ask'); setTimeout(()=>document.getElementById('results')?.scrollIntoView({behavior:'smooth',block:'start'}),50)}
  function recordFeedback(label){
    const chosen=result?.ranked?.[selected];
    setFeedback(f=>[{id:Date.now(), label, result: chosen?.name, category: result?.form?.category, action: result?.form?.action, createdAt:new Date().toISOString()},...f].slice(0,100));
    const rawTags=Array.isArray(chosen?.tags)?chosen.tags:String(chosen?.tags||'').split(/[, ]+/);
    const useful=rawTags.map(x=>String(x).trim().toLowerCase()).filter(x=>x.length>3 && !['google_places','fallback','travel','food','style','local','money','shopping'].includes(x)).slice(0,4);
    if(['Loved it','Good fit','Would choose again'].includes(label)){
      setProfile(p=>({...p, learnedLikes:[...new Set([...(p.learnedLikes||[]),...useful])].slice(-20)}));
    }
    const avoidMap={'Too expensive':['overpriced','expensive'],'Too noisy':['very noisy','loud'],'Too far':['too far','long travel time'],'Not my style':['not my style'],'Too stressful':['too stressful','rushed'],'Would avoid':['avoid similar option']};
    if(avoidMap[label]) setProfile(p=>({...p, learnedAvoid:[...new Set([...(p.learnedAvoid||[]),...avoidMap[label],...useful.slice(0,2)])].slice(-20)}));
  }

  return <div className="app">
    <header className="topbar"><button className="brand" onClick={resetHome} title="Go home"><span><Sparkles size={18}/></span><b>SecondSelf</b></button><nav><button className={tab==='ask'?'active':''} onClick={()=>setTab('ask')}>Ask</button><button className={tab==='profile'?'active':''} onClick={()=>setTab('profile')}>Profile</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>History</button></nav></header>
    {tab==='ask' && <main className="page guidedPage">
      <section className="hero simpleHero missionHero"><div><div className="eyebrow"><ShieldCheck size={14}/> Check before you commit</div><h1>Check before you commit.</h1><p>SecondSelf gives one practical next move before you book, buy, hire, or pay. No long advice lists. No fake certainty.</p></div><ProfileNudge completeness={completeness} setTab={setTab}/></section>
      <StepBar step={currentStep} action={form.action} category={form.category}/>
      {currentStep>1 && <button className="backBtn" onClick={goBack}><ArrowLeft size={16}/> Back</button>}
      {currentStep===1 && <ActionStep selectAction={selectAction}/>} 
      {currentStep===2 && <CategoryStep action={form.action} selectCategory={selectCategory}/>} 
      {currentStep===3 && <DetailStep form={form} cfg={cfg} update={update} locSuggestions={locSuggestions} handleDateFrom={handleDateFrom} handleDateTo={handleDateTo} handleUpload={handleUpload} toggleChip={toggleChip} prompt={prompt} loading={loading} run={run} error={error} profileMode={profileMode}/>} 
      {result && <Results result={result} selected={selected} setSelected={setSelected} selectedBuy={selectedBuy} setSelectedBuy={setSelectedBuy} recordFeedback={recordFeedback}/>} 
    </main>}
    {tab==='profile' && <Profile profile={profile} setProfile={setProfile} setTab={setTab}/>} {tab==='history' && <HistoryView history={history} loadHist={loadHist} clear={()=>{setHistory([]);localStorage.removeItem(LS_HISTORY)}}/>}
  </div>
}

function ProfileNudge({completeness,setTab}){return <div className="profileNudge"><div className="meter"><span style={{width:`${completeness}%`}}/></div><div><b>{completeness}% profile built</b><p>{completeness<70?'Build profile for sharper rankings.':'Profile ready. Results are personalized.'}</p></div><button onClick={()=>setTab('profile')}>{completeness<70?'Build profile':'Edit profile'} <ChevronRight size={15}/></button></div>}
function StepBar({step,action,category}){return <div className="stepBar"><div className={step>=1?'done':''}><span>1</span><b>Choose action</b></div><div className={step>=2?'done':''}><span>2</span><b>{action?actionTitle(action):'Choose category'}</b></div><div className={step>=3?'done':''}><span>3</span><b>{category?categoryConfig[category]?.label||category:'Add details'}</b></div></div>}
function PromiseStrip(){return <section className="promiseStrip"><div><Zap size={18}/><b>Red flags</b><span>hidden fees, missing warranty, strict terms</span></div><div><MessageSquare size={18}/><b>Ask-this message</b><span>ready-to-send questions before paying</span></div><div><Eye size={18}/><b>Honest limits</b><span>what is verified vs what still needs checking</span></div></section>}
function ActionStep({selectAction}){return <section className="panel stepPanel cleanActionStep"><div className="stepIntro"><h2>What do you need?</h2><p>Pick one path. Start with checking or comparing; finding options is secondary.</p></div><div className="actionGrid">{actionCards.map(card=>{const I=card.icon;return <button key={card.id} className="actionCard" onClick={()=>selectAction(card.id)}><div className="actionIcon"><I size={24}/></div><small>{card.short}</small><h3>{card.title}</h3><p>{card.text}</p><span>Continue <ChevronRight size={16}/></span></button>})}</div></section>}
function CategoryStep({action,selectCategory}){const ids=actionCategoryMap[action]||categories.map(c=>c.id); return <section className="panel stepPanel"><div className="stepIntro"><h2>What are you deciding about?</h2><p>{categoryHelp(action)}</p></div><div className="cleanCatGrid">{categories.filter(c=>ids.includes(c.id)).map(c=>{const I=iconMap[c.id];return <button key={c.id} className="cleanCat" onClick={()=>selectCategory(c.id)}><I size={22}/><div><b>{c.label}</b><small>{categoryLine(action,c.id,c.hint)}</small></div><ChevronRight size={18}/></button>})}</div></section>}
function categoryHelp(action){ if(action==='find') return 'Choose what kind of options you need. Use this only when you do not already have choices.'; if(action==='compare') return 'Choose the type of choices you want to compare.'; return 'Choose what you want to check before spending money or committing.'; }
function categoryLine(action,id,hint){ if(action==='check'&&id==='money') return 'Audit a quote, bill, or invoice before paying'; if(action==='check') return 'Check fit, risk, and questions before committing'; if(action==='compare') return 'Compare exact options you already have'; return hint; }

function DetailStep({form,cfg,update,locSuggestions,handleDateFrom,handleDateTo,handleUpload,toggleChip,prompt,loading,run,error,profileMode}){
  const needsQuoteUpload = form.action==='check' && form.category==='money' && form.moneyMode!=='find';
  return <section className="panel detailPanel directDetailsPanel">
    <div className="formHead compactConfirmHead">
      <div>
        <div className="eyebrow"><Target size={14}/> {actionTitle(form.action)} · {cfg.label || form.category}</div>
        <h2>Add the essentials.</h2>
        <p>Only add details that change the decision: dates, location, budget, must-haves, quote text, or options.</p>
      </div>
      <SmartBadge form={form} mode={profileMode}/>
    </div>

    <div className="coreDetailsBlock">
      <div className="sectionTitle slimTitle"><SlidersHorizontal size={17}/><h3>Core details</h3><span>choose or edit</span></div>
      <DynamicFields form={form} update={update} locSuggestions={locSuggestions} handleDateFrom={handleDateFrom} handleDateTo={handleDateTo} handleUpload={handleUpload}/>
    </div>

    <div className="chips directChipBlock"><label>Must-have</label><p className="microcopy">Tap the few signals that matter most.</p><div>{cfg.chips.map(x=><button type="button" key={x} className={form.vibe.includes(x)?'chip on':'chip'} onClick={()=>toggleChip(x)}>{x}</button>)}</div></div>

    <label className="full compactTextarea"><span>{form.action==='compare'?'Paste your options':form.action==='check'?'Paste what you want reviewed':'Optional notes'} <em>{form.action==='find'?'optional':'recommended'}</em></span><textarea value={form.details} onChange={e=>update({details:e.target.value})} placeholder={placeholderFor(form)}/></label>

    {needsQuoteUpload && <label className="uploadBox compactUpload"><Upload size={18}/><span>Upload quote / note / text file</span><input type="file" onChange={e=>handleUpload(e.target.files?.[0])}/></label>}

    <div className="preview compactPreview"><Sparkles size={15}/><span>{prompt}</span></div>
    <div className="actions"><button className="primary" disabled={loading} onClick={run}>{loading?<Loader2 className="spin" size={18}/>:<Send size={18}/>} {ctaLabel(form)}</button><button className="soft" onClick={()=>update({details:'', vibe:(cfg.chips||[]).slice(0,3)})}><RotateCcw size={15}/> Clear refinements</button>{error&&<span className="error"><AlertTriangle size={15}/>{error}</span>}</div>
  </section>
}
function ParsedSummary({form,update}){
  const items=[
    ['Action', actionTitle(form.action)],
    ['Category', categoryConfig[form.category]?.label || form.category],
    form.category==='travel' ? ['Mode', form.travelMode==='hotel'?'Hotels / stays':form.travelMode==='itinerary'?'Plan my trip':'Destinations'] : null,
    form.category==='shopping' ? ['Mode', form.shoppingMode==='places'?'Stores / places':'Products'] : null,
    form.category==='money' ? ['Mode', form.moneyMode==='find'?'Find provider':'Audit quote / bill'] : null,
    form.location ? ['Location', form.location] : ['Location','Add if relevant'],
    (form.dateFrom||form.dateTo) ? ['Dates', `${form.dateFrom||'Start'} → ${form.dateTo||'End'}`] : (form.category==='travel'?['Dates','Needed before results']:null),
    ['Budget', form.budget],
    ['For', form.forWho],
    form.need ? ['Need', form.need] : null
  ].filter(Boolean);
  return <div className="understoodCard"><div className="understoodHead"><div><div className="eyebrow"><Wand2 size={14}/> We understood this</div><h3>Confirm the extracted details</h3></div><button className="soft smallSoft" onClick={()=>update({action:null, category:null})}><RotateCcw size={14}/> Start over</button></div><div className="summaryPills">{items.map(([k,v])=><div key={k} className="summaryPill"><span>{k}</span><b>{v}</b></div>)}</div></div>
}
function QuickRefine({form,cfg,update,toggleChip}){
  const who=['solo','couple','couple or family','family with kids','work'];
  const budgets=['budget','balanced','premium','luxury'];
  return <div className="quickRefine"><div className="sectionTitle slimTitle"><SlidersHorizontal size={17}/><h3>Quick refine</h3><span>tap only what matters</span></div>
    <div className="quickRows">
      <div className="quickGroup"><label>For</label><div>{who.map(x=><button key={x} type="button" className={form.forWho===x?'chip on':'chip'} onClick={()=>update({forWho:x})}>{x}</button>)}</div></div>
      <div className="quickGroup"><label>Budget</label><div>{budgets.map(x=><button key={x} type="button" className={form.budget===x?'chip on':'chip'} onClick={()=>update({budget:x})}>{x}</button>)}</div></div>
      <div className="quickGroup fullQuick"><label>Must-have</label><div>{(cfg.chips||[]).map(x=><button type="button" key={x} className={form.vibe.includes(x)?'chip on':'chip'} onClick={()=>toggleChip(x)}>{x}</button>)}</div></div>
    </div>
  </div>
}
function detailSubtitle(form,cfg){ if(form.action==='compare') return 'Paste 2–5 real options. The result will be a clear winner, tradeoffs, and what to verify.'; if(form.action==='check') return 'Review before you commit. The result will flag risk, missing details, and the exact next step.'; return cfg.subtitle; }
function SmartBadge({form,mode}){ if(usesPrimaryMap(form)) return <span className="badge"><MapPin size={14}/> Map results</span>; if(needsBuyingMap(form)) return <span className="badge"><Store size={14}/> Where to buy</span>; return <span className="badge"><Target size={14}/> {mode}</span> }
function DynamicFields({form,update,locSuggestions,handleDateFrom,handleDateTo}){ const cfg=categoryConfig[form.category]; return <div className="gridFields">
  {cfg.fields.includes('travelMode')&&<label><span>Travel type</span><select value={form.travelMode} onChange={e=>update({travelMode:e.target.value, need:defaultNeedFor('travel',e.target.value)})}><option value="hotel">Hotels / stays</option><option value="itinerary">Plan my trip</option><option value="destination">Destinations</option></select></label>}
  {cfg.fields.includes('shoppingMode')&&<label><span>Shopping type</span><select value={form.shoppingMode} onChange={e=>update({shoppingMode:e.target.value, need:defaultNeedFor('shopping',e.target.value)})}><option value="products">Products</option><option value="places">Stores / places</option></select></label>}
  {cfg.fields.includes('moneyMode')&&<label className="modeLabel"><span>Quote Audit mode</span><select value={form.moneyMode||'review'} onChange={e=>update({moneyMode:e.target.value, need:e.target.value==='find'?'AC repair provider':'AC repair quote'})}><option value="review">Audit quote / bill</option><option value="find">Find provider</option></select><small className="hint">Audit mode checks whether to approve, question, compare, or pause. Find mode searches providers on a map.</small></label>}
  {cfg.fields.includes('need')&&<label><span>{needLabel(form)}</span><input value={form.need} onChange={e=>update({need:e.target.value})} placeholder={needPlaceholder(form)}/></label>}
  {cfg.fields.includes('occasion')&&<label><span>Occasion</span><input value={form.occasion} onChange={e=>update({occasion:e.target.value})} placeholder="travel, interview, dinner, wedding, work"/></label>}
  {(cfg.fields.includes('location')||cfg.fields.includes('locationOptional'))&&<label><span>Location {cfg.fields.includes('locationOptional')&&<em>optional</em>}</span><input list="location-suggestions" value={form.location} onChange={e=>update({location:e.target.value})} placeholder="Start typing: Miami Beach, Austin, near me"/><datalist id="location-suggestions">{locSuggestions.map(x=><option key={x} value={x}/>)}</datalist></label>}
  {cfg.fields.includes('dateRange')&&<div className="datePair"><label><span>{form.travelMode==='hotel'?'Check-in / start':'Start date'}</span><input type="date" min={TODAY_ISO} value={form.dateFrom} onChange={e=>handleDateFrom(e.target.value)}/></label><label><span>{form.travelMode==='hotel'?'Check-out / end':'End date'}</span><input type="date" min={form.dateFrom||TODAY_ISO} value={form.dateTo} onChange={e=>handleDateTo(e.target.value)}/></label></div>}
  {cfg.fields.includes('dateSingle')&&<label><span>Date</span><input type="date" min={TODAY_ISO} value={form.dateFrom} onChange={e=>handleDateFrom(e.target.value)}/></label>}
  {cfg.fields.includes('amount') && form.moneyMode!=='find' && <label><span>Amount</span><input value={form.amount} onChange={e=>update({amount:e.target.value})} placeholder="$780, $1,200, etc."/></label>}
  <label><span>For</span><select value={form.forWho} onChange={e=>update({forWho:e.target.value})}><option>solo</option><option>couple</option><option>couple or family</option><option>family with kids</option><option>work</option></select></label>
  <label><span>Budget</span><select value={form.budget} onChange={e=>update({budget:e.target.value})}><option>budget</option><option>balanced</option><option>premium</option><option>luxury</option></select></label>
</div>}
function needLabel(form){ if(form.category==='travel') return form.travelMode==='itinerary'?'Trip focus':'Looking for'; if(form.category==='style') return 'Style need'; if(form.category==='money') return form.moneyMode==='find'?'Service needed':'Quote / bill type'; return 'Looking for'}
function needPlaceholder(form){ if(form.category==='travel'&&form.travelMode==='itinerary') return '3-day family trip, romantic weekend, beach trip'; if(form.category==='shopping') return form.shoppingMode==='places'?'shopping places, mall, boutiques':'laptop, shoes, suitcase, gift'; if(form.category==='money') return form.moneyMode==='find'?'AC repair provider, plumber, electrician':'AC repair quote, medical bill, invoice'; if(form.category==='style') return 'outfit, shoes, travel look'; return 'hotel, restaurant, provider'}
function placeholderFor(form){ if(form.action==='compare') return 'Option A: name, price, location, pros/cons\nOption B: name, price, location, pros/cons\nOption C: optional'; if(form.category==='travel'&&form.travelMode==='itinerary') return 'Add pace, interests, must-see places, kids, food preferences, hotel area, transport, or mobility limits.'; if(form.category==='style') return 'Add weather, colors you like, dress code, sizes, or comfort needs.'; if(form.category==='money') return form.moneyMode==='find'?'Add issue, urgency, brand/model, preferred timing, and warranty details.':'Paste quote details: parts, labor, fees, warranty, exclusions, provider notes.'; if(form.category==='shopping') return 'Paste product names/links if you have them, or describe what matters.'; return 'Add area, parking, cancellation, noise, kid-friendly needs, etc.' }
function ctaLabel(form){ if(form.action==='compare') return 'Compare options'; if(form.action==='check') return 'Check before committing'; if(form.category==='travel'&&form.travelMode==='itinerary') return 'Plan trip'; return 'Find best options'; }


function CommitVerdictHero({option,result}){
  const red=(option.redFlags||[]).slice(0,2);
  const missing=(option.missingInfo||[]).slice(0,2);
  const verify=(option.notVerified||[]).slice(0,2);
  const action=option.commitAction || option.nextStep || 'Verify the key details before committing.';
  const label=option.commitLabel || option.verdict || 'Review';
  const important=[...red.map(x=>({kind:'Risk',text:x})),...missing.map(x=>({kind:'Need',text:x})),...verify.map(x=>({kind:'Verify',text:x}))].slice(0,3);
  return <div className="commitVerdictHero leanVerdict compactVerdict">
    <div className="verdictMain"><div className="eyebrow"><Zap size={14}/> Best move</div><h2>{action}</h2></div>
    <div className="verdictScore"><b>{option.commitScore || option.score}</b><span>{label}</span></div>
    <div className="verdictChecklist">
      {important.length?important.map((x,i)=><div key={i}><span>{x.kind}</span><b>{x.text}</b></div>):<div><span>Verify</span><b>Final price, availability, terms, and recent reviews before committing.</b></div>}
    </div>
  </div>
}
function Results({result,selected,setSelected,selectedBuy,setSelectedBuy,recordFeedback}){
  const [showCompare,setShowCompare]=useState(false);
  const [reportStatus,setReportStatus]=useState('');
  const best=result.ranked?.[selected] || result.ranked?.[0];
  const hasMap=usesPrimaryMap(result.form);
  const buyMap=needsBuyingMap(result.form) && result.buyPlaces?.length;
  const comparable=result.ranked?.length>1;
  return <section id="results" className="panel results">
    {best && <CommitVerdictHero option={best} result={result}/>}
    <LiveDataNotice result={result}/>
    {hasMap && <><MapBlock options={result.ranked} selected={selected} setSelected={setSelected}/><PinnedCount options={result.ranked}/></>}

    <div className="resultTools">
      {comparable && <button className={showCompare?'toolBtn active':'toolBtn'} onClick={()=>setShowCompare(v=>!v)}><SlidersHorizontal size={16}/>{showCompare?'Hide comparison':'Compare these'}</button>}
    </div>

    {showCompare && <ComparePanel options={result.ranked.slice(0,4)} setSelected={setSelected}/>} 

    <OptionList options={result.ranked} selected={selected} setSelected={setSelected}/>
    {best && <OutputCard option={best}/>} 
    {buyMap && <section className="buyMap"><div className="sectionTitle"><Store size={17}/><h3>Where to buy nearby</h3></div><MapBlock options={result.buyPlaces} selected={selectedBuy} setSelected={setSelectedBuy}/><OptionList options={result.buyPlaces} selected={selectedBuy} setSelected={setSelectedBuy} compact/></section>}
    {best?.buyOptions?.length>0 && <BuyLinks links={best.buyOptions}/>} 
    <FeedbackPanel recordFeedback={recordFeedback}/>
  </section>
}


function LiveDataNotice({result}){
  const live=result?.live;
  const form=result?.form||{};
  const msg=live
    ? 'Live place data was used where available. Exact price, availability, fees, and terms still need verification.'
    : (form.action==='find' ? 'No live pricing source is connected. Treat results as a shortlist, then verify current price, availability, fees, and terms.' : 'This is based on your pasted/details input. Verify final terms before committing.');
  return <div className={live?'liveNotice ok':'liveNotice'}><Info size={16}/><span>{msg}</span></div>
}

function ConfidencePanel({result,selected}){
  const best=result.ranked?.[selected] || result.ranked?.[0] || {};
  let points=45;
  const reasons=[];
  if(result.form?.location){points+=12; reasons.push('location provided')}
  if(result.form?.dateFrom){points+=10; reasons.push('date context provided')}
  if(result.form?.details && result.form.details.length>25){points+=12; reasons.push('extra details provided')}
  if(result.form?.action==='compare' && /Option\s*A/i.test(result.form.details||'') && /Option\s*B/i.test(result.form.details||'')){points+=14; reasons.push('real options pasted')}
  if(result.form?.action==='check' && ((result.form.details||'').length>35 || result.form.amount)){points+=14; reasons.push('quote/check details provided')}
  if(result.live){points+=12; reasons.push('live place data used')}
  if(result.profileCompleteness>=70){points+=10; reasons.push('strong profile')}
  if((best.cautions||[]).some(x=>/missing|hidden|verify|unknown/i.test(x))) points-=8;
  points=Math.max(25,Math.min(95,Math.round(points)));
  const label=points>=80?'High':points>=60?'Medium':'Low';
  return <div className={`confidenceBox ${label.toLowerCase()}`}><Info size={16}/><div><b>Confidence: {label}</b><p>{reasons.length?`Based on ${reasons.slice(0,4).join(', ')}.`:'Add more details for a sharper recommendation.'} {label!=='High'?'Paste exact options, links, quote details, dates, or final prices to improve confidence.':''}</p></div></div>
}

function ScoreExplainer(){
  return <div className="scoreExplainer lean"><Info size={16}/><div><b>Fit score</b><p>Not a live price or star rating. It reflects profile match, budget fit, must-haves, risks, and known details.</p></div></div>
}
function ComparePanel({options,setSelected}){
  return <div className="comparePanel">
    <div className="sectionTitle compactTitle"><SlidersHorizontal size={17}/><h3>Quick comparison</h3><span>Top {options.length}</span></div>
    <div className="compareGrid">
      {options.map((o,i)=><button key={i} className="compareCard" onClick={()=>setSelected(i)}>
        <div className="compareRank">#{i+1}</div>
        <h4>{o.name}</h4>
        <div className="compareScore">{o.score}/100 · {o.verdict}</div>
        <p>{o.recommendation || o.nextStep || 'Compare based on fit, risk, value, and location.'}</p>
        <ul>
          {(o.pros||[]).slice(0,2).map((x,j)=><li key={j}>{x}</li>)}
          {(o.cautions||[]).slice(0,1).map((x,j)=><li key={'c'+j} className="risk">{x}</li>)}
        </ul>
      </button>)}
    </div>
  </div>
}

function ComparisonInsight({options,selected}){
  const current=options?.[selected]||options?.[0];
  const next=options?.find((_,i)=>i!==selected);
  if(!current || !next) return null;
  const currentPros=(current.pros||[]).slice(0,2);
  const nextPros=(next.pros||[]).slice(0,1);
  return <div className="comparisonInsight"><SlidersHorizontal size={16}/><div><b>Why this option is ahead</b><p>{current.name} is currently ranked above {next.name} because it has stronger fit signals for your budget, profile, must-haves, or risk checks.</p><ul>{currentPros.map((x,i)=><li key={i}>{x}</li>)}</ul>{nextPros.length>0&&<p><b>{next.name} may still be better if:</b> {nextPros.join(' ')}</p>}</div></div>
}
function ScoreBreakdown({option}){
  const plus=option.scoreBreakdown?.plus||[];
  const minus=option.scoreBreakdown?.minus||[];
  if(!plus.length && !minus.length) return null;
  return <div className="breakdownBox"><div className="sectionTitle compactTitle"><Info size={17}/><h3>Why this score</h3><span>{option.score}/100</span></div><div className="breakdownGrid"><div><b>Raised score</b><ul>{plus.length?plus.map((x,i)=><li key={i}>{x}</li>):<li>No strong positive signal found.</li>}</ul></div><div><b>Lowered score</b><ul>{minus.length?minus.map((x,i)=><li key={i}>{x}</li>):<li>No major concern detected.</li>}</ul></div></div></div>
}

function Score({score=0}){return <div className="score"><b>{score}</b><small>/100</small></div>}
function PinnedCount({options}){const total=options.length; const pinned=options.filter(o=>Number.isFinite(o.lat)&&Number.isFinite(o.lng)).length; return <div className="pinCount"><MapPinned size={15}/> Pinned {pinned}/{total} results on map</div>}
function MapBlock({options,selected,setSelected}){ const pts=options.map((o,i)=>({...o,idx:i})).filter(o=>Number.isFinite(o.lat)&&Number.isFinite(o.lng)); if(!pts.length) return null; const active=pts.find(p=>p.idx===selected)||pts[0]; return <div className="mapCard"><MapContainer center={[active.lat,active.lng]} zoom={13} style={{height:'100%',width:'100%'}}><TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/><Recenter lat={active.lat} lng={active.lng}/>{pts.map(p=><Marker key={p.idx} position={[p.lat,p.lng]} icon={markerIcon} eventHandlers={{click:()=>setSelected(p.idx)}}><Popup><div className="popup"><b>{p.name}</b><span>{p.score}/100 · {p.verdict}</span>{p.address&&<small>{p.address}</small>}{p.mapsUrl&&<a href={p.mapsUrl} target="_blank" rel="noreferrer">Open in Maps</a>}</div></Popup></Marker>)}</MapContainer></div>}
function Recenter({lat,lng}){const map=useMap(); useEffect(()=>{map.setView([lat,lng],map.getZoom(),{animate:true})},[lat,lng]); return null}
function OptionList({options,selected,setSelected,compact=false}){return <div className={compact?'optionList compact':'optionList'}><div className="sectionTitle"><SlidersHorizontal size={17}/><h3>{compact?'Nearby options':'Ranked options'}</h3><span>{options.length} shown · click to inspect</span></div>{options.map((o,i)=><button key={i} className={selected===i?'option active':'option'} onClick={()=>setSelected(i)}><div><b>#{i+1} {o.name}</b><small>{o.address || o.verdict}</small>{o.rating&&<small><Star size={13}/> {o.rating} {o.reviewCount?`(${Number(o.reviewCount).toLocaleString()})`:''}</small>}</div><span className="pill">{o.verdict} · {o.score}</span></button>)}</div>}
function OutputCard({option}){return <>
  <div className="practicalSummary">
    <div><span>Choose this if</span><p>{option.chooseThisIf}</p></div>
    <div><span>Regret warning</span><p>{option.regretPredictor}</p></div>
  </div>
  <div className="outputGrid leanGrid">
    <div className="outCard"><div className="eyebrow"><CheckCircle2 size={14}/> Why this works</div><ul>{(option.pros?.length?option.pros:['It fits the details you selected better than the other options.']).slice(0,4).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
    <div className="outCard"><div className="eyebrow warn"><AlertTriangle size={14}/> Check carefully</div><ul>{(option.redFlags?.length?option.redFlags:(option.cautions?.length?option.cautions:option.notVerified?.length?option.notVerified:['Final price, terms, and availability.'])).slice(0,4).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
  </div>
  <AskBeforeCommit option={option}/>
</>}
function AskBeforeCommit({option}){ const msg=option.askBeforeMessage||'Please confirm final cost, terms, and missing details before I commit.'; return <div className="askBefore"><div className="sectionTitle compactTitle"><FileText size={17}/><h3>Ask before you commit</h3><button className="copyMini" onClick={()=>navigator.clipboard?.writeText(msg)}>Copy message</button></div><p>{msg}</p></div> }
function ProofPanel({option}){ return <div className="proofPanel"><div><div className="eyebrow"><ClipboardCheck size={14}/> Evidence used</div><ul>{(option.evidence||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div><div><div className="eyebrow warn"><Info size={14}/> Not verified yet</div><ul>{(option.notVerified||[]).map((x,i)=><li key={i}>{x}</li>)}</ul></div>{option.missingInfo?.length>0&&<div><div className="eyebrow warn"><AlertTriangle size={14}/> Missing details</div><ul>{option.missingInfo.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}</div> }

function BuyLinks({links}){return <div className="buyLinks"><div className="sectionTitle"><Store size={17}/><h3>Where to buy online</h3></div>{links.map((l,i)=><a key={i} href={l.url} target="_blank" rel="noreferrer">{l.label}<ExternalLink size={14}/></a>)}</div>}

function makeDecisionReport(option,result){
  const form=result?.form||{};
  const lines=[];
  lines.push('SecondSelf Decision Passport');
  lines.push('');
  lines.push(`Decision: ${form.action || 'decision'} / ${form.category || 'category'}${form.travelMode?` / ${form.travelMode}`:''}`);
  lines.push(`Option: ${option?.name || 'Selected option'}`);
  lines.push(`Commit score: ${option?.commitScore ?? option?.score}/100 (${option?.commitLabel || option?.verdict || 'review'})`);
  lines.push(`Best move: ${option?.commitAction || option?.nextStep || 'Review before committing.'}`);
  lines.push('');
  if(option?.chooseThisIf) lines.push(`Choose this if: ${option.chooseThisIf}`);
  if(option?.regretPredictor) lines.push(`Regret warning: ${option.regretPredictor}`);
  if(option?.askBeforeMessage){ lines.push(''); lines.push('Ask before committing:'); lines.push(option.askBeforeMessage); }
  if(option?.redFlags?.length){ lines.push(''); lines.push('Red flags:'); option.redFlags.forEach(x=>lines.push(`- ${x}`)); }
  if(option?.missingInfo?.length){ lines.push(''); lines.push('Missing information:'); option.missingInfo.forEach(x=>lines.push(`- ${x}`)); }
  if(option?.notVerified?.length){ lines.push(''); lines.push('Not verified yet:'); option.notVerified.forEach(x=>lines.push(`- ${x}`)); }
  lines.push('');
  lines.push('Generated by SecondSelf. Verify live price, availability, and terms before committing.');
  return lines.join('\n');
}
function downloadText(filename,text){
  const blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
function DecisionPassport({option,result,selected,setReportStatus}){
  const form=result?.form||{};
  async function copyReport(){
    const text=makeDecisionReport(option,result);
    try{ await navigator.clipboard.writeText(text); setReportStatus('Decision Passport copied.'); }
    catch{ setReportStatus('Copy failed. Use download instead.'); }
    setTimeout(()=>setReportStatus(''),2200);
  }
  function downloadReport(){
    const safe=String(option?.name||'decision').replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'').slice(0,40)||'decision';
    downloadText(`SecondSelf_${safe}_passport.txt`, makeDecisionReport(option,result));
    setReportStatus('Decision Passport downloaded.');
    setTimeout(()=>setReportStatus(''),2200);
  }
  return <div className="passportBox">
    <div className="passportHead"><div><div className="eyebrow"><FileText size={14}/> Decision Passport</div><h3>Save the decision, not just the result.</h3><p>A short record of the choice, risks, questions, and next step you can copy, save, or send.</p></div><div className="passportActions"><button onClick={copyReport}><ClipboardCheck size={15}/> Copy</button><button onClick={downloadReport}><FileText size={15}/> Download</button></div></div>
    <div className="passportGrid">
      <div><span>Decision</span><b>{form.action || 'Review'} · {form.category || 'choice'}</b></div>
      <div><span>Current option</span><b>{option?.name}</b></div>
      <div><span>Best move</span><b>{option?.commitAction || option?.nextStep}</b></div>
      <div><span>Use before</span><b>{form.dateFrom || 'Before you book, buy, hire, or pay'}</b></div>
    </div>
  </div>
}
function ValueInnovationLayer({option,result}){
  const form=result?.form||{};
  const alternative=alternativeMove(form,option);
  const timeline=commitTimeline(form,option);
  return <div className="innovationGrid">
    <div className="innovationCard valueLens"><div className="eyebrow"><Target size={14}/> Value lens</div><h3>What this is really good for</h3><p>{valueLensText(form,option)}</p><ul>{valueLensBullets(form,option).map((x,i)=><li key={i}>{x}</li>)}</ul></div>
    <div className="innovationCard"><div className="eyebrow"><ShieldCheck size={14}/> Safer alternative path</div><h3>{alternative.title}</h3><p>{alternative.text}</p><button className="miniAction" onClick={()=>navigator.clipboard?.writeText(alternative.text)}>Copy next move</button></div>
    <div className="innovationCard wide"><div className="eyebrow"><CalendarDays size={14}/> Commit checklist</div><h3>3 steps before you commit</h3><div className="timelineSteps">{timeline.map((x,i)=><div key={i}><span>{i+1}</span><b>{x.title}</b><p>{x.text}</p></div>)}</div></div>
  </div>
}
function valueLensText(form,option){
  if(form.category==='travel'&&form.travelMode==='hotel') return 'A hotel choice is not just rating. It is total price, location, noise, fees, cancellation, and fit for your group.';
  if(form.category==='travel'&&form.travelMode==='itinerary') return 'A trip plan should protect energy and time, not just list attractions.';
  if(form.category==='money') return form.moneyMode==='find'?'A provider is only valuable if pricing, warranty, and scope are clear before they arrive.':'A quote is only safe when parts, labor, warranty, and exclusions are clear.';
  if(form.category==='local') return 'A provider is useful only if they can put scope, fee, timing, and warranty in writing.';
  if(form.category==='shopping') return 'A purchase is a good fit only if it matches your actual use, warranty, return policy, and price comfort.';
  if(form.category==='food') return 'A good restaurant choice depends on occasion, noise, timing, travel, menu fit, and price comfort.';
  if(form.category==='style') return 'A good look should match occasion, weather, comfort, and what you already like.';
  return 'The best option is the one that fits your situation and has fewer regret triggers.';
}
function valueLensBullets(form,option){
  const b=[];
  const cb=option?.commitBreakdown||{};
  if(cb.priceValue!==undefined) b.push(`Price/value safety: ${cb.priceValue}/100`);
  if(cb.hiddenFeeSafety!==undefined) b.push(`Hidden-risk safety: ${cb.hiddenFeeSafety}/100`);
  if(cb.regretSafety!==undefined) b.push(`Regret safety: ${cb.regretSafety}/100`);
  if(option?.missingInfo?.length) b.push(`Missing: ${option.missingInfo.slice(0,2).join(', ')}`);
  if(option?.redFlags?.length) b.push(`Red flag: ${option.redFlags[0]}`);
  return b.slice(0,4);
}
function alternativeMove(form,option){
  if((option?.commitScore||0)<65) return {title:'Do not commit yet', text:'Compare one safer alternative or get missing details in writing before you spend money.'};
  if(form.category==='travel') return {title:'Compare one quieter/value option', text:'Before booking, compare one nearby alternative with a similar location but better total price, cancellation, or quiet-fit.'};
  if(form.category==='money'&&form.moneyMode!=='find') return {title:'Ask for itemization first', text:'Send the itemization request first. If they cannot separate parts, labor, fees, and warranty, get another quote.'};
  if(form.category==='local'||(form.category==='money'&&form.moneyMode==='find')) return {title:'Contact two providers', text:'Use the same written scope with two providers so the quotes are comparable and harder to inflate.'};
  if(form.category==='shopping') return {title:'Compare one value and one premium option', text:'Do not buy only from popularity. Compare one cheaper option and one higher-quality option against warranty and return policy.'};
  if(form.category==='food') return {title:'Check availability and noise', text:'Before reserving, check recent reviews, noise, and reservation time. Pick a backup nearby.'};
  return {title:'Verify the biggest unknown', text:'Resolve the largest missing detail first, then decide.'};
}
function commitTimeline(form,option){
  if(form.category==='money'&&form.moneyMode!=='find') return [
    {title:'Before approval',text:'Ask for parts, labor, diagnostic fee, warranty, and exclusions in writing.'},
    {title:'Before payment',text:'Compare one second quote if the amount is high or scope is vague.'},
    {title:'After decision',text:'Save the quote, message, warranty, and outcome in your Decision Passport.'}
  ];
  if(form.category==='travel') return [
    {title:'Before booking',text:'Confirm final price, fees, cancellation, parking/transit, and location fit.'},
    {title:'Before travel',text:'Check recent reviews, route, weather, and reservation timing.'},
    {title:'After trip',text:'Mark what worked or failed so future rankings improve.'}
  ];
  return [
    {title:'Before committing',text:'Check final cost, terms, return/cancellation/warranty, and biggest regret risk.'},
    {title:'Before paying',text:'Ask the generated question or compare one alternative.'},
    {title:'After outcome',text:'Use feedback buttons so SecondSelf learns what fit you.'}
  ];
}
function FeedbackPanel({recordFeedback}){
  const [picked,setPicked]=useState('');
  const opts=[['Loved it',ThumbsUp],['Good fit',CheckCircle2],['Too expensive',WalletCards],['Too far',MapPin],['Too noisy',AlertTriangle],['Not my style',ThumbsDown],['Too stressful',AlertTriangle],['Would avoid',Trash2]];
  function click(label){ setPicked(label); recordFeedback(label); }
  return <div className="feedback">
    <div className="feedbackHead">
      <div>
        <h3>Was this a good fit?</h3>
        <p>Choose one response. It saves locally and updates lightweight preference signals for future rankings.</p>
      </div>
      {picked && <span className="savedFeedback">Saved: {picked}</span>}
    </div>
    <div>{opts.map(([label,I])=><button key={label} className={picked===label?'selectedFeedback':''} onClick={()=>click(label)}><I size={14}/>{label}</button>)}</div>
  </div>
}
function Profile({profile,setProfile,setTab}){
  const comp=profileCompleteness(profile);
  const [manual,setManual]=useState(false);
  const quickPresets={
    family:{label:'Low-stress family',desc:'Safe, easy logistics, quiet, kid-friendly.',priorities:['safe','easy logistics','family-friendly','good value'],avoid:['hidden fees','very noisy','overpriced','rushed'],travelStyle:'low-stress, walkable, family-friendly, good food nearby',foodStyle:'relaxed, kid-friendly, good value',shoppingStyle:'practical, durable, good value',decisionStyle:'low stress, low regret, clear tradeoffs'},
    value:{label:'Value smart',desc:'Good value, durable, transparent, no hidden fees.',priorities:['good value','durable','transparent pricing','flexible cancellation'],avoid:['overpriced','hidden fees','bad warranty'],travelStyle:'balanced price, walkable, no hidden fees',foodStyle:'flavorful, good value, relaxed',shoppingStyle:'best value, durable, practical',decisionStyle:'compare price and long-term value'},
    premium:{label:'Premium comfort',desc:'Comfort, quality, polished, easy service.',priorities:['premium quality','comfortable','polished','easy logistics'],avoid:['cheap quality','rushed','poor service'],travelStyle:'comfortable, premium, easy logistics',foodStyle:'polished, memorable, high-quality',shoppingStyle:'premium quality, polished, long-lasting',decisionStyle:'quality and comfort over cheapest price'},
    simple:{label:'Quick practical',desc:'Fast, reliable, low effort, less stress.',priorities:['fast service','reliable','low effort','easy logistics'],avoid:['long waits','complicated process','unclear pricing'],travelStyle:'simple, convenient, easy logistics',foodStyle:'casual, easy, reliable',shoppingStyle:'practical, low maintenance, reliable',decisionStyle:'quick practical choice with low regret'}
  };
  const priorityChips=['walkable','good value','safe','easy logistics','family-friendly','quiet','premium quality','durable','fast service','flexible cancellation','good reviews','easy parking'];
  const avoidChips=['hidden fees','very noisy','overpriced','crowded','long waits','bad cancellation policy','poor warranty','cheap quality','rushed','poor service','unclear pricing'];
  const tasteChips=['comfortable','polished','classic','colorful','relaxed','modern','practical','elegant','memorable','low-stress','adventurous','local feel'];
  function list(k,v){setProfile({...profile,[k]:v.split(',').map(x=>x.trim()).filter(Boolean)})}
  function preset(key){ const {label,desc,...data}=quickPresets[key]; setProfile({...profile,...data}); }
  function resetSection(section){
    if(section==='all'){ setProfile(defaultProfile); return; }
    if(section==='preset'){ setProfile(defaultProfile); return; }
    if(section==='priorities'){ setProfile({...profile, priorities: []}); return; }
    if(section==='avoid'){ setProfile({...profile, avoid: []}); return; }
    if(section==='taste'){ setProfile({...profile, travelStyle:'', foodStyle:'', shoppingStyle:''}); return; }
  }
  function toggleList(key,value){ const arr=profile[key]||[]; setProfile({...profile,[key]:arr.includes(value)?arr.filter(x=>x!==value):[...arr,value]}); }
  function toggleStyle(field,value){
    const parts=String(profile[field]||'').split(',').map(x=>x.trim()).filter(Boolean);
    const next=parts.includes(value)?parts.filter(x=>x!==value):[...parts,value];
    setProfile({...profile,[field]:next.join(', ')});
  }
  function styleHas(field,value){return String(profile[field]||'').split(',').map(x=>x.trim()).includes(value)}
  return <main className="page"><section className="panel profilePanel smartProfile">
    <div className="profileHero compactHero">
      <div><div className="eyebrow"><UserRound size={14}/> Your profile</div><h1>Make results fit you.</h1><p>Tap a preset, then tap chips. No typing required unless you want to fine-tune.</p></div>
      <div className="profileScore"><b>{comp}%</b><span>complete</span><div className="meter"><span style={{width:`${comp}%`}}/></div></div>
    </div>

    <div className="profileSection"><div className="profileSectionHead"><h3>1. Start with a preset</h3><div className="sectionHeadActions"><span>click one</span><button type="button" className="sectionReset" onClick={()=>resetSection('preset')}><RotateCcw size={13}/> Reset</button></div></div><div className="presetCards">{Object.entries(quickPresets).map(([key,item])=><button key={key} className="presetCard" onClick={()=>preset(key)}><b>{item.label}</b><small>{item.desc}</small></button>)}</div></div>

    <div className="profileSection"><div className="profileSectionHead"><h3>2. Prioritize</h3><div className="sectionHeadActions"><span>tap to add/remove</span><button type="button" className="sectionReset" onClick={()=>resetSection('priorities')}><RotateCcw size={13}/> Reset</button></div></div><div className="clickChipGrid">{priorityChips.map(x=><button key={x} type="button" className={(profile.priorities||[]).includes(x)?'profileChip on':'profileChip'} onClick={()=>toggleList('priorities',x)}>{(profile.priorities||[]).includes(x)?'✓ ':''}{x}</button>)}</div></div>

    <div className="profileSection"><div className="profileSectionHead"><h3>3. Avoid</h3><div className="sectionHeadActions"><span>tap to add/remove</span><button type="button" className="sectionReset" onClick={()=>resetSection('avoid')}><RotateCcw size={13}/> Reset</button></div></div><div className="clickChipGrid">{avoidChips.map(x=><button key={x} type="button" className={(profile.avoid||[]).includes(x)?'profileChip avoid on':'profileChip avoid'} onClick={()=>toggleList('avoid',x)}>{(profile.avoid||[]).includes(x)?'✓ ':''}{x}</button>)}</div></div>

    <div className="profileSection"><div className="profileSectionHead"><h3>4. Taste words</h3><div className="sectionHeadActions"><span>applies to travel, food, shopping, and style</span><button type="button" className="sectionReset" onClick={()=>resetSection('taste')}><RotateCcw size={13}/> Reset</button></div></div><div className="clickChipGrid">{tasteChips.map(x=><button key={x} type="button" className={styleHas('travelStyle',x)||styleHas('shoppingStyle',x)||styleHas('foodStyle',x)?'profileChip taste on':'profileChip taste'} onClick={()=>{toggleStyle('travelStyle',x);toggleStyle('foodStyle',x);toggleStyle('shoppingStyle',x)}}>{styleHas('travelStyle',x)||styleHas('shoppingStyle',x)||styleHas('foodStyle',x)?'✓ ':''}{x}</button>)}</div></div>

    <div className="profileSummaryCards">
      <div><b>Prioritize</b><p>{(profile.priorities||[]).join(', ')||'None selected yet'}</p></div>
      <div><b>Avoid</b><p>{(profile.avoid||[]).join(', ')||'None selected yet'}</p></div>
      <div><b>Taste</b><p>{[profile.travelStyle,profile.foodStyle,profile.shoppingStyle].filter(Boolean).join(' • ')}</p></div>
    </div>

    <div className="profileFooterActions"><button className="manualToggle" type="button" onClick={()=>setManual(!manual)}>{manual?'Hide manual fields':'Fine-tune manually'}</button><button type="button" className="sectionReset allReset" onClick={()=>resetSection('all')}><RotateCcw size={13}/> Reset all profile values</button></div>
    {manual && <div className="profileGrid"><label><span>Priorities</span><textarea value={(profile.priorities||[]).join(', ')} onChange={e=>list('priorities',e.target.value)}/></label><label><span>Avoid</span><textarea value={(profile.avoid||[]).join(', ')} onChange={e=>list('avoid',e.target.value)}/></label><label><span>Travel style</span><input value={profile.travelStyle||''} onChange={e=>setProfile({...profile,travelStyle:e.target.value})}/></label><label><span>Food style</span><input value={profile.foodStyle||''} onChange={e=>setProfile({...profile,foodStyle:e.target.value})}/></label><label><span>Shopping style</span><input value={profile.shoppingStyle||''} onChange={e=>setProfile({...profile,shoppingStyle:e.target.value})}/></label><label><span>Decision style</span><input value={profile.decisionStyle||''} onChange={e=>setProfile({...profile,decisionStyle:e.target.value})}/></label></div>}
    <button className="primary" onClick={()=>setTab('ask')}><Search size={18}/> Start a fit check</button>
  </section></main> }
function HistoryView({history,loadHist,clear}){return <main className="page"><section className="panel"><div className="historyTop"><div><div className="eyebrow"><History size={14}/> History</div><h1>Saved searches</h1></div><button className="soft" onClick={clear}><Trash2 size={15}/> Clear</button></div>{history.length===0?<p>No history yet.</p>:<div className="historyList">{history.map(h=><button key={h.id} onClick={()=>loadHist(h)}><b>{h.form?.action} · {h.form?.category} · {h.form?.need}</b><span>{h.ranked?.[0]?.name} <ChevronRight size={15}/></span></button>)}</div>}</section></main>}

createRoot(document.getElementById('root')).render(<App/>);
