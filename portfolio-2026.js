'use strict';
const main = document.getElementById('main');
const viewer = document.getElementById('image-viewer');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PREVIEWS = {"portfolio-content/essence-oil/assets/posters/oil-product.png": "portfolio-previews/oil.webp", "portfolio-sunscreen-product-original.png": "portfolio-previews/sun.webp", "portfolio-mask-product-original.png": "portfolio-previews/mask.webp", "portfolio-content/cleanser/assets/posters/cleanser-main.jpg": "portfolio-previews/clean.webp", "portfolio-content/kugou/assets/weibo/fatang-rules.jpg": "portfolio-previews/kugou.webp"};
const preview = src => PREVIEWS[src] || src;
const flow = items => `<div class="flow">${items.map((s,i) => `${i?'<i aria-hidden="true">→</i>':''}<span>${esc(s)}</span>`).join('')}</div>`;
let currentView = '';
let lastImageButton = null;

function projectCard(p) {
  return `<a class="project-card card-${p.id}" href="#/project/${p.id}" aria-label="查看${esc(p.name)}案例">
    <div class="card-art"><img src="${preview(p.cover)}" alt="${esc(p.coverNote)}历史作品" loading="lazy" width="800" height="552"><div class="card-topline"><span>${p.number} / ${esc(p.category)}</span></div><span class="card-arrow" aria-hidden="true">↗</span></div>
    <div class="card-info"><div class="card-meta"><span>${esc(p.label)}</span><span>CASE ${p.number}</span></div><h3>${esc(p.cardTitle)}</h3><p>${esc(p.summary)}</p><div class="card-result"><strong>${esc(p.metric)}</strong><span>${esc(p.metricLabel)}</span></div></div>
  </a>`;
}

function home() {
  return `<div class="container">
    <section class="home-hero" aria-labelledby="home-title">
      <div class="hero-copy"><p class="eyebrow">CONTENT, WITH A REASON. <span> / 2026</span></p><p class="hero-person"><b>我是孙岩萍</b> · 品牌／产品内容策划</p><h1 id="home-title">把产品价值，<br>写成<em>选择理由。</em></h1><p class="lead">从卖点提炼、图文策划到视频脚本与销售沟通，<br class="desktop-break">让专业的产品信息，成为更容易理解的内容。</p><div class="hero-actions"><a class="button" href="#/works">浏览精选项目 <span aria-hidden="true">↘</span></a><a class="text-link" href="#/about">了解我的工作方式 ↗</a></div></div>
      <div class="hero-art" aria-label="日夜精华油与童颜面膜代表作品"><div class="hero-art-top"><b>SELECTED WORK</b><span>PRODUCT → CONTENT</span></div><div class="hero-art-images"><img class="hero-art-main" src="portfolio-previews/oil.webp" alt="日夜精华油历史产品海报" width="740" height="820" fetchpriority="high"><img class="hero-art-small" src="portfolio-previews/mask.webp" alt="童颜面膜产品作品" width="340" height="380"></div><div class="hero-art-bottom"><span>从一个卖点，到一组完整的内容。</span><span>01 — 05</span></div></div>
    </section>
    <div class="expertise-strip" aria-label="工作范围"><span>What I do</span><span>产品卖点提炼</span><i>／</i><span>多渠道内容策划</span><i>／</i><span>人物与场景脚本</span><i>／</i><span>公域内容与活动</span></div>
    <section id="works" class="work-section" aria-labelledby="work-title"><div class="section-heading"><div><p class="eyebrow">01 / SELECTED PROJECTS</p><h2 id="work-title">用真实项目，展开策划过程。</h2></div><p>四个护肤产品案例，<br>一段音乐平台的内容与增长实践。</p></div><div class="work-grid">${PROJECTS.map(projectCard).join('')}</div><p class="work-note">护肤品 GMV 为团队与渠道共同完成的项目销售结果。酷狗引流为拉新及促活口径；具体统计范围见各案例说明。</p></section>
    ${wireframeTeaser()}
    <section id="about" class="about-section" aria-labelledby="about-title"><p class="eyebrow">03 / ABOUT & APPROACH</p><div class="about-layout"><div><h2 id="about-title" class="about-lead">以消费者能理解的方式，<br>讲清产品为什么值得关注。</h2><span class="about-label">产品内容 × 公域传播</span></div><div class="about-copy"><p>我的经验覆盖护肤品新品内容策划，以及酷狗音乐的多平台内容运营与活动。前者让我持续处理卖点、成分信息和购买顾虑；后者让我关注内容如何适应平台、带动参与并连接业务目标。</p><p>在项目中，我负责把零散资料组织成主次清楚的表达，再根据公众号、朋友圈、详情页、视频或销售沟通的场景，调整内容的展开方式。</p><a class="text-link" href="mailto:beibiduo@163.com">关于品牌／产品内容岗位，欢迎联系 ↗</a></div></div><div class="method-grid"><div><span>01.</span><h3>找到主线</h3><p>从产品资料与沟通任务里，选择用户先需要理解的核心问题。</p></div><div><span>02.</span><h3>组织表达</h3><p>将专业信息转成观点、类比、场景与故事，建立清楚的讲述顺序。</p></div><div><span>03.</span><h3>推进落地</h3><p>按渠道安排内容，与设计、达人及相关团队沟通，完成具体交付。</p></div></div></section>
  </div><section id="contact" class="contact-section"><div><span>LET'S MAKE GOOD CONTENT.</span><h2>下一次，让内容为你的品牌说话。</h2></div><a href="mailto:beibiduo@163.com">beibiduo@163.com <span>↗</span></a></section>`;
}

function imageGallery(images) {
  if (!images.length) return '';
  return `<div class="image-grid ${images.length===2?'two':''}">${images.map(im => `<figure><button type="button" class="image-button" data-image="${esc(im.src)}" data-caption="${esc(im.title)}" aria-label="放大查看：${esc(im.title)}"><img src="${preview(im.src)}" alt="${esc(im.title)}" loading="lazy" decoding="async"><span class="expand" aria-hidden="true">查看原作 ↗</span></button><figcaption>${esc(im.title)}${im.note?`<small>${esc(im.note)}</small>`:''}</figcaption></figure>`).join('')}</div>`;
}

function chapterSection(p, c, number) {
  const example = c.example;
  return `<section class="case-section ${p.id==='kugou'?'kugou-section':''}" id="${p.id}-${c.id}"><span class="section-num">${number} / SELECTED WORK</span><div class="section-heading"><h2>${esc(c.title)}</h2></div><div class="chapter-copy">${c.body.map(t=>`<p>${esc(t)}</p>`).join('')}</div>
    ${imageGallery(c.images)}
    ${example?`<div class="example-box"><p class="example-label">${esc(example.label)}</p><h3>${esc(example.question)}</h3><blockquote>${esc(example.answer)}</blockquote>${flow(example.steps)}${example.note?`<small>${esc(example.note)}</small>`:''}</div>`:''}
    ${c.links.length?`<div class="document-links">${c.links.map(l=>`<a href="${esc(l.href)}" ${l.href.startsWith("#/")?'':'target="_blank" rel="noopener"'}>${esc(l.title)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`:''}
    ${c.stats?`<div class="section-stats">${c.stats.map(s=>`<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join('')}</div><p class="stat-note">${esc(c.statsNote)}</p>`:''}
  </section>`;
}

function project(p) {
  const index=PROJECTS.indexOf(p), next=PROJECTS[(index+1)%PROJECTS.length];
  const nav=[['overview','项目概览'],['strategy','策划主线'],...p.chapters.map(c=>[c.id,c.title.split('｜')[0]])];
  if(p.videos.length) nav.push(['videos','视频脚本']);
  nav.push(['outcome','项目成果']);
  const videoSection=p.videos.length?`<section class="case-section" id="${p.id}-videos"><span class="section-num">${String(p.chapters.length+3).padStart(2,'0')} / VIDEO SCRIPTS</span><div class="section-heading"><h2>视频脚本｜同一主线，不同讲述方式</h2></div><p class="video-intro">${esc(p.videoNote)}</p><div class="video-grid">${p.videos.map(v=>`<article class="video-card"><video controls preload="metadata" playsinline ${v.poster?`poster="${preview(v.poster)}"`:''} aria-label="${esc(v.title)}"><source src="${esc(v.src)}" type="video/mp4">当前浏览器无法播放。<a href="${esc(v.src)}">打开视频文件</a></video><div class="video-copy"><h3>${esc(v.title)}</h3><p>${esc(v.body)}</p>${flow(v.steps)}</div></article>`).join('')}</div></section>`:'';
  return `<div class="container"><div class="breadcrumb"><a href="#/works">← 全部项目</a> <span> / CASE ${p.number}</span></div><section class="project-hero ${p.id}"><div><p class="eyebrow">${esc(p.label)}</p><h1>${esc(p.title).replace(/\n/g,'<br>')}</h1><p class="project-summary">${esc(p.summary)}</p><div class="project-metric"><strong>${esc(p.metric)}</strong><span>${esc(p.metricLabel)}</span></div></div><img class="project-cover" src="${preview(p.cover)}" alt="${esc(p.coverNote)}代表作品" width="650" height="590" fetchpriority="high"></section></div>
    <nav class="project-subnav" aria-label="案例章节"><div class="container">${nav.map(([id,title])=>`<a href="#/project/${p.id}/${id}">${esc(title)}</a>`).join('')}</div></nav>
    <div class="container"><section class="case-section case-grid" id="${p.id}-overview"><div class="case-intro"><span class="section-num">01 / THE BRIEF</span><h2>项目任务与我的职责</h2><p>${esc(p.intro)}</p><span class="challenge-label">需要解决的问题</span><p>${esc(p.challenge)}</p></div><aside class="role-box"><span class="small-label">MY CONTRIBUTION</span><h3>${esc(p.role)}</h3><ul>${p.responsibilities.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="credit">${esc(p.credit)}</p></aside></section>
    <section class="case-section" id="${p.id}-strategy"><span class="section-num">02 / CONTENT THINKING</span><div class="section-heading"><h2>策划主线：先选择重点，再组织表达。</h2></div><div class="strategy-grid">${p.strategy.map((s,i)=>`<article><p class="eyebrow">0${i+1}</p><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p>${s.quote?`<blockquote class="quote">“${esc(s.quote)}”</blockquote>`:''}</article>`).join('')}</div></section>
    ${p.chapters.map((c,i)=>chapterSection(p,c,String(i+3).padStart(2,'0'))).join('')}${videoSection}
    <section class="case-section" id="${p.id}-outcome"><div class="outcome-block"><div><p class="eyebrow">PROJECT OUTCOME</p><strong>${esc(p.metric)}</strong><span class="outcome-label">${esc(p.metricLabel)}</span></div><div><p>${esc(p.outcome)}</p><small>${esc(p.metricNote)}</small></div></div><p class="historical-note">${p.id==='kugou'?'历史作品与截图按原貌展示。各项成果保留对应的平台、活动及统计范围；个人策划、统筹审核和团队制作职责分别说明。':'图文与视频保留历史作品中的传播表达；本页聚焦内容组织与策划方法。项目 GMV 为整体成果，未作单条内容或个人销售归因。策略说明依据已确认职责及现有作品整理。'}</p></section>
    <nav class="next-project" aria-label="更多项目"><a href="#/works">← 返回全部项目</a><a href="#/project/${next.id}"><span><small>下一个案例 / ${next.number}</small><strong>${esc(next.name)}</strong></span><span class="arrow" aria-hidden="true">↗</span></a></nav></div>`;
}

function route() {
  const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const isProject=parts[0]==='project';
  const isWireframes=parts[0]==='wireframes';
  const p=isProject?PROJECTS.find(p=>p.id===parts[1]):null;
  const view=isProject?(p?`project-${p.id}`:'missing'):isWireframes?'wireframes':'home';
  if(view!==currentView){
    document.querySelectorAll('video').forEach(v=>v.pause());
    if(viewer.open) closeViewer();
    main.innerHTML=view==='home'?home():isWireframes?wireframesPage():p?project(p):`<div class="container empty-state"><h1>没有找到这个项目</h1><p>可以回到项目目录继续浏览。</p><a class="button" href="#/works">查看全部项目 ↗</a></div>`;
    currentView=view;
  }
  document.title=p?`${p.name}｜孙岩萍作品集`:isWireframes?'海报内容结构与设计沟通｜孙岩萍作品集':'孙岩萍｜品牌与产品内容策划';
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(parts[0]||''))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const target=p&&parts[2]?document.getElementById(`${p.id}-${parts[2]}`):isWireframes&&parts[1]?document.getElementById(`wireframes-${parts[1]}`):view==='home'&&parts[0]?document.getElementById(parts[0]):null;
  requestAnimationFrame(()=>{
    if(target)target.scrollIntoView({behavior:'instant',block:'start'});else window.scrollTo({top:0,behavior:'instant'});
    main.focus({preventScroll:true});
  });
}

function closeViewer(){viewer.close();document.body.style.overflow='';if(lastImageButton?.isConnected)lastImageButton.focus({preventScroll:true});}
document.addEventListener('click',event=>{
  if(event.target.closest('.skip')){event.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({behavior:'instant'});return;}
  const imageButton=event.target.closest('[data-image]');
  if(imageButton){
    lastImageButton=imageButton;
    const im=document.getElementById('viewer-image');
    im.src=imageButton.dataset.image;im.alt=imageButton.dataset.caption;
    document.getElementById('image-title').textContent=imageButton.dataset.caption;
    document.getElementById('image-original').href=imageButton.dataset.image;
    viewer.showModal();document.body.style.overflow='hidden';document.querySelector('.viewer-scroll').scrollTop=0;
  }
  const routeLink=event.target.closest('a[href^="#/"]');
  if(routeLink&&routeLink.hash===location.hash){event.preventDefault();route();}
});
document.getElementById('viewer-close').addEventListener('click',closeViewer);
viewer.addEventListener('cancel',e=>{e.preventDefault();closeViewer();});
viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer();});
window.addEventListener('hashchange',route);
route();
