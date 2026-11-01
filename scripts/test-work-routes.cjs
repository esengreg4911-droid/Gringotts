const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function boot(url){
 const location=new URL(url),nodes=new Map(),events={};
 function element(){return {value:'',hidden:false,innerHTML:'',textContent:'',style:{setProperty(){},removeProperty(){}},classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(n,f){this[n]=f},setAttribute(n,v){this[n]=v},getAttribute(n){return this[n]},removeAttribute(n){delete this[n]},querySelector(){return null},querySelectorAll(){return []},appendChild(){},contains(){return false},getBoundingClientRect(){return {top:0}},focus(){},scrollIntoView(){}};}
 const document={baseURI:new URL(location.pathname==='/'?'./':'../',location).href,getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},querySelectorAll(){return []},querySelector(){return null},createElement:element,body:element(),documentElement:{}};
 const history={state:null,pushState(s,t,u){this.state=s;location.href=u},replaceState(s,t,u){this.state=s;location.href=u},back(){}};
 const window={location,matchMedia(){return {matches:false,addEventListener(){}}},addEventListener(n,f){events[n]=f},scrollTo(){}};
 const c=vm.createContext({window,document,history,URL,console,requestAnimationFrame:f=>f()});
 for(const file of ['data.js','work-routes.js','script.js']){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c);if(file==='work-routes.js')c.createWorkRoutes=window.createWorkRoutes;}
 return {c,location,history,document,events};
}
const app=boot('https://www.gringotts04.cc/');
assert.equal(app.c.workRoutes.byId[10201],'the-wire');
for(const work of app.c.DATA){
 const slug=app.c.workRoutes.byId[work.id];assert.match(slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
 assert(fs.existsSync(path.join(root,slug,'index.html')));
 const html=fs.readFileSync(path.join(root,slug,'index.html'),'utf8');assert(html.includes('<base href="../">'));assert(html.includes('work-routes.js'));
 app.c.openM(work.id);assert.equal(app.location.pathname,'/'+slug);assert.equal(app.location.search,'');assert.equal(app.c.currentWorkId,work.id);
 app.c.toggleLang();assert.equal(app.location.pathname,'/'+slug);app.c.toggleLang();
 const direct=boot('https://www.gringotts04.cc/'+slug+'/');assert.equal(direct.c.currentWorkId,work.id);assert.equal(direct.location.pathname,'/'+slug);
 direct.location.href='https://www.gringotts04.cc/';direct.events.popstate();assert.equal(direct.c.currentWorkId,null);
 direct.location.href='https://www.gringotts04.cc/'+slug;direct.events.popstate();assert.equal(direct.c.currentWorkId,work.id);
}
const legacy=boot('https://www.gringotts04.cc/?work=10201');assert.equal(legacy.c.currentWorkId,null);assert.equal(legacy.location.href,'https://www.gringotts04.cc/');
console.log('Passed: all 395 routes, direct entry, trailing-slash normalization, click navigation, language switching, history and removal of query routing.');
