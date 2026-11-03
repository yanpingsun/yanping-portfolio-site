'use strict';
(() => {
  const D = window.GENERAL_PORTFOLIO;
  const main = document.getElementById('main');
  const root = new URL('../../', document.baseURI);
  const dialog = document.getElementById('image-viewer');
  const stage = document.getElementById('viewer-stage');
  const fullImage = document.getElementById('viewer-image');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain = s => s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\*\*|`/g,'').trim();
  const slug = s => plain(s).toLowerCase().replace(/\s+/g,'-').replace(/[^\p{L}\p{N}_-]/gu,'');
  const project = id => D.projects.find(p => p.id === id);
  const absolute = (raw, source) => new URL(raw, new URL(source, root));
  const relative = url => decodeURIComponent(url.pathname.slice(root.pathname.length));
  let currentKey = '', lastUrl = '', routeSequence = 0, restoreLock = false;
  let saveTimer, scrollFrame, lastTrigger, oldOverflow = '', imageScrollY = 0, zoom = 1;
  history.scrollRestoration = 'manual';

  function destination(raw, source) {
    if (raw.startsWith('mailto:')) return {href:raw};
    if (/^https?:/.test(raw)) return {href:raw, external:true};
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return {href:'#/works'};
    if (raw.startsWith('#')) return {href:'#/home/selected'};
    const url=absolute(raw,source), rel=relative(url), fragment=decodeURIComponent(url.hash.slice(1));
    for(const [key,p] of Object.entries(D.pages)) {
      if(p.source!==rel) continue;
      return {href:key==='home'?(fragment?'#/home/selected':'#/'):['about','works'].includes(key)?'#/'+key:'#/project/'+key};
    }
    const mid=D.material_paths[rel];
    if(mid) return {href:'#/read/'+mid+(fragment?'/'+encodeURIComponent(fragment):'')};
    if(rel.endsWith('.md')) return {href:'https://github.com/yanpingsun/yanping-portfolio-site/blob/work/general-ux-r1/'+rel.split('/').map(encodeURIComponent).join('/'),external:true};
    return {href:url.href,external:true};
  }

  function inline(text,source) {
    const token=/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let result='',at=0,m;
    while((m=token.exec(text))) {
      result+=esc(text.slice(at,m.index)); const value=m[0];
      if(value.startsWith('**')) result+='<strong>'+esc(value.slice(2,-2))+'</strong>';
      else if(value.startsWith('`')) result+='<code>'+esc(value.slice(1,-1))+'</code>';
      else {
        const parts=/^\[([^\]]+)\]\(([^)]+)\)$/.exec(value),to=destination(parts[2],source);
        result+=`<a href="${esc(to.href)}"${to.external?' target="_blank" rel="noopener"':''}>${esc(parts[1])}${to.external?' <span aria-label="新标签打开">↗</span>':''}</a>`;
      }
      at=token.lastIndex;
    }
    return result+esc(text.slice(at));
  }

  function figure(item,source,options={}) {
    const url=absolute(item.src,source),info=D.images[relative(url)]||{};
    const preview=info.preview?new URL(info.preview,root).href:url.href;
    const group=/\/([^/]+)-wireframe\./.exec(item.src)?.[1];
    const id=group&&options.caseId?` id="${options.caseId}-wireframe-${esc(group)}" tabindex="-1"`:'';
    return `<figure${id} class="work-figure ${options.hero?'hero-work':''}"><button type="button" class="image-open" data-full-src="${esc(url.href)}" data-caption="${esc(item.alt)}" aria-label="放大查看：${esc(item.alt)}"><img src="${esc(preview)}" alt="${esc(item.alt)}" ${info.width?`width="${info.width}" height="${info.height}"`:''} loading="${options.hero?'eager':'lazy'}" decoding="async"><span class="image-placeholder" hidden>图片暂时无法载入，可查看原图。</span></button><figcaption>${esc(item.alt)}</figcaption><a class="original-link" href="${esc(url.href)}" target="_blank" rel="noopener">查看原图 ↗</a></figure>`;
  }

  function block(b,source,caseId='') {
    if(b.kind==='paragraph') {
      const movies=[...b.text.matchAll(/\[([^\]]+)\]\(([^)]+\.mp4)\)/g)];
      if(movies.length) return '<div class="video-entries">'+movies.map(m=>{
        const url=absolute(m[2],source),frame=D.frames[relative(url)];
        return `<div class="video-entry"><video controls playsinline preload="metadata"${frame?` poster="${esc(frame.preview)}"`:''} aria-label="${esc(m[1])}"><source src="${esc(url.href)}" type="video/mp4">请使用原文件入口播放。</video><div><p class="video-name">${esc(m[1])}</p>${frame?`<p class="caption">预览取自现有成片第${frame.second}秒</p>`:''}<p class="media-warning" hidden role="status">视频暂时无法播放，可打开下方原文件。</p></div></div>`;
      }).join('')+'</div><p class="file-links">'+inline(b.text,source)+'</p>';
      const claim=/^\*\*((?:原作主张|历史原作|历史主张)：)(.*?)\*\*(.*)$/.exec(b.text);
      if(claim) return `<p class="claim"><span class="claim-label">${esc(claim[1])}</span><strong>${esc(claim[2])}</strong></p>${claim[3]?'<p>'+inline(claim[3].trim(),source)+'</p>':''}`;
      return '<p>'+inline(b.text,source)+'</p>';
    }
    if(b.kind==='heading') {const n=Math.min(5,Math.max(2,b.level-1));return `<h${n}>${inline(b.text,source)}</h${n}>`;}
    if(b.kind==='images') {
      const pair=b.items.length===2&&b.items[0].src.includes('-wireframe.');
      return `<div class="${pair?'paired-figures':'image-sequence'}">${b.items.map(i=>figure(i,source,{caseId})).join('')}</div>`;
    }
    if(b.kind==='quote') return '<blockquote>'+b.items.map(s=>'<p>'+inline(s,source)+'</p>').join('')+'</blockquote>';
    if(b.kind==='list') {const tag=b.ordered?'ol':'ul';return `<${tag}>`+b.items.map(s=>'<li>'+inline(s,source)+'</li>').join('')+`</${tag}>`;}
    if(b.kind==='code') return '<pre><code>'+esc(b.text)+'</code></pre>';
    if(b.kind==='table') {const [head,...rows]=b.rows;return '<div class="table-scroll"><table><thead><tr>'+head.map(h=>'<th scope="col">'+inline(h,source)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(t=>'<td>'+inline(t,source)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
    return '';
  }
  const renderBlocks=(blocks,source,id)=>blocks.map(b=>block(b,source,id)).join('');
  function sections(page,level=3) {
    const result=[];
    for(const b of page.blocks) {
      if(b.kind==='heading'&&b.level===level) result.push({title:b.text,blocks:[]});
      else result.at(-1)?.blocks.push(b);
    }
    return result;
  }
  function cards(blocks) {
    const result=[];
    for(const b of blocks) {
      if(b.kind==='heading'&&b.level===4)result.push({title:b.text,blocks:[]});
      else result.at(-1)?.blocks.push(b);
    }
    return result;
  }

  function homePage() {
    const p=D.pages.home,ss=sections(p),intro=ss.shift();
    let html='<div class="page-home"><section class="home-intro"><p class="eyebrow">'+inline(intro.title,p.source)+'</p>';
    for(const b of intro.blocks) html+=b.kind==='paragraph'&&/^\*\*.+\*\*$/.test(b.text)?'<h1>'+inline(b.text.slice(2,-2),p.source)+'</h1>':block(b,p.source);
    html+='</section>';
    for(const s of ss) {
      html+=`<section class="home-section"${s.title==='代表项目'?' id="home-selected" tabindex="-1"':''}><h2>${inline(s.title,p.source)}</h2>`;
      if(s.blocks.some(b=>b.kind==='heading'&&b.level===4)) {
        const primary=s.title==='代表项目';html+=`<div class="${primary?'featured-projects':'more-projects'}">`;
        for(const c of cards(s.blocks)) {
          const images=c.blocks.filter(b=>b.kind==='images'),copy=c.blocks.filter(b=>b.kind!=='images');
          html+=`<article class="${primary?'featured-project':'more-project'}">${images.map(b=>renderBlocks([b],p.source)).join('')}<div class="project-copy"><h3>${inline(c.title,p.source)}</h3>${renderBlocks(copy,p.source)}</div></article>`;
        }
        html+='</div>';
      } else html+=renderBlocks(s.blocks,p.source);
      html+='</section>';
    }
    return html+'</div>';
  }
  function worksPage() {
    const p=D.pages.works,ss=sections(p),first=ss.shift(),entries=cards(first.blocks);
    let html='<section class="page-works"><h1>'+inline(first.title,p.source)+'</h1>'+renderBlocks(first.blocks.filter(b=>b.kind!=='heading').slice(0,1),p.source)+'<div class="works-list">';
    for(const c of entries) {
      const image=c.blocks.find(b=>b.kind==='images'),link=c.blocks.find(b=>b.kind==='paragraph'&&b.text.startsWith('['));
      const href=/\]\(([^)]+)\)/.exec(link?.text||'')?.[1];
      html+='<article class="work-row">'+(image?`<a class="work-thumbnail" href="${esc(destination(href,p.source).href)}" aria-label="${esc(plain(c.title))}"><img src="${esc(absolute(image.items[0].src,p.source).href)}" alt="" loading="lazy"></a>`:'')+'<div><h2>'+inline(c.title,p.source)+'</h2>'+renderBlocks(c.blocks.filter(b=>b!==image),p.source)+'</div></article>';
    }
    html+='</div></section>';
    return html+ss.map(s=>'<section class="home-section"><h2>'+inline(s.title,p.source)+'</h2>'+renderBlocks(s.blocks,p.source)+'</section>').join('');
  }
  function aboutPage() {
    const p=D.pages.about;
    return '<article class="page-about">'+sections(p).map((s,i)=>`<section class="${i?'about-section':'about-intro'}"${s.title==='继续了解'?' id="about-contact" tabindex="-1"':''}><${i?'h2':'h1'}>${inline(s.title,p.source)}</${i?'h2':'h1'}>${renderBlocks(s.blocks,p.source)}</section>`).join('')+'</article>';
  }

  const storyIds={oil:['strategy','wireframes','article','videos'],kugou:['growth','sound','radio'],sun:['sales','wireframes','videos'],mask:['strategy','wireframes','videos','live'],clean:['strategy','works']};
  const extraIds={oil:['data','article','moments','videos','sales'],kugou:['social','social-audio','function','wechat','videochannel','radio'],sun:['posters','moments','detail','videos'],mask:['posters','moments','videos','detail','sales'],clean:['ingredients','texture','works']};
  function casePage(id) {
    const p=D.pages[id],ss=sections(p),hero=ss.shift(),complete=ss.pop(),outcome=ss.pop();
    const labels=id==='kugou'?['项目概览','主要任务','工作范围','完整作品']:['项目概览','策划与作品','结果与贡献','完整作品'];
    const keys=['overview','story','outcome','complete'];
    const links=keys.map((key,i)=>`<a href="#/project/${id}/${key}" data-chapter="${id}-${key}">${labels[i]}</a>`).join('');
    const image=hero.blocks.find(b=>b.kind==='images');
    const title=hero.title.split('｜');
    const roles=hero.blocks.filter(b=>b.kind==='paragraph'&&b.text.startsWith('**'));
    const intro=hero.blocks.filter(b=>b!==image&&!roles.includes(b));
    let html=`<div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>${esc(project(id).name)}</p>${links}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>${esc(project(id).name)}</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目概览</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}</nav></div><article class="case-main"><section class="case-hero" id="${id}-overview" data-top-chapter tabindex="-1"><p class="eyebrow">${esc(title[0])}</p><h1>${esc(title.slice(1).join('｜')||title[0])}</h1><div class="hero-layout">${image?figure(image.items[0],p.source,{hero:true}):''}<div class="hero-copy">${renderBlocks(intro,p.source)}<div class="role-notes">${renderBlocks(roles,p.source)}</div></div></div></section><div id="${id}-story" class="story-group" data-top-chapter tabindex="-1">`;
    ss.forEach((s,i)=>{html+=`<section class="case-section" id="${id}-${storyIds[id][i]}" tabindex="-1"><h2>${inline(s.title,p.source)}</h2>${renderBlocks(s.blocks,p.source,id)}</section>`;});
    html+=`</div><section class="case-section outcome" id="${id}-outcome" data-top-chapter tabindex="-1"><h2>${inline(outcome.title,p.source)}</h2>${renderBlocks(outcome.blocks,p.source,id)}</section><section class="case-section complete-works" id="${id}-complete" data-top-chapter tabindex="-1"><h2>${inline(complete.title,p.source)}</h2>`;
    const start=complete.blocks.findIndex(b=>b.kind==='heading'&&b.level===4);
    html+=renderBlocks(complete.blocks.slice(0,start),p.source,id);
    const groups=cards(complete.blocks.slice(start));const tail=[];
    groups.forEach((g,i)=>{
      const body=g.blocks.filter(b=>{
        if(b.kind==='paragraph'&&/^(?:继续查看：|图文及成片按历史|作品中的技术|图文中的配方)/.test(b.text)){tail.push(b);return false;}return true;
      });
      const images=body.filter(b=>b.kind==='images').reduce((n,b)=>n+b.items.length,0);
      const movies=body.reduce((n,b)=>n+(b.text?.match(/\.mp4\)/g)||[]).length,0);
      const meta=[images?`${images} 幅图`:'',movies?`${movies} 条视频`:''].filter(Boolean).join(' · ')||'文字资料';
      html+=`<details id="${id}-more-${extraIds[id][i]}" class="supplementary"><summary><span>${inline(g.title,p.source)}</span><span class="detail-meta">${meta}</span></summary><div class="supplement-body">${renderBlocks(body,p.source,id)}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`;
    });
    return html+`<div class="case-notes">${renderBlocks(tail,p.source,id)}</div></section></article></div>`;
  }
  function materialPage(key) {
    const p=D.materials[key];if(!p)return missingPage();let first=true,index=0;
    const body=p.blocks.map(b=>{
      if(b.kind!=='heading')return block(b,p.source);
      const n=first?1:Math.min(5,Math.max(2,b.level));first=false;
      return `<h${n} id="read-${index++}" data-anchor="${esc(slug(b.text))}" tabindex="-1">${inline(b.text,p.source)}</h${n}>`;
    }).join('');
    const parent=p.parents.find(id=>project(id));
    const back=history.state?.returnTo?'<button type="button" class="back-link" data-return-to>← 返回原阅读位置</button>':`<a class="back-link" href="#/project/${parent}">← 返回${esc(project(parent)?.name||'案例')}</a>`;
    return '<article class="page-material">'+back+'<p class="eyebrow">补充资料</p>'+body+'</article>';
  }
  const missingPage=()=>'<section class="missing-page"><h1>没有找到这个页面。</h1><a href="#/works">查看全部作品 →</a></section>';

  function closeMenu(focus=false) {
    const toggle=document.getElementById('chapter-toggle'),menu=document.getElementById('mobile-chapters');
    if(!toggle||!menu)return;const wasOpen=!menu.hidden;menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus&&wasOpen)toggle.focus({preventScroll:true});
  }
  function updateChapter() {
    const tops=[...main.querySelectorAll('[data-top-chapter]')];if(!tops.length)return;
    const bar=main.querySelector('.case-bar'),threshold=(bar&&getComputedStyle(bar).display!=='none'?bar.offsetHeight:0)+32;
    let active=tops[0];for(const el of tops)if(el.getBoundingClientRect().top<=threshold)active=el;
    if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4)active=tops.at(-1);
    main.querySelectorAll('[data-chapter]').forEach(a=>{if(a.dataset.chapter===active.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    const label=main.querySelector(`.case-nav [data-chapter="${active.id}"]`);
    const current=document.getElementById('chapter-current');if(label&&current)current.textContent=label.textContent;
  }
  function remember() {
    if(restoreLock||!currentKey)return;
    const opened={};main.querySelectorAll('details[id]').forEach(d=>opened[d.id]=d.open);
    history.replaceState({...history.state,scrollY:window.scrollY,opened,page:currentKey,focusKey:document.activeElement?.dataset.focusKey||null},'',location.href);
  }
  function navigate(href) {
    remember();const returnTo=href.startsWith('#/read/')?location.hash:null;
    history.pushState({scrollY:0,returnTo},'',href);applyRoute(false);
  }
  function routeTarget(parts) {
    if(parts[0]==='home'&&parts[1])return document.getElementById('home-selected');
    if(parts[0]==='contact')return document.getElementById('about-contact');
    if(parts[0]==='read'&&parts[2])return [...main.querySelectorAll('[data-anchor]')].find(n=>n.dataset.anchor===slug(parts[2]));
    if(parts[0]!=='project'||!project(parts[1])||!parts[2])return null;
    const id=parts[1],chapter=parts[2],group=parts[3];
    if(group&&['wireframes','wireframes-extra'].includes(chapter))return document.getElementById(`${id}-wireframe-${group}`);
    const direct=document.getElementById(`${id}-${chapter}`);if(direct)return direct;
    const maps={oil:{intro:'overview',moments:'more-moments',sales:'more-sales'},sun:{intro:'overview',strategy:'wireframes',article:'videos',moments:'more-moments',detail:'more-detail'},mask:{intro:'overview',moments:'strategy',article:'wireframes',detail:'more-detail',sales:'more-sales'},clean:{intro:'overview',wireframes:'strategy','wireframes-extra':'more-ingredients'},kugou:{intro:'overview',social:'more-social',function:'more-function',wechat:'more-wechat',videochannel:'more-videochannel'}};
    return document.getElementById(`${id}-${maps[id][chapter]||'wireframe-'+chapter}`)||document.getElementById(id+'-overview');
  }
  function applyRoute(restore=false) {
    const sequence=++routeSequence;lastUrl=location.href;let parts;
    try{parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);}catch{parts=['missing'];}
    if(parts[0]==='wireframes'){history.replaceState(history.state,'',`#/project/sun/wireframes${parts[1]?'/'+encodeURIComponent(parts[1]):''}`);return applyRoute(restore);}
    const page=parts[0]==='project'?(project(parts[1])?'case:'+parts[1]:'missing'):parts[0]==='read'?'read:'+parts[1]:['about','contact'].includes(parts[0])?'about':parts[0]==='works'?'works':!parts.length||parts[0]==='home'?'home':'missing';
    const saved=history.state||{},restoreSaved=restore&&saved.page===page&&typeof saved.scrollY==='number';
    restoreLock=true;closeMenu();main.setAttribute('aria-busy','true');
    if(page!==currentKey){
      main.querySelectorAll('video').forEach(v=>v.pause());if(dialog.open)dialog.close();
      main.innerHTML=page==='home'?homePage():page==='works'?worksPage():page==='about'?aboutPage():page.startsWith('case:')?casePage(parts[1]):page.startsWith('read:')?materialPage(parts[1]):missingPage();
      currentKey=page;
      main.querySelectorAll('a,button,summary,video').forEach((el,i)=>el.dataset.focusKey=page+'-'+i);
      main.querySelectorAll('.image-open img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.nextElementSibling.hidden=false;},{once:true}));
      main.querySelectorAll('video').forEach(v=>v.addEventListener('error',()=>{v.closest('.video-entry').querySelector('.media-warning').hidden=false;}));
    }
    document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(page==='about'?'about':page==='works'||page.startsWith('case:')?'works':''))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=(page.startsWith('case:')?project(parts[1]).name:page==='about'?'关于我':page==='works'?'全部作品':'作品集')+'｜孙岩萍';
    if(restoreSaved&&saved.opened)for(const [id,open]of Object.entries(saved.opened)){const el=document.getElementById(id);if(el)el.open=open;}
    const target=routeTarget(parts);
    if(target&&!restoreSaved){let el=target;while(el&&el!==main){if(el.tagName==='DETAILS')el.open=true;el=el.parentElement;}}
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(sequence!==routeSequence)return;
      if(restoreSaved)window.scrollTo(0,saved.scrollY);else if(target)target.scrollIntoView({block:'start'});else window.scrollTo(0,0);
      let focus=restoreSaved&&saved.focusKey?[...main.querySelectorAll('[data-focus-key]')].find(el=>el.dataset.focusKey===saved.focusKey):target||main.querySelector('h1')||main;
      if(focus&&!focus.getClientRects().length)focus=document.getElementById('chapter-toggle')||main.querySelector('h1');
      if(focus){if(!focus.matches('a,button,summary,video'))focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});}
      restoreLock=false;main.setAttribute('aria-busy','false');updateChapter();
    }));
  }
  function setZoom(value,fit=false) {
    if(!fullImage.naturalWidth)return;
    zoom=fit?Math.min(1,(stage.clientWidth-32)/fullImage.naturalWidth):Math.min(4,Math.max(.1,value));
    fullImage.style.width=Math.round(fullImage.naturalWidth*zoom)+'px';
    document.getElementById('zoom-value').textContent=fit?'适宽':Math.round(zoom*100)+'%';
  }
  function openImage(button){
    lastTrigger=button;document.getElementById('viewer-title').textContent=button.dataset.caption;document.getElementById('viewer-original').href=button.dataset.fullSrc;
    document.getElementById('viewer-error').hidden=true;fullImage.hidden=false;fullImage.alt=button.dataset.caption;fullImage.style.width='100%';fullImage.src=button.dataset.fullSrc;
    imageScrollY=window.scrollY;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();stage.scrollTo(0,0);document.getElementById('viewer-close').focus();
    if(fullImage.complete&&fullImage.naturalWidth)setZoom(1,true);
  }
  fullImage.addEventListener('load',()=>setZoom(1,true));
  fullImage.addEventListener('error',()=>{fullImage.hidden=true;document.getElementById('viewer-error').hidden=false;});
  document.getElementById('viewer-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;window.scrollTo(0,imageScrollY);if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
  document.getElementById('zoom-in').addEventListener('click',()=>setZoom(zoom*1.3));
  document.getElementById('zoom-out').addEventListener('click',()=>setZoom(zoom/1.3));
  document.getElementById('zoom-fit').addEventListener('click',()=>setZoom(1,true));
  document.getElementById('zoom-actual').addEventListener('click',()=>setZoom(1));
  document.addEventListener('click',event=>{
    const image=event.target.closest('.image-open');if(image){openImage(image);return;}
    if(event.target.closest('.skip-link')){event.preventDefault();main.focus();return;}
    const toggle=event.target.closest('#chapter-toggle');
    if(toggle){const menu=document.getElementById('mobile-chapters'),open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)menu.querySelector('a').focus({preventScroll:true});return;}
    const collapse=event.target.closest('.collapse-detail');
    if(collapse){const d=collapse.closest('details');d.open=false;d.querySelector('summary').focus({preventScroll:true});d.scrollIntoView({block:'nearest'});remember();return;}
    if(event.target.closest('[data-return-to]')){history.back();return;}
    if(!event.target.closest('.case-bar'))closeMenu();
    const a=event.target.closest('a[href]');
    if(a&&a.getAttribute('href').startsWith('#/')&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();navigate(a.getAttribute('href'));}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!dialog.open)closeMenu(true);});
  main.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')main.querySelectorAll('video').forEach(v=>{if(v!==event.target)v.pause();});},true);
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{updateChapter();scrollFrame=null;});clearTimeout(saveTimer);saveTimer=setTimeout(remember,120);},{passive:true});
  window.addEventListener('resize',()=>{closeMenu();updateChapter();if(dialog.open)setZoom(1,true);});
  main.addEventListener('toggle',()=>{if(!restoreLock){updateChapter();remember();}},true);
  window.addEventListener('popstate',()=>applyRoute(true));
  window.addEventListener('hashchange',()=>{if(location.href!==lastUrl)applyRoute(false);});
  window.addEventListener('pagehide',remember);
  applyRoute(false);
})();
