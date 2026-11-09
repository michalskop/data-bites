'use strict';
const $=id=>document.getElementById(id);
const A_RGB=[217,96,15],B_RGB=[36,103,168],MID=[196,192,181];
const S={a:'gasse',b:'strasse',metric:'logit',centre:'parity',alpha:'all',size:10};
const LIMIT=Math.log(20); // logit clip: 1:20
let meta,geo,base,plateNames={},terrainImg,fam={},rows=[],index=new Map(),cols=[],view={cx:4300,cy:3000,k:1},dpr=1,W=0,H=0,hover=null,bounds;
const canvas=$('map'),ctx=canvas.getContext('2d');
let lang='cs';try{lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('gasse-strasse-lang')||'cs'}catch(e){}if(!COPY[lang])lang='cs';
const tr=(k,v={})=>COPY[lang][k].replace(/\{(\w+)\}/g,(m,x)=>v[x]);
const fmt=n=>n.toLocaleString(lang);
function applyLang(){
  document.documentElement.lang=lang;document.title=tr('pageTitle');
  document.querySelectorAll('[data-i18n-aria]').forEach(e=>e.setAttribute('aria-label',tr(e.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=tr(e.dataset.i18n));
  document.querySelectorAll('[data-i18n-html]').forEach(e=>e.innerHTML=tr(e.dataset.i18nHtml));
  $('about-body').innerHTML=tr('about_html');
  document.querySelectorAll('.lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===lang));
  if(rows.length){legend();text();plates()}
}
const mix=(c1,c2,t)=>c1.map((v,i)=>v+(c2[i]-v)*t);

async function j(u){const r=await fetch(u);if(!r.ok)throw Error(u);return r.json()}
async function init(){
  [meta,geo,base,plateNames]=await Promise.all([j('data/meta.json'),j('data/geo.json'),j('data/basemap.json'),j('data/plates.json')]);
  terrainImg=new Image();terrainImg.crossOrigin='anonymous';terrainImg.onload=draw;terrainImg.src='https://media.datatimes.org/databites-dtcz/2026-gasse-strasse/terrain-v1.png';
  meta.families.forEach((f,i)=>fam[f.key]=i);
  for(const id of ['a','b']){$(id).innerHTML=meta.families.map(f=>`<option value="${f.key}">${f.label}</option>`).join('');}
  $('a').value=S.a;$('b').value=S.b;
  let xs=[],ys=[];for(const r of Object.values(geo))for(const p of r)for(const [x,y] of p[0]){xs.push(x);ys.push(y)}
  bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
  $('srcs').innerHTML='<p class="small">'+meta.sources.map(s=>s.region+' · '+(s.modified||'')).join('<br>')+'</p>';
  bind();applyLang();resize();await loadSize();$('loading').hidden=true;
}
async function loadSize(){
  rows=await j(`data/hex-${S.size}.json`);index=new Map();
  rows.forEach((r,i)=>index.set(r[0]*100003+r[1],i));
  recolour();
}
// overall counts for the "average" centre
function totals(){const t=new Array(meta.families.length).fill(0);for(const r of rows)for(let i=0;i<t.length;i++)t[i]+=r[3+i];return t}
let colour=[],alphaArr=[];
function recolour(){
  const ia=fam[S.a],ib=fam[S.b],T=totals();
  const centreLogit=S.centre==='mean'?Math.log((T[ia]+.5)/(T[ib]+.5)):0;
  const centreShare=S.centre==='mean'?T[ia]/Math.max(1,T[ia]+T[ib]):.5;
  const base=S.alpha==='all'?r=>r[2]:r=>r[3+ia]+r[3+ib];
  const vals=rows.map(base).filter(v=>v>0).sort((x,y)=>x-y);
  const hi=Math.log1p(vals[Math.floor(vals.length*.98)]||1);
  colour=new Array(rows.length);alphaArr=new Float32Array(rows.length);
  rows.forEach((r,i)=>{
    const a=r[3+ia],b=r[3+ib],n=base(r);
    let t; // -1 = pure B side … +1 = pure A side
    if(a+b===0){t=0}
    else if(S.metric==='logit'){
      const l=Math.log((a+.5)/(b+.5))-centreLogit;t=Math.max(-1,Math.min(1,l/LIMIT));
    }else{
      const s=a/(a+b),c=centreShare;t=s>=c?(s-c)/(1-c):-(c-s)/c;
    }
    const col=t>=0?mix(MID,A_RGB,t):mix(MID,B_RGB,-t);
    colour[i]=col.map(Math.round).join(',');
    alphaArr[i]=n>0?.1+.9*Math.min(1,Math.log1p(n)/hi):0;
  });
  legend();text();plates();draw();
}
function legend(){
  const lc=$('lg-color').getContext('2d'),w=180;
  for(let x=0;x<w;x++){const t=x/(w-1)*2-1;lc.fillStyle=`rgb(${(t<0?mix(MID,A_RGB,-t):mix(MID,B_RGB,t)).map(Math.round)})`;lc.fillRect(x,0,1,12)}
  const la=$('lg-alpha').getContext('2d');la.clearRect(0,0,w,12);
  for(let x=0;x<w;x++){la.fillStyle=`rgba(90,90,90,${.1+.9*x/(w-1)})`;la.fillRect(x,0,1,12)}
  $('lg-a').textContent=lab(S.a);$('lg-b').textContent=lab(S.b);
}
const lab=k=>meta.families[fam[k]].label;
function text(){
  $('title').innerHTML=tr('titleQ',{a:`<span class="ca">${lab(S.a)}</span>`,b:`<span class="cb">${lab(S.b)}</span>`});
  const T=totals(),tot=rows.reduce((s,r)=>s+r[2],0);
  $('subtitle').textContent=tr('subtitle',{na:fmt(T[fam[S.a]]),a:lab(S.a),nb:fmt(T[fam[S.b]]),b:lab(S.b),tot:fmt(tot),hex:fmt(rows.length)});
  $('metric-note').textContent=tr(S.metric==='logit'?'noteLogit':'noteShare');
}
// ---- street plates
const PLATE_CITIES=[['Zürich','zuerich',''],['Hamburg','hamburg',''],['München','muenchen',''],['Berlin','berlin',''],['Wien','wien','']];
function plates(){
  if(!base||!rows.length)return;
  const ia=fam[S.a],ib=fam[S.b],R=S.size<=5?14:S.size<=10?16:22,out=[];
  for(const [city,cls,prefix] of PLATE_CITIES){
    const c=base.cities.find(x=>x[0]===city);if(!c)continue;
    let a=0,b=0;
    for(const r of rows){const [x,y]=centre(r);if((x-c[1])**2+(y-c[2])**2<R*R){a+=r[3+ia];b+=r[3+ib]}}
    if(a+b===0)continue;
    const keyA=S.a,keyB=S.b,top=a>=b?keyA:keyB,p=Math.round(100*Math.max(a,b)/(a+b));
    const name=(plateNames[city]||{})[top];if(!name)continue;
    out.push(`<button class="plate-item" data-city="${city}" title="${tr('plateHint')}"><div class="plate-box"><div class="plate ${cls}" data-sub="2a – 8">${prefix}${name}</div></div><small>${tr('plateCaption',{city:city,p:p,fam:lab(top)})}</small></button>`);
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
  if(!W)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  if(base){
    ctx.fillStyle='#f7f4ec';ctx.strokeStyle='#cfc9ba';ctx.lineWidth=.8;
    for(const poly of base.land){ctx.beginPath();poly[0].forEach(([X,Y],n)=>{const [x,y]=toScreen(X,Y);n?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fill();ctx.stroke()}
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
  for(const [n,X,Y] of base.cities){
    const [x,y]=toScreen(X,Y);if(x<0||y<0||x>W||y>H)continue;
    const w=ctx.measureText(n).width,b=[x+5,y-7,x+9+w,y+7];
    if(boxes.some(o=>b[0]<o[2]&&b[2]>o[0]&&b[1]<o[3]&&b[3]>o[1]))continue;boxes.push(b);
    ctx.fillStyle='#101432';ctx.beginPath();ctx.arc(x,y,2.5,0,6.3);ctx.fill();
    ctx.lineWidth=3;ctx.strokeStyle='rgba(253,251,247,.85)';ctx.strokeText(n,x+7,y);ctx.fillStyle='#101432';ctx.fillText(n,x+7,y);
  }
}
function fit(){
  const [x0,y0,x1,y1]=bounds;view.cx=(x0+x1)/2;view.cy=(y0+y1)/2;view.k=Math.min(W/(x1-x0),H/(y1-y0))*.95;
}
let firstFit=false;
function resize(){
  const r=canvas.getBoundingClientRect();dpr=window.devicePixelRatio||1;W=r.width;H=r.height;
  canvas.width=W*dpr;canvas.height=H*dpr;if(!firstFit&&W){fit();firstFit=true}draw();
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
  $('size').children[1].setAttribute('aria-pressed','true');
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
  document.querySelectorAll('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;try{localStorage.setItem('gasse-strasse-lang',lang)}catch(e){}applyLang();if(hover!=null)hide()});
  $('terrain').onchange=$('cities').onchange=draw;$('about').onclick=()=>$('dlg').showModal();$('close').onclick=()=>$('dlg').close();
  $('export').onclick=()=>{const a=document.createElement('a');a.download='gasse-or-strasse.png';a.href=canvas.toDataURL('image/png');a.click()};
  new ResizeObserver(resize).observe(canvas);
}
function zoom(f,px,py){const [wx,wy]=toWorld(px,py);view.k=Math.max(.35,Math.min(80,view.k*f));
  const [nx,ny]=toWorld(px,py);view.cx+=wx-nx;view.cy+=wy-ny;hide();draw()}
function hide(){if(hover!=null){hover=null;draw()}$('tooltip').hidden=true}
function tip(px,py){
  const i=hexAt(px,py);
  if(i===null||alphaArr[i]<=0){if(hover!=null||!$('tooltip').hidden)hide();return}
  if(i!==hover){hover=i;draw()}
  const r=rows[i],ia=fam[S.a],ib=fam[S.b],a=r[3+ia],b=r[3+ib];
  const list=meta.families.map((f,k)=>[f.label,r[3+k],k]).filter(x=>x[1]>0).sort((x,y)=>y[1]-x[1]).slice(0,6);
  const other=r[2]-list.reduce((s,x)=>s+x[1],0);
  const col=k=>k===ia?'var(--a)':k===ib?'var(--b)':'#aaa59a';
  const t=$('tooltip');
  t.innerHTML=`<b>${tr('tipStreets',{n:fmt(r[2])})}</b>`+(a+b?`<div>${tr('tipShare',{a:lab(S.a),pa:Math.round(100*a/(a+b)),b:lab(S.b),pb:Math.round(100*b/(a+b))})}</div>`:`<div style="color:var(--muted)">${tr('tipNone')}</div>`)+
   '<table>'+list.map(x=>`<tr><td><span class="sw" style="background:${col(x[2])}"></span>${x[0]}</td><td>${fmt(x[1])}</td></tr>`).join('')+(other>0?`<tr><td style="color:var(--muted)"><span class="sw" style="background:#ddd"></span>${tr('tipOther')}</td><td>${fmt(other)}</td></tr>`:'')+'</table>';
  t.hidden=false;const w=t.offsetWidth,h=t.offsetHeight;
  t.style.left=Math.min(px+16,W-w-8)+'px';t.style.top=Math.max(8,Math.min(py+16,H-h-8))+'px';
}
applyLang();
init().catch(e=>{$('loading').textContent=tr('error');console.error(e)});
