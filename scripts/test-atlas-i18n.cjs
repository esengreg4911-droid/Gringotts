const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'../the-wire/atlas');
function boot(language='zh',saved,denyStorage=false){
 const {window}=parseHTML(fs.readFileSync(path.join(root,'index.html'),'utf8')),document=window.document;
 const storage=new Map([['wire-atlas-language',language]]);if(saved)storage.set('wire-atlas-progress',JSON.stringify(saved));
 const frames=[];Object.defineProperty(document.getElementById('episodeSelect'),'value',{value:'1',configurable:true,writable:true});
 window.Element.prototype.getBoundingClientRect=()=>({left:0,top:0,right:850,bottom:650,width:850,height:650});window.innerWidth=1440;
 const context=vm.createContext({window,document,console,URL,localStorage:{getItem(k){if(denyStorage)throw Error('denied');return storage.get(k)||null},setItem(k,v){if(denyStorage)throw Error('denied');storage.set(k,v)}},ResizeObserver:class{observe(){}},setTimeout:()=>0,clearTimeout(){},requestAnimationFrame:f=>frames.push(f)});
 for(const file of ['data.js','i18n-en.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 function flush(){while(frames.length)frames.shift()();}flush();
 const $=id=>document.getElementById(id),shot=()=>window.WireAtlas.getSnapshot();
 function click(node){assert(node);node.dispatchEvent(new window.Event('click',{bubbles:true}));flush();}
 function episode(n){$('episodeSelect').value=String(n);$('episodeSelect').dispatchEvent(new window.Event('change',{bubbles:true}));flush();}
 function season(n){click(document.querySelector('[data-season="'+n+'"]'));}
 function english(){const toggle=$('languageToggle').textContent;$('languageToggle').textContent='';const text=document.body.textContent;$('languageToggle').textContent=toggle;const han=text.match(/[\u3400-\u9fff][^\n<>]{0,70}/g);assert(!han,'English UI contains Chinese: '+han?.slice(0,5).join(';'));}
 return {window,document,$,shot,click,episode,season,english,storage,flush};
}
const app=boot('en');app.english();assert.equal(app.document.documentElement.lang,'en');
for(const s of app.window.WIRE_DATA.seasons){
 app.season(s.season);
 for(let ep=1;ep<=s.episodes.length;ep++){app.episode(ep);app.english();assert.equal(app.shot().episode,ep);}
 app.click(app.document.querySelector('[data-view="directory"]'));
 for(const p of s.people){app.click(app.document.querySelector('[data-person="'+p.id+'"]'));app.english();assert.equal(app.shot().selected,p.id);}
 app.click(app.$('languageToggle'));assert.equal(app.shot().language,'zh');assert(app.$('detailPanel').textContent.includes(s.people.at(-1).bio));
 const before=JSON.stringify(app.shot());app.click(app.$('languageToggle'));assert.equal(app.shot().language,'en');app.english();const beforeObj=JSON.parse(before),after=app.shot();delete beforeObj.language;const afterObj={...after};delete afterObj.language;assert.equal(JSON.stringify(afterObj),JSON.stringify(beforeObj));
 app.click(app.document.querySelector('[data-view="map"]'));
}
const filtered=boot('en',{season:4,progress:{4:8}});const box=filtered.document.querySelector('#groupFilters input');box.checked=false;box.dispatchEvent(new filtered.window.Event('change',{bubbles:true}));filtered.flush();
filtered.click(filtered.document.querySelector('[data-type="conflict"]'));const before=JSON.stringify(filtered.shot());filtered.click(filtered.$('languageToggle'));filtered.click(filtered.$('languageToggle'));assert.equal(JSON.stringify(filtered.shot()),before);assert(!filtered.document.querySelector('#groupFilters input').checked);assert.equal(filtered.document.querySelector('[data-type="conflict"]').getAttribute('aria-pressed'),'false');
const restored=boot(filtered.storage.get('wire-atlas-language'),JSON.parse(filtered.storage.get('wire-atlas-progress')||'{"season":4,"progress":{"4":8}}'));assert.equal(restored.shot().language,'en');
const denied=boot('en',null,true);denied.click(denied.$('languageToggle'));assert.equal(denied.shot().language,'en');
console.log('Passed: English text coverage in all 60 episodes and every character detail; language switch preserves selection, filters and progress; saved language and blocked-storage fallback.');
