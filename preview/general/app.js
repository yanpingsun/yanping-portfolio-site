'use strict';
(() => {
  const D = window.GENERAL_PORTFOLIO;
  const main = document.getElementById('main');
  const root = new URL('../../', document.baseURI);
  const dialog = document.getElementById('image-viewer');
  const stage = document.getElementById('viewer-stage');
  const fullImage = document.getElementById('viewer-image');
  const plain = s => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*|`/g, '').trim();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const project = id => D.projects.find(p => p.id === id);
  const slug = s => plain(s).toLowerCase().replace(/[\s]+/g,'-').replace(/[^\p{L}\p{N}_-]/gu,'');
  let currentKey = '', lastUrl = '', observer, lastTrigger, zoom = 1, oldOverflow = '';
  let restoreLock = false, saveTimer, routeSequence = 0;
  history.scrollRestoration = 'manual';

  function destination(raw, source) {
    if (raw.startsWith('mailto:')) return {href:raw};
    if (/^https?:/.test(raw)) return {href:raw, external:true};
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return {href:'#/works'};
    const base = new URL(source, root);
    const url = new URL(raw, base);
    const rel = decodeURIComponent(url.pathname.slice(root.pathname.length));
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (rel === 'content/home.md') return {href:fragment ? '#/home/selected' : '#/'};
    if (rel === 'content/about.md') return {href:'#/about'};
    for (const p of D.projects) if (D.pages[p.id].source === rel) return {href:`#/project/${p.id}`};
    const mid = D.material_paths[rel];
    if (mid) return {href:`#/read/${mid}${fragment ? '/'+encodeURIComponent(fragment) : ''}`};
    if (rel.endsWith('.md')) return {href:'https://github.com/yanpingsun/yanping-portfolio-site/blob/archive/general-content-r3/'+rel.split('/').map(encodeURIComponent).join('/')+(fragment?'#'+encodeURIComponent(fragment):''),external:true};
    return {href:url.href, external:true};
  }

  function inline(text, source) {
    const token = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let result='', at=0, m;
    while ((m=token.exec(text))) {
      result += esc(text.slice(at,m.index));
      const value=m[0];
      if (value.startsWith('**')) result += '<strong>'+esc(value.slice(2,-2))+'</strong>';
      else if (value.startsWith('`')) result += '<code>'+esc(value.slice(1,-1))+'</code>';
      else {
        const parts=/^\[([^\]]+)\]\(([^)]+)\)$/.exec(value);
        const to=destination(parts[2],source);
        result += `<a href="${esc(to.href)}"${to.external?' target="_blank" rel="noopener"':''}>${esc(parts[1])}${to.external?' <span class="external-mark" aria-label="新标签打开">↗</span>':''}</a>`;
      }
      at=token.lastIndex;
    }
    return result+esc(text.slice(at));
  }

  function figure(item, source, options={}) {
    const url=new URL(item.src,new URL(source,root));
    const rel=decodeURIComponent(url.pathname.slice(root.pathname.length));
    const info=D.images[rel] || {};
    const thumb=info.preview ? new URL(info.preview,root).href : url.href;
    const long=(info.height || 0)/(info.width || 1)>3.5;
    const excerpt=options.excerpt;
    return `<figure class="work-figure ${options.pair?'':'single-image'} ${long?'long-image':''} ${excerpt?'cover-excerpt':''}">
      <button type="button" class="image-open" data-full-src="${esc(url.href)}" data-caption="${esc(item.alt)}" aria-label="放大查看：${esc(item.alt)}">
        <img src="${esc(thumb)}" alt="${esc(item.alt)}" ${info.width?`width="${info.width}" height="${info.height}"`:''} loading="${options.hero?'eager':'lazy'}" decoding="async">
        <span class="image-placeholder" hidden>图片暂时无法载入，可用下方入口查看原图。</span>
      </button><figcaption>${esc(item.alt)}${excerpt?'（封面节选）':''}</figcaption>
      <a class="original-link" href="${esc(url.href)}" target="_blank" rel="noopener">查看原图 ↗</a></figure>`;
  }

  function block(b, source) {
    if (b.kind==='paragraph') return `<p>${inline(b.text,source)}</p>`;
    if (b.kind==='heading') {const n=Math.min(5,Math.max(2,b.level-1));return `<h${n}>${inline(b.text,source)}</h${n}>`;}
    if (b.kind==='quote') return '<blockquote>'+b.items.map(s=>`<p>${inline(s,source)}</p>`).join('')+'</blockquote>';
    if (b.kind==='list') {const tag=b.ordered?'ol':'ul';return `<${tag}>`+b.items.map(s=>`<li>${inline(s,source)}</li>`).join('')+`</${tag}>`;}
    if (b.kind==='code') return `<pre><code>${esc(b.text)}</code></pre>`;
    if (b.kind==='table') {
      const [head,...rows]=b.rows;
      return `<table class="data-table"><thead><tr>${head.map(h=>`<th scope="col">${inline(h,source)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>'<tr>'+row.map((v,i)=>`<td data-label="${esc(plain(head[i] || '说明'))}">${inline(v,source)}</td>`).join('')+'</tr>').join('')}</tbody></table>`;
    }
    if (b.kind==='images') return b.items.length===2?`<div class="paired-figures">${b.items.map(i=>figure(i,source,{pair:true})).join('')}</div>`:b.items.map(i=>figure(i,source)).join('');
    return '';
  }
  const renderBlocks = (blocks,source) => blocks.map(b=>block(b,source)).join('');

  function sectionId(id,title,index) {
    const map={oil:[['项目任务','overview'],['内容判断','strategy'],['海报','wireframes'],['公众号','article'],['朋友圈','moments'],['四类视频','videos'],['销售沟通','sales'],['项目结果','outcome']],
      sun:[['内容判断','strategy'],['海报','wireframes'],['公众号','article'],['朋友圈','moments'],['销售话术','sales'],['详情页','detail'],['四条视频','videos'],['项目结果','outcome']],
      mask:[['内容判断','strategy'],['海报','wireframes'],['公众号','article'],['朋友圈','moments'],['三条视频','videos'],['直播讲解','live'],['商城详情页','detail'],['私域沟通','sales'],['项目结果','outcome']],
      clean:[['主海报','wireframes'],['补充对照','wireframes-extra'],['上新长文','works'],['项目结果','outcome']],
      kugou:[['任务与分工','overview'],['发糖机','growth'],['小红书','social'],['抖音','function'],['微信渠道','wechat'],['入梦晚安电台','radio'],['这些作品','outcome']]};
    return map[id].find(([prefix])=>title.startsWith(prefix))?.[1] || 'section-'+index;
  }

  function splitSections(page) {
    const result=[];
    for (const b of page.blocks) {
      if (b.kind==='heading'&&b.level===3) result.push({title:b.text,blocks:[]});
      else result.at(-1)?.blocks.push(b);
    }
    return result;
  }

  function posterChapter(blocks,source,id) {
    const intro=[],groups=[],footer=[];
    for (const b of blocks) {
      if (b.kind==='heading'&&b.level===4) groups.push({title:b.text,blocks:[]});
      else if (b.kind==='paragraph'&&b.text.includes('.pdf)')&&b.text.includes('线稿')) footer.push(b);
      else (groups.length?groups.at(-1).blocks:intro).push(b);
    }
    const featured={oil:['day','night'],sun:['value','texture'],mask:['comparison','dual'],clean:['core']}[id];
    const rendered=groups.map((g,index)=>{
      const image=g.blocks.find(b=>b.kind==='images')?.items[0].src || '';
      const name=/\/([^/]+)-wireframe\./.exec(image)?.[1] || 'group-'+index;
      return {name,title:g.title,html:`<article class="poster-group" id="${id}-wireframe-${esc(name)}" tabindex="-1"><h3>${inline(g.title,source)}</h3>${renderBlocks(g.blocks,source)}</article>`};
    });
    const primary=rendered.filter(g=>featured.includes(g.name));
    const extra=rendered.filter(g=>!featured.includes(g.name));
    const introduction=id==='clean'&&intro.some(b=>b.kind==='images')?`<article class="poster-group" id="clean-wireframe-core" tabindex="-1">${renderBlocks(intro,source)}</article>`:renderBlocks(intro,source);
    return introduction+primary.map(g=>g.html).join('')+(extra.length?`<details class="supplementary" id="${id}-poster-more"><summary>补充查看：${extra.map(g=>esc(g.title.split('：')[0])).join('、')}，${extra.length}组</summary>${extra.map(g=>g.html).join('')}</details>`:'')+renderBlocks(footer,source);
  }

  function videoChapter(blocks,source) {
    const intro=[],cards=[],tail=[];let current;
    for (const b of blocks) {
      if (b.kind==='heading'&&b.level===4) {current={title:b.text,blocks:[]};cards.push(current);}
      else if (!current) (cards.length?tail:intro).push(b);
      else {current.blocks.push(b);if(b.kind==='paragraph'&&b.text.includes('.mp4)'))current=null;}
    }
    return renderBlocks(intro,source)+`<div class="video-grid">${cards.map((c,i)=>{
      const movie=c.blocks.find(b=>b.kind==='paragraph'&&b.text.includes('.mp4)'));
      const match=/\[([^\]]+)\]\(([^)]+\.mp4)\)/.exec(movie?.text || '');
      const url=match?new URL(match[2],new URL(source,root)).href:'';
      const copy=c.blocks.filter(b=>b!==movie);
      return `<article class="video-card" id="video-${i+1}"><h3>${inline(c.title,source)}</h3>${renderBlocks(copy,source)}${url?`<video controls playsinline preload="metadata" aria-label="${esc(plain(c.title))}"><source src="${esc(url)}" type="video/mp4">当前浏览器不能播放，请使用下方文件入口。</video><p class="media-warning" hidden role="status">视频暂时无法播放，可尝试打开原文件。</p><a class="video-file" href="${esc(url)}" target="_blank" rel="noopener">${esc(match[1])} · 原文件 ↗</a>`:renderBlocks(movie?[movie]:[],source)}</article>`;
    }).join('')}</div>`+renderBlocks(tail,source);
  }

  function homePage() {
    const p=D.pages.home, sections=splitSections(p), intro=sections.shift();
    let html='<div class="page-home"><section class="home-intro">';
    html+=`<p class="eyebrow">${inline(intro.title,p.source)}</p>`;
    for (const b of intro.blocks) {
      if(b.kind==='paragraph'&&b.text.startsWith('**')) html+=`<h1>${inline(b.text.replace(/^\*\*|\*\*$/g,''),p.source)}</h1>`;
      else html+=`<div class="intro-copy">${block(b,p.source)}</div>`;
    }
    html+='</section>';
    for (const s of sections) {
      if (s.title==='代表项目') {
        const cards=[];for(const b of s.blocks) {if(b.kind==='heading'&&b.level===4)cards.push({title:b.text,blocks:[]});else cards.at(-1)?.blocks.push(b);}
        html+='<section class="home-section" id="home-selected"><h2>代表项目</h2><div class="primary-grid">';
        cards.forEach((c,i)=>{
          const meta=D.projects[i];
          html+=`<a class="project-card" href="#/project/${meta.id}"><img class="cover" src="${esc(new URL(meta.cover,root).href)}" alt="" width="640" height="400"><h3>${inline(c.title,p.source)}</h3>`;
          for (const b of c.blocks) {
            if(b.kind==='paragraph'&&/^\[/.test(b.text))html+=`<span class="card-cta">${esc(plain(b.text))} →</span>`;
            else if(b.kind==='paragraph')html+=`<p>${esc(plain(b.text))}</p>`;
          }
          html+='</a>';
        });html+='</div></section>';
      } else if (s.title.startsWith('更多项目')) {
        html+=`<section class="home-section"><h2>${inline(s.title,p.source)}</h2>`;
        let open=false;
        for(const b of s.blocks) {
          if(b.kind==='paragraph'&&b.text.startsWith('**')) {if(open)html+='</article>';html+=`<article class="more-project"><h3>${inline(b.text,p.source)}</h3>`;open=true;}
          else html+=block(b,p.source);
        }
        html+=(open?'</article>':'')+'</section>';
      } else html+=`<section class="home-section"><h2>${inline(s.title,p.source)}</h2><div class="home-experience">${renderBlocks(s.blocks,p.source)}</div></section>`;
    }
    return html+'</div>';
  }

  function worksPage() {
    return `<section class="page-works"><p class="eyebrow">产品内容策划 · 新媒体运营</p><h1>五个项目，不同的内容问题。</h1><p>从产品主线、升级沟通到粉丝活动，查看具体作品与个人分工。</p><div class="works-list">${D.projects.map((p,i)=>`<a class="work-row" href="#/project/${p.id}"><span class="number">0${i+1}</span><img src="${esc(new URL(p.cover,root).href)}" alt="" loading="lazy" width="160" height="126"><div><h2>${esc(p.title)}</h2><p>${esc(p.scope)}</p></div><span class="arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section>`;
  }

  function aboutPage() {
    const p=D.pages.about,sections=splitSections(p);
    return '<div class="page-about">'+sections.map((s,i)=>`<section class="${i?'about-section':'about-intro'}" ${s.title==='继续了解'?'id="about-contact"':''}><${i?'h2':'h1'}>${inline(s.title,p.source)}</${i?'h2':'h1'}>${renderBlocks(s.blocks,p.source)}</section>`).join('')+'</div>';
  }

  function casePage(id) {
    const p=D.pages[id],sections=splitSections(p),hero=sections.shift();
    const figureBlock=hero.blocks.find(b=>b.kind==='images');
    const rest=sections.map((s,i)=>({...s,id:sectionId(id,s.title,i)}));
    const toc=rest.map(s=>`<a href="#/project/${id}/${s.id}" data-chapter="${id}-${s.id}">${esc(s.title.split('：')[0])}</a>`).join('');
    let html=`<div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>本案目录</p>${toc}</nav><article class="case-main"><a class="back-link" href="#/works">← 全部作品</a><section class="case-hero" id="${id}-intro" tabindex="-1"><h1>${inline(hero.title,p.source)}</h1><div class="hero-layout"><div class="hero-copy">${renderBlocks(hero.blocks.filter(b=>b!==figureBlock),p.source)}</div>${figureBlock?figure(figureBlock.items[0],p.source,{hero:true,excerpt:id==='kugou'}):''}</div></section>`;
    for (const s of rest) {
      const posters=s.id==='wireframes'||s.id==='wireframes-extra';
      html+=`<section class="case-section" id="${id}-${s.id}" tabindex="-1"><h2>${inline(s.title,p.source)}</h2>`;
      if(posters) html+=posterChapter(s.blocks,p.source,id);
      else if(s.id==='videos')html+=videoChapter(s.blocks,p.source);
      else if(id==='clean'&&s.id==='works')html+=s.blocks.map(b=>b.kind==='images'?`<details class="supplementary" id="clean-cleansing-more"><summary>补充查看：清洁感海报，1幅</summary>${block(b,p.source)}</details>`:block(b,p.source)).join('');
      else html+=renderBlocks(s.blocks,p.source);
      html+='</section>';
    }
    return html+'</article></div>';
  }

  function materialPage(key) {
    const p=D.materials[key];if(!p)return missingPage();
    let first=true,index=0;
    const body=p.blocks.map(b=>{
      if(b.kind==='heading') {
        const n=first?1:Math.min(5,Math.max(2,b.level));first=false;
        return `<h${n} id="read-${slug(b.text)}-${index++}" data-anchor="${esc(slug(b.text))}" tabindex="-1">${inline(b.text,p.source)}</h${n}>`;
      }
      return block(b,p.source);
    }).join('');
    const parent=p.parents?.find(id=>project(id));
    return `<article class="page-material"><header class="material-header"><a class="back-link" href="${parent?'#/project/'+parent:'#/works'}">← ${parent?'返回'+esc(project(parent).name)+'案例':'全部作品'}</a><p class="eyebrow">补充资料</p></header><div class="material-body">${body}</div></article>`;
  }
  const missingPage = () => '<section class="missing-page"><h1>没有找到这个页面。</h1><p>可以从全部作品继续查看案例。</p><a href="#/works">查看全部作品 →</a></section>';

  function remember() {
    if(restoreLock||!currentKey)return;
    const opened={};main.querySelectorAll('details[id]').forEach(d=>opened[d.id]=d.open);
    history.replaceState({...history.state,scrollY:window.scrollY,opened,page:currentKey},'',location.href);
  }

  function navigate(href) {
    remember();history.pushState({scrollY:0},'',href);applyRoute(false);
  }

  function applyRoute(restore=false) {
    const sequence=++routeSequence;
    lastUrl=location.href;
    let parts;
    try {parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);}catch{parts=['missing'];}
    if(parts[0]==='wireframes') {history.replaceState(history.state,'',`#/project/sun/wireframes${parts[1]?'/'+encodeURIComponent(parts[1]):''}`);return applyRoute(restore);}
    const validProject=!!project(parts[1]);
    const page=parts[0]==='project'?(validProject?'case:'+parts[1]:'missing'):parts[0]==='read'?'read:'+parts[1]:['about','contact'].includes(parts[0])?'about':parts[0]==='works'?'works':!parts.length||parts[0]==='home'?'home':'missing';
    const saved=history.state || {};
    const restoreSaved=restore&&saved.page===page&&typeof saved.scrollY==='number';
    restoreLock=true;
    main.setAttribute('aria-busy','true');
    if(page!==currentKey) {
      main.querySelectorAll('video').forEach(v=>v.pause());if(dialog.open)dialog.close();
      observer?.disconnect();
      main.innerHTML=page==='home'?homePage():page==='works'?worksPage():page==='about'?aboutPage():page.startsWith('case:')?casePage(parts[1]):page.startsWith('read:')?materialPage(parts[1]):missingPage();
      currentKey=page;
      main.querySelectorAll('.image-open img').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;img.closest('figure').classList.add('is-missing');img.nextElementSibling.hidden=false;},{once:true}));
      main.querySelectorAll('video').forEach(v=>v.addEventListener('error',()=>{v.nextElementSibling.hidden=false;}));
      if('IntersectionObserver' in window) {
        observer=new IntersectionObserver(entries=>{
          const seen=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
          if(seen)main.querySelectorAll('[data-chapter]').forEach(a=>a.toggleAttribute('aria-current',a.dataset.chapter===seen.target.id));
        },{rootMargin:'-5% 0px -65% 0px'});
        main.querySelectorAll('.case-section').forEach(s=>observer.observe(s));
      }
    }
    document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(page==='about'?'about':page==='works'||page.startsWith('case:')?'works':''))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=page.startsWith('case:')?`${project(parts[1]).name}｜孙岩萍作品集预览`:page==='about'?'关于我｜孙岩萍作品集预览':page==='works'?'全部作品｜孙岩萍作品集预览':'孙岩萍｜作品集预览';
    if(restoreSaved&&saved.opened)for(const [id,open] of Object.entries(saved.opened)){const d=document.getElementById(id);if(d)d.open=open;}
    let target;
    if(parts[0]==='project'&&validProject) {
      const id=parts[1];let chapter=parts[2];
      if(chapter==='wireframes'&&parts[3])target=document.getElementById(`${id}-wireframe-${parts[3]}`);
      else if(chapter) {
        if(chapter==='overview'&&!document.getElementById(`${id}-overview`))chapter='intro';
        if(chapter==='strategy'&&!document.getElementById(`${id}-strategy`))chapter=id==='clean'?'wireframes':'overview';
        target=document.getElementById(`${id}-${chapter}`);
      }
    } else if(parts[0]==='home'&&parts[1])target=document.getElementById('home-selected');
    else if(parts[0]==='contact')target=document.getElementById('about-contact');
    else if(parts[0]==='read'&&parts[2])target=[...main.querySelectorAll('[data-anchor]')].find(n=>n.dataset.anchor===slug(parts[2]));
    if(target?.closest('details')&&!restoreSaved)target.closest('details').open=true;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(sequence!==routeSequence)return;
      if(restoreSaved)window.scrollTo(0,saved.scrollY);
      else if(target)target.scrollIntoView({block:'start'});
      else window.scrollTo(0,0);
      const focus=target || main.querySelector('h1') || main;focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});
      restoreLock=false;
      main.setAttribute('aria-busy','false');
    }));
  }

  function setZoom(value,fit=false) {
    if(!fullImage.naturalWidth)return;
    zoom=fit?Math.min(1,(stage.clientWidth-32)/fullImage.naturalWidth):Math.min(4,Math.max(.1,value));
    fullImage.style.width=Math.round(fullImage.naturalWidth*zoom)+'px';
    document.getElementById('zoom-value').textContent=fit?'适宽':Math.round(zoom*100)+'%';
  }
  function openImage(button) {
    lastTrigger=button;document.getElementById('viewer-title').textContent=button.dataset.caption;
    document.getElementById('viewer-original').href=button.dataset.fullSrc;
    document.getElementById('viewer-error').hidden=true;fullImage.hidden=false;
    fullImage.alt=button.dataset.caption;fullImage.style.width='100%';fullImage.src=button.dataset.fullSrc;
    oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();
    dialog.style.setProperty('--viewer-bar-height',dialog.querySelector('header').getBoundingClientRect().height+'px');
    stage.scrollTo(0,0);document.getElementById('viewer-close').focus();
    if(fullImage.complete&&fullImage.naturalWidth)setZoom(1,true);
  }
  fullImage.addEventListener('load',()=>setZoom(1,true));
  fullImage.addEventListener('error',()=>{fullImage.hidden=true;document.getElementById('viewer-error').hidden=false;});
  document.getElementById('viewer-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
  document.getElementById('zoom-in').addEventListener('click',()=>setZoom(zoom*1.3));
  document.getElementById('zoom-out').addEventListener('click',()=>setZoom(zoom/1.3));
  document.getElementById('zoom-fit').addEventListener('click',()=>setZoom(1,true));
  document.getElementById('zoom-actual').addEventListener('click',()=>setZoom(1));
  document.addEventListener('click',event=>{
    const image=event.target.closest('.image-open');if(image){openImage(image);return;}
    const skip=event.target.closest('.skip-link');if(skip){event.preventDefault();main.focus();return;}
    const a=event.target.closest('a[href]');
    if(a&&a.getAttribute('href').startsWith('#/')&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();navigate(a.getAttribute('href'));}
  });
  main.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')main.querySelectorAll('video').forEach(v=>{if(v!==event.target)v.pause();});},true);
  window.addEventListener('scroll',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(remember,120);},{passive:true});
  main.addEventListener('toggle',()=>{if(!restoreLock)remember();},true);
  window.addEventListener('popstate',()=>applyRoute(true));
  window.addEventListener('hashchange',()=>{if(location.href!==lastUrl)applyRoute(false);});
  window.addEventListener('pagehide',remember);
  applyRoute(false);
})();
