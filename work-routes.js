(function(root){
  'use strict';
  function createWorkRoutes(data){
    var overrides={136:'slam-dunk',138:'war-and-peace'};
    var byId=Object.create(null),bySlug=Object.create(null);
    data.forEach(function(work){
      var title=work.title.replace(/\s+S0?1$/i,'').replace(/\s+S(\d+)$/i,' Season $1');
      var slug=overrides[work.id]||title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
      if(!slug)throw new Error('Missing readable URL for work '+work.id);
      if(bySlug[slug]!==undefined)throw new Error('Duplicate work URL: '+slug);
      byId[work.id]=slug;bySlug[slug]=work.id;
    });
    return {byId:byId,bySlug:bySlug};
  }
  if(typeof module==='object'&&module.exports)module.exports=createWorkRoutes;
  else root.createWorkRoutes=createWorkRoutes;
})(typeof window==='undefined'?globalThis:window);
