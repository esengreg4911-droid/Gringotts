
(function(){
  var C=["S","E","C","C"];
  var bs=[0,1,2,3].map(function(i){return document.getElementById("x7g_b"+i);});
  var done=false;
  setTimeout(function(){bs[0].focus();},150);
  bs.forEach(function(b,i){
    b.addEventListener("keydown",function(e){
      if(e.key==="Backspace"){e.preventDefault();b.value="";b.classList.remove("x7g_filled");if(i>0)bs[i-1].focus();return;}
      if(e.key==="ArrowLeft"&&i>0){bs[i-1].focus();e.preventDefault();}
      if(e.key==="ArrowRight"&&i<3){bs[i+1].focus();e.preventDefault();}
    });
    b.addEventListener("input",function(){
      var v=b.value.replace(/[^a-zA-Z]/g,"").toUpperCase().slice(-1);
      b.value=v;
      if(v){b.classList.add("x7g_filled");if(i<3)bs[i+1].focus();else chk();}
      else b.classList.remove("x7g_filled");
    });
    b.addEventListener("click",function(){b.focus();});
  });
  function chk(){
    if(done)return;
    var ok=bs.every(function(b,i){return b.value.toUpperCase()===C[i];});
    if(ok){
      done=true;
      document.getElementById("x7g_ov").classList.add("x7g_fade");
      setTimeout(function(){
        document.getElementById("x7g_L").classList.add("x7g_split");
        document.getElementById("x7g_R").classList.add("x7g_split");
      },180);
      setTimeout(function(){
        document.getElementById("x7g_ov").style.display="none";
        document.getElementById("x7g_L").style.display="none";
        document.getElementById("x7g_R").style.display="none";
      },1100);
    } else {
      bs.forEach(function(b){b.classList.add("x7g_err");b.classList.remove("x7g_filled");});
      setTimeout(function(){bs.forEach(function(b){b.classList.remove("x7g_err");b.value="";});bs[0].focus();done=false;},350);
    }
  }
})();



var DATA = window.DATA || [];
var curLang = "zh";
var filters = {genre:"all",type:"all",lang:"all"};
var sortBy = "year";
var sortDir = "desc";
var curPage = 1;
var PAGE_SIZE = 21;
var ll = {en:"English",fr:"Français",it:"Italiano",hi:"Hindi",jp:"日本語",de:"Deutsch",ko:"한국어"};
var tl = {film:{zh:"电影",en:"Film"},series:{zh:"剧集",en:"Series"}};
var gl = {"Feature":"Feature","Fantasy":"Fantasy","Documentary":"Documentary","Suspense":"Suspense","Science Fiction":"Sci-Fi"};

function animN(id,n){
  var el=document.getElementById(id),v=0,s=Math.ceil(n/40);
  var iv=setInterval(function(){v=Math.min(v+s,n);el.textContent=v;if(v>=n)clearInterval(iv);},28);
}

document.querySelectorAll(".fb[data-f]").forEach(function(b){
  b.addEventListener("click",function(){
    var f=this.dataset.f,v=this.dataset.v;
    filters[f]=v;
    document.querySelectorAll(".fb[data-f='"+f+"']").forEach(function(x){x.classList.remove("on");});
    this.classList.add("on");
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
    render();
  });
});
// Pagination controls
document.getElementById("pg-first").addEventListener("click",function(){curPage=1;render();});
document.getElementById("pg-last").addEventListener("click",function(){
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;curPage=tot;render();
});
document.getElementById("pg-prev").addEventListener("click",function(){if(curPage>1){curPage--;render();}});
document.getElementById("pg-next").addEventListener("click",function(){
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;if(curPage<tot){curPage++;render();}
});
function doJump(){
  var el=document.getElementById("pg-jump");
  var tot=Math.ceil(window._filteredLen/PAGE_SIZE)||1;
  var v=parseInt(el.value);
  if(!isNaN(v)){curPage=Math.max(1,Math.min(v,tot));render();}
  el.value="";
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
document.getElementById("srch").addEventListener("input",function(){curPage=1;render();});

// ── TMDB dynamic cover loader ──
var TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjMmY4NDY3ZTBkMDIxODg2MTlkMWUwNGIxNDI3NjEyOCIsIm5iZiI6MTc3NzI5MDg3OC4yMjcsInN1YiI6IjY5ZWY0ZTdlZTIxNDc3YTZmYTkzNmU5OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.X1rJdsAvRO57QZVrPnS99ATzrRVXeKuOlsG994KdLqo";
var TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// Title overrides: when TMDB title differs from our stored title
// key = our base title (lowercased), value = correct TMDB search title
var TITLE_OVERRIDES = {
  "all creatures great and small": "All Creatures Great & Small",
  "schindler list": "Schindler's List",
  "2001 a space odyssey": "2001: A Space Odyssey",
  "la confidential": "L.A. Confidential",
  "cien anos de soledad": "One Hundred Years of Solitude",
  "war and peace": "War & Peace",
  "война и мир": "War & Peace",
  "请回答1988": "Reply 1988",
  "灌篮高手": "Slam Dunk",
  "a knight of the seven kingdoms": "A Knight of the Seven Kingdoms"
};
var _coverCache = {};    // item id -> final image url
var _showIdCache = {};   // base show title -> tmdb show id
var _fetchQueue = [];
var _fetchRunning = 0;
var FETCH_CONCURRENCY = 0;

// Parse title: returns {base, season} e.g. "Breaking Bad S3" -> {base:"Breaking Bad", season:3}
function parseTitle(d) {
  if (d.type === 'film') return {base: d.title, season: null};
  var m = d.title.match(/^(.+?)\s+S(\d+)$/);
  if (m) return {base: m[1].trim(), season: parseInt(m[2])};
  // Single-season series (no S# suffix)
  return {base: d.title, season: 1};
}

function tmdbHeaders() {
  return {headers: {'Authorization': 'Bearer ' + TMDB_TOKEN, 'accept': 'application/json'}};
}

function fetchPosterForItem(d) {
  return new Promise(function(resolve) {
    var parsed = parseTitle(d);

    // Step 1: get TMDB show/movie ID
    function getShowId() {
      var key = (d.type === 'film' ? 'film:' : 'tv:') + parsed.base.toLowerCase();
      if (_showIdCache[key] !== undefined) return Promise.resolve(_showIdCache[key]);
      var searchTitle = TITLE_OVERRIDES[parsed.base.toLowerCase()] || parsed.base;
      var url = d.type === 'film'
        ? 'https://api.themoviedb.org/3/search/movie?query=' + encodeURIComponent(searchTitle) + '&year=' + d.year + '&language=en-US'
        : 'https://api.themoviedb.org/3/search/tv?query=' + encodeURIComponent(searchTitle) + '&language=en-US';
      return fetch(url, tmdbHeaders()).then(function(r){return r.json();}).then(function(data){
        var results = data.results || [];
        // Find best match
        var best = null;
        var qtLower = (TITLE_OVERRIDES[parsed.base.toLowerCase()] || parsed.base).toLowerCase();
        for (var i = 0; i < results.length; i++) {
          var r = results[i];
          var rt = (r.title || r.name || '').toLowerCase();
          if (rt === qtLower) { best = r; break; }
          if (!best) best = r;
        }
        var id = best ? best.id : null;
        _showIdCache[key] = id;
        // For films, also store the poster directly
        if (d.type === 'film' && best && best.poster_path) {
          _showIdCache[key + ':poster'] = TMDB_IMG + best.poster_path;
        }
        return id;
      });
    }

    if (d.type === 'film') {
      var key = 'film:' + parsed.base.toLowerCase();
      // Check if we already have poster from search
      if (_showIdCache[key + ':poster']) { resolve(_showIdCache[key + ':poster']); return; }
      getShowId().then(function(id) {
        var poster = _showIdCache[key + ':poster'];
        resolve(poster || null);
      }).catch(function(){ resolve(null); });
    } else {
      // TV series: get show ID then fetch season poster
      getShowId().then(function(showId) {
        if (!showId) { resolve(null); return; }
        var seasonNum = parsed.season || 1;
        var seasonUrl = 'https://api.themoviedb.org/3/tv/' + showId + '/season/' + seasonNum + '?language=en-US';
        return fetch(seasonUrl, tmdbHeaders()).then(function(r){return r.json();}).then(function(data){
          if (data.poster_path) {
            resolve(TMDB_IMG + data.poster_path);
          } else {
            // Fall back to show-level poster
            var showUrl = 'https://api.themoviedb.org/3/tv/' + showId + '?language=en-US';
            return fetch(showUrl, tmdbHeaders()).then(function(r){return r.json();}).then(function(show){
              resolve(show.poster_path ? TMDB_IMG + show.poster_path : null);
            });
          }
        });
      }).catch(function(){ resolve(null); });
    }
  });
}

function enqueue(id) {
  if (_coverCache[id] !== undefined || _fetchQueue.indexOf(id) !== -1) return;
  _fetchQueue.push(id);
  drainQueue();
}

function drainQueue() {
  while (_fetchRunning < FETCH_CONCURRENCY && _fetchQueue.length > 0) {
    var id = _fetchQueue.shift();
    if (_coverCache[id] !== undefined) { drainQueue(); return; }
    _fetchRunning++;
    var d = DATA.find(function(x){ return x.id === id; });
    if (!d) { _fetchRunning--; drainQueue(); continue; }
    fetchPosterForItem(d).then(function(id){ return function(url) {
      _coverCache[id] = url || '';
      if (url) {
        // Apply to cover element if on page
        var el = document.querySelector('.mc-cover[data-id="' + id + '"]');
        if (el) applyCover(el, url);
        // Apply to modal if open for this id
        var mc = document.getElementById('modal-cover');
        if (mc && mc._currentId === id) applyCover(mc, url);
      }
      _fetchRunning--;
      drainQueue();
    };}(id)).catch(function(){ _fetchRunning--; drainQueue(); });
  }
}

function loadCovers() {
  setTimeout(function(){
    var els = document.querySelectorAll('.mc-cover[data-id]');
    els.forEach(function(cover){
      var id = parseInt(cover.getAttribute('data-id'));
      if (_coverCache[id]) { applyCover(cover, _coverCache[id]); return; }
      enqueue(id);
    });
  }, 30);
}

function applyCover(cover, url) {
  if (!cover || !url) return;
  var existing = cover.querySelector('img');
  if (existing && existing.src === url) return;
  var img = document.createElement('img');
  img.onload = function(){ img.classList.add('loaded'); };
  img.onerror = function(){ img.remove(); };
  img.src = url;
  img.alt = '';
  cover.innerHTML = '';
  cover.appendChild(img);
}

function showPlaceholder(cover) {
  if (!cover) return;
  cover.style.background = 'linear-gradient(160deg,rgba(20,40,80,0.7) 0%,rgba(8,16,40,0.9) 100%)';
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

  if(!numsEl) return;
  numsEl.innerHTML = "";

  // Build page number array with ellipsis
  // Always show: 1, last, and up to 2 pages around current
  var pages = [];
  if(tot <= 7) {
    for(var i=1;i<=tot;i++) pages.push(i);
  } else {
    var left = Math.max(2, curPage-1);
    var right = Math.min(tot-1, curPage+1);
    pages.push(1);
    if(left > 2) pages.push("…");
    for(var p=left;p<=right;p++) pages.push(p);
    if(right < tot-1) pages.push("…");
    pages.push(tot);
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
        return function(){curPage=n;render();};
      }(p));
      numsEl.appendChild(btn);
    }
  });
}

function render(){
  var q=(document.getElementById("srch").value||"").toLowerCase();
  var list=DATA.filter(function(d){
    if(filters.genre!=="all"&&d.genre!==filters.genre)return false;
    if(filters.type!=="all"&&d.type!==filters.type)return false;
    if(filters.lang!=="all"&&d.lang!==filters.lang)return false;
    if(q&&d.title.toLowerCase().indexOf(q)<0&&d.zh.indexOf(q)<0)return false;
    return true;
  });
  // Sorting: year/imdb/douban all support asc/desc
  list=list.slice().sort(function(a,b){
    var dir=sortDir==="asc"?1:-1;
    if(sortBy==="year") return dir*(a.year-b.year);
    if(sortBy==="imdb") return dir*(a.imdb-b.imdb);
    if(sortBy==="douban") return dir*(a.douban-b.douban);
    return 0;
  });

  var grid=document.getElementById("mgrid");
  var nores=document.getElementById("nores");
  var cnt=document.getElementById("cnt");
  var pgInfo=document.getElementById("pg-info");
  nores.style.display=list.length===0?"block":"none";
  cnt.textContent=list.length+(curLang==="zh"?" 部":" titles");
  if(!list.length){grid.innerHTML="";renderPagination(0,1);if(pgInfo)pgInfo.textContent="";return;}

  // Pagination
  window._filteredLen=list.length;
  var tot=Math.ceil(list.length/PAGE_SIZE)||1;
  if(curPage>tot)curPage=tot;
  var start=(curPage-1)*PAGE_SIZE;
  var pageList=list.slice(start,start+PAGE_SIZE);
  if(pgInfo)pgInfo.textContent=curPage+" / "+tot;
  renderPagination(list.length, tot);

  grid.innerHTML=pageList.map(function(d){
    var nm=curLang==="zh"&&d.zh?d.zh:d.title;
    var gl_zh={"Feature":"剧情","Fantasy":"奇幻","Documentary":"纪录片","Suspense":"侦探","Science Fiction":"科幻"};
    var coverHtml='<div class="mc-cover" data-id="'+d.id+'">'
      +'<div class="mc-cover-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/><circle cx="15.5" cy="10.5" r="2.5"/></svg></div>'
      +'</div>';
    // 豆瓣保留搜索，IMDb 智能判断跳转：
    var imdbUrl = d.imdb_id ? "https://www.imdb.com/title/" + d.imdb_id + "/" : "https://www.imdb.com/find?q=" + encodeURIComponent(d.title);
    var doubanUrl = "https://search.douban.com/movie/subject_search?search_text=" + encodeURIComponent(d.zh||d.title);

    return '<div class="mc" onclick="openM('+d.id+')">'
      +coverHtml
      +'<div class="mc-g">'+(curLang==="zh"?gl_zh[d.genre]||d.genre:d.genre)+'</div>'
      +'<div class="mc-t">'+nm+'</div>'
      +'<div class="mc-m">'+d.year+(d.dir?' · '+d.dir.split(',')[0]:'')+'</div>'
      +'<div class="mc-r">'
      +'<a class="rp ri" href="'+imdbUrl+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="IMDb">IMDb '+d.imdb+'</a>'
      +'<a class="rp rd" href="'+doubanUrl+'" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="豆瓣">'+(curLang==="zh"?"豆瓣":"Douban")+' '+d.douban+'</a>'
      +'</div>'
      +'<div class="mc-tags">'
      +'<span class="ct ctlang">'+(ll[d.lang]||d.lang)+'</span>'
      +'<span class="ct cttype">'+tl[d.type][curLang]+'</span>'
      +'</div></div>';
  }).join("");
  // Async-load cover images after render
  _coverQueue = [];
  loadCovers();
}

function openM(id){
  var d=DATA.find(function(x){return x.id===id;});
  if(!d)return;
  var zh=curLang==="zh";
  var nm=zh&&d.zh?d.zh:d.title;
  var orig=(zh&&d.zh)?d.title:(d.zh||"");
  var gl_zh2={"Feature":"剧情","Fantasy":"奇幻","Documentary":"纪录片","Suspense":"侦探","Science Fiction":"科幻"};
  document.getElementById("mcat").textContent=(curLang==="zh"?gl_zh2[d.genre]||d.genre:d.genre)+" · "+tl[d.type][curLang];
  document.getElementById("mtitle").textContent=nm;
  document.getElementById("morig").textContent=orig;
  // Modal cover
  var mc = document.getElementById("modal-cover");
  if (mc) {
    mc.innerHTML = '<div class="modal-cover-placeholder"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6"/><circle cx="15.5" cy="10.5" r="2.5"/></svg></div>';
    mc._currentId = d.id;
    if (_coverCache[d.id]) {
      applyCover(mc, _coverCache[d.id]);
    } else {
      enqueue(d.id);
    }
  }
  var imdbUrl = d.imdb_id ? "https://www.imdb.com/title/" + d.imdb_id + "/" : "https://www.imdb.com/find?q=" + encodeURIComponent(d.title);
  var doubanUrl = "https://search.douban.com/movie/subject_search?search_text=" + encodeURIComponent(d.zh||d.title);
  document.getElementById("mrats").innerHTML=
    '<a class="mrat im" href="'+imdbUrl+'" target="_blank" rel="noopener" title="Search on IMDb" style="text-decoration:none;cursor:pointer"><div class="mrn">'+d.imdb+'</div><div class="mrl">IMDb ↗</div></a>'
    +'<a class="mrat db" href="'+doubanUrl+'" target="_blank" rel="noopener" title="在豆瓣搜索" style="text-decoration:none;cursor:pointer"><div class="mrn">'+d.douban+'</div><div class="mrl">'+(zh?"豆瓣评分":"Douban")+' ↗</div></a>';
  var yl=zh?"年份":"Year",dl=zh?"导演":"Director",ll2=zh?"语言":"Language",cl=zh?"国家":"Country";
  document.getElementById("minfo").innerHTML=
    '<div class="miitem"><div class="milbl">'+yl+'</div><div class="mival">'+d.year+'</div></div>'
    +'<div class="miitem"><div class="milbl">'+dl+'</div><div class="mival">'+(d.dir||"—")+'</div></div>'
    +'<div class="miitem"><div class="milbl">'+ll2+'</div><div class="mival">'+(ll[d.lang]||d.lang)+'</div></div>'
    +'<div class="miitem"><div class="milbl">'+cl+'</div><div class="mival">'+(d.country||"—")+'</div></div>';
  document.getElementById("mdesc").textContent=zh?d.desc_zh:d.desc_en;
  document.getElementById("ov").classList.add("open");
}
function closeOv(e){if(e.target===document.getElementById("ov"))closeModal();}
function closeModal(){document.getElementById("ov").classList.remove("open");}
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeModal();});


function toggleTheme(){
  var isLight=document.body.classList.toggle("light");
  var tb=document.getElementById("tb");
  if(isLight){
    tb.innerHTML='🌙 <span class="zh">暗黑</span><span class="en">Dark</span>';
    // hide stars in light mode (canvas already faded via CSS)
  } else {
    tb.innerHTML='☀ <span class="zh">明亮</span><span class="en">Light</span>';
  }
}

function toggleLang(){
  curLang=curLang==="zh"?"en":"zh";
  var isLight=document.body.classList.contains("light");
  document.body.className=(isLight?"light ":"")+curLang;
  document.getElementById("lb").textContent=curLang==="zh"?"EN":"中文";
  render();
}

// Stars
var cv=document.getElementById("sc"),cx=cv.getContext("2d");
var W,H,stars=[],shooters=[],nebulae=[];
var tick=0;
function rsz(){W=cv.width=innerWidth;H=cv.height=innerHeight;}
rsz();addEventListener("resize",function(){rsz();initS();});
function initS(){
  stars=[];nebulae=[];shooters=[];
  var n=Math.floor(W*H/5500);
  for(var i=0;i<n;i++){
    var big=Math.random()>.85;
    stars.push({
      x:Math.random()*W,y:Math.random()*H,
      r:big?(Math.random()*.9+.7):(Math.random()*.6+.15),
      v:Math.random()*.025+.005,
      a:Math.random()*.55+.12,
      twinkle:Math.random()*Math.PI*2,
      twinkleSpeed:Math.random()*.03+.01,
      h:Math.random()>.55?198:(Math.random()>.5?210:185),
      glow:big
    });
  }
  // Static nebula-like soft blobs
  for(var j=0;j<4;j++){
    nebulae.push({
      x:Math.random()*W,y:Math.random()*H,
      rx:Math.random()*180+80,ry:Math.random()*120+60,
      h:Math.random()>.5?210:190,
      a:Math.random()*.07+.025
    });
  }
}
initS();

function spawnShooter(){
  var angle=Math.PI*.18+Math.random()*.18;
  var speed=Math.random()*5+7;
  shooters.push({
    x:Math.random()*W*.8,y:Math.random()*H*.4,
    dx:Math.cos(angle)*speed,dy:Math.sin(angle)*speed,
    len:Math.random()*80+60,
    a:1,life:1
  });
}

function draw(){
  tick++;
  cx.clearRect(0,0,W,H);

  // Nebula blobs (very subtle)
  nebulae.forEach(function(nb){
    var g=cx.createRadialGradient(nb.x,nb.y,0,nb.x,nb.y,nb.rx);
    g.addColorStop(0,"hsla("+nb.h+",70%,65%,"+nb.a+")");
    g.addColorStop(1,"hsla("+nb.h+",70%,65%,0)");
    cx.save();
    cx.scale(1,nb.ry/nb.rx);
    cx.beginPath();
    cx.arc(nb.x,nb.y*(nb.rx/nb.ry),nb.rx,0,Math.PI*2);
    cx.fillStyle=g;cx.fill();
    cx.restore();
  });

  // Regular stars with twinkle
  stars.forEach(function(s){
    s.twinkle+=s.twinkleSpeed;
    var a=s.a*(0.7+0.3*Math.sin(s.twinkle));
    if(s.glow){
      var g=cx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*3.5);
      g.addColorStop(0,"hsla("+s.h+",90%,90%,"+(a*.9)+")");
      g.addColorStop(0.4,"hsla("+s.h+",80%,80%,"+(a*.4)+")");
      g.addColorStop(1,"hsla("+s.h+",80%,80%,0)");
      cx.beginPath();cx.arc(s.x,s.y,s.r*3.5,0,Math.PI*2);
      cx.fillStyle=g;cx.fill();
    }
    cx.beginPath();cx.arc(s.x,s.y,s.r,0,Math.PI*2);
    cx.fillStyle="hsla("+s.h+",85%,90%,"+a+")";cx.fill();
    s.y-=s.v;
    if(s.y<-4){s.y=H+4;s.x=Math.random()*W;}
  });

  // Shooting stars
  if(Math.random()<.003&&shooters.length<3)spawnShooter();
  shooters=shooters.filter(function(sh){
    sh.x+=sh.dx;sh.y+=sh.dy;sh.life-=.022;sh.a=sh.life;
    if(sh.life<=0)return false;
    var g=cx.createLinearGradient(sh.x,sh.y,sh.x-sh.dx*(sh.len/sh.dx||10),sh.y-sh.dy*(sh.len/sh.dy||10));
    g.addColorStop(0,"hsla(200,90%,95%,"+(sh.a*.85)+")");
    g.addColorStop(1,"hsla(200,90%,85%,0)");
    cx.beginPath();
    cx.moveTo(sh.x,sh.y);
    var tailLen=sh.len;
    cx.lineTo(sh.x-sh.dx/Math.sqrt(sh.dx*sh.dx+sh.dy*sh.dy)*tailLen,
              sh.y-sh.dy/Math.sqrt(sh.dx*sh.dx+sh.dy*sh.dy)*tailLen);
    cx.strokeStyle=g;cx.lineWidth=1.5;cx.stroke();
    return true;
  });

  requestAnimationFrame(draw);
}
draw();

animN("sf",DATA.filter(function(d){return d.type==="film";}).length);
animN("ss",DATA.filter(function(d){return d.type==="series";}).length);
// Set default sort button active
var defBtn=document.getElementById("sb-year");
if(defBtn){defBtn.classList.add("on");}
(function(){
  var LOCAL={"1": "covers/0001.jpg", "2": "covers/0002.jpg", "3": "covers/0003.jpg", "4": "covers/0004.jpg", "5": "covers/0005.jpg", "6": "covers/0006.jpg", "7": "covers/0007.jpg", "8": "covers/0008.jpg", "9": "covers/0009.jpg", "10": "covers/0010.jpg", "11": "covers/0011.jpg", "12": "covers/0012.jpg", "13": "covers/0013.jpg", "14": "covers/0014.jpg", "15": "covers/0015.jpg", "16": "covers/0016.jpg", "17": "covers/0017.jpg", "18": "covers/0018.jpg", "19": "covers/0019.jpg", "20": "covers/0020.jpg", "21": "covers/0021.jpg", "22": "covers/0022.jpg", "23": "covers/0023.jpg", "24": "covers/0024.jpg", "25": "covers/0025.jpg", "26": "covers/0026.jpg", "27": "covers/0027.jpg", "28": "covers/0028.jpg", "29": "covers/0029.jpg", "30": "covers/0030.jpg", "31": "covers/0031.jpg", "32": "covers/0032.jpg", "33": "covers/0033.jpg", "34": "covers/0034.jpg", "35": "covers/0035.jpg", "201": "covers/0201.jpg", "202": "covers/0202.jpg", "203": "covers/0203.jpg", "204": "covers/0204.jpg", "205": "covers/0205.jpg", "206": "covers/0206.jpg", "207": "covers/0207.jpg", "208": "covers/0208.jpg", "209": "covers/0209.jpg", "210": "covers/0210.jpg", "211": "covers/0211.jpg", "212": "covers/0212.jpg", "213": "covers/0213.jpg", "301": "covers/0301.jpg", "302": "covers/0302.jpg", "303": "covers/0303.jpg", "304": "covers/0304.jpg", "305": "covers/0305.jpg", "306": "covers/0306.jpg", "307": "covers/0307.jpg", "308": "covers/0308.jpg", "309": "covers/0309.jpg", "310": "covers/0310.jpg", "311": "covers/0311.jpg", "312": "covers/0312.jpg", "313": "covers/0313.jpg", "314": "covers/0314.jpg", "105": "covers/0105.jpg", "106": "covers/0106.jpg", "111": "covers/0111.jpg", "128": "covers/0128.jpg", "129": "covers/0129.jpg", "134": "covers/0134.jpg", "136": "covers/0136.jpg", "138": "covers/0138.jpg", "256": "covers/0256.jpg", "316": "covers/0316.jpg", "403": "covers/0403.jpg", "404": "covers/0404.jpg", "405": "covers/0405.jpg", "408": "covers/0408.jpg", "10101": "covers/10101.jpg", "10102": "covers/10102.jpg", "10103": "covers/10103.jpg", "10104": "covers/10104.jpg", "10105": "covers/10105.jpg", "10201": "covers/10201.jpg", "10202": "covers/10202.jpg", "10203": "covers/10203.jpg", "10204": "covers/10204.jpg", "10205": "covers/10205.jpg", "10301": "covers/10301.jpg", "10302": "covers/10302.jpg", "10303": "covers/10303.jpg", "10304": "covers/10304.jpg", "10305": "covers/10305.jpg", "10306": "covers/10306.jpg", "10701": "covers/10701.jpg", "10801": "covers/10801.jpg", "10802": "covers/10802.jpg", "10803": "covers/10803.jpg", "10804": "covers/10804.jpg", "10805": "covers/10805.jpg", "10806": "covers/10806.jpg", "10901": "covers/10901.jpg", "10902": "covers/10902.jpg", "10903": "covers/10903.jpg", "11001": "covers/11001.jpg", "11002": "covers/11002.jpg", "11003": "covers/11003.jpg", "11004": "covers/11004.jpg", "11005": "covers/11005.jpg", "11006": "covers/11006.jpg", "11007": "covers/11007.jpg", "11008": "covers/11008.jpg", "11009": "covers/11009.jpg", "11010": "covers/11010.jpg", "11011": "covers/11011.jpg", "12401": "covers/12401.jpg", "12402": "covers/12402.jpg", "12403": "covers/12403.jpg", "11201": "covers/11201.jpg", "11202": "covers/11202.jpg", "11203": "covers/11203.jpg", "11204": "covers/11204.jpg", "11205": "covers/11205.jpg", "11206": "covers/11206.jpg", "11207": "covers/11207.jpg", "11208": "covers/11208.jpg", "11209": "covers/11209.jpg", "11210": "covers/11210.jpg", "11401": "covers/11401.jpg", "11402": "covers/11402.jpg", "11403": "covers/11403.jpg", "11404": "covers/11404.jpg", "11405": "covers/11405.jpg", "11406": "covers/11406.jpg", "11407": "covers/11407.jpg", "11408": "covers/11408.jpg", "25101": "covers/25101.jpg", "25102": "covers/25102.jpg", "25103": "covers/25103.jpg", "25104": "covers/25104.jpg", "25201": "covers/25201.jpg", "25202": "covers/25202.jpg", "25203": "covers/25203.jpg", "25204": "covers/25204.jpg", "25205": "covers/25205.jpg", "25206": "covers/25206.jpg", "25401": "covers/25401.jpg", "25402": "covers/25402.jpg", "25403": "covers/25403.jpg", "25404": "covers/25404.jpg", "25405": "covers/25405.jpg", "25501": "covers/25501.jpg", "25502": "covers/25502.jpg", "25503": "covers/25503.jpg", "25504": "covers/25504.jpg", "31501": "covers/31501.jpg", "31502": "covers/31502.jpg", "31503": "covers/31503.jpg", "31504": "covers/31504.jpg", "31505": "covers/31505.jpg", "31506": "covers/31506.jpg", "31507": "covers/31507.jpg", "31508": "covers/31508.jpg", "31701": "covers/31701.jpg", "31702": "covers/31702.jpg", "31703": "covers/31703.jpg", "31801": "covers/31801.jpg", "31802": "covers/31802.jpg", "31803": "covers/31803.jpg", "31804": "covers/31804.jpg", "31805": "covers/31805.jpg", "25301": "covers/25301.jpg", "25302": "covers/25302.jpg", "25701": "covers/25701.jpg", "25702": "covers/25702.jpg", "25703": "covers/25703.jpg", "25704": "covers/25704.jpg", "26001": "covers/26001.jpg", "26002": "covers/26002.jpg", "90501": "covers/90501.jpg", "90502": "covers/90502.jpg", "90503": "covers/90503.jpg", "90601": "covers/90601.jpg", "90602": "covers/90602.jpg", "90603": "covers/90603.jpg", "90604": "covers/90604.jpg", "90605": "covers/90605.jpg", "90606": "covers/90606.jpg", "90607": "covers/90607.jpg", "50101": "covers/50101.jpg", "50102": "covers/50102.jpg", "50103": "covers/50103.jpg", "50104": "covers/50104.jpg", "50105": "covers/50105.jpg", "50106": "covers/50106.jpg", "50107": "covers/50107.jpg", "50108": "covers/50108.jpg", "50109": "covers/50109.jpg", "50201": "covers/50201.jpg", "50202": "covers/50202.jpg", "50203": "covers/50203.jpg", "50204": "covers/50204.jpg", "25801": "covers/25801.jpg", "25802": "covers/25802.jpg", "25803": "covers/25803.jpg", "25804": "covers/25804.jpg", "90201": "covers/90201.jpg", "90202": "covers/90202.jpg", "90203": "covers/90203.jpg", "90301": "covers/90301.jpg", "90302": "covers/90302.jpg", "90303": "covers/90303.jpg", "90401": "covers/90401.jpg", "90402": "covers/90402.jpg", "90403": "covers/90403.jpg", "90404": "covers/90404.jpg", "90405": "covers/90405.jpg", "90406": "covers/90406.jpg", "90407": "covers/90407.jpg", "12101": "covers/12101.jpg", "11301": "covers/11301.jpg", "11302": "covers/11302.jpg", "11303": "covers/11303.jpg", "11304": "covers/11304.jpg", "11305": "covers/11305.jpg", "11306": "covers/11306.jpg", "11307": "covers/11307.jpg", "11308": "covers/11308.jpg", "11309": "covers/11309.jpg", "11310": "covers/11310.jpg", "11311": "covers/11311.jpg", "11312": "covers/11312.jpg", "11901": "covers/11901.jpg", "11902": "covers/11902.jpg", "11903": "covers/11903.jpg", "11904": "covers/11904.jpg", "11905": "covers/11905.jpg", "12001": "covers/12001.jpg", "12002": "covers/12002.jpg", "12201": "covers/12201.jpg", "12202": "covers/12202.jpg", "12203": "covers/12203.jpg", "12204": "covers/12204.jpg", "12205": "covers/12205.jpg", "13001": "covers/13001.jpg", "13002": "covers/13002.jpg", "13003": "covers/13003.jpg", "13101": "covers/13101.jpg", "13102": "covers/13102.jpg", "13501": "covers/13501.jpg", "13502": "covers/13502.jpg", "13503": "covers/13503.jpg", "13504": "covers/13504.jpg", "13505": "covers/13505.jpg", "13701": "covers/13701.jpg", "13702": "covers/13702.jpg", "25901": "covers/25901.jpg", "25902": "covers/25902.jpg", "26101": "covers/26101.jpg", "26102": "covers/26102.jpg", "40601": "covers/40601.jpg", "40602": "covers/40602.jpg", "40603": "covers/40603.jpg", "40701": "covers/40701.jpg", "40702": "covers/40702.jpg", "40703": "covers/40703.jpg", "40704":  "covers/40704.jpg","50311": "covers/50311.jpg", "50312": "covers/50312.jpg", "50313": "covers/50313.jpg", "50314": "covers/50314.jpg", "50315": "covers/50315.jpg", "50316": "covers/50316.jpg", "50317": "covers/50317.jpg", "50318": "covers/50318.jpg", "50319": "covers/50319.jpg", "50320": "covers/50320.jpg", "50321": "covers/50321.jpg", "50322": "covers/50322.jpg", "50323": "covers/50323.jpg", "50411": "covers/50411.jpg", "50412": "covers/50412.jpg", "50413": "covers/50413.jpg", "50414": "covers/50414.jpg", "50415": "covers/50415.jpg", "50416": "covers/50416.jpg", "12609": "covers/12609.jpg", "12610": "covers/12610.jpg", "12102": "covers/12102.jpg", "12103": "covers/12103.jpg", "12104": "covers/12104.jpg", "26201": "covers/26201.jpg", "26202": "covers/26202.jpg", "12701": "covers/12701.jpg", "12702": "covers/12702.jpg", "12703": "covers/12703.jpg", "12704": "covers/12704.jpg", "12705": "covers/12705.jpg", "12706": "covers/12706.jpg", "12707": "covers/12707.jpg", "11601": "covers/11601.jpg", "11602": "covers/11602.jpg", "12601": "covers/12601.jpg", "12602": "covers/12602.jpg", "12603": "covers/12603.jpg", "12604": "covers/12604.jpg", "12605": "covers/12605.jpg", "12606": "covers/12606.jpg", "12607": "covers/12607.jpg", "12608": "covers/12608.jpg", "12301": "covers/12301.jpg", "12302": "covers/12302.jpg", "12303": "covers/12303.jpg", "12304": "covers/12304.jpg", "12305": "covers/12305.jpg", "12306": "covers/12306.jpg", "11801": "covers/11801.jpg", "11802": "covers/11802.jpg", "11803": "covers/11803.jpg", "11804": "covers/11804.jpg", "11805": "covers/11805.jpg", "11806": "covers/11806.jpg", "11501": "covers/11501.jpg", "13301": "covers/13301.jpg", "13302": "covers/13302.jpg", "13303": "covers/13303.jpg", "13304": "covers/13304.jpg", "13305": "covers/13305.jpg", "13306": "covers/13306.jpg", "13307": "covers/13307.jpg", "11701": "covers/11701.jpg", "11702": "covers/11702.jpg", "11703": "covers/11703.jpg", "11704": "covers/11704.jpg", "11705": "covers/11705.jpg", "11706": "covers/11706.jpg", "11707": "covers/11707.jpg", "11708": "covers/11708.jpg", "11709": "covers/11709.jpg", "11710": "covers/11710.jpg", "11711": "covers/11711.jpg", "13201": "covers/13201.jpg", "13202": "covers/13202.jpg", "13203": "covers/13203.jpg", "13204": "covers/13204.jpg", "13205": "covers/13205.jpg", "13206": "covers/13206.jpg", "12501": "covers/12501.jpg", "12502": "covers/12502.jpg", "12503": "covers/12503.jpg", "12504": "covers/12504.jpg", "12505": "covers/12505.jpg", "12506": "covers/12506.jpg", "12507": "covers/12507.jpg", "221": "covers/0221.jpg", "222": "covers/0222.jpg", "223": "covers/0223.jpg", "224": "covers/0224.jpg", "225": "covers/0225.jpg", "226": "covers/0226.jpg", "227": "covers/0227.jpg", "228": "covers/0228.jpg", "229": "covers/0229.jpg", "230": "covers/0230.jpg", "231": "covers/0231.jpg", "232": "covers/0232.jpg", "233": "covers/0233.jpg", "234": "covers/0234.jpg", "235": "covers/0235.jpg", "236": "covers/0236.jpg", "237": "covers/0237.jpg", "238": "covers/0238.jpg", "239": "covers/0239.jpg", "240": "covers/0240.jpg", "241": "covers/0241.jpg", "242": "covers/0242.jpg", "243": "covers/0243.jpg", "244": "covers/0244.jpg", "245": "covers/0245.jpg", "401": "covers/0401.jpg", "402": "covers/0402.jpg", "26301": "covers/26301.jpg", "26302": "covers/26302.jpg", "26303": "covers/26303.jpg", "26304": "covers/26304.jpg", "26305": "covers/26305.jpg", "26306": "covers/26306.jpg", "26307": "covers/26307.jpg", "26308": "covers/26308.jpg", "26309": "covers/26309.jpg", "26310": "covers/26310.jpg", "26311": "covers/26311.jpg"};
  Object.keys(LOCAL).forEach(function(id){_coverCache[parseInt(id)]=LOCAL[id];});
})();

function openAbout(){document.getElementById("about-ov").classList.add("open");}
function closeAbout(){document.getElementById("about-ov").classList.remove("open");}
function closeAboutOv(e){if(e.target===document.getElementById("about-ov"))closeAbout();}
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAbout();});


render();
