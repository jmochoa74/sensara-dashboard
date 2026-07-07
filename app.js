

const WEBAPP = 'https://script.google.com/macros/s/AKfycbyt7Gb37EaA_L4-2AsnpvMlmXErX0K5fEHQMXoEg9dxoheBSmrRAZMsAO4n2oIYMxQ/exec';

async function gsCall(action, data) {
  var url = WEBAPP + '?action=' + action;
  if (data) url += '&d=' + encodeURIComponent(JSON.stringify(data));
  var r = await fetch(url);
  return r.json();
}

const HM={2022:{v:144192,i:21320,j:57800,e:17610},2023:{v:225159,i:137039,j:33305,e:16257},2024:{v:206026,i:63348,j:71717,e:5994},2025:{v:277772,i:103073,j:84551,e:32864}};
const AC={'Respirómetros':'#4e8c28','Sensores':'#2471a3','Analizadores':'#e67e22','Consultoría ENAC':'#8e44ad','Consultoría':'#16a085','Otros':'#95a5a6'};
const AR=['Respirómetros','Sensores','Analizadores','Consultoría ENAC','Consultoría'];
const GD={'Respirómetros':[-10,30,80],'Sensores':[-20,10,40],'Analizadores':[-20,20,60],'Consultoría ENAC':[-5,0,15],'Consultoría':[-10,5,20]};
var PL_DEFAULT=[{id:1,n:'Union Derivan (Italmatch)',a:'Respirómetros',im:44614,p:75,ic:50,nt:'E260036·SN8+SICAIR'},{id:2,n:'UTE Pinedo VI',a:'Respirómetros',im:40795,p:70,ic:50,nt:'E260021·SN8+SICAIR-SICTOX'},{id:3,n:'CCB Serveis (Besòs)',a:'Respirómetros',im:49072,p:65,ic:50,nt:'E260012·SN8+SICTOX'}];
var PL=PL_DEFAULT;
var SD={byAnioArea:{},byMes:{},lastSync:''};
var CH={};

const E=v=>{if(v==null||isNaN(v))return'—';const a=Math.abs(v);return(v<0?'−':'')+(a>=1000?(a/1000).toFixed(1)+'k':a.toFixed(0))+'€'};
const E2=v=>{if(v==null||isNaN(v))return'—';return Math.abs(v).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'};
const Pc=v=>(!isFinite(v)||isNaN(v))?'—':(v*100).toFixed(1)+'%';
const dC=k=>{if(CH[k]){CH[k].destroy();delete CH[k];}};

function plSave(){
  fetch(WEBAPP+'?action=pl_save&pl='+encodeURIComponent(JSON.stringify(PL))).catch(()=>{});
}
function plLoad(){
  fetch(WEBAPP+'?action=pl_load').then(r=>r.json()).then(function(d){
    if(d&&Array.isArray(d)){PL=d;} renderAll();
  }).catch(function(){renderAll();});
}

function loadData(){
  document.getElementById('loading').style.display='flex';
  fetch(WEBAPP+'?action=data').then(r=>r.json()).then(function(SD_new){
    SD=SD_new;
    document.getElementById('sync-badge').textContent='✓ '+SD.lastSync;
    document.getElementById('loading').style.display='none';
    plLoad();
  }).catch(function(){
    document.getElementById('sync-badge').textContent='Error al cargar';
    document.getElementById('loading').style.display='none';
    renderAll();
  });
}

function renderAll(){
  const AY=new Date().getFullYear(),PY=AY-1;
  const rA=SD.byAnioArea[AY]||{};
  const rT=Object.values(rA).reduce((s,v)=>s+v,0)||0;
  const hP=HM[PY]||{v:277772,i:103073,j:84551,e:32864};
  renderTesoro(SD.tesoro);
  renderKPIs(AY,rT,rA);renderHist(AY,rT);renderAreas(AY,rA,rT);
  renderPK(rT,hP);renderSeg(AY,rA,rT);renderGT(PY);renderProj(AY,PY,rT,hP);
}

function renderTesoro(t){
  if(!t||!t.ok){
    document.getElementById('tesoro-sub').textContent='No disponible';
    document.getElementById('tesoro-kpis').innerHTML='<div style="font-size:12px;color:var(--gray);grid-column:span 4">Sin datos de tesorería</div>';
    return;
  }
  document.getElementById('tesoro-sub').textContent='Últimos 180 días · status real de facturas';
  document.getElementById('tesoro-kpis').innerHTML=[
    {l:'Pendiente de cobro',v:E2(t.pendiente),c:'var(--blu)',a:'var(--blu)',s:'facturas sin cobrar'},
    {l:'Vencido',v:E2(t.vencido),c:t.vencido>0?'var(--red)':'var(--dg)',a:t.vencido>0?'var(--red)':'var(--g)',s:'plazo superado'},
    {l:'Previsión 30 días',v:E2(t.prevision30),c:'var(--dg)',a:'var(--g)',s:'por vencer en 30d'},
    {l:'Cobrado (180d)',v:E2(t.cobrado),c:'var(--dg)',a:'var(--dg)',s:'facturas cobradas'},
  ].map(k=>'<div class="kpi" style="border-top-color:'+k.a+'"><div class="kl">'+k.l+'</div><div class="kv" style="color:'+k.c+'">'+k.v+'</div><div class="ks">'+k.s+'</div></div>').join('');

  const vHtml = t.vencidosItems.length
    ? '<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:var(--deep);color:#fff">'
      +'<th style="padding:6px 8px;text-align:left;font-size:10px">Cliente</th>'
      +'<th style="padding:6px 8px;text-align:right;font-size:10px">Importe</th>'
      +'<th style="padding:6px 8px;text-align:right;font-size:10px">Vencimiento</th>'
      +'<th style="padding:6px 8px;text-align:right;font-size:10px">Días</th>'
      +'</tr></thead><tbody>'
      +t.vencidosItems.map((f,i)=>'<tr style="background:'+(i%2?'var(--w)':'var(--ow)')+';border-bottom:1px solid #f0f5eb">'
        +'<td style="padding:6px 8px">'+f.nombre+'</td>'
        +'<td style="padding:6px 8px;text-align:right;font-weight:700;color:var(--red)">'+E2(f.total)+'</td>'
        +'<td style="padding:6px 8px;text-align:right;color:var(--gray)">'+f.vencimiento+'</td>'
        +'<td style="padding:6px 8px;text-align:right;font-weight:700;color:var(--red)">+'+f.dias+'d</td>'
      +'</tr>').join('')
      +'</tbody></table>'
    : '<div style="font-size:12px;color:var(--dg)">✅ Sin facturas vencidas</div>';

  const pHtml = t.detalleProximos.length
    ? '<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:var(--deep);color:#fff">'
      +'<th style="padding:6px 8px;text-align:left;font-size:10px">Cliente</th>'
      +'<th style="padding:6px 8px;text-align:right;font-size:10px">Importe</th>'
      +'<th style="padding:6px 8px;text-align:right;font-size:10px">Vence en</th>'
      +'</tr></thead><tbody>'
      +t.detalleProximos.slice(0,8).map((f,i)=>'<tr style="background:'+(i%2?'var(--w)':'var(--ow)')+';border-bottom:1px solid #f0f5eb">'
        +'<td style="padding:6px 8px">'+f.nombre+'</td>'
        +'<td style="padding:6px 8px;text-align:right;font-weight:700;color:var(--dg)">'+E2(f.total)+'</td>'
        +'<td style="padding:6px 8px;text-align:right;color:var(--gray)">'+f.dias+'d</td>'
      +'</tr>').join('')
      +'</tbody></table>'
    : '<div style="font-size:12px;color:var(--gray)">Sin cobros previstos en 90 días</div>';

  document.getElementById('tesoro-cuentas').innerHTML='<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--red)">⚠️ Facturas vencidas</div>'+vHtml;
  document.getElementById('tesoro-posicion').innerHTML='<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--dg)">📅 Próximos cobros (90d)</div>'+pHtml;
}

function renderKPIs(AY,rT,rA){
  const pp=PL.reduce((s,p)=>s+p.im*(p.p/100),0);const resp=rA['Respirómetros']||0;
  document.getElementById('kpis').innerHTML=[
    {l:'Ingresos '+AY,v:E(rT),c:'var(--dg)',a:'var(--g)',s:'base imponible'},
    {l:'Respirómetros',v:E(resp),c:'var(--dg)',a:'#4e8c28',s:Pc(rT?resp/rT:0)+' del total'},
    {l:'Pipeline pond.',v:E(pp),c:'var(--blu)',a:'var(--blu)',s:PL.length+' oportunidades'},
    {l:'Potencial total',v:E(rT+pp),c:'var(--dg)',a:'var(--g)',s:'real + pipeline'},
  ].map(k=>'<div class="kpi" style="border-top-color:'+k.a+'"><div class="kl">'+k.l+'</div><div class="kv" style="color:'+k.c+'">'+k.v+'</div><div class="ks">'+k.s+'</div></div>').join('');
}

function renderHist(AY){
  const anos=[...new Set([...Object.keys(HM).map(Number),...Object.keys(SD.byAnioArea).map(Number)])].sort();
  document.getElementById('hcards').innerHTML=anos.map(a=>{
    const d=HM[a]||{v:Object.values(SD.byAnioArea[a]||{}).reduce((s,v)=>s+v,0)||0,e:0};
    const pr=HM[a-1]||{v:0};const vp=pr.v?(d.v-pr.v)/pr.v:null;const ec=d.e>=0?'var(--dg)':'var(--red)';
    return'<div class="hc '+(a===AY?'cur':'')+'"><div style="font-size:10px;font-weight:700;color:var(--gray);margin-bottom:3px">'+a+(a===AY?' ↗':'')+'</div><div style="font-size:16px;font-weight:800;letter-spacing:-.5px">'+E(d.v)+'</div><div style="font-size:11px;font-weight:700;color:'+ec+';margin-top:2px">EBIT '+E(d.e)+'</div><div style="font-size:10px;color:var(--gray)">'+Pc(d.v?d.e/d.v:0)+'</div>'+(vp!==null?'<div style="font-size:10px;font-weight:700;margin-top:3px;color:'+(vp>=0?'var(--dg)':'var(--red)')+'">'+( vp>=0?'↑':'↓')+Pc(Math.abs(vp))+'</div>':'')+'</div>';
  }).join('');
  dC('c1');const ctx1=document.getElementById('ch1').getContext('2d');
  const aH=Object.keys(HM).map(Number).sort();
  CH['c1']=new Chart(ctx1,{type:'bar',data:{labels:aH.map(String),datasets:AR.map(ar=>({label:ar,data:aH.map(a=>{const ay=SD.byAnioArea[a];return ay?ay[ar]||0:0;}),backgroundColor:AC[ar]+'bb',borderRadius:3}))},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{font:{size:10},padding:8}},tooltip:{callbacks:{label:c=>' '+c.dataset.label+': '+E2(c.raw)}}},
    scales:{x:{stacked:true,grid:{display:false},ticks:{font:{size:10}}},y:{stacked:true,grid:{color:'#f0f5eb'},ticks:{font:{size:10},callback:v=>E(v)}}}}});
  dC('c2');const ctx2=document.getElementById('ch2').getContext('2d');
  const mes=Object.keys(SD.byMes).sort();const ML=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  CH['c2']=new Chart(ctx2,{type:'line',data:{labels:mes.map(m=>ML[parseInt(m.slice(5))-1]+' '+m.slice(2,4)),
    datasets:[{label:'Ingresos mensuales',data:mes.map(m=>SD.byMes[m]||0),borderColor:'#6db33f',backgroundColor:'#6db33f22',borderWidth:2,pointRadius:3,fill:true,tension:.3}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+E2(c.raw)}}},
    scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'#f0f5eb'},ticks:{font:{size:10},callback:v=>E(v)}}}}});
}

function renderAreas(AY,rA,rT){
  document.getElementById('asub').textContent=AY+' (acumulado)';
  document.getElementById('acards').innerHTML=AR.map(ar=>{
    const v=rA[ar]||0,col=AC[ar];const pct=rT?v/rT:0;const prev=SD.byAnioArea[AY-1]?.[ar]||0;const vp=prev?(v-prev)/prev:null;
    return'<div class="ac" style="background:'+col+'18;border-color:'+col+'44"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:'+col+';margin-bottom:6px">'+ar+'</div><div style="font-size:18px;font-weight:800;color:'+col+';letter-spacing:-.5px">'+(v>0?E2(v):'—')+'</div>'+(v>0?'<div style="font-size:10px;color:'+col+';margin-top:2px">'+Pc(pct)+' del total</div>':'')+(vp!==null?'<div style="font-size:10px;font-weight:700;margin-top:3px;color:'+(vp>=0?'var(--dg)':'var(--red)')+'">'+( vp>=0?'↑':'↓')+Pc(Math.abs(vp))+' vs '+(AY-1)+'</div>':'')+'</div>';
  }).join('');
  dC('c3');const ctx=document.getElementById('ch3').getContext('2d');
  const aA=AR.filter(a=>(rA[a]||0)>0);
  CH['c3']=new Chart(ctx,{type:'bar',data:{labels:aA,datasets:[{data:aA.map(a=>rA[a]||0),backgroundColor:aA.map(a=>AC[a]),borderRadius:5,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' '+E2(c.raw)+' ('+Pc(c.raw/(rT||1))+')'}}},
    scales:{x:{grid:{display:false},ticks:{font:{size:10}}},y:{grid:{color:'#f0f5eb'},ticks:{font:{size:10},callback:v=>E(v)}}}}});
}

function pkE(p){return p.im*(1-p.ic/100)*0.82;}
function renderPK(rT,hP){
  hP=hP||HM[new Date().getFullYear()-1]||{e:32864};rT=rT||0;
  const po=PL.reduce((s,p)=>s+p.im*(p.p/100),0),ep=PL.reduce((s,p)=>s+pkE(p)*(p.p/100),0);
  const to=PL.reduce((s,p)=>s+p.im,0),et=PL.reduce((s,p)=>s+pkE(p),0);
  document.getElementById('pkk').innerHTML=[{l:'Importe ponderado',v:E2(po),c:'var(--dg)'},{l:'EBIT ponderado',v:E2(ep),c:'var(--dg)'},{l:'Si todo cierra',v:E2(to),c:'var(--blu)'},{l:'EBIT máximo',v:E2(et),c:'var(--dg)'}]
    .map(k=>'<div class="kpi"><div class="kl">'+k.l+'</div><div class="kv" style="font-size:18px;color:'+k.c+'">'+k.v+'</div></div>').join('');
  document.getElementById('pklist').innerHTML=PL.map(p=>{
    const col=AC[p.a]||'#95a5a6';const pc=p.p>=70?'var(--dg)':p.p>=40?'var(--amb)':'var(--red)';const eb=pkE(p);
    return'<div class="pi"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><div><span style="font-size:13px;font-weight:700">'+p.n+'</span><span style="background:'+col+'22;color:'+col+';padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;margin-left:8px">'+p.a+'</span><div style="font-size:11px;color:var(--gray)">'+p.nt+'</div></div><button type="button" data-del="'+p.id+'" style="background:none;border:none;color:var(--gray);font-size:20px;cursor:pointer;padding:0">×</button></div><div class="pn"><div><div class="pnl">Base imponible</div><div class="pnv">'+E2(p.im)+'</div></div><div><div class="pnl">EBIT estimado</div><div class="pnv">'+E2(eb)+'</div></div><div><div class="pnl">Ponderado</div><div class="pnv" style="color:'+pc+'">'+E2(p.im*p.p/100)+'</div></div></div><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:var(--gray)">Probabilidad</span><span id="ppv-'+p.id+'" style="font-size:13px;font-weight:800;color:'+pc+'">'+p.p+'%</span></div><input type="range" min="0" max="100" value="'+p.p+'" data-prob="'+p.id+'" style="width:100%;accent-color:'+pc+';margin-bottom:3px"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--gray)"><span>INCONEF '+p.ic+'%</span><span>EBIT pond: '+E2(eb*p.p/100)+'</span></div></div>';
  }).join('');
  const escs=[{l:'Solo el más probable',fn:a=>{const mx=Math.max(...a.map(p=>p.p));return a.filter(p=>p.p===mx).slice(0,1);}},{l:'Todos ≥ 70%',fn:a=>a.filter(p=>p.p>=70)},{l:'Todos ≥ 50%',fn:a=>a.filter(p=>p.p>=50)},{l:'Todo el pipeline',fn:a=>a}];
  document.getElementById('pkesc').innerHTML=escs.map(({l,fn})=>{const ops=fn(PL);if(!ops.length)return'';const ing=ops.reduce((s,p)=>s+p.im,0),eb=ops.reduce((s,p)=>s+pkE(p),0);return'<div style="display:flex;justify-content:space-between;align-items:center;background:var(--lg);border-radius:8px;padding:10px 12px;margin-bottom:8px"><div><div style="font-size:12px;font-weight:700">'+l+'</div><div style="font-size:10px;color:var(--gray)">'+ops.length+' op.</div></div><div style="text-align:right"><div style="font-size:14px;font-weight:800;color:var(--dg)">'+E2(ing)+'</div><div style="font-size:11px;color:var(--dg)">EBIT: '+E2(eb)+'</div></div></div>';}).join('');
  const h25=HM[2025]||{e:32864};
  document.getElementById('pkimp').innerHTML='<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:var(--deep);color:#fff">'+['Escenario','Ingresos año','EBIT pipeline','vs 2025'].map((h,i)=>'<th style="padding:7px 10px;text-align:'+(i?'right':'left')+';font-size:10px;text-transform:uppercase">'+h+'</th>').join('')+'</tr></thead><tbody>'+[{l:'Sin cerrar nada',p:0,e:0},{l:'Pipeline ponderado',p:po,e:ep},{l:'Cierro ≥70%',p:PL.filter(p=>p.p>=70).reduce((s,p)=>s+p.im,0),e:PL.filter(p=>p.p>=70).reduce((s,p)=>s+pkE(p),0)},{l:'Cierro todo',p:to,e:et}].map((r,i)=>{const iT=rT+r.p,eT=r.e,vE=eT-h25.e;return'<tr style="background:'+(i%2?'var(--w)':'var(--ow)')+';border-bottom:1px solid #f0f5eb"><td style="padding:7px 10px;font-weight:600">'+r.l+'</td><td style="padding:7px 10px;text-align:right;font-weight:700;color:var(--dg)">'+E2(iT)+'</td><td style="padding:7px 10px;text-align:right;font-weight:700;color:'+(eT>=0?'var(--dg)':'var(--red)')+'">'+E2(eT)+'</td><td style="padding:7px 10px;text-align:right;font-weight:700;color:'+(vE>=0?'var(--dg)':'var(--red)')+'">'+( vE>=0?'+':'')+E2(vE)+'</td></tr>';}).join('')+'</tbody></table>';
}

function getG(){const g={};AR.forEach(ar=>{const defs=GD[ar]||[-10,20,50];const sid=ar.replace(/\\s/g,'-');g[ar]=[0,1,2].map(i=>{const el=document.getElementById('gr-'+sid+'-'+i);return el?parseFloat(el.value)||defs[i]:defs[i];});});return g;}

function renderSeg(AY,rA,rT){
  const g=getG();const obj={};
  AR.forEach(a=>{const b=SD.byAnioArea[AY-1]?.[a]||0;obj[a]=b*(1+(g[a]?.[1]||0)/100);});
  const oT=Object.values(obj).reduce((s,v)=>s+v,0)||1;
  const pp=PL.reduce((s,p)=>s+p.im*(p.p/100),0);const cP=rT+pp;
  const mes=new Date().getMonth()+1;const mR=12-mes;const falt=Math.max(0,oT-rT);
  const rN=mR>0?falt/mR:0;const rA2=mes>0?rT/mes:0;
  const rat=rN>0?rA2/rN:(rT>0?1:0);
  const st=rat>=0.9?'verde':rat>=0.6?'ambar':'rojo';
  const si=st==='verde'?'✅':st==='ambar'?'⚠️':'🚨';
  const sm=st==='verde'?'En camino al objetivo':st==='ambar'?'Necesitas acelerar en H2':'Riesgo de no llegar';
  document.getElementById('semg').innerHTML='<div class="sem '+st+'"><strong>'+si+' '+sm+'</strong> Llevas '+E2(rT)+' de '+E2(oT)+' objetivo · Necesario: '+E2(rN)+'/mes · '+mR+' meses</div>';
  const pc=rT/oT,pcP=Math.min(cP/oT,1);
  document.getElementById('sreal').style.width=Math.min(pc,1)*100+'%';
  document.getElementById('spipe').style.width=pcP*100+'%';
  document.getElementById('sfl').textContent='Real: '+E2(rT)+' ('+Pc(pc)+' del objetivo)';
  document.getElementById('sfr').textContent='+Pipeline: '+E2(pp);
  document.getElementById('segk').innerHTML=[{l:'Facturado '+AY,v:E(rT),c:'var(--g)',a:'var(--g)',s:'acumulado'},{l:'Objetivo Base',v:E(oT),c:'var(--gray)',a:'var(--gray)',s:'vs año anterior'},{l:'Real+pipeline',v:E(cP),c:'var(--blu)',a:'var(--blu)',s:'ponderado'},{l:'Pendiente',v:E(falt),c:'var(--red)',a:'var(--red)',s:mR+' meses'}]
    .map(k=>'<div class="kpi" style="border-top-color:'+k.a+'"><div class="kl">'+k.l+'</div><div class="kv" style="font-size:19px;color:'+k.c+'">'+k.v+'</div><div class="ks">'+k.s+'</div></div>').join('');
  document.getElementById('sarea').innerHTML=AR.filter(a=>(obj[a]||0)>0).map(ar=>{
    const o=obj[ar]||0,r=rA[ar]||0;const pip=PL.filter(p=>p.a===ar).reduce((s,p)=>s+p.im*(p.p/100),0);
    const pc=o?r/o:0,pcP=o?Math.min((r+pip)/o,1):0;const col=AC[ar]||'#95a5a6';
    return'<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:12px;font-weight:600;color:'+col+'"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:'+col+';margin-right:6px"></span>'+ar+'</span><span style="font-size:11px;color:var(--gray)"><strong style="color:'+col+'">'+E(r)+'</strong> / '+E(o)+'<span style="background:'+col+'22;color:'+col+';padding:1px 7px;border-radius:10px;font-size:10px;font-weight:700;margin-left:6px">'+Pc(pc)+'</span></span></div><div class="bb"><div class="bf2" style="width:'+pcP*100+'%;background:'+col+'"></div><div class="bf" style="width:'+pc*100+'%;background:'+col+'"></div></div>'+(pip>0?'<div style="font-size:10px;color:'+col+';margin-top:2px">+'+E(pip)+' pipeline ponderado</div>':'')+'</div>';
  }).join('');
}

function renderGT(PY){
  const b=SD.byAnioArea[PY]||{};
  document.getElementById('gtb').innerHTML=AR.filter(a=>(b[a]||HIST_MANUAL?.[PY]?.areas?.[a])>0||(b[a]||0)>0).map(ar=>{
    const base=b[ar]||0,col=AC[ar]||'#95a5a6';const defs=GD[ar]||[-10,20,50];const sid=ar.replace(/\\s/g,'-');
    const cc=['#c0392b','#e67e22','#27ae60'];
    return'<tr><td style="color:'+col+';font-weight:600;font-size:11px;padding:6px 8px"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:'+col+';margin-right:5px"></span>'+ar+'<br><span style="font-size:10px;color:var(--gray);font-weight:400">'+E2(base)+' ('+PY+')</span></td>'+[0,1,2].map(i=>'<td style="padding:4px 6px;text-align:center"><input class="gt" style="border-color:'+cc[i]+';color:'+cc[i]+';font-weight:700" type="number" id="gr-'+sid+'-'+i+'" value="'+defs[i]+'" min="-100" max="500" step="5" oninput="onGC()"><div style="font-size:9px;color:var(--gray);margin-top:2px" id="gp-'+sid+'-'+i+'">→'+E(base*(1+defs[i]/100))+'</div></td>').join('')+'</tr>';
  }).join('');
}

function onGC(){
  const PY=new Date().getFullYear()-1;const b=SD.byAnioArea[PY]||{};
  AR.forEach(ar=>{const base=b[ar]||0,sid=ar.replace(/\\s/g,'-');[0,1,2].forEach(i=>{const inp=document.getElementById('gr-'+sid+'-'+i);const pv=document.getElementById('gp-'+sid+'-'+i);if(inp&&pv)pv.textContent='→'+E(base*(1+parseFloat(inp.value||0)/100));});});
  renderSeg(new Date().getFullYear(),SD.byAnioArea[new Date().getFullYear()]||{},Object.values(SD.byAnioArea[new Date().getFullYear()]||{}).reduce((s,v)=>s+v,0)||0);
  renderProj();
}

function onSl(){
  const jm=parseFloat(document.getElementById('sjm').value);
  document.getElementById('vjm').textContent=E(jm);
  document.getElementById('vinc').textContent=document.getElementById('sinc').value+'%';
  const ox=parseFloat(document.getElementById('sopx').value);
  document.getElementById('vopx').textContent=(ox>=0?'+':'')+ox+'%';
  renderProj();
}

function renderProj(AY,PY,rT,hP){
  AY=AY||new Date().getFullYear();PY=PY||AY-1;
  rT=rT||Object.values(SD.byAnioArea[AY]||{}).reduce((s,v)=>s+v,0)||0;
  hP=hP||HM[PY]||{v:277772,i:103073,j:84551,e:32864};
  const jm=parseFloat(document.getElementById('sjm').value)||82000;
  const inc=parseFloat(document.getElementById('sinc').value)/100||0.5;
  const opx=parseFloat(document.getElementById('sopx').value)/100||0;
  const b=SD.byAnioArea[PY]||{};const g=getG();
  const calcE=(idx,pm)=>{let vH=0,vR=0;AR.forEach(a=>{const base=b[a]||0;const gr=g[a]?.[idx]??GD[a][idx];const pA=PL.filter(p=>p.a===a).reduce((s,p)=>s+p.im*pm*(p.p/100),0);const v=base*(1+(gr||0)/100)+pA;vH+=v;if(a==='Respirómetros')vR=v;});const ci=vR*inc,co=(hP.i||0)*0.15*(vH/(hP.v||1)),mb=vH-ci-co;const os=Math.max(0,((hP.j||0)-jm)*(1+opx));return{v:rT+vH,e:mb-os-jm,m:vH?mb/vH:0};};
  const SCS=[{l:'🔴 Conservador',bg:'#fdecea',c:'#c0392b',idx:0,pm:0},{l:'🟡 Base',bg:'#fef9e7',c:'#e67e22',idx:1,pm:0.5},{l:'🟢 Optimista',bg:'var(--lg)',c:'var(--dg)',idx:2,pm:1}];
  document.getElementById('prjc').innerHTML=SCS.map(sc=>{const r=calcE(sc.idx,sc.pm);const vV=r.v-hP.v,vE=r.e-hP.e;return'<div class="ps" style="background:'+sc.bg+';border-color:'+sc.c+'44"><div style="font-size:11px;font-weight:700;color:'+sc.c+';text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px">'+sc.l+'</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px"><div><div style="font-size:10px;color:var(--gray)">Ingresos '+AY+'</div><div style="font-size:20px;font-weight:800;color:'+sc.c+';letter-spacing:-.5px">'+E(r.v)+'</div><div style="font-size:11px;color:'+sc.c+'">'+(vV>=0?'+':'')+E(vV)+' vs '+PY+'</div></div><div><div style="font-size:10px;color:var(--gray)">EBIT estimado</div><div style="font-size:20px;font-weight:800;color:'+(r.e>=0?'var(--dg)':'var(--red)')+';letter-spacing:-.5px">'+E(r.e)+'</div><div style="font-size:11px;color:'+(vE>=0?'var(--dg)':'var(--red)')+'">'+(vE>=0?'+':'')+E(vE)+' vs '+PY+'</div></div></div><div style="font-size:11px;color:var(--gray)">Margen: '+Pc(r.m)+' · JM: '+E(jm)+' · INCONEF: '+Math.round(inc*100)+'%</div></div>';}).join('');
}

document.getElementById('pklist').addEventListener('click',function(e){
  const b=e.target.closest('[data-del]');
  if(b){PL=PL.filter(p=>p.id!==parseInt(b.getAttribute('data-del')));plSave();renderPK();}
});
document.getElementById('pklist').addEventListener('input',function(e){
  const s=e.target.closest('[data-prob]');
  if(s){const id=parseInt(s.getAttribute('data-prob')),v=parseInt(s.value);
    PL=PL.map(p=>p.id===id?Object.assign({},p,{p:v}):p);plSave();
    const l=document.getElementById('ppv-'+id);if(l)l.textContent=v+'%';renderPK();}
});
document.getElementById('bpadd').addEventListener('click',function(){document.getElementById('pkform').style.display='block';});
document.getElementById('bpcancel').addEventListener('click',function(){document.getElementById('pkform').style.display='none';});
document.getElementById('bpsave').addEventListener('click',function(){
  const n=document.getElementById('pkn').value.trim(),i=parseFloat(document.getElementById('pki').value);
  if(!n||!i)return;
  PL=PL.concat([{id:Date.now(),n,a:document.getElementById('pka').value,im:i,
    p:parseInt(document.getElementById('pkp').value)||50,ic:parseInt(document.getElementById('pkic').value)||50,
    nt:document.getElementById('pknota').value.trim()}]);
  ['pkn','pki','pknota'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pkform').style.display='none';
  plSave();renderPK();
});

var INV = null;
var invCatActiva = null;

function invLoad() {
  fetch(WEBAPP+'?action=inv_load').then(r=>r.json()).then(function(d){
    INV=d; renderInventario();
  }).catch(()=>{});
}

function renderInventario() {
  if (!INV) return;
  document.getElementById('inv-sub').textContent = 'Actualizado: ' + INV.lastUpdate;

  const alertas = [];
  INV.categorias.forEach(cat => {
    cat.productos.forEach(p => {
      if ((p.stock||0) <= (p.minimo||0)) {
        alertas.push({nombre:p.nombre, ref:p.ref, stock:p.stock||0, minimo:p.minimo||0, col:cat.color});
      }
    });
  });
  document.getElementById('inv-alertas').innerHTML = alertas.length
    ? '<div style="background:#fdecea;border-left:4px solid var(--red);border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:12px">'
      +'<strong style="font-size:12px">⚠️ Stock bajo o agotado:</strong> '
      +alertas.map(a=>'<span style="background:'+a.col+'22;color:'+a.col+';padding:1px 8px;border-radius:10px;font-size:11px;font-weight:700;margin-left:6px">'+a.ref+' ('+a.stock+')</span>').join('')
      +'</div>'
    : '<div style="background:var(--lg);border-left:4px solid var(--g);border-radius:0 8px 8px 0;padding:8px 14px;margin-bottom:12px;font-size:12px">✅ Todo el stock por encima del mínimo</div>';

  if (!invCatActiva) invCatActiva = INV.categorias[0]?.id;
  document.getElementById('inv-tabs').innerHTML = INV.categorias.map(cat =>
    '<button type="button" data-cat="'+cat.id+'" style="padding:7px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:2px solid '+(invCatActiva===cat.id?cat.color:'var(--bdr)')+';background:'+(invCatActiva===cat.id?cat.color+'22':'var(--ow)')+';color:'+(invCatActiva===cat.id?cat.color:'var(--gray)')+'">'+cat.nombre+'</button>'
  ).join('');

  const cat = INV.categorias.find(c => c.id === invCatActiva);
  if (cat) {
    document.getElementById('inv-tabla').innerHTML =
      '<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:var(--deep);color:#fff">'
      +'<th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase">Referencia</th>'
      +'<th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase">Nombre</th>'
      +'<th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase">Stock</th>'
      +'<th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase">Mínimo</th>'
      +'<th style="padding:8px 10px;text-align:right;font-size:10px;text-transform:uppercase">Precio coste</th>'
      +'<th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase">Acciones</th>'
      +'</tr></thead><tbody>'
      +cat.productos.map((p,i) => {
        const bajo = (p.stock||0) <= (p.minimo||0);
        return '<tr style="background:'+(i%2?'var(--w)':'var(--ow)')+';border-bottom:1px solid #f0f5eb">'
          +'<td style="padding:8px 10px;font-weight:700;font-family:monospace;color:'+cat.color+'">'+( p.ref||'—')+'</td>'
          +'<td style="padding:8px 10px">'+(p.nombre||'')+'</td>'
          +'<td style="padding:8px 10px;text-align:center">'
            +'<span style="font-size:16px;font-weight:800;color:'+(bajo?'var(--red)':'var(--dg)')+';background:'+(bajo?'#fdecea':'var(--lg)')+';padding:2px 10px;border-radius:8px">'+(p.stock||0)+'</span>'
            +' <span style="font-size:10px;color:var(--gray)">'+(p.unidad||'ud')+'</span>'
          +'</td>'
          +'<td style="padding:8px 10px;text-align:center;color:var(--gray)">'+(p.minimo||0)+'</td>'
          +'<td style="padding:8px 10px;text-align:right;color:var(--gray)">'+(p.precio?E2(p.precio):'—')+'</td>'
          +'<td style="padding:8px 10px;text-align:center">'
            +'<button type="button" data-inv-del="'+p.id+'" data-inv-cat="'+cat.id+'" title="Eliminar" style="background:none;border:none;color:var(--gray);cursor:pointer;font-size:14px">🗑</button>'
          +'</td>'
        +'</tr>';
      }).join('')
      +'</tbody></table>';
  }

  const movCat = document.getElementById('mov-cat');
  if (movCat) {
    movCat.innerHTML = INV.categorias.map(c => '<option value="'+c.id+'">'+c.nombre+'</option>').join('');
    onMovCatChange();
  }
  const addCat = document.getElementById('add-cat');
  if (addCat) addCat.innerHTML = INV.categorias.map(c => '<option value="'+c.id+'">'+c.nombre+'</option>').join('');
}

function onMovCatChange() {
  const catId = document.getElementById('mov-cat').value;
  const cat = INV?.categorias.find(c => c.id === catId);
  const sel = document.getElementById('mov-prod');
  if (cat && sel) sel.innerHTML = cat.productos.map(p => '<option value="'+p.id+'">'+p.ref+' — '+p.nombre+' (stock: '+(p.stock||0)+')</option>').join('');
}

document.getElementById('inv-tabs').addEventListener('click', function(e) {
  const btn = e.target.closest('[data-cat]');
  if (btn) { invCatActiva = btn.getAttribute('data-cat'); renderInventario(); }
});

document.getElementById('inv-tabla').addEventListener('click', function(e) {
  const btn = e.target.closest('[data-inv-del]');
  if (btn && confirm('¿Eliminar este producto?')) {
    fetch(WEBAPP+'?action=inv_del&d='+encodeURIComponent(JSON.stringify({categoriaId:btn.getAttribute('data-inv-cat'),productoId:btn.getAttribute('data-inv-del')}))).then(()=>invLoad());
  }
});

var FACT_STORE = {serie_F:1, serie_P:1, items:[]};
var CLIENTES = [];
var factEstadoFiltro = 'todos';
var factTipoActual = 'factura';

function factLoad() {
  fetch(WEBAPP+'?action=fact_load').then(r=>r.json()).then(function(d){
    FACT_STORE=d; renderFacturas();
  }).catch(()=>{});
  fetch(WEBAPP+'?action=contactos').then(r=>r.json()).then(function(d){
    CLIENTES=d;
    const sel=document.getElementById('fact-cliente');
    if(sel) sel.innerHTML='<option value="">-- Selecciona cliente --</option>'
      +CLIENTES.filter(c=>c.tipo!=='supplier').map(c=>'<option value="'+c.id+'">'+c.nombre+(c.nif?' ('+c.nif+')':'')+'</option>').join('');
  }).catch(()=>{});
}

function renderFacturas() {
  const items = FACT_STORE.items || [];
  const filtrados = factEstadoFiltro==='todos' ? items :
    factEstadoFiltro==='presupuesto' ? items.filter(d=>d.tipo==='presupuesto') :
    items.filter(d=>d.estado===factEstadoFiltro);

  const facturas = items.filter(d=>d.tipo!=='presupuesto');
  const cobradas = facturas.filter(d=>d.estado==='cobrada').reduce((s,d)=>s+d.base,0);
  const emitidas = facturas.filter(d=>d.estado==='emitida').reduce((s,d)=>s+d.base,0);
  const presups  = items.filter(d=>d.tipo==='presupuesto').length;
  document.getElementById('fact-sub').textContent = items.length+' documentos';
  document.getElementById('fact-kpis').innerHTML = [
    {l:'Facturado cobrado',v:E2(cobradas),c:'var(--dg)',a:'var(--g)',s:'base imponible'},
    {l:'Pendiente cobro',v:E2(emitidas),c:'var(--blu)',a:'var(--blu)',s:'emitidas sin cobrar'},
    {l:'Total facturado',v:E2(cobradas+emitidas),c:'var(--dg)',a:'var(--dg)',s:'ejercicio actual'},
    {l:'Presupuestos',v:presups,c:'var(--gray)',a:'var(--gray)',s:'activos'},
  ].map(k=>'<div class="kpi" style="border-top-color:'+k.a+'"><div class="kl">'+k.l+'</div><div class="kv" style="color:'+k.c+'">'+k.v+'</div><div class="ks">'+k.s+'</div></div>').join('');

  const ESTADO_COLOR = {emitida:'var(--blu)',cobrada:'var(--dg)',pendiente:'var(--amb)',cancelada:'var(--red)'};
  const ESTADO_LABEL = {emitida:'Emitida',cobrada:'✅ Cobrada',pendiente:'Pendiente',cancelada:'Cancelada'};
  document.getElementById('fact-lista').innerHTML = filtrados.length
    ? '<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:var(--deep);color:#fff">'
      +'<th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase">Número</th>'
      +'<th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase">Cliente</th>'
      +'<th style="padding:8px 10px;text-align:right;font-size:10px;text-transform:uppercase">Base</th>'
      +'<th style="padding:8px 10px;text-align:right;font-size:10px;text-transform:uppercase">Total</th>'
      +'<th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase">Estado</th>'
      +'<th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase">Fecha</th>'
      +'<th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase">Acciones</th>'
      +'</tr></thead><tbody>'
      +filtrados.map((d,i)=>{
        const ec = ESTADO_COLOR[d.estado]||'var(--gray)';
        const el = ESTADO_LABEL[d.estado]||d.estado;
        return '<tr style="background:'+(i%2?'var(--w)':'var(--ow)')+';border-bottom:1px solid #f0f5eb">'
          +'<td style="padding:8px 10px;font-weight:700;font-family:monospace;color:var(--dg)">'+d.numero+'</td>'
          +'<td style="padding:8px 10px">'+d.cliente.nombre+'</td>'
          +'<td style="padding:8px 10px;text-align:right;font-weight:700">'+E2(d.base)+'</td>'
          +'<td style="padding:8px 10px;text-align:right;font-weight:700;color:var(--dg)">'+E2(d.total)+'</td>'
          +'<td style="padding:8px 10px;text-align:center"><span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:'+ec+'22;color:'+ec+'">'+el+'</span></td>'
          +'<td style="padding:8px 10px;text-align:center;color:var(--gray)">'+d.fecha+'</td>'
          +'<td style="padding:8px 10px;text-align:center;white-space:nowrap">'
            +(d.estado==='emitida'?'<button type="button" data-cobrar="'+d.id+'" title="Marcar cobrada" style="background:none;border:none;cursor:pointer;font-size:14px">✅</button>':'')
            +'<button type="button" data-preview="'+d.id+'" title="Ver PDF" style="background:none;border:none;cursor:pointer;font-size:14px">🖨</button>'
            +'<button type="button" data-del-doc="'+d.id+'" title="Eliminar" style="background:none;border:none;cursor:pointer;font-size:14px">🗑</button>'
          +'</td>'
        +'</tr>';
      }).join('')
      +'</tbody></table>'
    : '<div style="font-size:12px;color:var(--gray);padding:12px">Sin documentos en este estado</div>';
}

function calcFactTotales() {
  const lineas = Array.from(document.querySelectorAll('.fact-linea')).map(row => ({
    cantidad: parseFloat(row.querySelector('.fl-qty').value)||0,
    precio:   parseFloat(row.querySelector('.fl-precio').value)||0,
    desc:     row.querySelector('.fl-desc').value
  }));
  const iva = parseFloat(document.getElementById('fact-iva').value)||21;
  const dto = parseFloat(document.getElementById('fact-dto').value)||0;
  const subtotal = lineas.reduce((s,l)=>s+l.cantidad*l.precio,0);
  const descImporte = subtotal*(dto/100);
  const base = subtotal-descImporte;
  const ivaImp = base*(iva/100);
  const total = base+ivaImp;
  document.getElementById('fact-totales').innerHTML =
    '<div style="display:flex;justify-content:flex-end"><table style="font-size:12px;min-width:280px">'
    +(dto>0?'<tr><td style="padding:3px 10px;color:var(--gray)">Subtotal</td><td style="text-align:right;padding:3px 10px">'+E2(subtotal)+'</td></tr>'
           +'<tr><td style="padding:3px 10px;color:var(--red)">Descuento '+dto+'%</td><td style="text-align:right;padding:3px 10px;color:var(--red)">−'+E2(descImporte)+'</td></tr>':'')
    +'<tr><td style="padding:3px 10px;color:var(--gray)">Base imponible</td><td style="text-align:right;padding:3px 10px;font-weight:700">'+E2(base)+'</td></tr>'
    +'<tr><td style="padding:3px 10px;color:var(--gray)">IVA '+iva+'%</td><td style="text-align:right;padding:3px 10px">'+E2(ivaImp)+'</td></tr>'
    +'<tr style="border-top:2px solid var(--g)"><td style="padding:6px 10px;font-weight:800;font-size:14px">TOTAL</td><td style="text-align:right;padding:6px 10px;font-weight:800;font-size:14px;color:var(--dg)">'+E2(total)+'</td></tr>'
    +'</table></div>';
  return {lineas, iva, dto, subtotal, base, ivaImporte:ivaImp, total};
}

function addLineaFact() {
  const cont = document.getElementById('fact-lineas');
  const div = document.createElement('div');
  div.className = 'fact-linea';
  div.style.cssText = 'display:grid;grid-template-columns:3fr 1fr 1fr auto;gap:8px;margin-bottom:6px;align-items:center';
  div.innerHTML =
    '<input class="fi fl-desc" type="text" placeholder="Descripción del servicio/producto" style="margin:0" oninput="calcFactTotales()">'
    +'<input class="fi fl-qty" type="number" value="1" min="0" step="0.01" placeholder="Cant." style="margin:0" oninput="calcFactTotales()">'
    +'<input class="fi fl-precio" type="number" value="0" min="0" step="0.01" placeholder="Precio €" style="margin:0" oninput="calcFactTotales()">'
    +'<button type="button" onclick="this.closest(\'.fact-linea\').remove();calcFactTotales()" style="background:none;border:none;color:var(--gray);font-size:18px;cursor:pointer;padding:0">×</button>';
  cont.appendChild(div);
  calcFactTotales();
}

function mostrarFormFact(tipo) {
  factTipoActual = tipo;
  document.getElementById('fact-form-title').textContent = tipo==='factura'?'Nueva factura':'Nuevo presupuesto';
  document.getElementById('fact-lineas').innerHTML = '';
  addLineaFact();
  const hoy = new Date();
  document.getElementById('fact-fecha').value = hoy.toISOString().slice(0,10);
  const vto = new Date(hoy); vto.setDate(vto.getDate()+30);
  document.getElementById('fact-vto').value = vto.toISOString().slice(0,10);
  document.getElementById('fact-form').style.display = 'block';
  document.getElementById('fact-preview').style.display = 'none';
  calcFactTotales();
}

function generarHTMLFactura(doc) {
  var lineasHTML = doc.lineas.map(function(l){
    return '<tr>'
      +'<td style="padding:8px;border-bottom:1px solid #eee">'+(l.desc||'')+'</td>'
      +'<td style="padding:8px;text-align:center;border-bottom:1px solid #eee">'+l.cantidad+'</td>'
      +'<td style="padding:8px;text-align:right;border-bottom:1px solid #eee">'+E2(l.precio)+'</td>'
      +'<td style="padding:8px;text-align:right;border-bottom:1px solid #eee;font-weight:700">'+E2(l.cantidad*l.precio)+'</td>'
      +'</tr>';
  }).join('');
  var dtoBadge = doc.descuento>0
    ? '<tr><td style="color:#8a9e7c">Subtotal</td><td style="text-align:right">'+E2(doc.subtotal)+'</td></tr>'
      +'<tr><td style="color:#c0392b">Descuento '+doc.descuento+'%</td><td style="text-align:right;color:#c0392b">-'+E2(doc.subtotal-doc.base)+'</td></tr>'
    : '';
  var estadoBadge = doc.estado==='cobrada'
    ? '<span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;background:#eaf4df;color:#4e8c28">Cobrada</span>'
    : '<span style="padding:3px 10px;border-radius:10px;font-size:11px;font-weight:700;background:#eaf2fb;color:#2471a3">Emitida</span>';
  return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
    +'<style>body{font-family:Arial,sans-serif;color:#1c2a14;max-width:800px;margin:0 auto;padding:30px;font-size:13px}'
    +'.hdr{display:flex;justify-content:space-between;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #6db33f}'
    +'.partes{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:24px}'
    +'h4{font-size:10px;text-transform:uppercase;color:#8a9e7c;margin:0 0 6px}'
    +'table{width:100%;border-collapse:collapse;margin-bottom:16px}'
    +'thead{background:#1a2e0f;color:#fff}'
    +'th{padding:9px 8px;text-align:left;font-size:10px;text-transform:uppercase}'
    +'th:not(:first-child){text-align:right}'
    +'.tf{display:flex;justify-content:flex-end}'
    +'.tf table{min-width:280px;font-size:13px}'
    +'.tf td{padding:4px 10px}'
    +'.tr{border-top:2px solid #6db33f;font-weight:800;font-size:15px;color:#4e8c28}'
    +'.ft{margin-top:30px;padding-top:16px;border-top:1px solid #d4e8c0;font-size:11px;color:#8a9e7c;text-align:center}'
    +'@media print{.np{display:none}}</style></head><body>'
    +'<div class="np" style="background:#eaf4df;padding:10px;border-radius:8px;margin-bottom:16px">'
      +'<button onclick="window.print()" style="padding:8px 18px;background:#4e8c28;color:#fff;border:none;border-radius:7px;font-weight:700;cursor:pointer">Imprimir / Guardar PDF</button> '
      +'<button onclick="window.close()" style="padding:8px 14px;background:#fff;border:1px solid #ccc;border-radius:7px;cursor:pointer">Cerrar</button>'
    +'</div>'
    +'<div class="hdr">'
      +'<div><h2 style="color:#1a2e0f;font-size:22px;font-weight:900;margin:0">sensara</h2>'
        +'<p style="color:#8a9e7c;font-size:11px;margin:3px 0"><strong>SENSARA, S.L.</strong> &middot; NIF: B26488361</p>'
        +'<p style="color:#8a9e7c;font-size:11px;margin:3px 0">C/Labradores, 25 bajo &middot; 26005 Logro&ntilde;o, La Rioja</p>'
        +'<p style="color:#8a9e7c;font-size:11px;margin:3px 0">info@sensaratech.com &middot; www.sensaratech.com</p>'
      +'</div>'
      +'<div style="text-align:right">'
        +'<div style="font-size:11px;color:#8a9e7c;text-transform:uppercase">'+(doc.tipo==="presupuesto"?"Presupuesto":"Factura")+'</div>'
        +'<div style="font-size:20px;font-weight:800;color:#4e8c28">'+doc.numero+'</div>'
        +'<p style="margin:6px 0;color:#8a9e7c">Fecha: '+doc.fecha+'</p>'
        +(doc.fechaVto?'<p style="margin:2px 0;color:#8a9e7c">Vto: '+doc.fechaVto+'</p>':'')
        +estadoBadge
      +'</div>'
    +'</div>'
    +'<div class="partes">'
      +'<div><h4>Emisor</h4>'
        +'<p><strong>SENSARA, S.L.</strong></p><p>NIF: B26488361</p>'
        +'<p>C/Labradores, 25 bajo</p><p>26005 Logro&ntilde;o, La Rioja</p>'
      +'</div>'
      +'<div><h4>Cliente</h4>'
        +'<p><strong>'+doc.cliente.nombre+'</strong></p>'
        +(doc.cliente.nif?'<p>NIF/CIF: '+doc.cliente.nif+'</p>':'')
        +(doc.cliente.direccion?'<p>'+doc.cliente.direccion+'</p>':'')
        +((doc.cliente.cp||doc.cliente.ciudad)?'<p>'+(doc.cliente.cp||'')+' '+(doc.cliente.ciudad||'')+'</p>':'')
      +'</div>'
    +'</div>'
    +'<table><thead><tr>'
      +'<th>Descripci&oacute;n</th>'
      +'<th style="text-align:right;width:80px">Cant.</th>'
      +'<th style="text-align:right;width:120px">Precio unit.</th>'
      +'<th style="text-align:right;width:120px">Importe</th>'
    +'</tr></thead><tbody>'+lineasHTML+'</tbody></table>'
    +'<div class="tf"><table>'
      +dtoBadge
      +'<tr><td style="color:#8a9e7c">Base imponible</td><td style="text-align:right;font-weight:700">'+E2(doc.base)+'</td></tr>'
      +'<tr><td style="color:#8a9e7c">IVA '+doc.iva+'%</td><td style="text-align:right">'+E2(doc.ivaImporte)+'</td></tr>'
      +'<tr class="tr"><td>TOTAL</td><td style="text-align:right">'+E2(doc.total)+'</td></tr>'
    +'</table></div>'
    +(doc.notas?'<div style="margin-top:16px;padding:12px;background:#f7faf3;border-radius:8px;font-size:12px;color:#8a9e7c"><strong>Notas:</strong> '+doc.notas+'</div>':'')
    +'<div class="ft">Forma de pago: Transferencia bancaria &middot; IBAN: ES15 0049 5011 1120 1609 7137<br>'
    +'SENSARA, S.L. &middot; B26488361 &middot; www.sensaratech.com</div>'
  +'</body></html>';
}

invLoad();
factLoad();
gastosLoad();
