// Run from this checkout after changing the integrated character atlas.
const fs=require('node:fs'),path=require('node:path');
const source=path.resolve(__dirname,'../the-wire/atlas');
const destination='E:/Subtitles/wire-atlas/dist';
if(path.resolve(destination)!==path.resolve('E:/Subtitles/wire-atlas/dist'))throw new Error('Unexpected sync destination');
function files(root,prefix=''){
 return fs.readdirSync(path.join(root,prefix),{withFileTypes:true}).flatMap(entry=>{
  if(entry.name==='AGENTS.md'||entry.name==='.git')return [];
  if(entry.isSymbolicLink())throw new Error('Symlinks are not supported');
  const relative=path.join(prefix,entry.name);return entry.isDirectory()?files(root,relative):[relative];
 });
}
function standaloneHtml(html){
 if(!html.includes('<base href="/the-wire/atlas/">'))throw new Error('Integrated base path changed; review standalone conversion');
 const converted=html.replace(/^\s*<base href="\/the-wire\/atlas\/">\r?\n/m,'').replace('href="/the-wire"','href="https://www.gringotts04.cc/the-wire"');
 if(/<base\b/.test(converted))throw new Error('Standalone base path was not removed');
 if(!converted.includes('href="https://www.gringotts04.cc/the-wire"'))throw new Error('Standalone return link was not converted');
 return converted;
}
const paths=files(source);
for(const relative of paths){
 const dest=path.join(destination,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});
 const bytes=relative==='index.html'?Buffer.from(standaloneHtml(fs.readFileSync(path.join(source,relative),'utf8'))):fs.readFileSync(path.join(source,relative));
 fs.writeFileSync(dest,bytes);
 const actual=fs.readFileSync(dest);if(!actual.equals(bytes))throw new Error('Sync failed: '+relative);
}
const extra=files(destination).filter(p=>!paths.includes(p));if(extra.length)throw new Error('Extra standalone files require review: '+extra.join(', '));
console.log('Synced and verified '+paths.length+' files, including all portraits and translations.');
