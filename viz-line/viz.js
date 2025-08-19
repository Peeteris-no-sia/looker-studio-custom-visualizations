// @ts-nocheck
(function(){
const dscc = window.dscc;
const NS='http://www.w3.org/2000/svg';
const PALETTE=['#119d9d','#48aeb3','#1a686c','#8cd7d6','#4d6063'];
const SHOW_LEGEND = true;

function setFont(el, size, weight, color){ if(size!=null) el.setAttribute('font-size',String(size)); if(weight) el.setAttribute('font-weight',String(weight)); if(color) el.setAttribute('fill',color); el.setAttribute('font-family','Ubuntu,Roboto,system-ui,Arial,sans-serif'); }

function ensureShadowDef(svg, scale){
  const DEF_ID='legendShadow';
  let defs=svg.querySelector('defs');
  if(!defs){ defs=document.createElementNS(NS,'defs'); svg.insertBefore(defs, svg.firstChild||null); }
  let filt=svg.querySelector('#'+DEF_ID);
  if(!filt){
    filt=document.createElementNS(NS,'filter');
    filt.setAttribute('id',DEF_ID);
    filt.setAttribute('x','-20%'); filt.setAttribute('y','-20%'); filt.setAttribute('width','140%'); filt.setAttribute('height','140%');
    const fe=document.createElementNS(NS,'feDropShadow');
    fe.setAttribute('dx', String(Math.max(0.5, Math.round(1*scale))));
    fe.setAttribute('dy', String(Math.max(0.5, Math.round(1*scale))));
    fe.setAttribute('stdDeviation', String(Math.max(0.5, Math.round(2*scale))));
    fe.setAttribute('flood-color','#000000');
    fe.setAttribute('flood-opacity','0.12');
    filt.appendChild(fe);
    defs.appendChild(filt);
  }
  return 'url(#'+DEF_ID+')';
}

function draw(data){
  const root=document.getElementById('root'); root.innerHTML='';
  const W=(dscc&&dscc.getWidth? dscc.getWidth(): root.clientWidth||900);
  const H=(dscc&&dscc.getHeight? dscc.getHeight(): root.clientHeight||350);
  const scale=Math.max(0.75,Math.min(3,Math.min(W/900,H/350)));
  const m={t:Math.round(24*scale), r:Math.round(28*scale), b:Math.round(80*scale), l:Math.round(90*scale)};
  const w=W-m.l-m.r, h=H-m.t-m.b;

  const svg=document.createElementNS(NS,'svg'); svg.setAttribute('width',W); svg.setAttribute('height',H); root.appendChild(svg);

  // Transform rows to series keyed by Series or single series
  const rows=(data.tables&&data.tables.DEFAULT)||[];
  const seriesKey= r=> r.Series!=null? String(r.Series): 'Series';
  const xKey= r=> String(r.X);
  const groups={};
  rows.forEach((r)=>{ const k=seriesKey(r); if(!groups[k]) groups[k]=[]; groups[k].push({x:xKey(r), y:+r.Value}); });
  const seriesNames=Object.keys(groups);
  // X domain order by first appearance
  const xOrder=[]; rows.forEach(r=>{ const xv=xKey(r); if(!xOrder.includes(xv)) xOrder.push(xv); });
  const xIndex={}; xOrder.forEach((x,i)=> xIndex[x]=i);

  const stepX=w/Math.max(1,xOrder.length-1);
  const maxY=Math.max(1, ...rows.map(r=>+r.Value||0));

  // Gridlines (horizontal) and y ticks
  const approxTicks=8; const niceMax=Math.ceil(maxY*1.15); const tickStep=Math.max(1,Math.ceil(niceMax/approxTicks));
  const ticks=[]; for(let t=0;t<=niceMax;t+=tickStep) ticks.push(t);
  const dash=Math.max(2,Math.round(6*scale)); const strokeW=Math.max(1,Math.round(2*scale));
  ticks.forEach(t=>{ const yy=m.t + h - (t/niceMax)*h; const line=document.createElementNS(NS,'line'); line.setAttribute('x1',m.l); line.setAttribute('x2',m.l+w); line.setAttribute('y1',yy); line.setAttribute('y2',yy); line.setAttribute('stroke','#C0C0C0'); line.setAttribute('stroke-dasharray',`${dash} ${dash}`); line.setAttribute('stroke-width',String(strokeW)); svg.appendChild(line); const tx=document.createElementNS(NS,'text'); tx.setAttribute('x',m.l- Math.round(12*scale)); tx.setAttribute('y',yy+ Math.round(5*scale)); tx.setAttribute('text-anchor','end'); setFont(tx, Math.round(22*scale), null, '#404040'); tx.textContent=String(t); svg.appendChild(tx); });

  // Axes labels (x labels)
  xOrder.forEach((x,i)=>{ const tx=document.createElementNS(NS,'text'); const px=m.l + i*stepX; tx.setAttribute('x',px); tx.setAttribute('y',m.t+h+ Math.round(28*scale)); tx.setAttribute('text-anchor','middle'); setFont(tx, Math.round(18*scale), null, '#333'); tx.textContent=x; svg.appendChild(tx); });

  // Optional legend for series
  if (SHOW_LEGEND && seriesNames.length>0){
    const fsLegend = Math.round(16*scale), sw = Math.round(14*scale), padX=Math.round(10*scale), padY=Math.round(8*scale), gap=Math.round(18*scale);
    const legendWrap=document.createElementNS(NS,'g');
    const legend=document.createElementNS(NS,'g');
    const legendOffsetX = Math.round(16*scale);
    let xCur=m.l + legendOffsetX, yCur=Math.max(0, m.t - Math.round(10*scale));
    seriesNames.forEach((name,si)=>{
      const color=PALETTE[si%PALETTE.length];
      const g=document.createElementNS(NS,'g');
      const r=document.createElementNS(NS,'rect'); r.setAttribute('x',xCur); r.setAttribute('y',yCur); r.setAttribute('width',sw); r.setAttribute('height',sw); r.setAttribute('rx',Math.round(3*scale)); r.setAttribute('fill',color); g.appendChild(r);
      const tx=document.createElementNS(NS,'text'); tx.setAttribute('x',xCur+sw+padX); tx.setAttribute('y',yCur+Math.round(sw*0.78)); tx.setAttribute('text-anchor','start'); setFont(tx,fsLegend,700,'#333'); tx.textContent=name; g.appendChild(tx);
      legend.appendChild(g);
      const approxW=Math.max(sw, Math.round(tx.textContent.length*fsLegend*0.6));
      xCur += sw+padX+approxW+gap; if(xCur>m.l+legendOffsetX+w){ xCur=m.l+legendOffsetX; yCur+=sw+padY; }
    });
    legendWrap.appendChild(legend);
    svg.appendChild(legendWrap);
    // White rounded background for legend, matching bar visual
    const lb=legend.getBBox();
    const bg=document.createElementNS(NS,'rect');
    const padBGx=Math.round(10*scale), padBGy=Math.round(6*scale);
    bg.setAttribute('x', lb.x - padBGx);
    bg.setAttribute('y', lb.y - padBGy);
    bg.setAttribute('width', lb.width + padBGx*2);
    bg.setAttribute('height', lb.height + padBGy*2);
    bg.setAttribute('rx', Math.round(10*scale));
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('stroke', '#d0d0d0');
    bg.setAttribute('stroke-width', String(Math.max(1, Math.round(2*scale))));
    bg.setAttribute('filter', ensureShadowDef(svg, scale));
    bg.setAttribute('pointer-events','none');
    legendWrap.insertBefore(bg, legendWrap.firstChild);
    // Remeasure after layout for stability
    const remeasure=(attempt=1)=>{
      requestAnimationFrame(()=>{
        const lb2=legend.getBBox();
        bg.setAttribute('x', lb2.x - padBGx);
        bg.setAttribute('y', lb2.y - padBGy);
        bg.setAttribute('width', lb2.width + padBGx*2);
        bg.setAttribute('height', lb2.height + padBGy*2);
        if(attempt<3 && (lb2.width===0 || lb2.height===0)) remeasure(attempt+1);
      });
    };
    remeasure();
    // Keep legend above other content
    svg.appendChild(legendWrap);
  }

  // Lines per series
  seriesNames.forEach((name, si)=>{
    const color=PALETTE[si%PALETTE.length];
    const pts=groups[name].slice().sort((a,b)=> xIndex[a.x]-xIndex[b.x]).map(p=>({x:m.l + xIndex[p.x]*stepX, y:m.t + h - (p.y/niceMax)*h, v:p.y}));
    const path=document.createElementNS(NS,'path');
    let d='';
    pts.forEach((p,i)=>{ d += (i===0? 'M ':' L ')+p.x+' '+p.y; });
    // use point diameter for stroke width and round only the joins/caps
    const markerR = Math.max(3, Math.round(7*scale));
    const strokeW = markerR*2;
    path.setAttribute('d',d.trim());
    path.setAttribute('fill','none');
    path.setAttribute('stroke',color);
    path.setAttribute('stroke-width', strokeW);
    path.setAttribute('stroke-linejoin','round');
    path.setAttribute('stroke-linecap','round');
    svg.appendChild(path);
    // markers and value labels
    pts.forEach(p=>{ const c=document.createElementNS(NS,'circle'); c.setAttribute('cx',p.x); c.setAttribute('cy',p.y); c.setAttribute('r', markerR ); c.setAttribute('fill',color); svg.appendChild(c); const tx=document.createElementNS(NS,'text'); tx.setAttribute('x',p.x); tx.setAttribute('y',p.y - Math.round(markerR + 6*scale)); tx.setAttribute('text-anchor','middle'); setFont(tx, Math.round(24*scale), 700, '#404040'); tx.textContent=String(Math.round(p.v)); svg.appendChild(tx); });
  });

  // Y axis title
  const yTitle=document.createElementNS(NS,'text'); yTitle.setAttribute('x', Math.round(34*scale)); yTitle.setAttribute('y', m.t + h/2); yTitle.setAttribute('text-anchor','middle'); setFont(yTitle, Math.round(40*scale), 700, '#333'); yTitle.setAttribute('transform', `rotate(-90,${Math.round(34*scale)},${m.t + h/2})`); yTitle.textContent=(data.fields&&data.fields.Value&&data.fields.Value.label)||'Value'; svg.appendChild(yTitle);
}

if (dscc){ dscc.subscribeToData(draw,{transform: dscc.objectTransform}); } else { document.addEventListener('DOMContentLoaded', ()=>{ draw({ fields:{Value:{label:'Value'}}, tables:{ DEFAULT:[ {X:'Jan',Value:10,Series:'A'}, {X:'Feb',Value:15,Series:'A'}, {X:'Mar',Value:9,Series:'A'}, {X:'Jan',Value:8,Series:'B'}, {X:'Feb',Value:12,Series:'B'}, {X:'Mar',Value:14,Series:'B'} ] } }); }); }
})();


