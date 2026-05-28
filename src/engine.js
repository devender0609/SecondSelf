
export const categories = [
  { id:'travel', label:'Travel', hint:'hotels, trip plans, destinations' },
  { id:'food', label:'Food', hint:'restaurants, cafes' },
  { id:'shopping', label:'Shopping', hint:'products, stores' },
  { id:'style', label:'Style', hint:'outfits, look' },
  { id:'local', label:'Local service', hint:'providers' },
  { id:'money', label:'Quote Check', hint:'review or find help' },
];
export const popularLocations = ['Miami Beach, FL','Austin, TX','New York, NY','Los Angeles, CA','Chicago, IL','Dallas, TX','Houston, TX','Orlando, FL','San Francisco, CA','Boston, MA'];
export const defaultProfile = {
  priorities:['walkable','good value','easy logistics','safe'],
  avoid:['hidden fees','very noisy','overpriced','bad cancellation policy'],
  travelStyle:'comfortable, walkable, good food nearby, not too packed',
  foodStyle:'relaxed, flavorful, good value, not too formal',
  shoppingStyle:'practical, polished, durable, good value',
  decisionStyle:'clear tradeoffs, low regret, verify before committing',
  learnedLikes:[],
  learnedAvoid:[]
};
export const initialForm = { action:'find', category:'travel', travelMode:'hotel', shoppingMode:'products', moneyMode:'review', need:'hotel', location:'Miami Beach, FL', occasion:'travel', dateFrom:'', dateTo:'', amount:'', forWho:'couple or family', budget:'balanced', vibe:['Walkable','Quiet','Good food nearby'], details:'' };

export function tripDayCount(form){
  const text = `${form.need || ''} ${form.details || ''}`;
  const m = text.match(/(\d+)\s*[- ]?day/i);
  if (m) return Math.max(1, Math.min(14, Number(m[1])));
  if (form.dateFrom && form.dateTo) {
    const a = new Date(form.dateFrom), b = new Date(form.dateTo);
    if (!isNaN(a) && !isNaN(b) && b >= a) return Math.max(1, Math.min(14, Math.round((b - a) / 86400000) + 1));
  }
  return 3;
}
export function addDaysISO(dateString, daysToAdd){
  if(!dateString) return '';
  const d = new Date(dateString + 'T00:00:00');
  if(isNaN(d)) return '';
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().slice(0,10);
}

export const categoryConfig = {
  travel:{label:'Travel',title:'Plan travel with real places, practical pacing, and a clear map.',subtitle:'Hotels and destinations show ranked places with pins. Trip Planner creates a day-by-day outline with realistic pacing.',fields:['travelMode','need','location','dateRange'],chips:['Walkable','Quiet','Beachfront','Family-friendly','Good food nearby','Pool','Great value','Easy parking']},
  food:{label:'Food',title:'Choose where to eat.',subtitle:'Find restaurants/cafes by vibe, price, location, and who is going.',fields:['need','location','dateSingle'],chips:['Casual','Date night','Kid-friendly','Vegetarian options','Not too loud','Easy parking','Good value']},
  shopping:{label:'Shopping',title:'Buy smarter or find stores nearby.',subtitle:'Product mode gives concrete buying criteria and retailer links. Store mode shows map results.',fields:['shoppingMode','need','locationOptional'],chips:['Best value','Premium quality','Lightweight','Long battery','Portable','Durable','Low maintenance']},
  style:{label:'Style',title:'Get a concrete outfit plan.',subtitle:'Style gives actual outfit formulas plus online and nearby where-to-buy options.',fields:['need','occasion','locationOptional','dateSingle'],chips:['Polished','Comfortable','Classic','Colorful','Minimal','Semi-formal','Low effort']},
  local:{label:'Local Service',title:'Find local service providers.',subtitle:'Rank nearby providers and show what to verify before hiring.',fields:['need','location','dateSingle'],chips:['Reliable','Written quote','Licensed','No surprise fees','Fast response','Great reviews','Best value']},
  money:{label:'Quote Audit',title:'Review a quote or find the right provider.',subtitle:'Review mode helps you question, compare, negotiate, or approve a bill. Find Provider mode searches nearby technicians or service companies and shows map results.',fields:['moneyMode','need','amount','locationOptional','dateSingle'],chips:['Itemized quote','Written estimate','Warranty','Licensed','No surprise fees']},
};
export function defaultNeedFor(cat,mode){ if(cat==='travel') return mode==='itinerary'?'3-day trip plan':mode==='destination'?'destination or area':'hotel'; if(cat==='shopping') return mode==='places'?'shopping places':'laptop'; if(cat==='food') return 'restaurant'; if(cat==='style') return 'outfit'; if(cat==='local') return 'repair provider'; if(cat==='money') return 'AC repair'; return 'option'; }
export function makePrompt(f){ const where=f.location?` in ${f.location}`:''; const dates=f.dateFrom?` Dates: ${f.dateFrom}${f.dateTo?` to ${f.dateTo}`:''}.`:''; const vibe=f.vibe?.length?` Must-have: ${f.vibe.join(', ')}.`:''; const extra=f.details?` Details: ${f.details}.`:''; const occ=f.occasion?` Occasion: ${f.occasion}.`:''; if(f.action==='compare') return `Compare my options for ${f.need}${where}. Budget: ${f.budget}.${occ}${dates}${vibe}${extra || ' Details: options not provided yet.'}`; if(f.action==='check') return `Check before I commit: ${f.need}${where}${f.amount?` (${f.amount})`:''}. Budget: ${f.budget}.${vibe}${extra}`; if(f.category==='money') { const mode=f.moneyMode==='find'?'Find providers for':'Review quote for'; return `${mode} ${f.need}${f.location?` in ${f.location}`:''}${f.amount?` (${f.amount})`:''}. Budget: ${f.budget}.${vibe}${extra}`; } return `Find the best ${f.need}${where} for ${f.forWho}. Budget: ${f.budget}.${occ}${dates}${vibe}${extra}`; }
export function usesPrimaryMap(f){ if(f.action && f.action!=='find') return false; if(f.category==='travel') return f.travelMode==='hotel' || f.travelMode==='destination'; return f.category==='food' || f.category==='local' || (f.category==='shopping'&&f.shoppingMode==='places') || (f.category==='money'&&f.moneyMode==='find'); }
export function needsBuyingMap(f){ return (f.category==='style' || (f.category==='shopping'&&f.shoppingMode==='products')) && f.location; }
export function profileCompleteness(p){ let score=0; if(p.priorities?.length>=4)score+=25; if(p.avoid?.length>=3)score+=20; if(p.travelStyle?.length>20)score+=15; if(p.foodStyle?.length>20)score+=15; if(p.shoppingStyle?.length>20)score+=15; if(p.decisionStyle?.length>15)score+=10; return Math.min(100,score); }
export function profileSummary(p){ return [...(p.priorities||[]), ...(p.avoid||[]).map(x=>`avoid ${x}`)].slice(0,8).join(', '); }
export function makeProfileTags(p){ return [...(p.priorities||[]), ...(p.avoid||[]).map(x=>`avoid: ${x}`), p.travelStyle, p.foodStyle, p.shoppingStyle].filter(Boolean).slice(0,12); }
function makeMapsUrl(name,address){ return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address||''}`)}` }
const knownLocationCoords = {
  'Miami Beach, FL':[25.7907,-80.1300],
  'Miami, FL':[25.7617,-80.1918],
  'Austin, TX':[30.2672,-97.7431],
  'New York, NY':[40.7580,-73.9855],
  'Los Angeles, CA':[34.0522,-118.2437],
  'Chicago, IL':[41.8781,-87.6298],
  'Dallas, TX':[32.7767,-96.7970],
  'Houston, TX':[29.7604,-95.3698],
  'Orlando, FL':[28.5383,-81.3792],
  'San Francisco, CA':[37.7749,-122.4194],
  'Boston, MA':[42.3601,-71.0589]
};
function coordForLocation(loc=''){
  const exact=knownLocationCoords[loc];
  if(exact) return exact;
  const lower=String(loc).toLowerCase();
  const key=Object.keys(knownLocationCoords).find(k=> lower.includes(k.toLowerCase().split(',')[0]));
  return key ? knownLocationCoords[key] : null;
}
function place(name,i,loc,tags=[],price=2,rating=4.4){
  const base=coordForLocation(loc);
  const address=`${loc || 'Selected area'}`;
  const item={name,rating,reviewCount:800+i*540,priceLevel:price,address,tags,mapsUrl:makeMapsUrl(name,address),source:'fallback'};
  if(base){ item.lat=base[0]+(i-1.5)*0.012; item.lng=base[1]+(i-1.5)*0.01; }
  else { item.cautionsExtra=['Map pin is hidden because this fallback location could not be safely geocoded. Add Google Places API for live mapped results.']; }
  return item;
}

function coordsForFallback(loc='',i=0){
  const base=coordForLocation(loc);
  if(!base) return {cautionsExtra:['Map pin is hidden because this fallback location could not be safely geocoded. Add Google Places API for live mapped results.']};
  return {lat:base[0]+(i-1)*0.012,lng:base[1]+(i-1)*0.01};
}

export function makeFallbackOptions(form){ const loc=form.location||'Selected area'; if(form.action==='compare') { const compared=parseComparedOptions(form); if(compared.length) return compared; return [{name:'Add at least two real options',scoreSeed:20,tags:['missing options'],recommendation:'Paste Option A and Option B with price, location, link, or key details before comparing.',doThis:['Add at least two options.','Include price, location, and what matters to you.'],cautionsExtra:['SecondSelf will not invent options in Compare mode.']}]; } if(form.action==='check') return form.category==='money' ? moneyOptions(form) : checkBeforeCommitOptions(form); if(form.category==='travel'&&form.travelMode==='itinerary') return tripPlanOptions(form); if(form.category==='travel'&&form.travelMode==='destination') return destinationOptions(form); if(form.category==='travel') return hotelFallbackOptions(form); if(form.category==='food') return [place('Relaxed local favorite',0,loc,['relaxed','flavorful','good value'],2,4.6),place('Quiet date-night restaurant',1,loc,['date night','not too loud','polished'],3,4.7),place('Family-friendly casual place',2,loc,['kid-friendly','easy parking','casual'],2,4.4),place('Popular lively spot',3,loc,['flavorful','popular','may be loud'],3,4.5)]; if(form.category==='local') return [place('Highest-rated local provider',0,loc,['licensed','great reviews','written quote'],3,4.7),place('Best-value provider',1,loc,['best value','no surprise fees','written quote'],2,4.4),place('Fast-response provider',2,loc,['fast response','convenient'],3,4.2),place('Specialist provider',3,loc,['licensed','insured','warranty'],4,4.5)]; if(form.category==='shopping'&&form.shoppingMode==='places') return [place('Best shopping district',0,loc,['walkable','food nearby','local stores'],2,4.5),place('Premium mall / retail center',1,loc,['premium quality','brands','parking'],4,4.6),place('Value shopping center',2,loc,['best value','easy parking'],2,4.2),place('Local boutique area',3,loc,['unique','walkable','gifts'],3,4.4)]; if(form.category==='shopping') return shoppingProductOptions(form); if(form.category==='style') return styleOptions(form); if(form.category==='money'&&form.moneyMode==='find') return [place('Licensed AC repair provider',0,loc,['licensed','warranty','written estimate','great reviews'],3,4.7),place('Best-value repair company',1,loc,['best value','itemized quote','no surprise fees'],2,4.5),place('Fast-response technician',2,loc,['fast response','transparent pricing'],3,4.3),place('Premium specialist service',3,loc,['premium','warranty','licensed'],4,4.6)]; if(form.category==='money') return moneyOptions(form); return []; }

function hotelFallbackOptions(form){
  const loc=form.location||'Selected area';
  if(/miami|south beach|mid-beach/i.test(loc)) return [
    {name:'The Palms Hotel & Spa',rating:4.5,reviewCount:3700,priceLevel:3,address:'3025 Collins Ave, Miami Beach, FL',lat:25.8075,lng:-80.1237,tags:['beachfront','calmer','family-friendly','walkable','good food nearby'],mapsUrl:makeMapsUrl('The Palms Hotel & Spa','3025 Collins Ave, Miami Beach, FL'),recommendation:'Best fit if you want calmer beachfront, walkability, and less South Beach chaos.'},
    {name:'Loews Miami Beach Hotel',rating:4.5,reviewCount:6400,priceLevel:4,address:'1601 Collins Ave, Miami Beach, FL',lat:25.7906,lng:-80.1294,tags:['beachfront','family','central','pool','premium'],mapsUrl:makeMapsUrl('Loews Miami Beach Hotel','Miami Beach'),recommendation:'Strong premium/family option; check total cost and crowd level.'},
    {name:'The Betsy South Beach',rating:4.6,reviewCount:2100,priceLevel:4,address:'1440 Ocean Dr, Miami Beach, FL',lat:25.7886,lng:-80.1299,tags:['elegant','walkable','good food nearby','pricey'],mapsUrl:makeMapsUrl('The Betsy South Beach','Miami Beach'),recommendation:'Best if boutique/elegant matters more than value.'},
    {name:'citizenM Miami South Beach',rating:4.4,reviewCount:700,priceLevel:2,address:'1200 Lincoln Rd, Miami Beach, FL',lat:25.7901,lng:-80.1404,tags:['value','modern','walkable','compact rooms'],mapsUrl:makeMapsUrl('citizenM Miami South Beach','Miami Beach'),recommendation:'Good value/modern pick if compact rooms are acceptable.'}
  ];
  const coords0=coordsForFallback(loc,0), coords1=coordsForFallback(loc,1), coords2=coordsForFallback(loc,2), coords3=coordsForFallback(loc,3);
  return [
    {name:`Best-fit hotel option in ${loc}`,rating:4.5,reviewCount:1200,priceLevel:3,address:loc,...coords0,tags:['hotel','balanced','good value','easy logistics','comfortable'],mapsUrl:makeMapsUrl(`hotel ${loc}`,''),recommendation:'Best fallback hotel direction for a balanced stay. Use live Google Places for exact hotel names, current availability, and precise pins.'},
    {name:`Premium comfort stay in ${loc}`,rating:4.6,reviewCount:900,priceLevel:4,address:loc,...coords1,tags:['hotel','premium quality','comfortable','service','pool'],mapsUrl:makeMapsUrl(`premium hotel ${loc}`,''),recommendation:'Best if comfort, service, and fewer compromises matter more than lowest price.'},
    {name:`Value stay in ${loc}`,rating:4.2,reviewCount:850,priceLevel:2,address:loc,...coords2,tags:['hotel','good value','budget','practical'],mapsUrl:makeMapsUrl(`value hotel ${loc}`,''),recommendation:'Best if price/value matters most. Verify reviews, room size, cancellation, and fees before booking.'},
    {name:`Quiet/walkable stay in ${loc}`,rating:4.4,reviewCount:700,priceLevel:3,address:loc,...coords3,tags:['hotel','quiet','walkable','easy logistics'],mapsUrl:makeMapsUrl(`quiet walkable hotel ${loc}`,''),recommendation:'Best if calmer location and easy logistics matter more than being in the busiest area.'}
  ];
}

export function makeFallbackBuyPlaces(form){ const loc=form.location||'Selected area'; const need=form.category==='style'?'clothing':(form.need||'shopping'); return [place(`${need} store with best overall fit`,0,loc,['where to buy','good reviews','nearby'],2,4.5),place(`Premium ${need} store`,1,loc,['premium quality','brands'],4,4.6),place(`Value ${need} store`,2,loc,['best value','easy returns'],2,4.2),place(`Local boutique / specialty store`,3,loc,['unique','specialty','good service'],3,4.4)]; }
function onlineBuyLinks(q){ const e=encodeURIComponent(q); return [{label:'Amazon',url:`https://www.amazon.com/s?k=${e}`},{label:'Google Shopping',url:`https://www.google.com/search?tbm=shop&q=${e}`},{label:'Target',url:`https://www.target.com/s?searchTerm=${e}`},{label:'Walmart',url:`https://www.walmart.com/search?q=${e}`}]; }
function fashionBuyLinks(q){ const e=encodeURIComponent(q); return [{label:'Nordstrom',url:`https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${e}`},{label:'Macy\'s',url:`https://www.macys.com/shop/featured/${e}`},{label:'Zara',url:`https://www.zara.com/us/en/search?searchTerm=${e}`},{label:'Google Shopping',url:`https://www.google.com/search?tbm=shop&q=${e}`}]; }


function extractDollarAmount(text=''){
  const m=String(text).match(/\$\s?([0-9][0-9,]*(?:\.\d+)?)/);
  return m ? Number(m[1].replace(/,/g,'')) : null;
}
function extractExplicitSignals(line=''){
  const raw=String(line||'');
  const lower=raw.toLowerCase();
  const pros=[]; const risks=[]; const tags=[];
  const add=(arr,msg)=>{ if(!arr.includes(msg)) arr.push(msg); };
  if(/quiet|calm|not noisy|not too loud/.test(lower)){tags.push('quiet'); add(pros,'Quiet/calm signal.');}
  if(/walkable|walking|close|near/.test(lower)){tags.push('walkable'); add(pros,'Walkability/nearby signal.');}
  if(/beach|beachfront|ocean/.test(lower)){tags.push('beachfront'); add(pros,'Beach/location signal.');}
  if(/family|kid|children|suite/.test(lower)){tags.push('family-friendly'); add(pros,'Family/logistics signal.');}
  if(/pool|amenit/.test(lower)){tags.push('pool'); add(pros,'Amenities signal.');}
  if(/premium|luxury|high[- ]?end|quality|comfort/.test(lower)){tags.push('premium quality'); add(pros,'Quality/comfort signal.');}
  if(/cheap|budget|affordable|value|low cost/.test(lower)){tags.push('good value'); add(pros,'Value/cost signal.');}
  if(/return|warranty|guarantee/.test(lower)){tags.push('warranty'); add(pros,'Warranty/return signal.');}
  if(/fee|hidden fee|resort fee|parking extra|extra charge/.test(lower)){tags.push('fee risk'); add(risks,'Possible extra fees.');}
  if(/nonrefundable|no refund|bad cancellation|strict cancellation/.test(lower)){tags.push('bad cancellation policy'); add(risks,'Cancellation/return risk.');}
  if(/small room|compact|tiny/.test(lower)){tags.push('compact'); add(risks,'May feel small/compact.');}
  if(/far|long drive|long commute|not close/.test(lower)){tags.push('too far'); add(risks,'Distance/travel-time risk.');}
  if(/noisy|loud|party|nightlife|club/.test(lower)){tags.push('very noisy'); add(risks,'Noise/lively-area risk.');}
  if(/expensive|pricey|overpriced/.test(lower)){tags.push('overpriced'); add(risks,'Price may be high.');}
  return {pros, risks, tags};
}

function parseComparedOptions(form){
  const raw=String(form.details||'').trim();
  if(!raw) return [];
  const optionRegex=/(?:^|\n)\s*(?:option\s*)?([A-Da-d]|[1-6])\s*[:.)-]\s*([\s\S]*?)(?=(?:\n\s*(?:option\s*)?(?:[A-Da-d]|[1-6])\s*[:.)-])|$)/g;
  const parsed=[]; let match;
  while((match=optionRegex.exec(raw))!==null){
    const body=String(match[2]||'').trim();
    if(body) parsed.push(body);
  }
  const candidates = parsed.length>=2 ? parsed : raw.split(/\n|;|\|/).map(x=>x.trim()).filter(Boolean);
  const cleaned=candidates.map(line=>line.replace(/^(option\s*[a-z0-9]|\d+\.|[-•])\s*[:.)-]?\s*/i,'').trim()).filter(x=>x && !/^option\s*[a-z0-9]\s*:?$/i.test(x));
  if(cleaned.length<2) return [];
  return cleaned.slice(0,6).map((line,i)=>{
    const price=extractDollarAmount(line);
    const name=line.split(/[,\n]/)[0].replace(/\$\s?[0-9][0-9,]*(?:\.\d+)?/,'').slice(0,90).trim() || `Option ${i+1}`;
    const signals=extractExplicitSignals(line);
    const tags=unique([form.category, ...(form.vibe||[]), ...signals.tags]);
    const proSummary=signals.pros.length?signals.pros.slice(0,2).join(' '):'Needs details to judge real fit.';
    const riskSummary=signals.risks.length?signals.risks.slice(0,2).join(' '):'No obvious risk from the pasted line.';
    return {
      name, raw:line, priceAmount:price, scoreSeed:74-i*3, tags,
      recommendation: price?`${name} is listed around $${price.toLocaleString()}. Compare the true total cost and fit, not just the headline price.`:`Compare ${name} against your profile, budget, avoid-list, and current context.`,
      prosExtra: signals.pros,
      cautionsExtra: [...signals.risks, 'This is based on the details you pasted. Add links, exact dates, final price, or terms for sharper comparison.'],
      doThis:[
        price?`Verify the final total for ${name}, not just the listed price.`:`Add price or final cost for ${name} if available.`,
        `Best signals seen: ${proSummary}`,
        `Main risk check: ${riskSummary}`,
        'Choose only if the tradeoff is acceptable compared with the other options.'
      ]
    };
  });
}
function checkBeforeCommitOptions(form){
  const detail=String(form.details||'').toLowerCase();
  const hasPrice=/\$|\b[0-9]{3,}\b/.test(detail+String(form.amount||''));
  const missingItemization=!/itemiz|parts|labor|warranty|fee/.test(detail);
  const isBooking=form.category==='travel';
  const isProduct=form.category==='shopping';
  const isProvider=form.category==='local';
  const firstName = missingItemization || hasPrice ? 'Pause and verify missing details' : 'Proceed only after checking fit and terms';
  const doThis = isBooking
    ? ['Check total price after taxes, resort fees, parking, and cancellation.','Read recent low-star reviews for noise, cleanliness, location, and hidden fees.','Compare at least one similar option before booking.']
    : isProduct
      ? ['Check return window, warranty, seller reliability, and low-star complaints.','Compare one cheaper and one higher-quality alternative.','Confirm the product matches your actual use, not just popularity.']
      : isProvider
        ? ['Ask for written scope, exclusions, warranty, license/insurance, and payment schedule.','Get one comparable quote for expensive or unclear work.','Avoid approving vague work descriptions.']
        : ['Confirm final price, cancellation/return policy, and hidden fees.','Read recent low-star reviews or complaints.','Compare at least one alternative if the cost or commitment is meaningful.'];
  return [
    {name:firstName,scoreSeed:84,tags:['verify before committing','low regret','clear tradeoffs','missing details'],recommendation:'Best move if this decision involves money, booking, hiring, or a hard-to-reverse commitment.',doThis,cautionsExtra: missingItemization ? ['Important details appear missing or not pasted. Add itemization, terms, warranty, or link for a sharper check.'] : []},
    {name:'Proceed only if terms are clear',scoreSeed:68,tags:['proceed','low friction'],recommendation:'Reasonable only when the total cost, terms, return/cancellation rules, and fit are already clear.',doThis:['Save the final terms or receipt.','Confirm cancellation/return/warranty before paying.','Avoid rushing if details are missing.'],cautionsExtra:['Proceeding without written details increases regret/dispute risk.']}
  ];
}
function shoppingProductOptions(form){ const item=form.need||'product'; const laptop=/laptop|computer|macbook|surface/i.test(item); if(laptop) return [{name:'Lightweight 14-inch laptop, 16GB RAM, 512GB SSD',scoreSeed:90,tags:['lightweight','portable','durable','best value','long battery'],recommendation:'Best practical target: 14-inch, 16GB RAM, 512GB SSD, strong battery, under about 3.5 lb.',doThis:['Prioritize 16GB RAM over branding.','Avoid heavy gaming laptops if portability matters.','Check battery, warranty, and return policy.'],buyOptions:onlineBuyLinks('14 inch laptop 16GB RAM 512GB SSD lightweight')},{name:'Premium ultrabook',scoreSeed:82,tags:['premium quality','portable','long battery'],recommendation:'Best if you want the cleanest build quality and can pay more upfront.',doThis:['Compare MacBook Air, Dell XPS, Surface Laptop, Lenovo Yoga/Slim.','Check ports and warranty.'],buyOptions:onlineBuyLinks('premium ultrabook 16GB RAM 512GB SSD')},{name:'Budget laptop with minimum acceptable specs',scoreSeed:62,tags:['best value','budget'],recommendation:'Only choose budget if it still has 16GB RAM or an easy return policy.',doThis:['Avoid 8GB RAM if multitasking matters.','Read low-star reviews for battery and hinge issues.'],buyOptions:onlineBuyLinks('budget laptop 16GB RAM 512GB SSD')}]; return [{name:`Best-value ${item}`,scoreSeed:84,tags:['best value','good reviews','easy returns','durable'],recommendation:`Choose the ${item} with the best balance of reviews, return policy, durability, and total cost.`,doThis:['Compare one value option and one premium option.','Read recent low-star reviews.','Check return window and warranty.'],buyOptions:onlineBuyLinks(`best value ${item}`)},{name:`Premium ${item}`,scoreSeed:76,tags:['premium quality','durable'],recommendation:`Choose premium only if the build quality, warranty, or daily use justifies the higher price.`,doThis:['Verify what makes it premium.','Avoid paying only for branding.'],buyOptions:onlineBuyLinks(`premium ${item}`)},{name:`Budget ${item}`,scoreSeed:58,tags:['budget','verify quality'],recommendation:`Choose budget only if return policy is easy and quality complaints are limited.`,doThis:['Avoid unknown brands with repeated defects.','Check warranty.'],buyOptions:onlineBuyLinks(`budget ${item}`)}]; }
function styleOptions(form){ const locText=`${form.location} ${form.occasion} ${form.details}`.toLowerCase(); const warm=/miami|beach|summer|hot|travel|florida/.test(locText); const formula=warm?['breathable linen/cotton shirt or blouse','tailored shorts, light chinos, or flowy trousers','comfortable clean sneakers, loafers, or sandals','sunglasses + one colorful accent','light layer for evening']:['structured top or clean shirt','well-fitted trousers/skirt/dark denim','comfortable polished shoes','one intentional accent','light jacket or cardigan']; return [{name:'Polished comfortable outfit formula',scoreSeed:90,tags:['polished','comfortable','classic','travel-friendly'],recommendation:`Wear: ${formula.join(' + ')}.`,doThis:formula,cautionsExtra:['Avoid heavy fabrics if weather is warm.','Avoid uncomfortable new shoes.','Use one color accent, not several competing colors.'],buyOptions:fashionBuyLinks(`${form.occasion||form.need} polished comfortable outfit`)},{name:'Minimal modern outfit formula',scoreSeed:80,tags:['minimal','classic','low effort'],recommendation:'Wear a simple neutral base, clean lines, and one good accessory.',doThis:['neutral top','clean tailored bottom','comfortable polished shoe','simple watch/bag/sunglasses'],buyOptions:fashionBuyLinks(`${form.occasion||form.need} minimal modern outfit`)},{name:'Color accent outfit formula',scoreSeed:72,tags:['colorful','statement','memorable'],recommendation:'Use color in one controlled place: shirt, scarf, bag, shoe, or accessory. Keep the rest simple.',doThis:['neutral base','one colorful accent','comfortable shoes','simple accessories'],buyOptions:fashionBuyLinks(`${form.occasion||form.need} colorful accent outfit`)}]; }
function moneyOptions(form){
  const amountText=form.amount?` for ${form.amount}`:'';
  const combined=`${form.amount||''} ${form.details||''}`.toLowerCase();
  const hasItemization=/itemiz/.test(combined) || (/parts/.test(combined) && /labor/.test(combined));
  const hasWarranty=/(warranty|guarantee)/.test(combined) && !/(no warranty|without warranty|warranty not|not stated|not listed|no guarantee)/.test(combined);
  const hasLicense=/licensed|insured/.test(combined);
  const amountNum=(combined.match(/\$?\s*([0-9][0-9,]{2,})/)||[])[1];
  const n=amountNum?Number(amountNum.replace(/,/g,'')):0;
  const expensive=n>=750;
  const vague=!hasItemization || !hasWarranty;
  const auditVerdict = vague && expensive ? 'Do not approve yet — quote looks incomplete for the amount' : vague ? 'Pause — quote needs clarification' : 'Likely reviewable, but verify with one comparison if costly';
  return [
    {name:auditVerdict,scoreSeed:96,tags:['itemized quote','written estimate','warranty','no hidden fees','avoid overpaying'],recommendation:`Before paying${amountText}, verify whether the quote is complete, itemized, and comparable.`,doThis:[
      'Ask for parts, labor, diagnostic/trip fee, warranty, exclusions, and optional charges in writing.',
      expensive ? 'Because the amount is meaningful, get one comparable quote using the same scope.' : 'If the cost is modest and details are clear, one clarification may be enough.',
      'Do not approve vague work descriptions such as “repair” or “service” without scope and warranty.'
    ],cautionsExtra:[
      !hasItemization ? 'Missing or unclear itemization: parts, labor, diagnostic fee, and scope are not clearly separated.' : '',
      !hasWarranty ? 'Warranty/guarantee is not clearly stated.' : '',
      !hasLicense && /home|repair|ac|hvac|plumb|electric|contractor/.test(combined) ? 'License/insurance is not mentioned for a home-service type quote.' : ''
    ].filter(Boolean)},
    {name:'Get one competing quote',scoreSeed:84,tags:['compare price','written proof','avoid overpaying'],recommendation:`Use the same scope to get one comparable quote${amountText}.`,doThis:['Send the same itemized scope to one competitor.','Compare parts, labor, warranty, trip/diagnostic fees, and exclusions.','If the competitor is far lower, ask the original provider to explain the difference.']},
    {name:'Ask for itemized breakdown first',scoreSeed:82,tags:['itemized quote','transparent pricing','no hidden fees'],recommendation:'Cleanest first move when the quote is unclear but you are not ready to switch providers.',doThis:['Ask for parts, labor, service fee, warranty, and optional charges.','Ask what can be removed or deferred.','Keep the response in writing.']},
    {name:'Pay as-is',scoreSeed:35,tags:['fast','least effort','risk'],recommendation:'Only pay as-is if timing matters more than savings and the written quote is already clear.',doThis:['Get paid invoice and warranty in writing.','Confirm no added charge later.'],cautionsExtra:['Highest overpayment/regret risk if itemization or warranty is missing.']},
    {name:'Dispute / escalate',scoreSeed:58,tags:['written proof','slower'],recommendation:'Use if charges are wrong, duplicated, unauthorized, or not aligned with contract.',doThis:['Collect quote, invoice, messages, photos, and dates.','Ask for correction first before escalating.']}
  ];
}
function tripPlanOptions(form){
  const loc=(form.location||'your destination');
  const days = inferTripDays(form);
  return [
    {name:`${days}-day practical trip plan for ${loc}`,scoreSeed:88,rating:null,reviewCount:null,priceLevel:3,address:loc,tags:['easy logistics','balanced pace','good value'],recommendation:`A practical ${days}-day outline for ${loc}. Use it as a draft, then verify exact activities, hours, weather, travel time, and booking costs.`,doThis:[`Pick one main area to stay in so the trip is not scattered.`,`Choose one main activity/anchor per day, then keep meals nearby.`,`Leave one flexible block for weather, rest, or changes.`,`Before booking, verify hotel location, final price, cancellation, and transport time.`],cautionsExtra:['This is not a live itinerary. Exact attractions, hours, weather, tickets, and prices must be checked.'],notVerified:['activity hours','tickets/prices','weather','transport time']}
  ];
}

function inferTripDays(form){ return tripDayCount(form); }


function destinationOptions(form){
  const loc=form.location||'Selected area';
  if(/miami|beach/i.test(loc)) return [
    {name:'Miami Beach relaxed beach + food base',scoreSeed:88,rating:4.6,reviewCount:2600,priceLevel:3,address:'Miami Beach, FL',lat:25.7907,lng:-80.1300,tags:['walkable','beachfront','good food nearby','easy logistics'],recommendation:'Best destination fit if you want beach access, restaurants nearby, and a trip that is easy to execute.',doThis:['Stay near Mid-Beach or the calmer edge of South Beach.','Plan mornings around beach/pool time.','Keep evenings close to restaurants you can walk or short-ride to.'],cautionsExtra:['Parking, resort fees, and weekend noise can change the experience.'],mapsUrl:makeMapsUrl('Miami Beach','FL')},
    {name:'Wynwood + Design District culture block',scoreSeed:78,rating:4.5,reviewCount:1800,priceLevel:3,address:'Wynwood, Miami, FL',lat:25.8012,lng:-80.1990,tags:['colorful','culture','food','shopping'],recommendation:'Best add-on area if you want murals, design, shopping, and food beyond the beach.',doThis:['Use as a half-day block, not a full beach-day replacement.','Pair murals/design with lunch or early dinner nearby.'],cautionsExtra:['Requires transport from Miami Beach; group stops together.'],mapsUrl:makeMapsUrl('Wynwood Miami','FL')},
    {name:'Biscayne Bay / boat activity day',scoreSeed:74,rating:4.4,reviewCount:1300,priceLevel:3,address:'Biscayne Bay, Miami, FL',lat:25.7743,lng:-80.1853,tags:['water','memorable','activity'],recommendation:'Best if you want one memorable water-based activity without overloading the trip.',doThis:['Pick one boat or bay activity.','Avoid stacking it with long cross-city plans.'],cautionsExtra:['Weather and timing matter. Book refundable if possible.'],mapsUrl:makeMapsUrl('Biscayne Bay Miami','FL')}
  ];
  return [
    {name:`Best overall area in ${loc}`,scoreSeed:84,rating:4.5,reviewCount:1200,priceLevel:3,address:loc,...coordsForFallback(loc,0),tags:['walkable','good value','easy logistics'],recommendation:'Best starting destination choice based on easy logistics and broad fit.',doThis:['Choose one main area as your base.','Group activities by neighborhood.','Avoid overpacking day one.'],mapsUrl:makeMapsUrl(loc,'')},
    {name:`Food + culture area in ${loc}`,scoreSeed:78,rating:4.4,reviewCount:950,priceLevel:3,address:loc,...coordsForFallback(loc,1),tags:['food','culture','walkable'],recommendation:'Best if restaurants and local character matter most.',doThis:['Plan one food anchor and one cultural stop.','Keep transport simple.'],mapsUrl:makeMapsUrl(loc,'food culture')},
    {name:`Relaxed family-friendly area in ${loc}`,scoreSeed:76,rating:4.3,reviewCount:800,priceLevel:2,address:loc,...coordsForFallback(loc,2),tags:['family-friendly','quiet','easy logistics'],recommendation:'Best if low stress matters more than seeing everything.',doThis:['Pick fewer activities and more buffer time.'],mapsUrl:makeMapsUrl(loc,'family activities')}
  ];
}

function flightOptions(form){ const q=encodeURIComponent(`flights ${form.location||''} ${form.dateFrom||''} ${form.dateTo||''}`); return [{name:'Best-value flight strategy',scoreSeed:82,tags:['best value','reasonable timing','avoid overpaying'],recommendation:'Search flexible dates and compare one nonstop option with one one-stop option. Avoid terrible layovers just to save a small amount.',doThis:['Use Google Flights flexible-date grid.','Compare total travel time, baggage fees, and arrival time.','Set a price alert if not urgent.'],buyOptions:[{label:'Search Google Flights',url:`https://www.google.com/travel/flights?q=${q}`},{label:'Search Kayak',url:`https://www.kayak.com/flights/`}]},{name:'Comfort-first flight strategy',scoreSeed:76,tags:['comfortable','nonstop','low stress'],recommendation:'Prioritize nonstop or shortest layover if traveling with family or tight schedule.',doThis:['Check seat selection and baggage fees.','Avoid very early/late flights unless price difference is large.'],buyOptions:[{label:'Search Google Flights',url:`https://www.google.com/travel/flights?q=${q}`}]},{name:'Cheapest fare strategy',scoreSeed:60,tags:['budget','higher friction'],recommendation:'Use only if price is top priority and you can tolerate layovers, strict baggage rules, and less ideal times.',doThis:['Check baggage and change fees carefully.','Avoid separate-ticket connections unless you understand the risk.'],buyOptions:[{label:'Search Skyscanner',url:`https://www.skyscanner.com/transport/flights/`}]}]; }

function inferredPriceLevel(o){
  if(Number.isFinite(Number(o.priceLevel))) return Number(o.priceLevel);
  if(Number.isFinite(Number(o.priceAmount))){
    const n=Number(o.priceAmount);
    if(n<100) return 1;
    if(n<300) return 2;
    if(n<800) return 3;
    return 4;
  }
  const text=`${o.name||''} ${o.address||''} ${(Array.isArray(o.tags)?o.tags.join(' '):o.tags)||''}`.toLowerCase();
  if(/ritz|four seasons|st regis|waldorf|edition|faena|setai|fontainebleau|loews|betsy|luxury|resort|premium|high end/.test(text)) return 4;
  if(/palms|marriott|hilton|hyatt|westin|boutique|spa|plaza|riu/.test(text)) return 3;
  if(/citizenm|hampton|holiday inn|tru|fairfield|best western|comfort inn|la quinta|moxy|catalina|suites|value|budget|motel|affordable/.test(text)) return 2;
  return null;
}
function budgetApplies(form){
  if(form.category==='money' && form.moneyMode!=='find') return false;
  if(form.action==='check' && form.category==='money') return false;
  if(form.category==='style') return ['budget','luxury','premium'].includes((form.budget||'').toLowerCase());
  return ['travel','food','shopping','local'].includes(form.category) || (form.category==='money'&&form.moneyMode==='find');
}
function budgetAssessment(form,o){
  if(!budgetApplies(form)) return {delta:0, pro:'', caution:'', priceLevel:null};
  const budget=(form.budget||'balanced').toLowerCase();
  let p=inferredPriceLevel(o);
  if(Number.isFinite(Number(o.priceAmount))){
    const n=Number(o.priceAmount);
    if(form.category==='travel'){ p = n>=400?4:n>=200?3:n>=100?2:1; }
    else if(form.category==='shopping'){ p = n>=1000?4:n>=300?3:n>=75?2:1; }
    else if(form.category==='food'){ p = n>=120?4:n>=60?3:n>=25?2:1; }
  }
  const text=textOf(o);
  let delta=0, pro='', caution='';
  if(p==null){
    caution='Price level is unclear; verify full cost before relying on this ranking.';
    if(budget==='budget') delta-=4;
    return {delta, pro, caution, priceLevel:p};
  }
  if(budget==='budget'){
    if(p<=2){delta+=18; pro='Budget fit: likely lower-cost/value option.';}
    else if(p===3){delta-=10; caution='May be higher than a budget-focused choice.';}
    else {delta-=28; caution='Poor budget fit: likely premium/expensive.';}
  } else if(budget==='balanced'){
    if(p===2 || p===3){delta+=13; pro='Balanced budget fit: not the cheapest, not the most expensive.';}
    else if(p===1){delta+=2; pro='Good value, but verify quality and comfort.';}
    else {delta-=18; caution='May stretch a balanced budget; verify total cost and fees.';}
  } else if(budget==='premium'){
    if(p===3 || p===4){delta+=14; pro='Premium budget fit: quality/comfort likely matches your budget.';}
    else {delta-=10; caution='May be too basic for a premium preference.';}
  } else if(budget==='luxury'){
    if(p>=4){delta+=32; pro='Luxury budget fit: likely aligns with high-comfort/premium expectations.';}
    else if(p===3){delta-=5; caution='May be acceptable, but not truly luxury/high-end.';}
    else {delta-=24; caution='May feel too basic for a luxury preference.';}
  }
  if(/good value|best value|value|transparent|no hidden fees|affordable/.test(text) && ['budget','balanced'].includes(budget)) { delta+=5; if(!pro) pro='Value signal matches your budget preference.'; }
  if(/expensive|pricey|luxury|premium|high end/.test(text) && ['budget','balanced'].includes(budget)) { delta-=6; if(!caution) caution='Price/value may not match your selected budget.'; }
  return {delta, pro, caution, priceLevel:p};
}
function categoryFitAdjustment(form,o){
  const text=textOf(o); let delta=0; const pros=[]; const cautions=[];
  const wants=(form.vibe||[]).join(' ').toLowerCase();
  if(form.category==='travel'){
    if(form.travelMode==='hotel' && /hotel|resort|inn|suites|stay|spa/.test(text)) { delta+=4; pros.push('Result type matches hotel/stay search.'); }
    if(form.travelMode==='destination' && /hotel|inn|resort|suites/.test(text)) { delta-=18; cautions.push('Looks more like a hotel than a destination/area.'); }
    if(form.travelMode==='itinerary' && /hotel|inn|resort|suites/.test(text)) { delta-=16; cautions.push('Looks more like lodging than a trip plan.'); }
    if(/quiet|low-stress|calm/.test(wants) && /party|nightlife|ocean dr|washington ave|club/.test(text)){delta-=14; cautions.push('May be too lively/noisy for your selected vibe.');}
    if(/walkable/.test(wants) && /collins|lincoln|ocean|south beach|miami beach|downtown|central/.test(text)){delta+=5; pros.push('Location appears walkable/central.');}
    if(/beachfront/.test(wants) && /beach|oceanfront|collins|ocean/.test(text)){delta+=6; pros.push('Beach-area signal matches your must-have.');}
    if(/family/.test(wants) && /suites|resort|pool|family|kid/.test(text)){delta+=6; pros.push('Better family/logistics signal.');}
  }
  if(form.category==='food'){
    if(/restaurant|cafe|dining|grill|bistro|kitchen|food/.test(text)){delta+=4; pros.push('Result type matches food search.');}
    if(/not too loud|quiet/.test(wants) && /bar|club|lounge|lively/.test(text)){delta-=10; cautions.push('May not fit a quieter meal.');}
    if(/kid-friendly|family/.test(wants) && /family|casual|kid/.test(text)){delta+=6; pros.push('Better family-friendly signal.');}
  }
  if(form.category==='shopping'){
    if(form.shoppingMode==='products' && /store|mall|district|center/.test(text)){delta-=8; cautions.push('This looks like a place, not a product recommendation.');}
    if(form.shoppingMode==='places' && /district|mall|store|center|boutique/.test(text)){delta+=6; pros.push('Result type matches store/place search.');}
    if(/durable|premium quality|lightweight|portable|long battery/.test(wants) && /durable|premium|lightweight|portable|battery|quality/.test(text)){delta+=5; pros.push('Product features match your must-haves.');}
  }
  if(form.category==='style'){
    if(/comfortable/.test(wants) && /comfortable|breathable|linen|cotton|easy/.test(text)){delta+=6; pros.push('Comfort/style fit signal.');}
    if(/colorful/.test(wants) && /color|accent|colorful/.test(text)){delta+=5; pros.push('Color preference is reflected.');}
    if(/semi-formal|polished/.test(wants) && /polished|structured|classic/.test(text)){delta+=5; pros.push('Formality/polish signal matches.');}
  }
  if(form.category==='local' || (form.category==='money'&&form.moneyMode==='find')){
    if(/licensed/.test(wants) && /licensed|insured/.test(text)){delta+=7; pros.push('License/insurance signal matches.');}
    if(/written quote|no surprise fees/.test(wants) && /written|transparent|no surprise|itemized/.test(text)){delta+=7; pros.push('Pricing transparency signal matches.');}
  }
  return {delta, pros, cautions};
}

function commitmentExtras(form,o,score,pros,cautions,questions,budget){
  const t = signalTextOf(o);
  const missing = [];
  const redFlags = [];
  const notVerified = [];
  const evidence = [];
  const isLivePlace = o.source === 'google_places';
  const isQuoteReview = form.category === 'money' && form.moneyMode !== 'find';
  const isPlaceSearch = ['food','local'].includes(form.category) || (form.category==='travel' && form.travelMode==='hotel') || (form.category==='shopping' && form.shoppingMode==='places') || (form.category==='money' && form.moneyMode==='find');

  if(form.category) evidence.push(`Category: ${form.category}${form.travelMode?` / ${form.travelMode}`:''}${form.shoppingMode?` / ${form.shoppingMode}`:''}${form.moneyMode?` / ${form.moneyMode}`:''}`);
  if(form.budget) evidence.push(`Budget selected: ${form.budget}`);
  if(form.location) evidence.push(`Location: ${form.location}`); else if(isPlaceSearch) missing.push('location');
  if(form.dateFrom) evidence.push(`Date context: ${form.dateFrom}${form.dateTo?` to ${form.dateTo}`:''}`); else if(form.category==='travel') missing.push('travel dates');
  if((form.vibe||[]).length) evidence.push(`Must-haves: ${(form.vibe||[]).join(', ')}`);
  if(o.rating) evidence.push(`Rating signal: ${o.rating}${o.reviewCount?` from ${Number(o.reviewCount).toLocaleString()} reviews`:''}`);
  if(isLivePlace) evidence.push('Live Google Places data used for place details.');
  if(form.details && form.details.length>25) evidence.push('User-provided details were used.');

  if(isQuoteReview){
    const d = `${form.details||''} ${form.amount||''}`.toLowerCase();
    if(!/warranty|guarantee/.test(d)) { missing.push('written warranty'); redFlags.push('Warranty is not clearly stated.'); }
    if(!/labor|parts|item|breakdown|itemized/.test(d)) { missing.push('parts/labor itemization'); redFlags.push('Parts and labor are not clearly separated.'); }
    if(!/diagnostic|trip|service fee/.test(d)) missing.push('diagnostic/trip fee details');
    if(/\b(?:1000|1,000|1200|1,200|1500|1,500|2000|2,000)\b/.test(d)) redFlags.push('Amount is high enough to justify another quote.');
    notVerified.push('local market price', 'provider license/insurance', 'whether the work is required now');
  } else if(form.category==='travel'){
    notVerified.push('exact final price', 'availability', 'cancellation rules', 'resort/parking fees');
    missing.push('live price/availability');
    if(/resort fee|parking extra|nonrefundable|non-refundable/.test(t)) redFlags.push('Possible extra fee or restrictive booking term.');
  } else if(form.category==='food'){
    notVerified.push('reservation availability', 'current wait time', 'recent noise/service complaints');
    if(/loud|bar|party|nightlife/.test(t)) redFlags.push('May be too loud for a quiet meal.');
  } else if(form.category==='local'){
    notVerified.push('license/insurance', 'written estimate', 'warranty', 'final service fee');
    if(!/licensed|insured|warranty|written/.test(t)) missing.push('license/warranty proof');
  } else if(form.category==='shopping'){
    notVerified.push('current price', 'return policy', 'warranty', 'recent low-star complaints');
    if(!/price|\$|deal|discount/.test(t)) missing.push('current price');
    if(/cheap|basic|verify quality|mixed reviews/.test(t)) redFlags.push('Quality or return-risk should be checked.');
  } else if(form.category==='style'){
    notVerified.push('weather', 'dress code', 'fit/size availability');
  }
  if((cautions||[]).length) redFlags.push(...cautions.slice(0,2));

  let fit = Math.max(10, Math.min(96, score + (pros.length*2) - (cautions.length*2)));
  let priceRisk = Math.max(10, Math.min(96, 78 - Math.max(0,(budget?.priceLevel||2)-2)*12 + (form.budget==='luxury'?10:0) - (form.budget==='budget'?8:0)));
  let hiddenRisk = Math.max(10, Math.min(96, 82 - redFlags.length*10 - missing.length*6));
  let convenience = Math.max(10, Math.min(96, 62 + (form.location?12:0) + (/walkable|easy|nearby|central|fast/.test(t)?12:0) - (/far|long|complicated/.test(t)?12:0)));
  let regret = Math.max(10, Math.min(96, 82 - cautions.length*8 - redFlags.length*8 - missing.length*5));

  let commitScore = Math.round((fit*0.30)+(priceRisk*0.18)+(hiddenRisk*0.20)+(convenience*0.12)+(regret*0.20));
  if(form.category==='travel' && form.travelMode==='hotel' && !/\$|price|rate|night/.test(t)) commitScore = Math.min(commitScore, 76);
  if(isPlaceSearch && !isLivePlace && form.location) commitScore = Math.min(commitScore, 72);
  if(redFlags.length>=2 || missing.length>=3) commitScore = Math.min(commitScore, 68);
  if(isQuoteReview && (redFlags.length || missing.length)) commitScore = Math.min(commitScore, 62);

  const criticalMissing = missing.filter(x=>/warranty|itemization|live price|current price|location|travel dates|license/.test(x));
  let commitLabel = 'Shortlist';
  let action = categoryAction(form,o,commitScore,redFlags,missing,notVerified,isLivePlace);
  if(commitScore>=85 && !redFlags.length && criticalMissing.length===0) commitLabel='Proceed';
  else if(commitScore>=70) commitLabel='Shortlist';
  else if(commitScore>=55) commitLabel='Pause';
  else commitLabel='Avoid for now';

  const chooseIf = chooseThisIf(form,o,t);
  const regretText = regretPredictor(form,o,t,redFlags,missing);
  const askMessage = askBeforeMessage(form,o,missing,redFlags);
  return {
    commitScore,
    commitLabel,
    commitAction: action,
    commitBreakdown:{fit:Math.round(fit), priceValue:Math.round(priceRisk), riskSafety:Math.round(hiddenRisk), convenience:Math.round(convenience), regretSafety:Math.round(regret)},
    redFlags: unique(redFlags).slice(0,4),
    missingInfo: unique(missing).slice(0,4),
    evidence: unique(evidence).slice(0,6),
    notVerified: unique(notVerified).slice(0,5),
    chooseThisIf: chooseIf,
    regretPredictor: regretText,
    askBeforeMessage: askMessage,
    dataStatus: isLivePlace ? 'Live place data used. Exact prices/availability may still need checking.' : 'No live data source used. Treat as a draft until verified.'
  };
}
function categoryAction(form,o,commitScore,redFlags,missing,notVerified,isLivePlace){
  if(form.category==='money' && form.moneyMode!=='find'){
    if(redFlags.length || missing.length) return 'Do not approve yet — ask for itemized details first.';
    return 'Looks reasonable to continue, but save written terms before paying.';
  }
  if(form.category==='travel' && form.travelMode==='hotel'){
    return 'Shortlist this hotel; verify total price, fees, availability, and cancellation before booking.';
  }
  if(form.category==='travel' && form.travelMode==='itinerary') return 'Use this as a draft plan; check timing, travel distance, and weather before locking it in.';
  if(form.category==='travel' && form.travelMode==='destination') return 'Shortlist this destination; verify season, travel time, and total trip cost.';
  if(form.category==='food') return 'Shortlist this place; check availability, noise, menu fit, and travel time before reserving.';
  if(form.category==='local' || (form.category==='money'&&form.moneyMode==='find')) return 'Contact only after confirming license, written estimate, warranty, and final fees.';
  if(form.category==='shopping') return 'Do not buy yet; verify live price, return policy, warranty, and one comparable alternative.';
  if(form.category==='style') return 'Use this outfit direction; confirm weather, dress code, and comfort before buying anything new.';
  return commitScore>=70 ? 'Shortlist this, then verify the biggest unknown.' : 'Pause and compare one safer option first.';
}
function chooseThisIf(form,o,t){
  if(form.category==='travel'&&form.travelMode==='hotel') return /quiet|calmer/.test(t)?'Choose this if quiet, easy logistics, and a calmer stay matter more than nightlife.':'Choose this if location, convenience, and overall stay quality matter most.';
  if(form.category==='travel'&&form.travelMode==='itinerary') return 'Choose this plan if the pacing matches your energy level and you can keep one main anchor per day.';
  if(form.category==='food') return /quiet|date/.test(t)?'Choose this if conversation and a calmer setting matter most.':'Choose this if menu fit, availability, and overall vibe match your group.';
  if(form.category==='shopping') return /value|budget/.test(t)?'Choose this if value matters more than premium features.':'Choose this if the specs, warranty, and return policy match your actual use.';
  if(form.category==='style') return 'Choose this if you want a polished but comfortable look that fits the occasion.';
  if(form.category==='local'||(form.category==='money'&&form.moneyMode==='find')) return 'Choose this provider only if license, written estimate, warranty, and final fee are confirmed.';
  if(form.category==='money') return 'Use this action if the provider cannot clearly itemize scope, parts, labor, fees, and warranty.';
  return 'Choose this if it matches your must-haves and the risks are acceptable.';
}
function regretPredictor(form,o,t,redFlags,missing){
  if(redFlags.length || missing.length) return `You may regret this if you commit before checking: ${[...redFlags,...missing.map(x=>`missing ${x}`)].slice(0,3).join('; ')}.`;
  if(form.category==='travel') return 'You may regret this if the final price, location, or cancellation policy is worse than expected.';
  if(form.category==='food') return 'You may regret this if it is louder, more expensive, or less available than expected.';
  if(form.category==='shopping') return 'You may regret this if the return policy, warranty, or low-star complaints are weak.';
  if(form.category==='style') return 'You may regret this if comfort, weather, or dress code are not checked.';
  if(form.category==='local') return 'You may regret this if the provider will not put scope, fees, and warranty in writing.';
  return 'You may regret this if key terms are unclear before you commit.';
}
function askBeforeMessage(form,o,missing,redFlags){
  if(form.category==='money' && form.moneyMode!=='find') return 'Hi, before approving, can you please send an itemized quote showing parts, labor, diagnostic/trip fee, warranty, exclusions, and whether any charges are optional?';
  if(form.category==='travel') return 'Hi, before booking, can you confirm the total price including taxes/fees, parking or resort fees, cancellation policy, and whether this option is quiet and well-located for my dates?';
  if(form.category==='local'||(form.category==='money'&&form.moneyMode==='find')) return 'Hi, before scheduling, can you confirm license/insurance, diagnostic fee, itemized written estimate, warranty, timing, and what is excluded from the quote?';
  if(form.category==='shopping') return 'Before buying, check the final price, warranty, return window, recent low-star complaints, and whether this is the right level of product for your actual need.';
  if(form.category==='food') return 'Before reserving, check availability, menu fit, noise level, parking/wait time, and recent reviews.';
  if(form.category==='style') return 'Before buying the look, check weather, dress code, comfort, sizing, and return policy.';
  return 'Before committing, confirm final cost, terms, missing details, and the biggest risk.';
}

function textOf(o){ return `${o.name||''} ${o.address||''} ${(Array.isArray(o.tags)?o.tags.join(' '):o.tags)||''} ${o.recommendation||''}`.toLowerCase(); }
function signalTextOf(o){ return `${o.name||''} ${o.address||''} ${(Array.isArray(o.tags)?o.tags.join(' '):o.tags)||''} ${o.raw||''}`.toLowerCase(); }
function unique(a){return [...new Set(a.filter(Boolean))]}
export function scoreOptions({form,options,profile}){
  const comp=profileCompleteness(profile);
  return options.map(o=>{
    let score=Number(o.scoreSeed||50);
    const baseScore=score;
    const scorePlus=[]; const scoreMinus=[];
    const t=textOf(o);
    const sig=signalTextOf(o);
    const pros=[]; const cautions=[]; const questions=[];

    const budget=budgetAssessment(form,o);
    score += budget.delta;
    if(budget.pro){ pros.push(budget.pro); scorePlus.push(budget.pro); }
    if(budget.caution){ cautions.push(budget.caution); scoreMinus.push(budget.caution); }

    if(o.rating>=4.7){score+=8; pros.push(`Strong rating signal (${o.rating}).`); scorePlus.push(`Strong rating (${o.rating}).`)}
    else if(o.rating>=4.4){score+=5; pros.push(`Good rating signal (${o.rating}).`); scorePlus.push(`Good rating (${o.rating}).`)}
    else if(o.rating && o.rating<4.0){score-=8; cautions.push(`Lower rating signal (${o.rating}); inspect recent reviews carefully.`); scoreMinus.push(`Lower rating (${o.rating}).`)}
    if(o.reviewCount>3000){score+=4; pros.push('Large review base.'); scorePlus.push('Large review base.')}
    else if(o.reviewCount>1200){score+=2; pros.push('Decent review base.'); scorePlus.push('Decent review base.')}

    const matchTerm=(term, haystack=sig)=>{
      const raw=String(term||'').toLowerCase().trim();
      if(!raw) return false;
      if(haystack.includes(raw)) return true;
      return raw.split(/\s+/).filter(w=>w.length>3).some(w=>haystack.includes(w));
    };
    // Match profile/must-have signals only against option identity/tags/raw details.
    // Do not match against recommendation/checklist text, otherwise warnings like
    // "verify cancellation fees" can falsely penalize options for "hidden fees".
    const avoidHit=(term)=>{
      const raw=String(term||'').toLowerCase().trim();
      if(!raw) return false;
      if(sig.includes(`no ${raw}`) || sig.includes(`without ${raw}`) || sig.includes(`avoid ${raw}`)) return false;
      if(raw==='overpriced' && (sig.includes('avoid overpaying') || sig.includes('not overpriced'))) return false;
      if(raw==='hidden fees' && (sig.includes('transparent') || sig.includes('no surprise fees'))) return false;
      return matchTerm(raw,sig);
    };
    (profile.priorities||[]).forEach(p=>{ if(matchTerm(p,sig)){const d=comp>=50?5:2; score+=d; pros.push(`Matches your profile: ${p}.`); scorePlus.push(`Profile match: ${p}.`)} });
    (profile.avoid||[]).forEach(p=>{ if(avoidHit(p)){const d=comp>=50?9:4; score-=d; cautions.push(`Touches your avoid-list: ${p}.`); scoreMinus.push(`Avoid-list signal: ${p}.`)} });
    (profile.learnedLikes||[]).forEach(p=>{ if(matchTerm(p,sig)){score+=4; pros.push(`Learned from past feedback: you tend to like ${p}.`); scorePlus.push(`Past feedback likes: ${p}.`)} });
    (profile.learnedAvoid||[]).forEach(p=>{ if(avoidHit(p)){score-=7; cautions.push(`Learned from past feedback: you tend to avoid ${p}.`); scoreMinus.push(`Past feedback avoid: ${p}.`)} });
    if(!(form.category==='money' && form.moneyMode!=='find')){
      (form.vibe||[]).forEach(v=>{ if(matchTerm(v,sig)){score+=5; pros.push(`Matches must-have: ${v}.`); scorePlus.push(`Must-have match: ${v}.`) } });
    }

    const cat=categoryFitAdjustment(form,o);
    score += cat.delta; pros.push(...cat.pros); cautions.push(...cat.cautions); if(cat.delta>0) scorePlus.push(...cat.pros.slice(0,2)); if(cat.delta<0) scoreMinus.push(...cat.cautions.slice(0,2));

    if(o.cautionsExtra){ cautions.push(...o.cautionsExtra); scoreMinus.push(...o.cautionsExtra.slice(0,2)); }
    if(o.prosExtra){ pros.push(...o.prosExtra); scorePlus.push(...o.prosExtra.slice(0,2)); }

    if(form.action==='compare'){
      questions.push('Are prices, dates, and cancellation/return terms comparable?','Which option best matches your must-haves and avoid-list?','What is the biggest regret risk for the top option?')
    } else if(form.action==='check' && form.category==='money'){
      questions.push('Is parts/labor itemized?','Is warranty stated in writing?','Are diagnostic, trip, and service fees separated?','Is there a second-quote trigger because the scope is vague or expensive?')
    } else if(form.category==='travel'&&form.travelMode==='itinerary'){
      questions.push('Are opening hours, travel time, and weather realistic for these days?','Are meals and activities grouped by area to avoid wasted time?','Is there enough rest/buffer time for your travel style?')
    } else if(form.category==='travel'){
      questions.push('Check newest low-star reviews or recent traveler feedback.','Verify full cost, resort fees, parking/transit, and cancellation rules.','Confirm the option matches your selected budget, not just the star rating.')
    } else if(form.category==='food'){
      questions.push('Check recent reviews, availability, menu fit, and noise level.','Confirm reservation timing and travel time.')
    } else if(form.category==='local'||(form.category==='money'&&form.moneyMode==='find')){
      questions.push('Check newest low-star reviews.','Verify written estimate, warranty, license/insurance, and exact service area.','Confirm diagnostic fee, trip charge, and what is included.')
    } else if(form.category==='shopping'&&form.shoppingMode==='places'){
      questions.push('Check store hours, parking, return policy, and whether the location has the product/category you need.')
    } else if(form.category==='shopping'){
      questions.push('Check return policy, warranty, and low-star complaints.','Compare one value option and one higher-quality option.')
    } else if(form.category==='style'){
      questions.push('Confirm weather, dress code, and comfort.','Choose one accent; keep the rest simple.')
    } else if(form.category==='money'){
      questions.push('Ask for itemized pricing in writing.','Compare at least one competing quote.')
    }

    score=Math.max(10,Math.min(96,Math.round(score)));
    const verdict = (form.category==='money' && form.moneyMode!=='find')
      ? (score>=82?'Recommended action':score>=68?'Reasonable action':score>=52?'Use with caution':'Weak action')
      : (score>=82?'Best fit':score>=68?'Good fit':score>=52?'Mixed fit':'Weak fit');
    { const cleanPros=unique(pros).slice(0,5); const cleanCautions=unique(cautions).slice(0,5); const cleanQuestions=unique(questions).slice(0,4); const extras=commitmentExtras(form,o,score,cleanPros,cleanCautions,cleanQuestions,budget); return {...o, ...extras, inferredPriceLevel:budget.priceLevel, score, verdict, scoreBreakdown:{base:baseScore, plus:unique(scorePlus).slice(0,4), minus:unique(scoreMinus).slice(0,4)}, pros:cleanPros, cautions:cleanCautions, questions:cleanQuestions, nextStep:o.nextStep||nextStep(form,o,score)} }
  }).sort((a,b)=>b.score-a.score);
}
function nextStep(form,o,score){
  if(form.category==='travel'&&form.travelMode==='itinerary') return 'Use this as a draft only. Verify activities, timing, weather, cost, and travel distance before booking.';
  if(form.category==='travel'&&form.travelMode==='destination') return score>=80
    ? `Shortlist ${o.name}; verify travel time, season/weather, nearby food, and whether the area matches your pace.`
    : `Keep ${o.name} as a backup area and compare one better-fit destination/area.`;
  if(form.category==='travel') return score>=80
    ? `Shortlist ${o.name}; verify total price, resort/parking fees, cancellation rules, newest reviews, and location fit.`
    : `Keep ${o.name} as a backup and compare one stronger hotel/stay option.`;
  if(form.category==='food') return score>=80
    ? `Shortlist ${o.name}; check reservation availability, recent reviews, menu fit, noise level, and travel time.`
    : `Keep ${o.name} as a backup and compare one stronger restaurant/cafe option.`;
  if(form.category==='local'||(form.category==='money'&&form.moneyMode==='find')) return score>=80
    ? `Contact ${o.name} first; verify license/insurance, written estimate, warranty, service area, and final price.`
    : `Keep ${o.name} as backup and contact one stronger provider first.`;
  if(form.category==='shopping'&&form.shoppingMode==='places') return score>=80
    ? `Shortlist ${o.name}; verify hours, parking, inventory/category fit, return policy, and distance.`
    : `Keep ${o.name} as a backup and compare one stronger store/place.`;
  if(form.category==='shopping') return score>=75
    ? 'Shortlist this direction, then compare actual products/links, warranty, reviews, and return policy.'
    : 'Do not buy yet; compare stronger product options or paste actual links.';
  if(form.category==='style') return 'Use this outfit formula and buy similar pieces if needed.';
  if(form.category==='money') return score>=70?'Do this before paying.':'Avoid this unless speed matters more than saving money.';
  return 'Verify missing details before committing.';
}

