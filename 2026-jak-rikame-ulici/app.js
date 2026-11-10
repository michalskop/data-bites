'use strict';
const $=id=>document.getElementById(id);
const A_RGB=[217,96,15],B_RGB=[36,103,168],MID=[196,192,181];
const S={a:'gasse',b:'strasse',metric:'logit',centre:'parity',alpha:'all',size:10};
const LIMIT=Math.log(20); // logit clip: 1:20
let fitK=.1,rid='dach',R,meta,geo,base,plateNames={},terrainImg,fam={},rows=[],index=new Map(),cols=[],view={cx:4300,cy:3000,k:1},dpr=1,W=0,H=0,hover=null,bounds;
const MEDIA='https://media.datatimes.org/databites-dtcz/2026-jak-rikame-ulici/';
const canvas=$('map'),ctx=canvas.getContext('2d');
let lang='cs';try{lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('jak-rikame-ulici-lang')||'cs'}catch(e){}if(!COPY[lang])lang='cs';
const tr=(k,v={})=>(COPY[lang][k]||COPY.en[k]).replace(/\{(\w+)\}/g,(m,x)=>v[x]);
const rc=k=>(R.copy[lang]||R.copy.en)[k]||R.copy.en[k]||'';
const fmt=n=>n.toLocaleString(lang);
function applyLang(){
  document.documentElement.lang=lang;if(R){document.title=rc('pageTitle');
    $('credit-extra').innerHTML=rc('credit');$('credit-base').textContent=tr('basemap');
    $('eyebrow').textContent=rc('eyebrow');$('h1').innerHTML=rc('h1');$('intro').innerHTML=rc('intro');$('disclaimer').textContent=rc('disclaimer');
    $('about-body').innerHTML=tr('about_h2')+tr('about_streets')+rc('families')+tr('about_colour')+tr('about_grid')+rc('area')+rc('caveat');
    document.querySelectorAll('#regions button').forEach(b=>{b.textContent=REGIONS[b.dataset.r].short[lang]||REGIONS[b.dataset.r].short.en;b.setAttribute('aria-pressed',b.dataset.r===rid)})}
  document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=tr(e.dataset.i18n));
  document.querySelectorAll('[data-i18n-html]').forEach(e=>e.innerHTML=tr(e.dataset.i18nHtml));
  document.querySelectorAll('.lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
  if(meta){for(const id of ['a','b']){const v=$(id).value;$(id).innerHTML=meta.families.map(f=>`<option value="${f.key}">${flab(f)}</option>`).join('');$(id).value=v}}
  if(rows.length){legend();text();plates()}
}
const mix=(c1,c2,t)=>c1.map((v,i)=>v+(c2[i]-v)*t);
const hex2rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const isDom=()=>S.metric==='dominant'&&R.dominant;

async function j(u){const r=await fetch(u);if(!r.ok)throw Error(u);return r.json()}
async function init(){
  let want=location.hash.slice(1);try{want=want||localStorage.getItem('region')}catch(e){}
  if(!REGIONS[want])want=REGION_ORDER[0];
  $('regions').innerHTML=REGION_ORDER.map(r=>`<button data-r="${r}"></button>`).join('');
  $('regions').querySelectorAll('button').forEach(b=>b.onclick=()=>switchRegion(b.dataset.r));
  bind();await loadRegion(want);
}
window.addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(REGIONS[h]&&h!==rid)switchRegion(h)});
async function switchRegion(id){
  if(id===rid&&meta)return;$('loading').hidden=false;hide();
  try{localStorage.setItem('region',id)}catch(e){}
  if(location.hash.slice(1)!==id)history.replaceState(null,'','#'+id);
  await loadRegion(id);
}
async function loadRegion(id){
  rid=id;R=REGIONS[id];const d=`data/${id}/`;
  [meta,geo,base,plateNames]=await Promise.all([j(d+'meta.json'),j(d+'geo.json'),j(d+'basemap.json'),j(d+'plates.json').catch(()=>({}))]);
  rows=[];fam={};hover=null;
  terrainImg=new Image();terrainImg.crossOrigin='anonymous';terrainImg.onload=draw;terrainImg.src=MEDIA+'terrain-'+rid+'-v1.png';$('export-ready').href=MEDIA+'ulice-'+rid+'-v1.png';
  meta.families.forEach((f,i)=>fam[f.key]=i);
  S.a=R.defaults.a;S.b=R.defaults.b;S.metric=R.defaults.metric||'logit';
  $('metric').querySelector('[data-v=dominant]').hidden=!R.dominant;
  [...$('metric').children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.metric));
  for(const id of ['a','b']){$(id).innerHTML=meta.families.map(f=>`<option value="${f.key}">${flab(f)}</option>`).join('');}
  $('a').value=S.a;$('b').value=S.b;
  let xs=[],ys=[];for(const r of Object.values(geo))for(const p of r)for(const [x,y] of p[0]){xs.push(x);ys.push(y)}
  bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  $('srcs').innerHTML='<p class="small">'+meta.sources.map(s=>s.region+' · '+(s.modified||'')).join('<br>')+'</p>';
  const sizes=Object.keys(meta.sizes).map(Number).sort((x,y)=>y-x);S.size=R.size||sizes[1]||sizes[0];
  $('size').innerHTML=sizes.map(z=>`<button data-v="${z}" aria-pressed="${z===S.size}">${z} km</button>`).join('');
  applyLang();resize();fit();await loadSize();$('loading').hidden=true;
}
async function loadSize(){
  rows=await j(`data/${rid}/hex-${S.size}.json`);index=new Map();
  rows.forEach((r,i)=>index.set(r[0]*100003+r[1],i));
  recolour();
}
// overall counts for the "average" centre
function totals(){const t=new Array(meta.families.length).fill(0);for(const r of rows)for(let i=0;i<t.length;i++)t[i]+=r[3+i];return t}
let colour=[],alphaArr=[];
function recolour(){
  const dom=isDom(),ia=fam[S.a],ib=fam[S.b],T=totals();
  const set=dom?R.dominant.map(([k])=>fam[k]):[ia,ib],dcols=dom?R.dominant.map(([,c])=>hex2rgb(c)):null;
  const centreLogit=S.centre==='mean'?Math.log((T[ia]+.5)/(T[ib]+.5)):0;
  const centreShare=S.centre==='mean'?T[ia]/Math.max(1,T[ia]+T[ib]):.5;
  const base=S.alpha==='all'?r=>r[2]:r=>set.reduce((s,f)=>s+r[3+f],0);
  const vals=rows.map(base).filter(v=>v>0).sort((x,y)=>x-y);
  const hi=Math.log1p(vals[Math.floor(vals.length*.98)]||1);
  colour=new Array(rows.length);alphaArr=new Float32Array(rows.length);
  rows.forEach((r,i)=>{
    const n=base(r);let col;
    if(dom){
      let best=0,bv=0,sum=0;set.forEach((f,k)=>{const v=r[3+f];sum+=v;if(v>bv){bv=v;best=k}});
      col=sum?mix(MID,dcols[best],Math.min(1,.45+.55*Math.max(0,(bv/sum-.4)/.6))):MID;
    }else{
      const a=r[3+ia],b=r[3+ib];let t; // -1 = pure B side … +1 = pure A side
      if(a+b===0){t=0}
      else if(S.metric==='logit'){
        const l=Math.log((a+.5)/(b+.5))-centreLogit;t=Math.max(-1,Math.min(1,l/LIMIT));
      }else{
        const s=a/(a+b),c=centreShare;t=s>=c?(s-c)/(1-c):-(c-s)/c;
      }
      col=t>=0?mix(MID,A_RGB,t):mix(MID,B_RGB,-t);
    }
    colour[i]=col.map(Math.round).join(',');
    alphaArr[i]=n>0?.1+.9*Math.min(1,Math.log1p(n)/hi):0;
  });
  for(const id of ['a','b','swap'])$(id).disabled=!!dom;
  legend();text();plates();draw();
}
function legend(){
  const lc=$('lg-color').getContext('2d'),w=180;
  for(let x=0;x<w;x++){const t=x/(w-1)*2-1;lc.fillStyle=`rgb(${(t<0?mix(MID,A_RGB,-t):mix(MID,B_RGB,t)).map(Math.round)})`;lc.fillRect(x,0,1,12)}
  const la=$('lg-alpha').getContext('2d');la.clearRect(0,0,w,12);
  for(let x=0;x<w;x++){la.fillStyle=`rgba(90,90,90,${.1+.9*x/(w-1)})`;la.fillRect(x,0,1,12)}
  const dom=isDom();$('lg-pair').hidden=dom;$('lg-dom').hidden=!dom;
  if(dom)$('lg-dom').innerHTML=R.dominant.map(([k,c,l])=>`<span><i style="background:${c}"></i>${lab2(k,l)}</span>`).join('');
  $('lg-a').textContent=lab(S.a);$('lg-b').textContent=lab(S.b);
}
const CSL={spanish:'španělské slovo na začátku (Calle, Camino, Paseo…)',french:'francouzské slovo na začátku (Rue, Chemin…)',bare:'jen jméno',shari:'Šári‘',hara:'Hára',tariq:'Tarík',ziqaq:'Ziqáq',midan:'Midán'};
const lab2=(k,l)=>(lang==='cs'&&CSL[k])||l||lab(k);
const flab=f=>(lang==='cs'&&CSL[f.key])||f.label;
const lab=k=>flab(meta.families[fam[k]]);
function text(){
  const T=totals(),tot=rows.reduce((s,r)=>s+r[2],0);
  if(isDom()){
    const sp=R.dominant.map(([k,c,l])=>`<span style="color:${c}">${lab2(k,l)}</span>`);
    $('title').innerHTML=sp.slice(0,-1).join(', ')+' '+tr('or')+' '+sp[sp.length-1]+'?';
    $('subtitle').textContent=R.dominant.map(([k,,l])=>fmt(T[fam[k]])+' '+lab2(k,l)).join(' · ')+' '+tr('subtitleDom',{tot:fmt(tot),hex:fmt(rows.length)});
    $('metric-note').textContent=tr('noteDom');return;
  }
  $('title').innerHTML=tr('titleQ',{a:`<span class="ca">${lab(S.a)}</span>`,b:`<span class="cb">${lab(S.b)}</span>`});
  $('subtitle').textContent=tr('subtitle',{na:fmt(T[fam[S.a]]),a:lab(S.a),nb:fmt(T[fam[S.b]]),b:lab(S.b),tot:fmt(tot),hex:fmt(rows.length)});
  $('metric-note').textContent=tr(S.metric==='logit'?'noteLogit':'noteShare');
}
// ---- street plates
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const plateText=n=>'<span class="pt">'+n.split(/\s*\/\s*/).map((p,i)=>i?`<span class="l2">${esc(p)}</span>`:esc(p)).join('<br>')+'</span>';
function plates(){
  if(!base||!rows.length)return;
  const ia=fam[S.a],ib=fam[S.b],R2=Math.max(S.size*.7,(R.plateRadius&&R.plateRadius[S.size])||Math.max(12,S.size*1.6)),out=[];
  for(const [city,cls,prefix,sub,feat] of R.plates){
    const c=base.cities.find(x=>x[0]===city);if(!c)continue;
    const keys=feat?[feat]:isDom()?R.dominant.map(x=>x[0]):[S.a,S.b],cnt=keys.map(()=>0);let cityTot=0;
    for(const r of rows){const [x,y]=centre(r);if((x-c[1])**2+(y-c[2])**2<R2*R2){keys.forEach((k,m)=>cnt[m]+=r[3+fam[k]]);for(let f=0;f<meta.families.length;f++)cityTot+=r[3+f]}}
    const sum=cnt.reduce((s,v)=>s+v,0),a=sum,b=0;if(sum===0)continue;
    const mi=cnt.indexOf(Math.max(...cnt)),top=keys[mi],p=Math.round(100*cnt[mi]/(feat?cityTot:sum));
    const name=(plateNames[city]||{})[top];if(!name)continue;
    const tot=cityTot;if(!feat&&!isDom()&&Math.max(...cnt)<.2*tot)continue;
    out.push(`<button class="plate-item" data-city="${city}" title="${tr('plateHint')}"><div class="plate-box"><div class="plate ${cls}" data-sub="${sub||''}">${prefix}${plateText(name)}</div></div><small>${tr('plateCaption',{city:city,p:p,fam:lab(top)})}</small></button>`);
  }
  $('plates').innerHTML=out.join('');
  $('plates').querySelectorAll('.plate-item').forEach(b=>b.onclick=()=>{
    const c=base.cities.find(x=>x[0]===b.dataset.city);view.cx=c[1];view.cy=c[2];view.k=Math.max(view.k,9);hide();draw()});
}
// ---- geometry
function hexSize(){return S.size/Math.sqrt(3)}
const toScreen=(x,y)=>[(x-view.cx)*view.k+W/2,-(y-view.cy)*view.k+H/2];
const toWorld=(px,py)=>[(px-W/2)/view.k+view.cx,-(py-H/2)/view.k+view.cy];
function centre(r){return [S.size*(r[0]+r[1]/2),hexSize()*1.5*r[1]]}
function draw(){
  if(!W||!geo||!meta)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  if(base){
    ctx.fillStyle='#f7f4ec';ctx.strokeStyle='#cfc9ba';ctx.lineWidth=.8;
    for(const poly of base.land){ctx.beginPath();poly[0].forEach(([X,Y],n)=>{const [x,y]=toScreen(X,Y);n?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.stroke()}
    for(const ins of base.insets||[]){const [a,b,c,d]=ins.box,[x0,y0]=toScreen(a,d),[x1,y1]=toScreen(c,b);
      ctx.fillStyle='#f1eee6';ctx.fillRect(x0,y0,x1-x0,y1-y0);ctx.setLineDash([4,3]);ctx.strokeStyle='#b9b3a2';ctx.lineWidth=1;ctx.strokeRect(x0,y0,x1-x0,y1-y0);ctx.setLineDash([]);
      ctx.fillStyle='#f7f4ec';ctx.strokeStyle='#cfc9ba';ctx.lineWidth=.8}
    for(const poly of base.inset_land||[]){ctx.beginPath();poly[0].forEach(([X,Y],n)=>{const [x,y]=toScreen(X,Y);n?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.stroke()}
    const T=base.terrain;
    if($('terrain').checked&&terrainImg.complete&&terrainImg.naturalWidth){
      const [tx,ty]=toScreen(T.x0,T.y1);ctx.drawImage(terrainImg,tx,ty,(T.x1-T.x0)*view.k,(T.y1-T.y0)*view.k)}
  }
  const s=hexSize()*view.k*.985,hw=Math.sqrt(3)/2*s,m=s*2;
  const dx=[0,hw,hw,0,-hw,-hw],dy=[-s,-s/2,s/2,s,s/2,-s/2];
  for(let i=0;i<rows.length;i++){
    const al=alphaArr[i];if(al<=0)continue;
    const [wx,wy]=centre(rows[i]),[x,y]=toScreen(wx,wy);
    if(x<-m||y<-m||x>W+m||y>H+m)continue;
    ctx.fillStyle=`rgba(${colour[i]},${al.toFixed(3)})`;
    ctx.beginPath();for(let k=0;k<6;k++)k?ctx.lineTo(x+dx[k],y+dy[k]):ctx.moveTo(x+dx[k],y+dy[k]);ctx.closePath();ctx.fill();
  }
  if(hover!=null){const [x,y]=toScreen(...centre(rows[hover]));ctx.strokeStyle='#101432';ctx.lineWidth=2;ctx.beginPath();
    for(let k=0;k<6;k++)k?ctx.lineTo(x+dx[k],y+dy[k]):ctx.moveTo(x+dx[k],y+dy[k]);ctx.closePath();ctx.stroke()}
  ctx.strokeStyle='rgba(16,20,50,.45)';ctx.lineWidth=.9;ctx.lineJoin='round';
  for(const reg of Object.values(geo))for(const poly of reg){ctx.beginPath();
    for(const ring of poly){ring.forEach(([X,Y],n)=>{const [x,y]=toScreen(X,Y);n?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath()}ctx.stroke()}
  labels();
}
function labels(){
  if(!base||!$('cities').checked)return;
  ctx.font='600 11px IBM Plex Sans,system-ui,sans-serif';ctx.textBaseline='middle';ctx.lineJoin='round';
  const boxes=[];
  for(const [n,X,Y,flag] of base.cities){
    const [x,y]=toScreen(X,Y);if(x<0||y<0||x>W||y>H)continue;
    const w=ctx.measureText(n).width,b=[x+5,y-7,x+9+w,y+7];
    if(boxes.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))continue;boxes.push(b);
    ctx.fillStyle='#101432';if(flag!=='t'){ctx.beginPath();ctx.arc(x,y,2.5,0,6.3);ctx.fill()}
    ctx.lineWidth=3;ctx.strokeStyle='rgba(253,251,247,.85)';ctx.strokeText(n,x+7,y);ctx.fillStyle='#101432';ctx.fillText(n,x+7,y);
  }
}
function fit(){
  if(!bounds||!W)return;
  const [x0,y0,x1,y1]=bounds;view.cx=(x0+x1)/2;view.cy=(y0+y1)/2;view.k=Math.min(W/(x1-x0),H/(y1-y0))*.95;fitK=view.k;
}
let firstFit=false;
function resize(){
  const r=canvas.getBoundingClientRect();dpr=window.devicePixelRatio||1;W=r.width;H=r.height;
  canvas.width=W*dpr;canvas.height=H*dpr;if(!firstFit&&W&&bounds){fit();firstFit=true}draw();
}
function hexAt(px,py){
  const [x,y]=toWorld(px,py),s=hexSize();
  const q0=(Math.sqrt(3)/3*x-y/3)/s,r0=2/3*y/s;
  let cx=q0,cz=r0,cy=-cx-cz,rx=Math.round(cx),ry=Math.round(cy),rz=Math.round(cz);
  const ex=Math.abs(rx-cx),ey=Math.abs(ry-cy),ez=Math.abs(rz-cz);
  if(ex>ey&&ex>ez)rx=-ry-rz;else if(ey<=ez)rz=-rx-ry;
  const i=index.get(rx*100003+rz);return i===undefined?null:i;
}
// ---- interaction
function bind(){
  $('a').onchange=e=>{S.a=e.target.value;recolour()};$('b').onchange=e=>{S.b=e.target.value;recolour()};
  $('swap').onclick=()=>{[S.a,S.b]=[S.b,S.a];$('a').value=S.a;$('b').value=S.b;recolour()};
  for(const g of ['metric','centre','alpha','size'])$(g).onclick=async e=>{
    const v=e.target.dataset.v;if(!v)return;S[g]=g==='size'?+v:v;
    [...$(g).children].forEach(b=>b.setAttribute('aria-pressed',b===e.target));
    if(g==='size')await loadSize();else recolour();
  };
  let drag=null;
  canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,cx:view.cx,cy:view.cy}};
  canvas.onpointermove=e=>{
    const r=canvas.getBoundingClientRect();
    if(drag){view.cx=drag.cx-(e.clientX-drag.x)/view.k;view.cy=drag.cy+(e.clientY-drag.y)/view.k;hide();draw();return}
    tip(e.clientX-r.left,e.clientY-r.top);
  };
  canvas.onpointerup=canvas.onpointercancel=()=>drag=null;canvas.onpointerleave=hide;
  canvas.onwheel=e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)};
  $('zoom-in').onclick=()=>zoom(1.5,W/2,H/2);$('zoom-out').onclick=()=>zoom(1/1.5,W/2,H/2);$('reset').onclick=()=>{fit();draw()};
  canvas.onkeydown=e=>{const p=60/view.k;
    if(e.key==='+'||e.key==='=')zoom(1.3,W/2,H/2);else if(e.key==='-')zoom(1/1.3,W/2,H/2);
    else if(e.key==='ArrowLeft')view.cx-=p;else if(e.key==='ArrowRight')view.cx+=p;else if(e.key==='ArrowUp')view.cy+=p;else if(e.key==='ArrowDown')view.cy-=p;else return;
    e.preventDefault();draw()};
  document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;try{localStorage.setItem('jak-rikame-ulici-lang',lang)}catch(e){}applyLang();if(hover!=null)hide()});
  $('terrain').onchange=$('cities').onchange=draw;$('about').onclick=()=>$('dlg').showModal();$('close').onclick=()=>$('dlg').close();
  const dl=(c,n)=>{const a=document.createElement('a');a.download=n;a.href=c.toDataURL('image/png');a.click()};
  $('export').onclick=()=>dl(canvas,`${isDom()?'dominant':S.a+'-or-'+S.b}-${rid}.png`);
  $('export-full').onclick=async()=>dl(await frameCanvas(),`${isDom()?'dominant':S.a+'-or-'+S.b}-${rid}-full.png`);
  new ResizeObserver(resize).observe(canvas);
}
let logo=null;{const im=new Image();im.onload=()=>logo=im;im.crossOrigin='anonymous';im.src='https://media.datatimes.org/databites-dtcz/2026-krajina-v-nazvech/datatimes-symbol-v1.svg'}
let cssCache=null;
async function embeddedCss(){
  if(cssCache)return cssCache;
  let css=await (await fetch('style.css')).text();
  const urls=[...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1]).filter(u=>!u.startsWith('data:')))];
  for(const u of urls){const b=await (await fetch(u)).blob();const d=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});css=css.split(`url(${u})`).join(`url(${d})`)}
  return cssCache=css.replace(/@import[^;]*;/g,'');
}
async function platesImage(s){
  const el=$('plates'),r=el.getBoundingClientRect();if(!el.children.length||!r.height)return null;
  const css=await embeddedCss(),clone=el.cloneNode(true);clone.querySelectorAll('button').forEach(b=>b.removeAttribute('title'));
  const inner=new XMLSerializer().serializeToString(clone);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${r.width*s}" height="${r.height*s}" viewBox="0 0 ${r.width} ${r.height}"><foreignObject width="${r.width}" height="${r.height}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${r.width}px;font-family:var(--font-body);color:var(--text)"><style>${css.replace(/</g,'\\3c ')}</style>${inner}</div></foreignObject></svg>`;
  const im=new Image();im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  await im.decode();return {im,w:r.width*s,h:r.height*s};
}
async function frameCanvas(){
  const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim()||null;
  const bg=v('--surface')||v('--bg')||'#fff',ink=v('--ink')||'#111',muted=v('--muted')||'#666',line=v('--line')||'#ddd';
  const fh=v('--font-heading')||'sans-serif',fb=getComputedStyle(document.body).fontFamily;
  const s=Math.max(3,dpr),od=dpr;
  dpr=s;canvas.width=Math.round(W*s);canvas.height=Math.round(H*s);draw();
  const mc=document.createElement('canvas');mc.width=canvas.width;mc.height=canvas.height;mc.getContext('2d').drawImage(canvas,0,0);
  dpr=od;canvas.width=Math.round(W*od);canvas.height=Math.round(H*od);draw();
  const pl=await platesImage(s).catch(e=>(console.warn(e),null));
  const P=28*s,w=mc.width+2*P,mw=mc.width;
  const wrap=(x,t,f,maxw)=>{x.font=f;const out=[];let l='';for(const word of t.split(/\s+/)){const q=l?l+' '+word:word;if(x.measureText(q).width>maxw&&l){out.push(l);l=word}else l=q}if(l)out.push(l);return out};
  const m=document.createElement('canvas').getContext('2d');
  const tf=`600 ${24*s}px ${fh}`,sf=`${13*s}px ${fb}`,cf=`${11*s}px ${fb}`;
  const title=$('title').textContent,sub=$('subtitle').textContent;
  m.font=tf;const toks=[];
  const walk=(n,col)=>{if(n.nodeType===3){n.textContent.split(/(\s+)/).forEach(t=>{if(t)toks.push([t,col])})}else[...n.childNodes].forEach(c=>walk(c,n.nodeType===1&&n!==$('title')?getComputedStyle(n).color:col))};
  walk($('title'),ink);
  const tl=[];{let line=[],wd=0;for(const [t,col] of toks){const tw=m.measureText(t).width;if(wd+tw>mw-200*s&&line.length&&t.trim()){tl.push(line);line=[];wd=0}if(!line.length&&!t.trim())continue;line.push([t,col]);wd+=tw}if(line.length)tl.push(line)}
  const sl=wrap(m,sub,sf,mw);
  const cred=[...document.querySelectorAll('.chart-credits > div')].map(d=>d.textContent.trim());
  const cl=cred.flatMap(t=>wrap(m,t,cf,mw));
  const hH=16*s+tl.length*30*s+sl.length*19*s+10*s,lgH=34*s,fH=cl.length*18*s+16*s;
  const c=document.createElement('canvas');c.width=w;c.height=Math.ceil(P+hH+mc.height+lgH+(pl?pl.h+10*s:0)+fH+P);
  const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.textBaseline='top';
  let y=P;x.fillStyle=muted;x.font=`600 ${11*s}px ${fb}`;x.letterSpacing=`${1.4*s}px`;x.fillText($('eyebrow-map')?.textContent||document.querySelector('.map-top .eyebrow').textContent,P,y);x.letterSpacing='0px';
  x.font=tf;tl.forEach((ln,i)=>{let tx=P;for(const [t,col] of ln){x.fillStyle=col;x.fillText(t,tx,y+16*s+i*30*s);tx+=x.measureText(t).width}});
  x.fillStyle=muted;x.font=sf;sl.forEach((t,i)=>x.fillText(t,P,y+16*s+tl.length*30*s+i*19*s));
  x.font=`600 ${14*s}px ${fh}`;x.textAlign='right';x.fillStyle=ink;const sg='DataTimes.org';x.fillText(sg,w-P,y+4*s);const sgw=x.measureText(sg).width;x.textAlign='left';
  if(logo)x.drawImage(logo,w-P-sgw-34*s,y-2*s,28*s,28*s);
  y+=hH;x.drawImage(mc,P,y);y+=mc.height;
  // legend
  const ly=y+10*s;x.font=`${11*s}px ${fb}`;x.fillStyle=ink;let lx=P;
  const sw=(cv,l,r)=>{const lw=x.measureText(l).width;x.fillText(l,lx,ly);lx+=lw+8*s;x.drawImage(cv,lx,ly,150*s,12*s);lx+=158*s;x.fillText(r,lx,ly);lx+=x.measureText(r).width+28*s};
  if(!$('lg-pair').hidden)sw($('lg-color'),$('lg-a').textContent,$('lg-b').textContent);
  else if(!$('lg-dom').hidden){$('lg-dom').querySelectorAll('span').forEach(sp=>{const sc=sp.querySelector('i,b,em');const col=sc?getComputedStyle(sc).backgroundColor:null;if(col){x.fillStyle=col;x.fillRect(lx,ly,12*s,12*s);lx+=17*s}x.fillStyle=ink;const t=sp.textContent.trim();x.fillText(t,lx,ly);lx+=x.measureText(t).width+14*s})}
  const lo=document.querySelectorAll('.legend .lg-row')[1];
  x.textAlign='right';const few=lo.children[0].textContent,many=lo.children[2].textContent;
  x.fillStyle=ink;x.fillText(many,w-P,ly);const mwid=x.measureText(many).width;x.drawImage($('lg-alpha'),w-P-mwid-8*s-150*s,ly,150*s,12*s);x.fillText(few,w-P-mwid-16*s-150*s,ly);x.textAlign='left';
  y+=lgH;if(pl){x.drawImage(pl.im,(w-pl.w)/2,y,pl.w,pl.h);y+=pl.h+10*s}
  x.strokeStyle=line;x.lineWidth=s;x.beginPath();x.moveTo(P,y);x.lineTo(w-P,y);x.stroke();
  x.fillStyle=ink;x.font=cf;cl.forEach((t,i)=>x.fillText(t,P,y+10*s+i*18*s));
  return c}
function zoom(f,px,py){const [wx,wy]=toWorld(px,py);view.k=Math.max(fitK*.6,Math.min(80,view.k*f));
  const [nx,ny]=toWorld(px,py);view.cx+=wx-nx;view.cy+=wy-ny;hide();draw()}
function hide(){if(hover!=null){hover=null;draw()}$('tooltip').hidden=true}
function tip(px,py){
  const i=hexAt(px,py);
  if(i===null||alphaArr[i]<=0){if(hover!=null||!$('tooltip').hidden)hide();return}
  if(i!==hover){hover=i;draw()}
  const r=rows[i],ia=fam[S.a],ib=fam[S.b],a=r[3+ia],b=r[3+ib];
  const list=meta.families.map((f,k)=>[flab(f),r[3+k],k]).filter(x=>x[1]>0).sort((x,y)=>y[1]-x[1]).slice(0,6);
  const other=r[2]-list.reduce((s,x)=>s+x[1],0);
  const dc=isDom()?Object.fromEntries(R.dominant.map(([k,c])=>[fam[k],c])):null;
  const col=k=>dc?(dc[k]||'#aaa59a'):k===ia?'var(--a)':k===ib?'var(--b)':'#aaa59a';
  const t=$('tooltip');
  t.innerHTML=`<b>${tr('tipStreets',{n:fmt(r[2])})}</b>`+(isDom()?'':a+b?`<div>${tr('tipShare',{a:lab(S.a),pa:Math.round(100*a/(a+b)),b:lab(S.b),pb:Math.round(100*b/(a+b))})}</div>`:`<div style="color:var(--muted)">${tr('tipNone')}</div>`)+
   '<table>'+list.map(x=>`<tr><td><span class="sw" style="background:${col(x[2])}"></span>${x[0]}</td><td>${fmt(x[1])}</td></tr>`).join('')+(other>0?`<tr><td style="color:var(--muted)"><span class="sw" style="background:#ddd"></span>${tr('tipOther')}</td><td>${fmt(other)}</td></tr>`:'')+'</table>';
  t.hidden=false;const w=t.offsetWidth,h=t.offsetHeight;
  t.style.left=Math.min(px+16,W-w-8)+'px';t.style.top=Math.max(8,Math.min(py+16,H-h-8))+'px';
}
init().catch(e=>{$('loading').textContent=tr('error');console.error(e)});
