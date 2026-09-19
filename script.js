var DATA = window.DATA || [];
var curLang = "zh";
var filters = {genre:"all",type:"all"};
var sortBy = "year";
var sortDir = "desc";
var curPage = 1;
var PAGE_SIZE = 12;
var currentWorkId = null;
var sidebarToggle=document.getElementById('sidebar-toggle');
var filterSidebar=document.getElementById('filter-sidebar');
var filterContent=document.getElementById('filter-content');
var narrowScreen=window.matchMedia('(max-width:759px)');
function setSidebarOpen(open){
  if(!open&&filterContent.contains(document.activeElement))sidebarToggle.focus();
  filterContent.inert=!open;
  filterContent.setAttribute('aria-hidden',String(!open));
  document.body.classList.toggle('sidebar-collapsed',!open);
  sidebarToggle.setAttribute('aria-expanded',String(open));
}
sidebarToggle.addEventListener('click',function(){setSidebarOpen(document.body.classList.contains('sidebar-collapsed'));});
setSidebarOpen(!narrowScreen.matches);
narrowScreen.addEventListener('change',function(e){setSidebarOpen(!e.matches);});
var tl = {film:{zh:"电影",en:"Film"},series:{zh:"剧集",en:"Series"}};

document.querySelectorAll(".fb[data-f]").forEach(function(b){
  b.addEventListener("click",function(){
    var f=this.dataset.f,v=this.dataset.v;
    filters[f]=v;
    curPage=1;
    document.querySelectorAll(".fb[data-f='"+f+"']").forEach(function(x){x.classList.remove("on");});
    this.classList.add("on");
    leaveDetailForCollection();
    render();
  });
});
document.querySelectorAll(".fb[data-sort]").forEach(function(b){
  b.addEventListener("click",function(){
    var ns=this.dataset.sort;
    if(sortBy===ns){
      sortDir=sortDir==="desc"?"asc":"desc";
    } else {
      sortBy=ns; sortDir="desc";
    }
    document.querySelectorAll(".fb[data-sort]").forEach(function(x){
      x.classList.remove("on");
      var sp=x.querySelector(".sdir");
      if(sp) sp.textContent="↓";
    });
    this.classList.add("on");
    var sp=this.querySelector(".sdir");
    if(sp) sp.textContent=sortDir==="desc"?"↓":"↑";
    curPage=1;
    leaveDetailForCollection();
    render();
  });
});
// Pagination controls
function goToPage(page){
  curPage=page;
  render();
  var toolbar=document.querySelector('.browse-toolbar');
  if(toolbar.getBoundingClientRect().top<0)toolbar.scrollIntoView({block:'start',behavior:'instant'});
}
document.getElementById("pg-first").addEventListener("click",function(){goToPage(1);});
document.getElementById("pg-last").addEventListener("click",function(){
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;goToPage(tot);
});
document.getElementById("pg-prev").addEventListener("click",function(){if(curPage>1){goToPage(curPage-1);}});
document.getElementById("pg-next").addEventListener("click",function(){
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;if(curPage<tot){goToPage(curPage+1);}
});
function doJump(){
  var el=document.getElementById("pg-jump");
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;
  var v=parseInt(el.value);
  if(!isNaN(v)){goToPage(Math.max(1,Math.min(v,tot)));el.value=curPage;}
}
document.getElementById("pg-minus").addEventListener("click",function(){
  var el=document.getElementById("pg-jump");
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;
  var v=parseInt(el.value)||curPage;
  el.value=Math.max(1,v-1);
});
document.getElementById("pg-plus").addEventListener("click",function(){
  var el=document.getElementById("pg-jump");
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;
  var v=parseInt(el.value)||curPage;
  el.value=Math.min(tot,v+1);
});
document.getElementById("pg-jump").addEventListener("keydown",function(e){
  if(e.key==="Enter"){doJump();}
});
document.getElementById("pg-go").addEventListener("click",function(){doJump();});
document.getElementById("srch").addEventListener("input",function(){curPage=1;leaveDetailForCollection();render();});

// ── Local cover loader ──
function coverUrl(id) {
  return "covers/" + String(id).padStart(4, "0") + ".jpg";
}

function loadCovers() {
  document.querySelectorAll('.mc-cover[data-id]').forEach(function(cover){
    applyCover(cover, coverUrl(cover.getAttribute('data-id')), true);
  });
}

function applyCover(cover, url, lazy) {
  if (!cover || !url) return;
  var existing = cover.querySelector('img');
  if (existing && existing.getAttribute('src') === url) return;
  var img = document.createElement('img');
  img.onload = function(){
    img.classList.add('loaded');
    cover.querySelectorAll('.mc-cover-placeholder,.modal-cover-placeholder').forEach(function(el){el.remove();});
  };
  img.onerror = function(){ img.remove(); };
  img.alt = '';
  img.decoding = 'async';
  if(lazy)img.loading = 'lazy';
  img.src = url;
  cover.querySelectorAll('img').forEach(function(el){el.remove();});
  cover.appendChild(img);
}

function renderPagination(total, tot) {
  var numsEl = document.getElementById("pg-nums");
  var pgInfo = document.getElementById("pg-info");
  var pgFirst = document.getElementById("pg-first");
  var pgLast = document.getElementById("pg-last");
  var pgPrev = document.getElementById("pg-prev");
  var pgNext = document.getElementById("pg-next");

  // Enable/disable edge buttons
  if(pgFirst) pgFirst.disabled = (curPage <= 1);
  if(pgPrev) pgPrev.disabled = (curPage <= 1);
  if(pgNext) pgNext.disabled = (curPage >= tot);
  if(pgLast) pgLast.disabled = (curPage >= tot);

  if(pgInfo) pgInfo.textContent = total > 0 ? curPage + " / " + tot : "";
  document.getElementById('pg-jump').value=curPage;
  document.getElementById('pg-jump').max=tot;

  if(!numsEl) return;
  numsEl.innerHTML = "";

  // Build page number array with ellipsis
  // Always show: 1, last, and up to 2 pages around current
  var pages = [];
  if(tot <= 7) {
    for(var i=1;i<=tot;i++) pages.push(i);
  } else if(curPage <= 4) {
    pages=[1,2,3,4,5,"…",tot];
  } else if(curPage >= tot-3) {
    pages=[1,"…",tot-4,tot-3,tot-2,tot-1,tot];
  } else {
    pages=[1,"…",curPage-1,curPage,curPage+1,"…",tot];
  }

  pages.forEach(function(p) {
    if(p === "…") {
      var el = document.createElement("span");
      el.className = "pg-ellipsis";
      el.textContent = "…";
      numsEl.appendChild(el);
    } else {
      var btn = document.createElement("button");
      btn.className = "pg-num" + (p === curPage ? " on" : "");
      btn.textContent = p;
      btn.addEventListener("click", function(n){
        return function(){goToPage(n);};
      }(p));
      numsEl.appendChild(btn);
    }
  });
}

function render(){
  var q=(document.getElementById("srch").value||"").trim().toLowerCase();
  var list=DATA.filter(function(d){
    if(filters.genre!=="all"&&d.genre!==filters.genre)return false;
    if(filters.type!=="all"&&d.type!==filters.type)return false;
    if(q&&(d.title||"").toLowerCase().indexOf(q)<0&&(d.zh||"").toLowerCase().indexOf(q)<0)return false;
    return true;
  }).slice().sort(function(a,b){
    var dir=sortDir==="asc"?1:-1;
    return dir*((a[sortBy]||0)-(b[sortBy]||0))||a.id-b.id;
  });

  var grid=document.getElementById("mgrid");
  var nores=document.getElementById("nores");
  var cnt=document.getElementById("cnt");
  var pgInfo=document.getElementById("pg-info");
  nores.style.display=list.length===0?"block":"none";
  if(cnt)cnt.textContent=list.length+(curLang==="zh"?" 部":" titles");
  window._filteredLen=list.length;
  document.getElementById('pgrow').hidden=!list.length;
  if(!list.length){curPage=1;grid.innerHTML="";renderPagination(0,1);if(pgInfo)pgInfo.textContent="";return;}

  // Pagination
  var tot=Math.ceil(list.length/PAGE_SIZE)||1;
  if(curPage>tot)curPage=tot;
  var start=(curPage-1)*PAGE_SIZE;
  var pageList=list.slice(start,start+PAGE_SIZE);
  if(pgInfo)pgInfo.textContent=curPage+" / "+tot;
  renderPagination(list.length, tot);

  grid.innerHTML=pageList.map(function(d){
    var nm=curLang==="zh"&&d.zh?d.zh:d.title;
    var coverHtml='<div class="mc-cover" data-id="'+d.id+'">'
      +'<div class="mc-cover-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/><circle cx="15.5" cy="10.5" r="2.5"/></svg></div>'
      +'</div>';
    return '<article class="mc">'
      +'<button class="mc-open" aria-labelledby="mc-title-'+d.id+'" onclick="openM('+d.id+')"></button>'
      +coverHtml
      +'<div class="mc-body"><div class="mc-t" id="mc-title-'+d.id+'">'+nm+'</div>'
      +'</div></article>';
  }).join("");
  // Load local cover images after render
  loadCovers();
}

function openM(id){
  showDetail(id,true);
}

function workUrl(id){
  var url=new URL(window.location.href);
  if(id===null)url.searchParams.delete('work');
  else url.searchParams.set('work',String(id));
  return url.href;
}

function leaveDetailForCollection(){
  if(currentWorkId!==null)showCollection(true);
}

function showCollection(pushHistory){
  currentWorkId=null;
  document.body.classList.remove('detail-open');
  document.getElementById('detail-view').hidden=true;
  document.getElementById('films').hidden=false;
  document.title='GRINGOTTS';
  if(pushHistory)history.pushState({view:'collection'},'',workUrl(null));
}

function showDetail(id,pushHistory){
  var d=DATA.find(function(x){return x.id===id;});
  if(!d){
    showCollection(false);
    history.replaceState({view:'collection'},'',workUrl(null));
    return;
  }
  currentWorkId=d.id;
  var zh=curLang==="zh";
  var nm=zh&&d.zh?d.zh:d.title;
  var gl_zh2={"Feature":"剧情","Fantasy":"奇幻","Documentary":"纪录片","Suspense":"侦探","Science Fiction":"科幻"};
  document.getElementById("detail-category").textContent=(curLang==="zh"?gl_zh2[d.genre]||d.genre:d.genre)+" · "+tl[d.type][curLang]+" · "+d.year;
  document.getElementById("detail-title").textContent=nm;
  var mc = document.getElementById("detail-cover");
  if (mc) {
    mc.innerHTML = '<div class="modal-cover-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/><circle cx="15.5" cy="10.5" r="2.5"/></svg></div>';
    mc._currentId = d.id;
    applyCover(mc, coverUrl(d.id), false);
  }
  var imdbUrl = d.imdb_id ? "https://www.imdb.com/title/" + d.imdb_id + "/" : "https://www.imdb.com/find?q=" + encodeURIComponent(d.title);
  var doubanUrl = d.douban_id ? "https://movie.douban.com/subject/" + d.douban_id + "/" : "https://search.douban.com/movie/subject_search?search_text=" + encodeURIComponent(d.zh||d.title);
  var doubanTitle = d.douban_id ? (zh?"查看豆瓣作品页":"View on Douban") : (zh?"在豆瓣搜索":"Search on Douban");
  document.getElementById("detail-ratings").innerHTML=
    '<a class="mrat im" href="'+imdbUrl+'" target="_blank" rel="noopener" title="Search on IMDb" style="text-decoration:none;cursor:pointer"><div class="mrn">'+d.imdb+'</div><div class="mrl">IMDb ↗</div></a>'
    +'<a class="mrat db" href="'+doubanUrl+'" target="_blank" rel="noopener" title="'+doubanTitle+'" style="text-decoration:none;cursor:pointer"><div class="mrn">'+d.douban+'</div><div class="mrl">'+(zh?"豆瓣":"Douban")+' ↗</div></a>';
  var synopsis=zh?d.description_zh:d.description_en;
  var synopsisSection=document.getElementById('detail-synopsis');
  synopsisSection.hidden=!synopsis;
  document.getElementById('detail-summary').textContent=synopsis||'';
  var source=document.getElementById('detail-source');
  var sourceUrl=zh?(d.description_source_zh||d.description_source):(d.description_source_en||d.description_source);
  if(synopsis&&sourceUrl){
    source.hidden=false;
    source.href=sourceUrl;
    var sourceName=zh?(d.description_source_name_zh||'资料页'):(d.description_source_name_en||'Source page');
    source.textContent=(zh?'资料来源：':'Source: ')+sourceName+' ↗';
  }else{
    source.hidden=true;
    source.removeAttribute('href');
    source.textContent='';
  }
  document.getElementById('films').hidden=true;
  document.getElementById('detail-view').hidden=false;
  document.body.classList.add('detail-open');
  document.title=nm+' · GRINGOTTS';
  if(pushHistory)history.pushState({view:'detail',id:d.id,fromCollection:true},'',workUrl(d.id));
  window.scrollTo({top:0,behavior:'instant'});
}

document.getElementById('detail-back').addEventListener('click',function(){
  if(history.state&&history.state.view==='detail'&&history.state.fromCollection)history.back();
  else{
    showCollection(false);
    history.replaceState({view:'collection'},'',workUrl(null));
    window.scrollTo({top:0,behavior:'instant'});
  }
});

window.addEventListener('popstate',function(){
  var id=parseInt(new URLSearchParams(window.location.search).get('work'),10);
  if(!isNaN(id))showDetail(id,false);
  else showCollection(false);
});

// Native dialogs make the background inert; retain the page position on mobile too.
function showDialog(dialog,trigger){
  if(dialog.open)return;
  var previous=document.querySelector('dialog[open]');
  if(previous)return;
  dialog._returnFocus=trigger||document.activeElement;
  dialog._scrollPosition={x:window.scrollX,y:window.scrollY};
  document.body.style.setProperty('--dialog-scroll-top',-window.scrollY+'px');
  document.body.classList.add('dialog-open');
  dialog.showModal();
  var panel=dialog.querySelector('.modal,.about-modal');
  panel.scrollTop=0;
  panel.focus({preventScroll:true});
}

document.querySelectorAll('dialog').forEach(function(dialog){
  dialog.addEventListener('close',function(){
    document.body.classList.remove('dialog-open');
    document.body.style.removeProperty('--dialog-scroll-top');
    var position=dialog._scrollPosition;
    if(position)window.scrollTo(position.x,position.y);
    if(dialog._returnFocus&&dialog._returnFocus.isConnected){
      var returnFocus=dialog._returnFocus;
      requestAnimationFrame(function(){
        if(document.activeElement===returnFocus)returnFocus.blur();
      });
    }
  });
  dialog.addEventListener('keydown',function(e){
    if(e.key!=='Tab')return;
    var focusable=Array.from(dialog.querySelectorAll('button,a[href],input,[tabindex="0"]')).filter(function(el){return !el.disabled&&el.getClientRects().length>0;});
    var first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
});

function toggleLang(){
  curLang=curLang==="zh"?"en":"zh";
  document.body.classList.remove('zh','en');
  document.body.classList.add(curLang);
  document.documentElement.lang=curLang;
  document.getElementById("lb").textContent=curLang==="zh"?"EN":"中文";
  if(currentWorkId!==null)showDetail(currentWorkId,false);
  else render();
}



// Set default sort button active
var defBtn=document.getElementById("sb-year");
if(defBtn){defBtn.classList.add("on");}

function openAbout(){showDialog(document.getElementById("about-ov"),document.querySelector('.aboutbtn'));}
function closeAbout(){document.getElementById("about-ov").close();}
function closeAboutOv(e){if(e.target===document.getElementById("about-ov"))closeAbout();}


render();
var initialWorkId=parseInt(new URLSearchParams(window.location.search).get('work'),10);
if(!isNaN(initialWorkId)){
  history.replaceState({view:'detail',id:initialWorkId,fromCollection:false},'',workUrl(initialWorkId));
  showDetail(initialWorkId,false);
}else{
  history.replaceState({view:'collection'},'',workUrl(null));
}
