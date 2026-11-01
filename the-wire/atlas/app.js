(() => {
 'use strict';
 const ATLAS=window.WIRE_DATA; let D=ATLAS.seasons[0]; const $=id=>document.getElementById(id), NS='http://www.w3.org/2000/svg';
 let people=new Map(D.people.map(p=>[p.id,p])), groups=new Map(D.groups.map(g=>[g.id,g])), sources=new Map(D.sources.map(s=>[s.id,s]));
 let lang='zh';try{if(localStorage.getItem('wire-atlas-language')==='en')lang='en';}catch{}
 const t=value=>lang==='en'?(window.WIRE_EN[value]??value):value;
 const tx=(value,vars)=>t(value).replace(/\{(\w+)\}/g,(_,key)=>String(vars[key]??''));
 const staticTexts=[],staticAttrs=[];
 function captureStatic(node){
  if(node.nodeType===3&&/[\u3400-\u9fff]/.test(node.nodeValue)){staticTexts.push([node,node.nodeValue]);return;}
  for(const child of node.childNodes||[])captureStatic(child);
 }
 function applyLanguage(){
  for(const [node,value] of staticTexts)node.nodeValue=value.replace(/[^\s].*[^\s]|[^\s]/s,part=>t(part));
  for(const [node,attr,value] of staticAttrs)node.setAttribute(attr,t(value));
  document.documentElement.lang=lang==='en'?'en':'zh-CN';
  document.title=lang==='en'?'The Wire · Character Atlas':'火线 · 人物地图 / The Wire Atlas';
  $('languageToggle').textContent=lang==='en'?'中文':'EN';
  $('languageToggle').setAttribute('aria-label',lang==='en'?'Switch to Chinese':'Switch to English');
 }
 const TYPES={work:'工作 / 组织',family:'亲属',personal:'私人交往',cooperate:'合作 / 信息',investigate:'调查 / 案件',conflict:'冲突 / 竞争'};
 const progress={}; const state={season:1,episode:1,view:'map',query:'',groups:new Set(D.groups.map(g=>g.id)),types:new Set(Object.keys(TYPES)),secondary:false,selected:null,focus:false};
 let transform={x:0,y:0,k:1}, sceneBounds=null, resizeTimer, toastTimer;
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const initials=p=>p.name.replace(/[’']/g,'').split(/[\s-]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('');
 const matches=p=>!state.query||[p.name,p.actor,...p.aliases].join(' ').toLocaleLowerCase().includes(state.query.toLocaleLowerCase());
 function available(){return D.people.filter(p=>p.since<=state.episode&&state.groups.has(p.group));}
 function availableEdges(){return D.relations.filter(r=>r.since<=state.episode&&state.types.has(r.type)&&people.get(r.source).since<=state.episode&&people.get(r.target).since<=state.episode);}
 function selectedRelations(){return availableEdges().filter(r=>r.source===state.selected||r.target===state.selected);}
 function neighborIds(){const ids=new Set([state.selected]);for(const r of selectedRelations()){ids.add(r.source);ids.add(r.target);}return ids;}
 function scene(){
  let list=available();
  if(state.query) list=list.filter(matches);
  else if(state.focus&&state.selected){const ids=neighborIds();list=list.filter(p=>ids.has(p.id));}
  else if(state.view==='map'&&!state.secondary){list=list.filter(p=>p.core||p.id===state.selected);}
  const ids=new Set(list.map(p=>p.id));
  return {list,edges:availableEdges().filter(r=>ids.has(r.source)&&ids.has(r.target))};
 }
 function photoAvailable(p){const gate=p.imageReveal;return !!p.image&&(!p.imageSince||p.imageSince<=state.episode)&&(!gate||state.season>gate.season||(state.season===gate.season&&state.episode>=gate.episode));}
 function photoCaption(p){
  if(!p.image)return t('暂无可靠角色图');
  if(!photoAvailable(p))return p.imageReveal?tx('角色照片来自 {episode}，观看至该集后显示',{episode:'S'+p.imageReveal.season+'E'+String(p.imageReveal.episode).padStart(2,'0')}):tx('角色照片将在观看至第 {episode} 集后显示',{episode:p.imageSince});
  const origin=p.imageEpisode?'S'+(p.imageSeason||1)+'E'+String(p.imageEpisode).padStart(2,'0'):t('拍摄季数未核验');
  return t(p.imageProvider||'TVmaze')+' · '+origin+(p.imageNote?' / '+t(p.imageNote):'');
 }
 function imageMarkup(p,cls=''){const alt=p.imageKind==='group'?t('Michael 与 Sean 的同框剧照；单人头像待核实'):tx('{name} 的角色照片',{name:p.name});return photoAvailable(p)?`<img class="${cls}" src="${escape(p.image)}" alt="${escape(alt)}" loading="lazy">`:`<span class="${cls||'card-initials'}" aria-label="${t(p.image?'角色照片尚未解锁':'暂无角色照片')}">${escape(initials(p))}</span>`;}
 function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3000);}
 function sourceLink(id){const s=sources.get(id);return s?`<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(t(s.title))} ↗</a>`:'';}
 function init(){
  captureStatic(document.body);
  document.querySelectorAll('[aria-label],[placeholder],[title]').forEach(node=>{for(const attr of ['aria-label','placeholder','title']){const value=node.getAttribute(attr);if(value)staticAttrs.push([node,attr,value]);}});
  applyLanguage();
  $('languageToggle').onclick=()=>{lang=lang==='en'?'zh':'en';try{localStorage.setItem('wire-atlas-language',lang);}catch{}applyLanguage();renderSeasonControls();render(false);};
  try{const saved=JSON.parse(localStorage.getItem('wire-atlas-progress'));if(saved?.progress)Object.assign(progress,saved.progress);else if(saved?.episode)progress[1]=saved.episode;if(ATLAS.seasons.some(s=>s.season===saved?.season))state.season=saved.season;}catch{}
  document.querySelectorAll('[data-season]').forEach(b=>b.onclick=()=>switchSeason(Number(b.dataset.season)));
  configureSeason();
  $('episodeSelect').addEventListener('change',e=>{
   state.episode=Number(e.target.value);state.focus=false;state.query='';$('searchInput').value='';
   if(state.selected&&people.get(state.selected)?.since>state.episode)state.selected=null;
   saveProgress();
   render(true);
  });
  $('groupFilters').addEventListener('change',e=>{const {value,checked}=e.target;if(checked)state.groups.add(value);else state.groups.delete(value);if(state.selected&&!state.groups.has(people.get(state.selected).group)){state.selected=null;state.focus=false;}render(true);});
  $('typeFilters').addEventListener('click',e=>{const b=e.target.closest('[data-type]');if(!b)return;const type=b.dataset.type;if(state.types.has(type))state.types.delete(type);else state.types.add(type);b.classList.toggle('active',state.types.has(type));b.setAttribute('aria-pressed',state.types.has(type));render(false);});
  $('secondaryToggle').addEventListener('change',e=>{state.secondary=e.target.checked;render(true);});
  $('searchInput').addEventListener('input',e=>{state.query=e.target.value.trim();state.focus=false;render(true);});
  $('clearSearch').onclick=()=>{state.query='';$('searchInput').value='';render(true);};
  $('clearFocus').onclick=()=>{state.focus=false;render(true);};
  $('resetFilters').onclick=resetFilters;$('emptyReset').onclick=resetFilters;
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;render(true);});
  $('zoomIn').onclick=()=>zoom(1.2);$('zoomOut').onclick=()=>zoom(1/1.2);$('fitMap').onclick=fit;
  $('directory').addEventListener('click',e=>{const b=e.target.closest('[data-person]');if(b)selectPerson(b.dataset.person);});
  $('detailPanel').addEventListener('click',e=>{
   const b=e.target.closest('[data-person]');if(b){selectPerson(b.dataset.person);return;}
   if(e.target.closest('[data-close]')){state.selected=null;state.focus=false;render(true);}
   if(e.target.closest('[data-focus]')){state.focus=true;state.query='';$('searchInput').value='';state.view='map';render(true);}
   if(e.target.closest('[data-onmap]')){state.view='map';state.focus=true;state.query='';$('searchInput').value='';render(true);}
  });
  document.addEventListener('keydown',e=>{
   const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
   if(e.key==='/'&&!typing){e.preventDefault();$('searchInput').focus();}
   if(e.key==='Escape'&&!typing&&state.selected){state.selected=null;state.focus=false;render(true);}
  });
  setupPanZoom();new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.view==='map')fit();},100);}).observe($('mapStage'));
  render(true);
 }
 function saveProgress(){progress[state.season]=state.episode;try{localStorage.setItem('wire-atlas-progress',JSON.stringify({season:state.season,episode:state.episode,progress}));}catch{}}
 function configureSeason(){
  D=ATLAS.seasons.find(s=>s.season===state.season);state.episode=Math.max(1,Math.min(D.episodes.length,Math.trunc(Number(progress[state.season]))||1));
  state.groups=new Set(D.groups.map(g=>g.id));people=new Map(D.people.map(p=>[p.id,p]));groups=new Map(D.groups.map(g=>[g.id,g]));sources=new Map(D.sources.map(s=>[s.id,s]));
  renderSeasonControls();
 }
 function renderSeasonControls(){
  $('episodeSelect').innerHTML=D.episodes.map((title,i)=>`<option value="${i+1}">${tx('第 {episode} 集',{episode:String(i+1).padStart(2,'0')})}${i===D.episodes.length-1?' · '+t('本季看完'):''}</option>`).join('');$('episodeSelect').value=String(state.episode);
  $('groupFilters').innerHTML=D.groups.map(g=>`<label class="group-filter" style="--color:${g.color}"><input type="checkbox" value="${g.id}"${state.groups.has(g.id)?' checked':''}><i class="color-dot"></i><span>${t(g.name)}</span><span class="group-count" id="count-${g.id}"></span></label>`).join('');
  $('typeFilters').innerHTML=Object.entries(TYPES).map(([id,name])=>`<button class="type-pill${state.types.has(id)?' active':''}" data-type="${id}" aria-pressed="${state.types.has(id)}">${t(name)}</button>`).join('');
  document.querySelectorAll('[data-season]').forEach(b=>{const active=Number(b.dataset.season)===state.season;b.classList.toggle('selected',active);b.setAttribute('aria-current',String(active));});
  document.querySelector('.select-label').textContent=tx('已看完{season}',{season:t(D.title)});
 }
 function switchSeason(season){if(state.season===season)return;saveProgress();state.season=season;state.selected=null;state.focus=false;state.query='';$('searchInput').value='';configureSeason();saveProgress();render(true);}
 function projectPeople(){const raw=ATLAS.seasons.find(s=>s.season===state.season);D={...raw,people:raw.people.map(p=>{let value={...p};for(const u of p.updates||[])if(u.since<=state.episode){const {since,...fields}=u;Object.assign(value,fields);}return value;})};people=new Map(D.people.map(p=>[p.id,p]));}
 function resetFilters(){state.groups=new Set(D.groups.map(g=>g.id));state.types=new Set(Object.keys(TYPES));state.query='';state.selected=null;state.focus=false;state.secondary=false;$('secondaryToggle').checked=false;$('searchInput').value='';document.querySelectorAll('#groupFilters input').forEach(e=>e.checked=true);document.querySelectorAll('[data-type]').forEach(b=>{b.classList.add('active');b.setAttribute('aria-pressed','true');});render(true);}
 function selectPerson(id){projectPeople();const p=people.get(id);if(!p||p.since>state.episode)return;state.selected=id;render(state.focus);$('detailPanel').scrollTop=0;}
 function render(refit){
  projectPeople();
  if(state.selected&&(!people.has(state.selected)||people.get(state.selected).since>state.episode||!state.groups.has(people.get(state.selected).group))){state.selected=null;state.focus=false;}
  const {list,edges}=scene();
  $('mapStage').hidden=state.view!=='map';$('directory').hidden=state.view!=='directory';
  document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===state.view);b.setAttribute('aria-current',b.dataset.view===state.view?'page':'false');});
  $('peopleCount').textContent=list.length;$('edgeCount').textContent=edges.length;
  $('episodeCaption').textContent=`E${String(state.episode).padStart(2,'0')} / ${D.episodes[state.episode-1]}`;
  const mode=state.view==='directory'?'全部已收录人物':state.focus?'直接关系':state.query?'搜索结果':state.secondary?'含配角':'核心人物';
  $('scopeLabel').textContent=tx('{season} · 截至第 {episode} 集 · {mode}',{season:t(D.title),episode:state.episode,mode:t(mode)})+(state.query?' · “'+state.query+'”':'');
  $('clearFocus').hidden=!state.focus;$('clearSearch').hidden=!state.query;
  for(const g of D.groups)$('count-'+g.id).textContent=D.people.filter(p=>p.group===g.id&&p.since<=state.episode).length.toString().padStart(2,'0');
  if(state.view==='map')renderMap(list,edges,refit);else renderDirectory(list);
  renderDetail();
 }
 function el(tag,attrs={},text){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
 function layout(list){
  const positions=new Map(),regions=[];
  if(state.focus&&state.selected&&!state.query){
   const center=list.find(p=>p.id===state.selected);if(center)positions.set(center.id,{x:570,y:470});
   const others=list.filter(p=>p.id!==state.selected);
   others.forEach((p,i)=>{const ring=i<12?0:1,slot=ring===0?i:i-12,total=ring===0?Math.min(others.length,12):others.length-12;const a=-Math.PI/2+slot*2*Math.PI/total;positions.set(p.id,{x:570+Math.cos(a)*(ring?700:440),y:470+Math.sin(a)*(ring?640:400)});});
   return {positions,regions};
  }
  // Core slots remain stable as episode progress changes. Expanded mode uses its own fixed slots.
  const expanded=state.secondary||!!state.query;
  const baseline=D.people.filter(p=>expanded||p.core||p.id===state.selected);
  const columns=state.season===1?[['detail','police'],['barksdale','street'],['justice','family']]:[0,1,2].map(col=>D.groups.filter(g=>g.column===col).map(g=>g.id));
  let laneX=35;
  for(const lane of columns){
   const sizes=lane.map(gid=>{const count=baseline.filter(p=>p.group===gid).length;return {gid,count,cols:count>12?5:count>6?4:3};});
   const laneWidth=Math.max(620,...sizes.filter(g=>g.count).map(g=>g.cols*200+20));
   let y=45;
   for(const {gid,count,cols} of sizes){
    if(!count)continue;
    const g=groups.get(gid),all=baseline.filter(p=>p.group===gid).sort((a,b)=>Number(b.core)-Number(a.core));
    const visible=list.filter(p=>p.group===gid),height=90+Math.ceil(count/cols)*218;
    all.forEach((p,i)=>positions.set(p.id,{x:laneX+110+(i%cols)*200,y:y+140+Math.floor(i/cols)*218}));
    if(visible.length)regions.push({...g,x:laneX,y,width:cols*200+20,height});
    y+=height+140;
   }
   laneX+=laneWidth+180;
  }
  return {positions,regions};
 }
 function renderMap(list,edges,refit){
  const {positions,regions}=layout(list),ids=new Set(list.map(p=>p.id)),near=state.selected?neighborIds():new Set();
  for(const id of ['svgDefs','groupLayer','edgeLayer','nodeLayer'])$(id).replaceChildren();
  const defs=$('svgDefs');
  const marker=el('marker',{id:'arrow',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'6',markerHeight:'6',orient:'auto-start-reverse'});marker.append(el('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'#8da082'}));defs.append(marker);
  for(const g of regions){
   const group=el('g');
   group.append(el('rect',{x:g.x+12,y:g.y,width:Math.min(g.width-24,lang==='en'?470:350),height:54,rx:1,class:'group-label'}));
   group.append(el('rect',{x:g.x+12,y:g.y,width:4,height:54,fill:g.color}));
   group.append(el('text',{x:g.x+28,y:g.y+23,class:'group-heading'},t(g.name)));
   group.append(el('text',{x:g.x+28,y:g.y+41,class:'group-subheading'},g.en));
   $('groupLayer').append(group);
  }
  const pairCounts=new Map();
  for(const r of edges){
   const a=positions.get(r.source),b=positions.get(r.target);if(!a||!b)continue;
   const key=[r.source,r.target].sort().join('/'),idx=pairCounts.get(key)||0;pairCounts.set(key,idx+1);
   const dx=b.x-a.x,dy=b.y-a.y,len=Math.max(Math.hypot(dx,dy),1),ux=dx/len,uy=dy/len;
   const start={x:a.x+ux*37,y:a.y+uy*37},end={x:b.x-ux*39,y:b.y-uy*39};
   const bend=idx?35:Math.min(32,len*.045),mid={x:(a.x+b.x)/2-uy*bend,y:(a.y+b.y)/2+ux*bend};
   const focused=state.selected&&(r.source===state.selected||r.target===state.selected);
   const path=el('path',{d:`M${start.x},${start.y} Q${mid.x},${mid.y} ${end.x},${end.y}`,class:`edge ${r.type}${focused?' focused':state.selected?' dimmed':''}`});
   if(r.directed)path.setAttribute('marker-end','url(#arrow)');path.append(el('title',{},`${people.get(r.source).name} ↔ ${people.get(r.target).name}：${t(r.label)}`));$('edgeLayer').append(path);
   if(focused){const edgeText=el('text',{x:(start.x+2*mid.x+end.x)/4,y:(start.y+2*mid.y+end.y)/4-5,class:'edge-label','text-anchor':'middle'},t(r.label));$('edgeLayer').append(edgeText);}
  }
  for(const p of list){
   const pos=positions.get(p.id);if(!pos)continue;const g=groups.get(p.group),selected=p.id===state.selected;
   const node=el('g',{transform:`translate(${pos.x},${pos.y})`,class:`person-node${selected?' selected':''}${state.selected&&!near.has(p.id)?' dimmed':''}`,tabindex:'0',role:'button','aria-label':`${p.name}, ${t(p.role)}, ${t('查看人物详情')}`,'data-id':p.id});
   node.append(el('title',{},`${p.name} · ${t(p.role)}`));
   if(selected)node.append(el('rect',{x:-88,y:-72,width:176,height:190,rx:3,class:'selection-halo'}));
   node.append(el('rect',{x:-82,y:-66,width:164,height:178,rx:1,class:'node-ring'}));
   node.append(el('rect',{x:-74,y:-58,width:148,height:104,class:'photo-mat'}));
   if(photoAvailable(p)){
    const clip=el('clipPath',{id:'clip-'+p.id});clip.append(el('rect',{x:-74,y:-58,width:148,height:104}));defs.append(clip);
    node.append(el('image',{href:p.image,x:-74,y:-58,width:148,height:104,preserveAspectRatio:'xMidYMid slice','clip-path':`url(#clip-${p.id})`,class:'node-photo'}));
   }else node.append(el('text',{class:'node-initials',y:-5},initials(p)));
   node.append(el('circle',{cx:0,cy:-61,r:4,class:'card-pin',fill:g.color}));
   const words=p.name.split(' '),lines=[''];
   for(const word of words){const last=lines.length-1;if(lines[last]&&(lines[last]+' '+word).length>20&&lines.length<2)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word;}
   const name=el('text',{y:67,class:'node-name'});
   lines.forEach((line,i)=>name.append(el('tspan',{x:0,dy:i?17:0},line)));node.append(name);
   const role=t(p.role)+(p.imageKind==='group'?t(' · 兄弟同框照'):'');
   node.append(el('text',{y:101,class:'node-role'},role.length>(lang==='en'?27:24)?role.slice(0,lang==='en'?26:23)+'…':role));
   node.addEventListener('click',()=>{if(!dragMoved)selectPerson(p.id);});
   node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPerson(p.id);}});
   $('nodeLayer').append(node);
  }
  const points=list.map(p=>positions.get(p.id)).filter(Boolean),boxes=regions.map(r=>({x:r.x,y:r.y,right:r.x+r.width,bottom:r.y+r.height}));
  if(points.length){const minX=Math.min(...points.map(p=>p.x-105),...boxes.map(r=>r.x)),minY=Math.min(...points.map(p=>p.y-78),...boxes.map(r=>r.y));const maxX=Math.max(...points.map(p=>p.x+105),...boxes.map(r=>r.right)),maxY=Math.max(...points.map(p=>p.y+122),...boxes.map(r=>r.bottom));sceneBounds={x:minX,y:minY,w:maxX-minX,h:maxY-minY};}else sceneBounds=null;
  $('mapEmpty').hidden=list.length>0;if(refit)requestAnimationFrame(fit);else applyTransform();
 }
 function renderDirectory(list){
  if(!list.length){$('directory').innerHTML=`<div class="directory-empty">${t('没有找到人物。试试别名、演员名，或重置筛选。')}</div>`;return;}
  $('directory').innerHTML=D.groups.map(g=>{const members=list.filter(p=>p.group===g.id);if(!members.length)return '';return `<h3 class="directory-group-title" style="--color:${g.color}"><i></i>${t(g.name)}<span>${String(members.length).padStart(2,'0')}</span></h3><div class="person-grid">${members.map(p=>`<button class="person-card${p.id===state.selected?' active':''}" data-person="${p.id}" aria-label="${escape(tx('查看 {name}',{name:p.name}))}"><div class="card-image">${imageMarkup(p)}</div><strong class="card-name">${escape(p.name)}</strong><span class="card-role">${escape(t(p.role))}</span></button>`).join('')}</div>`;}).join('');
 }
 function renderDetail(){
  const panel=$('detailPanel');panel.classList.toggle('open',!!state.selected);
  panel.hidden=false;
  if(!state.selected){panel.innerHTML=`<div class="detail-welcome"><svg class="abstract-lines" viewBox="0 0 240 150" fill="none" aria-hidden="true"><path d="M15 75H63L104 29H167L218 75L167 122H104L63 75" stroke="currentColor" stroke-opacity=".2"/><path d="M63 75H167M104 29V122M167 29V122M15 75L104 122M218 75L104 29" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="3 4"/><circle cx="104" cy="75" r="17" fill="#e3b74f" fill-opacity=".8"/><circle cx="63" cy="75" r="7" fill="#c1cbb4"/><circle cx="167" cy="29" r="7" fill="#c1cbb4"/><circle cx="167" cy="122" r="7" fill="#c1cbb4"/><circle cx="218" cy="75" r="5" fill="#c1cbb4"/><circle cx="104" cy="29" r="5" fill="#c1cbb4"/></svg></div>`;return;}
  const p=people.get(state.selected),g=groups.get(p.group),relations=selectedRelations();
  const byOther=new Map();for(const r of relations){const other=r.source===p.id?r.target:r.source;if(!state.groups.has(people.get(other).group))continue;if(!byOther.has(other))byOther.set(other,[]);byOther.get(other).push(r);}
  panel.innerHTML=`<div class="detail-top"><span>PERSON / ${String(D.people.indexOf(p)+1).padStart(3,'0')}</span><button class="detail-close" data-close aria-label="${t('关闭人物详情')}">×</button></div><div class="portrait-wrap">${photoAvailable(p)?imageMarkup(p):`<div class="portrait-placeholder">${escape(initials(p))}</div>`}</div><p class="portrait-caption">${escape(photoCaption(p))}</p><div class="detail-identity"><span class="group-badge" style="--group-color:${g.color}">${t(g.name)}</span><h2>${escape(p.name)}</h2><p class="actor">${p.actor?escape(tx('{actor} 饰',{actor:t(p.actor)})):t('演员信息待核对')}</p><div class="detail-role"><span>${escape(t(p.role))}</span><span>${tx('收录自 {episode}',{episode:'E'+String(p.since).padStart(2,'0')})}</span></div><p class="bio">${escape(t(p.bio))}</p><div class="detail-actions"><button class="primary-button" data-focus>${t('只看直接关系 ↗')}</button><button class="outline-button" data-onmap>${t('在地图中查看')}</button></div></div><div class="detail-relations"><div class="detail-section-title">${t('已揭示的直接联系')} <span>${tx('{people} 人 / {relations} 条',{people:byOther.size,relations:[...byOther.values()].flat().length})}</span></div>${byOther.size?[...byOther.entries()].map(([id,rs])=>{const other=people.get(id);return `<div class="relation-item"><button class="relation-person" data-person="${id}"><span class="mini-face">${imageMarkup(other,'mini-initials')}</span><span class="rel-name">${escape(other.name)}</span><span class="rel-tag">${escape(rs.map(r=>t(r.label)).join(' / '))}</span></button><details><summary>${t('查看关系依据')}</summary>${rs.map(r=>`<p><strong>${escape(t(r.label))}</strong> · ${tx('收录边界 {episode}',{episode:'S'+state.season+'E'+String(r.since).padStart(2,'0')})}<br>${escape(t(r.note))}</p>${r.sources.map(sourceLink).join('')}`).join('')}</details></div>`;}).join(''):`<p class="bio" style="margin-top:15px">${t('当前进度与筛选条件下，尚未收录可显示的直接联系。')}</p>`}</div><details class="detail-sources"><summary>${t('人物资料与图片来源 · 外链可能剧透')}</summary>${p.sources.map(sourceLink).join('')}${p.imageProvider==='本地剧集截图'?`<p>${t('本地视频截图')} · S${p.imageSeason}E${String(p.imageEpisode).padStart(2,'0')} · ${escape(t(p.imageNote))}</p>`:''}${p.imageSource?`<a href="${escape(p.imageSource)}" target="_blank" rel="noopener noreferrer">${t('角色图片来源')} · ${escape(t(p.imageProvider||'TVmaze'))} ↗</a>`:''}</details>`;
 }
 function applyTransform(){$('world').setAttribute('transform',`translate(${transform.x},${transform.y}) scale(${transform.k})`);$('zoomLabel').textContent=Math.round(transform.k*100)+'%';}
 function fit(){if(!sceneBounds||state.view!=='map')return;const b=$('mapStage').getBoundingClientRect();if(!b.width||!b.height)return;const pad=window.innerWidth<650?22:32;const bottom=70;transform.k=Math.min(1.35,Math.max(.16,Math.min((b.width-pad*2)/sceneBounds.w,(b.height-pad-bottom)/sceneBounds.h)));transform.x=(b.width-sceneBounds.w*transform.k)/2-sceneBounds.x*transform.k;transform.y=(b.height-bottom-sceneBounds.h*transform.k)/2-sceneBounds.y*transform.k;applyTransform();}
 function zoom(factor,point){const b=$('mapStage').getBoundingClientRect(),pt=point||{x:b.width/2,y:b.height/2},k=Math.max(.16,Math.min(3.5,transform.k*factor));transform.x=pt.x-(pt.x-transform.x)*k/transform.k;transform.y=pt.y-(pt.y-transform.y)*k/transform.k;transform.k=k;applyTransform();}
 let drag=null,dragMoved=false;
 function setupPanZoom(){const svg=$('network');svg.addEventListener('wheel',e=>{e.preventDefault();const b=svg.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),{x:e.clientX-b.left,y:e.clientY-b.top});},{passive:false});svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragMoved=false;if(e.target.closest('.person-node'))return;drag={x:e.clientX,y:e.clientY,tx:transform.x,ty:transform.y,id:e.pointerId};svg.setPointerCapture(e.pointerId);});svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)dragMoved=true;if(dragMoved){svg.classList.add('dragging');transform.x=drag.tx+dx;transform.y=drag.ty+dy;applyTransform();}});const stop=e=>{if(!drag||e.pointerId!==drag.id)return;drag=null;svg.classList.remove('dragging');if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);setTimeout(()=>dragMoved=false,0);};svg.addEventListener('pointerup',stop);svg.addEventListener('pointercancel',stop);}
 // Expose only public, progress-filtered summaries for lightweight local QA.
 window.WireAtlas={getSnapshot:()=>{const s=scene();return {language:lang,season:state.season,episode:state.episode,view:state.view,selected:state.selected,focus:state.focus,people:s.list.map(p=>p.id),relations:s.edges.map(r=>r.id)};}};
 init();
})();
