'use strict';
const main = document.getElementById('main');
const viewer = document.getElementById('image-viewer');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PREVIEWS = {"portfolio-content/essence-oil/assets/posters/oil-product.png": "portfolio-previews/oil.webp", "portfolio-sunscreen-product-original.png": "portfolio-previews/sun.webp", "portfolio-mask-product-original.png": "portfolio-previews/mask.webp", "portfolio-content/cleanser/assets/posters/cleanser-main.jpg": "portfolio-previews/clean.webp", "portfolio-content/kugou/assets/weibo/fatang-rules.jpg": "portfolio-previews/kugou.webp"};
const preview = src => PREVIEWS[src] || src;
const flow = items => `<div class="flow">${items.map((s,i) => `${i?'<i aria-hidden="true">→</i>':''}<span>${esc(s)}</span>`).join('')}</div>`;
let currentView = '';
let lastImageButton = null;

// Homepage emphasis describes demonstrated capabilities, rather than past job titles.
const HOME_PROJECTS = {
  oil: {focus:'复杂产品 · 内容主线',title:'日夜精华油：为双产品建立一条主线',summary:'从皮脂膜护理切入，串联“精华入油”与日夜场景，统一公众号、朋友圈、视频与销售沟通的表达。'},
  sun: {focus:'高价产品 · 价值沟通',title:'高客单防晒：让护理价值成为购买理由',summary:'围绕高端抗老定位，以精华护理解释价值、以轻薄肤感回应顾虑，并用图文、话术和视频承接同一主线。'},
  mask: {focus:'产品升级 · 复杂信息梳理',title:'童颜面膜：在旧品认知上讲清升级价值',summary:'承接王牌产品认知，梳理新增卖点、双膜组合与使用步骤，将升级理由延展到图文、视频、直播话术与详情页。'},
  kugou: {focus:'团队协作 · 平台与资源统筹',title:'酷狗音乐：从内容策划到多平台协同',summary:'独立负责微博内容与活动，管理两名专员并统筹内容审核；协调产品与 APP 运营资源，连接客户端拉新与促活。'}
};

function projectCard(p) {
  const home = HOME_PROJECTS[p.id];
  return `<a class="project-card card-${p.id}" href="#/project/${p.id}" aria-label="查看${esc(p.name)}案例">
    <div class="card-art"><img src="${preview(p.cover)}" alt="${esc(p.coverNote)}历史作品" loading="lazy" width="800" height="552"><div class="card-topline"><span>${p.number} / ${esc(p.category)}</span></div><span class="card-arrow" aria-hidden="true">↗</span></div>
    <div class="card-info"><div class="card-meta"><span>${esc(home.focus)}</span><span>CASE ${p.number}</span></div><h3>${esc(home.title)}</h3><p>${esc(home.summary)}</p><div class="card-result"><strong>${esc(p.metric)}</strong><span>${esc(p.metricLabel)}</span></div></div>
  </a>`;
}

function home() {
  const featured = ['oil','sun','mask','kugou'].map(id=>PROJECTS.find(p=>p.id===id));
  const clean = PROJECTS.find(p=>p.id==='clean');
  return `<div class="container">
    <section class="home-hero positioning-hero" aria-labelledby="home-title">
      <div class="hero-copy"><p class="eyebrow">CONTENT, WITH A REASON. <span> / 2026</span></p><p class="hero-person"><b>我是孙岩萍</b> · 内容策划作品集</p><h1 id="home-title">把产品价值，<br>写成<em>选择理由。</em></h1><p class="lead">从护肤品新品内容到酷狗音乐的平台实践，<br class="desktop-break">围绕产品价值组织内容，协同团队推进落地。</p><ul class="hero-capabilities" aria-label="核心工作经历"><li><strong>护肤品产品内容策划</strong><span>卖点提炼 · 内容主线 · 文案与视频脚本</span></li><li><strong>多渠道内容统筹</strong><span>公众号、朋友圈、详情页、视频与销售沟通</span></li><li><strong>团队协作</strong><span>酷狗管理两名专员，协同设计、产品与 APP 运营</span></li></ul><div class="hero-actions"><a class="button" href="#/works">浏览四个重点案例 <span aria-hidden="true">↘</span></a><a class="text-link" href="#/about">了解我的工作方式 ↗</a></div></div>
      <div class="hero-art" aria-label="日夜精华油与童颜面膜代表作品"><div class="hero-art-top"><b>SELECTED WORK</b><span>PRODUCT → CONTENT</span></div><div class="hero-art-images"><img class="hero-art-main" src="portfolio-previews/oil.webp" alt="日夜精华油历史产品海报" width="740" height="820" fetchpriority="high"><img class="hero-art-small" src="portfolio-previews/mask.webp" alt="童颜面膜产品作品" width="340" height="380"></div><div class="hero-art-bottom"><span>从一个卖点，到一组完整的内容。</span><span>01 — 05</span></div></div>
    </section>
    <div class="expertise-strip positioning-strip" aria-label="案例关注的问题"><span>What I solve</span><span>高价产品的价值沟通</span><i>／</i><span>复杂产品的内容主线</span><i>／</i><span>团队与平台协同</span></div>
    <section id="works" class="work-section positioning-work" aria-labelledby="work-title"><div class="section-heading"><div><p class="eyebrow">01 / SELECTED PROJECTS</p><h2 id="work-title">四个重点案例，<br>展开不同的策划判断。</h2></div><p>精华油、防晒、童颜面膜与酷狗音乐，<br>从产品价值到内容落地与团队协同。</p></div><div class="work-grid featured-projects">${featured.map(projectCard).join('')}</div><a class="supporting-project" href="#/project/clean" aria-label="查看逆时光洁颜霜案例"><div class="supporting-project-art"><img src="${preview(clean.cover)}" alt="逆时光洁颜霜历史海报" loading="lazy" width="300" height="220"></div><div class="supporting-project-copy"><span class="eyebrow">补充案例 / PRODUCT COPY</span><h3>逆时光洁颜霜：把清洁力与肤感讲清楚</h3><p>通过上新长文、系列海报和线稿对照，展示产品卖点、信息层级与文案表达。</p></div><span class="supporting-project-link">查看案例 <span aria-hidden="true">↗</span></span></a><p class="work-note">护肤品 GMV 为团队与渠道共同完成的项目销售结果。酷狗引流为拉新及促活口径；具体统计范围见各案例说明。</p></section>
    ${wireframeTeaser()}
    <section id="about" class="about-section" aria-labelledby="about-title"><p class="eyebrow">03 / ABOUT & APPROACH</p><div class="about-layout"><div><h2 id="about-title" class="about-lead">讲清产品价值，<br>也推动内容走到用户面前。</h2><span class="about-label">产品内容策划 × 多渠道统筹 × 团队协作</span></div><div class="about-copy"><p>在护肤品项目中，我负责产品卖点、文案、内容结构与视频脚本，建立新品或产品升级的沟通主线，并根据公众号、朋友圈、详情页、视频与销售沟通的任务组织表达，与设计师及达人协作完成作品。</p><p>在酷狗音乐，我独立负责微博内容与活动，管理两名专员，统筹其他平台的内容及脚本审核。在客户端引流项目中，我提出资源合作思路，协调产品与 APP 运营团队，策划用户参与机制。</p><a class="text-link" href="mailto:beibiduo@163.com">关于品牌／产品内容岗位，欢迎联系 ↗</a></div></div><div class="method-grid"><div><span>01.</span><h3>建立产品主线</h3><p>从产品资料和购买顾虑中选择沟通重点，让成分、技术与使用场景围绕同一个价值展开。</p></div><div><span>02.</span><h3>安排渠道任务</h3><p>让长文解释完整价值、海报突出一个理由、话术回应疑问、视频呈现人物与使用场景。</p></div><div><span>03.</span><h3>协同内容落地</h3><p>对接设计、达人及平台资源；在酷狗管理两名专员，统筹内容与脚本审核，推进跨团队合作。</p></div></div></section>
  </div><section id="contact" class="contact-section"><div><span>LET'S MAKE GOOD CONTENT.</span><h2>下一次，让内容为你的品牌说话。</h2></div><a href="mailto:beibiduo@163.com">beibiduo@163.com <span>↗</span></a></section>`;
}

function imageGallery(images) {
  if (!images.length) return '';
  return `<div class="image-grid ${images.length===2?'two':''}">${images.map(im => `<figure><button type="button" class="image-button" data-image="${esc(im.src)}" data-caption="${esc(im.title)}" aria-label="放大查看：${esc(im.title)}"><img src="${preview(im.src)}" alt="${esc(im.title)}" loading="lazy" decoding="async"><span class="expand" aria-hidden="true">查看原作 ↗</span></button><figcaption>${esc(im.title)}${im.note?`<small>${esc(im.note)}</small>`:''}</figcaption></figure>`).join('')}</div>`;
}

function chapterSection(p, c, number) {
  if(c.kind==='wireframes') return projectWireframes(p,number);
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
  if(parts[0]==='wireframes'){location.replace('#/project/sun/wireframes'+(parts[1]?'/'+parts[1]:''));return;}
  const isProject=parts[0]==='project';
  const p=isProject?PROJECTS.find(p=>p.id===parts[1]):null;
  const view=isProject?(p?`project-${p.id}`:'missing'):'home';
  if(view!==currentView){
    document.querySelectorAll('video').forEach(v=>v.pause());
    if(viewer.open) closeViewer();
    main.innerHTML=view==='home'?home():p?project(p):`<div class="container empty-state"><h1>没有找到这个项目</h1><p>可以回到项目目录继续浏览。</p><a class="button" href="#/works">查看全部项目 ↗</a></div>`;
    currentView=view;
  }
  document.title=p?`${p.name}｜孙岩萍作品集`:'孙岩萍｜品牌与产品内容策划';
  document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(parts[0]||''))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const detailTarget=p&&parts[2]==='wireframes'&&parts[3]?document.getElementById(`${p.id}-wireframe-${parts[3]}`):null;
  if(detailTarget?.closest('details')) detailTarget.closest('details').open=true;
  const target=detailTarget||(p&&parts[2]?document.getElementById(`${p.id}-${parts[2]}`):view==='home'&&parts[0]?document.getElementById(parts[0]):null);
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
