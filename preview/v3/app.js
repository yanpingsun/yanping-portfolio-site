'use strict';
(() => {
  const D = window.GENERAL_PORTFOLIO;
  const V = window.PORTFOLIO_V3;
  const M = window.PORTFOLIO_MEDIA;
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
    if(M.articles[rel]) return {href:M.articles[rel].url,external:true};
    if(M.videos[rel]) return {href:M.videos[rel].originalUrl||M.videos[rel].analysis,external:!!M.videos[rel].originalUrl};
    if(rel==='portfolio-resume.pdf') return {href:new URL('assets/resume.pdf?v=3.0.13',document.baseURI).href,external:true};
    const directoryRoutes={
      'portfolio-content/tongyan-mask/assets/detail':'#/project/mask/more-detail',
      'portfolio-content/tongyan-mask/assets/moments':'#/project/mask/more-moments',
      'portfolio-content/tongyan-mask/assets/video-stills':'#/project/mask/more-videos',
      'portfolio-content/tongyan-mask/assets/videos':'#/project/mask/more-videos',
      'portfolio-content/tongyan-mask/assets/wechat':'#/project/mask/article'
    };
    if(directoryRoutes[rel.replace(/\/$/,'')]) return {href:directoryRoutes[rel.replace(/\/$/,'')]};
    if(rel==='portfolio-content/tongyan-mask/docs/detail-case.md') return {href:'#/read/'+D.material_paths['portfolio-content/tongyan-mask/docs/detail-analysis.md']};
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
        const originalArticle=!/^[a-z]+:/i.test(parts[2])&&M.articles[relative(absolute(parts[2],source))];
        result+=`<a href="${esc(to.href)}"${to.external?' target="_blank" rel="noopener"':''}>${esc(originalArticle?'阅读公众号原文':parts[1])}${to.external?' <span aria-label="新标签打开">↗</span>':''}</a>`;
      }
      at=token.lastIndex;
    }
    return result+esc(text.slice(at));
  }

  function figure(item,source,options={}) {
    const url=absolute(item.src,source),info=D.images[relative(url)]||{};
    const preview=info.preview?new URL(info.preview,root).href:url.href;
    const fullUrl=options.originalSrc?new URL(options.originalSrc,root).href:url.href;
    const artworkType=/-(wireframe|finished)\./.exec(item.src)?.[1];
    const artworkLabel=artworkType?`<p class="work-type-label">${artworkType==='wireframe'?'内容线稿':'设计成品'}</p>`:'';
    const group=/\/([^/]+)-wireframe\./.exec(item.src)?.[1];
    const id=group&&options.caseId?` id="${options.caseId}-wireframe-${esc(group)}" tabindex="-1"`:'';
    return `<figure${id} class="work-figure ${options.hero?'hero-work':''}">${artworkLabel}<button type="button" class="image-open" data-full-src="${esc(fullUrl)}" data-caption="${esc(item.alt)}" aria-label="放大查看：${esc(item.alt)}"><img src="${esc(preview)}" alt="${esc(item.alt)}" ${info.width?`width="${info.width}" height="${info.height}"`:''} loading="${options.hero?'eager':'lazy'}" decoding="async"><span class="image-placeholder" hidden>图片暂时无法载入，可查看原图。</span></button><figcaption>${esc(item.alt)}</figcaption><a class="original-link" href="${esc(fullUrl)}" target="_blank" rel="noopener">查看原图 ↗</a></figure>`;
  }

  function videoCard(path, description='') {
    const v=M.videos[path];
    if(!v||v.verification==='user_reported_removed')return '';
    const poster=new URL(v.poster,root).href,caption=`${V.cases[v.project].name} · ${v.title}${v.title.endsWith('视频')?'封面':'视频封面'}`;
    const image=`<img src="${esc(poster)}" alt="${esc(caption)}" width="${v.posterWidth||400}" height="${v.posterHeight||400}" loading="lazy">`;
    const cover=v.originalUrl?`<a class="video-cover" href="${esc(v.originalUrl)}" target="_blank" rel="noopener" aria-label="观看原视频：${esc(v.title)}">${image}</a>`:`<div class="video-cover">${image}</div>`;
    return `<article class="video-link-card video-${esc(v.project)}" data-video-path="${esc(path)}"><div class="video-visual">${cover}<button type="button" class="image-open video-poster-zoom" data-full-src="${esc(poster)}" data-caption="${esc(caption)}" aria-label="放大封面：${esc(v.title)}">放大封面 <span aria-hidden="true">↗</span></button></div><div class="video-link-copy">${description?`<h3>${esc(v.title)}</h3><p class="video-description">${esc(description)}</p>`:`<p class="video-kind">${esc(v.kind)}</p><h4>${esc(v.title)}</h4><p>${esc(V.cases[v.project].name)} · 视频脚本策划</p>`}<div class="video-link-actions">${v.originalUrl?`<a class="button video-watch" href="${esc(v.originalUrl)}" target="_blank" rel="noopener">观看原视频 <span aria-hidden="true">↗</span></a>`:''}<a class="text-link" href="${esc(v.analysis)}">查看脚本分析 <span aria-hidden="true">↗</span></a></div></div></article>`;
  }

  function block(b,source,caseId='') {
    if(b.kind==='video')return videoCard(b.path,b.description);
    if(b.kind==='metrics')return `<div class="work-metric-set"><div class="work-metrics">${b.items.map(item=>`<div class="metric-item"><strong>${esc(item.value)}<small>${esc(item.unit)}</small></strong><span>${esc(item.label)}</span></div>`).join('')}</div><p class="caption">${esc(b.note)}</p></div>`;
    if(b.kind==='paragraph') {
      const movies=[...b.text.matchAll(/\[([^\]]+)\]\(([^)]+\.mp4)\)/g)];
      if(movies.length) return '<div class="video-links-grid">'+movies.map(m=>videoCard(relative(absolute(m[2],source)))).join('')+'</div>';
      const claim=/^\*\*((?:原作主张|历史原作|历史主张)：)(.*?)\*\*(.*)$/.exec(b.text);
      if(claim) return `<p class="claim"><span class="claim-label">${esc(claim[1])}</span><strong>${esc(claim[2])}</strong></p>${claim[3]?'<p>'+inline(claim[3].trim(),source)+'</p>':''}`;
      return '<p>'+inline(b.text,source)+'</p>';
    }
    if(b.kind==='heading') {const n=Math.min(5,Math.max(2,b.level-1));return `<h${n}>${inline(b.text,source)}</h${n}>`;}
    if(b.kind==='images') {
      const pair=b.items.length===2&&b.items[0].src.includes('-wireframe.');
      if(pair&&['oil','mask','sun','clean'].includes(caseId)){
        const group=/\/([^/]+)-wireframe\./.exec(b.items[0].src)[1];
        return `<div class="poster-work">${figure(b.items[1],source,{caseId})}<details id="${caseId}-linework-${group}" class="supplementary poster-linework"${window.matchMedia('(min-width:761px)').matches?' open':''}><summary><span>查看文案与排版线稿</span></summary><div class="supplement-body">${figure(b.items[0],source,{caseId})}</div></details></div>`;
      }
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

  const asset = path => new URL(path,root).href;
  const cta = (href,label,kind='button') => `<a class="${kind}" href="${href}"${/\.pdf(?:[?#]|$)/.test(href)?' target="_blank" rel="noopener"':''}>${label}<span aria-hidden="true">↗</span></a>`;
  function projectArtwork(c) {
    if(c===V.cases.oil) return `<div class="project-art art-oil art-editorial-cover"><img src="${esc(new URL('assets/oil-editorial-cover-v309.webp',document.baseURI).href)}" alt="日夜精华油：昼夜分护、仿生皮脂膜，日间与夜间双瓶组合" width="1448" height="1086" loading="lazy"><span class="art-label">${esc(c.number)} / ${esc(c.category)}</span></div>`;
    if(c===V.cases.kugou) return `<div class="project-art art-kugou art-kugou-cover art-editorial-cover"><img src="${esc(new URL('assets/kugou-platform-cover-v308.webp',document.baseURI).href)}" alt="酷狗音乐：微博、微信公众号、小红书、抖音多平台内容传播" width="1448" height="1086" loading="lazy"><span class="art-label">${esc(c.number)} / ${esc(c.category)}</span></div>`;
    return `<div class="project-art ${c===V.cases.mask?'art-mask':''}"><img src="${esc(asset(c.cover))}" alt="${esc(c.name)}代表作品" width="560" height="380" loading="lazy"><span class="art-label">${esc(c.number)} / ${esc(c.category)}</span></div>`;
  }
  function featureCard(id) {
    const c=V.cases[id];
    const info=id==='oil'?{
      title:'新品上市内容策划',
      work:'卖点提炼、海报文案与信息层级、公众号文章、视频脚本。',
      result:'上新首月私域 GMV 460万+ · 团队及渠道整体成绩',
      pictures:[['portfolio-content/skincare-wireframes/essence-oil/day-finished.jpg','日间透亮油海报'],['portfolio-content/skincare-wireframes/essence-oil/night-finished.jpg','夜间精华油海报']]
    }:{
      title:'新媒体运营与团队管理',
      work:'独立策划微博内容与活动，管理两名专员，统筹其他平台内容审核。',
      result:'整体引流项目累计 256万人次 · 拉新 21万名纯新增用户',
      pictures:[['portfolio-content/kugou/assets/weibo/fatang-rules.jpg','胖汪发糖机活动页面'],['portfolio-content/kugou/assets/douyin/concert-collection.png','演唱会音效内容合集']]
    };
    return `<article class="feature-card feature-${id}"><div class="feature-heading"><h3><a href="#/project/${id}">${esc(c.name)}<span aria-hidden="true">↗</span></a></h3><p class="project-type">${esc(info.title)}</p></div><a class="feature-image-link" href="#/project/${id}" aria-label="查看${esc(c.name)}案例"><div class="work-samples samples-${id}">${info.pictures.map(([path,label])=>`<img src="${esc(asset(path))}" alt="${esc(label)}" loading="lazy">`).join('')}</div></a><div class="feature-copy"><p class="feature-work">${esc(info.work)}</p><p class="feature-result">${esc(info.result)}</p><a class="text-link" href="#/project/${id}">查看案例 <span aria-hidden="true">↗</span></a></div></article>`;
  }
  function compactProject(id) {
    const c=V.cases[id];
    return `<a class="compact-project ${id==='mask'?'compact-mask':''}" href="#/project/${id}"><span class="project-index">${c.number}</span><img src="${esc(asset(c.cover))}" alt="" width="100" height="110" loading="lazy"><span class="compact-copy"><span class="eyebrow">${esc(c.category)}</span><strong>${esc(c.name)}</strong><span>${esc(c.short)}</span></span><span class="project-arrow" aria-hidden="true">↗</span></a>`;
  }
  function contactBand() {
    return `<section class="contact-band" id="about-contact"><div><p class="eyebrow">LET’S MAKE GOOD CONTENT.</p><h2>下一次，让内容为你的品牌说话。</h2><p>求职方向：内容营销经理 / 内容团队组长 · 广州</p></div><div>${cta('mailto:beibiduo@163.com','邮件联系','contact-link')}<a href="assets/resume.pdf?v=3.0.13" target="_blank" rel="noopener">查看简历 PDF ↗</a></div></section>`;
  }
  function homePage() {
    const otherWork={mask:'升级卖点、达人脚本与直播讲解',sun:'产品卖点、销售话术与达人脚本',clean:'产品主张、海报文案与上新文章'};
    return `<div class="page-home home-direct"><section class="home-intro"><p class="intro-name">孙岩萍 · 作品集</p><h1>内容营销与<br class="mobile-break">新媒体运营</h1><p class="intro-description">9年以上经验，做过护肤品新品内容策划、酷狗音乐新媒体运营，并管理过两名专员。</p><p class="intro-target">求职方向：内容营销经理 / 内容团队组长 · 广州</p><div class="hero-actions">${cta('#/home/selected','查看作品')}${cta('assets/resume.pdf?v=3.0.13','查看简历','text-link')}</div></section><section class="selected-section" id="home-selected" tabindex="-1"><div class="section-heading"><h2>代表项目</h2></div><div class="featured-grid">${featureCard('oil')}${featureCard('kugou')}</div></section><section class="more-section"><div class="section-heading"><h2>其他作品</h2><a class="text-link" href="#/works">全部作品 <span aria-hidden="true">↗</span></a></div><div>${['mask','sun','clean'].map(id=>{const c=V.cases[id];return `<a class="compact-project compact-${id}" href="#/project/${id}"><img src="${esc(asset(c.cover))}" alt="" width="100" height="110" loading="lazy"><span class="compact-copy"><strong>${esc(c.name)}</strong><span>${esc(otherWork[id])}</span></span><span class="project-arrow" aria-hidden="true">↗</span></a>`;}).join('')}</div></section><section class="home-contact" id="about-contact"><div><h2>联系我</h2><p>求职方向：内容营销经理 / 内容团队组长</p></div><a href="mailto:beibiduo@163.com">beibiduo@163.com <span aria-hidden="true">↗</span></a></section></div>`;
  }
  function worksPage() {
    return `<section class="page-works"><p class="eyebrow">PROJECT INDEX / 05</p><div class="section-heading"><h1>从产品价值，<br>到用户参与。</h1><p>产品内容策略、升级沟通、<br>平台运营与团队协作。</p></div><div class="work-index">${V.order.map(id=>{const c=V.cases[id];return `<article class="work-row"><a class="work-row-art" href="#/project/${id}" aria-label="查看${esc(c.name)}案例">${projectArtwork(c)}</a><div class="work-row-copy"><p class="eyebrow">${c.number} / ${esc(c.category)}</p><h2><a href="#/project/${id}">${esc(c.name)}<span aria-hidden="true">↗</span></a></h2><p class="work-row-title">${esc(c.title)}</p><p>${esc(c.short)}</p><p class="caption">我的职责：${esc(c.role)} · ${esc(c.tags.join(' / '))}</p>${cta('#/project/'+id,'查看完整案例','text-link')}</div></article>`;}).join('')}</div></section>${contactBand()}`;
  }
  function aboutPage() {
    const jobs=[['2024.03—2026.09','广州无添加主义化妆品有限公司','企划（产品内容方向）','负责护肤品产品内容与新品上市传播，完成卖点、长图文、内容结构与视频脚本，协同产品、研发、设计、运营与销售推进交付。'],['2019.06—2024.01','广州酷狗计算机科技有限公司','新媒体运营经理','独立负责微博内容与活动，管理两名专员，统筹多平台内容审核；推动公众号定位调整、视频号从0到1运营与客户端引流合作。'],['2018.02—2019.04','China Marketing Development Center 首尔分部','新媒体运营','参与韩国品牌在中国市场的本地化内容、线上推广及小红书种草项目执行。'],['2017.01—2018.01','上海沪江网教育技术有限公司','新媒体编辑','围绕韩语学习需求、活动及课程推广组织新媒体内容与表达。']];
    return `<article class="page-about"><section class="about-hero"><p class="eyebrow">ABOUT & APPROACH</p><h1>讲清产品价值，<br>也推动内容走到用户面前。</h1><div class="about-lead"><p class="about-label">孙岩萍<br><span>产品内容营销 / 内容策略 / 团队协作</span></p><div><p>9年以上内容策划与新媒体运营经验，经历从品牌本地化、音乐平台运营，延伸到护肤品新品内容与上市传播。</p><p>在护肤品项目中，我负责卖点、内容主线、文案与视频脚本；在酷狗音乐，我独立负责微博内容与活动，管理两名专员，并统筹其他平台内容与脚本审核。</p><a class="text-link" href="assets/resume.pdf?v=3.0.13" target="_blank" rel="noopener">查看完整简历 ↗</a></div></div></section><section class="about-section"><div class="section-heading"><div><p class="eyebrow">MY CONTRIBUTION</p><h2>把专业判断，落实到具体交付。</h2></div></div><div class="about-principles"><article><span class="index">01.</span><h3>选择这一轮的沟通重点</h3><p>精华油先建立共同特点与日夜角色；防晒兼顾价格解释和肤感顾虑；升级产品需要承接已有认知。</p></article><article><span class="index">02.</span><h3>根据触点调整信息与讲述</h3><p>从海报、公众号、人物视频到详情页和销售沟通，为不同形式安排合适的任务与信息层级。</p></article><article><span class="index">03.</span><h3>通过分工推进内容</h3><p>独立撰写与统筹审核分别说明，对接设计、达人及内部团队；在酷狗承担两名专员的管理与内容审核。</p></article></div></section><section class="about-section"><p class="eyebrow">EXPERIENCE</p><h2>工作经历</h2><div class="timeline">${jobs.map(j=>`<article><p class="job-date">${j[0]}</p><div><h3>${j[1]}</h3><p class="job-role">${j[2]}</p><p>${j[3]}</p></div></article>`).join('')}</div></section><section class="education"><div><p class="eyebrow">EDUCATION & LANGUAGE</p><h2>教育与语言</h2></div><div><p>釜山大学 · 对外韩语教育硕士 · 2015—2017<br>三江学院 · 国际旅游管理本科 · 2010—2014</p><p>韩国语 TOPIK 6级<br>日常使用 ChatGPT、Gemini 辅助资料整理、选题与脚本优化。</p></div></section></article>${contactBand()}`;
  }

  const storyIds={oil:['strategy','wireframes','article','videos'],kugou:['growth','sound','radio'],sun:['sales','wireframes','article','videos'],mask:['strategy','wireframes','article','videos','live'],clean:['strategy','works']};
  const extraIds={oil:['data','article','moments','videos'],kugou:['social','social-audio','function','wechat','videochannel','radio'],sun:['posters','moments','detail','videos'],mask:['posters','moments','videos','detail'],clean:['ingredients','texture','works']};
  function metricDisplay(c) {
    return `<div class="metric-item"><strong>${esc(c.metric)}${c.metricUnit?`<small>${esc(c.metricUnit)}</small>`:''}</strong><span>${esc(c.metricLabel)}</span></div>${c.secondaryMetric?`<div class="metric-item secondary"><strong>${esc(c.secondaryMetric)}<small>${esc(c.secondaryUnit)}</small></strong><span>${esc(c.secondaryLabel)}</span></div>`:''}`;
  }
  function oilCasePage() {
    const c=V.cases.oil,p=D.pages.oil,parts=sections(p);
    const links=[['overview','项目介绍'],['story','作品展示'],['outcome','项目结果'],['complete','更多作品']].map(([key,label])=>`<a href="#/project/oil/${key}" data-chapter="oil-${key}">${label}</a>`).join('');
    const topButton='<button type="button" class="back-to-top" data-back-to-top>↑ 返回顶部</button>';
    const extraGroups=cards(parts.at(-1).blocks),extras=['data','article','moments'];
    const videos=[
      ['oil-influencer-qa.mp4','从护肤疑问切入，解释日夜两款产品的区别与使用场景。'],
      ['oil-liuxiaoqing.mp4','结合人物口吻与熟龄护理话题，介绍产品特点和使用方式。'],
      ['oil-tutorial.mp4','将使用方法写成口播与动作说明，方便拍摄和演示。']
    ];
    return `<div class="case-page case-oil product-direct"><div class="breadcrumb"><a href="#/works">← 全部作品</a><span>产品内容策划 / 文案</span></div><section class="case-hero" id="oil-overview" data-top-chapter tabindex="-1"><div class="case-hero-copy"><p class="project-type">新品上市内容策划 · ${esc(c.period)}</p><h1>日夜精华油</h1><p class="hero-summary">为日用、夜用两款精华油策划上市内容，说明产品特点、日夜区别与使用方法。</p><div class="product-role-summary" id="oil-collaboration" tabindex="-1"><p><strong>我负责</strong><span>卖点提炼、海报文案与信息层级、公众号文章、视频脚本。</span></p><p class="product-team-note"><strong>合作分工</strong><span>设计师负责视觉；相关团队负责产品方案、拍摄、剪辑及商务。</span></p></div></div><div class="case-hero-visual">${figure(parts[0].blocks.find(b=>b.kind==='images').items[0],p.source,{hero:true})}</div></section><div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>本案目录</p>${links}${topButton}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>日夜精华油</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目介绍</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}${topButton}</nav></div><article class="case-main"><div id="oil-story" class="story-group" data-top-chapter tabindex="-1"><section class="case-section" id="oil-wireframes" tabindex="-1"><h2>海报文案与信息层级</h2><div id="oil-strategy" tabindex="-1">${renderBlocks(parts[1].blocks,p.source,'oil')}</div>${renderBlocks(parts[2].blocks,p.source,'oil')}</section><section class="case-section" id="oil-article" tabindex="-1"><h2>公众号上新文章</h2>${renderBlocks(parts[3].blocks,p.source,'oil')}</section><section class="case-section" id="oil-videos" tabindex="-1"><span id="oil-more-videos" tabindex="-1"></span><h2>视频脚本</h2><p>我负责脚本撰写，并结合人物风格与发布要求调整表达。</p><div class="product-video-list">${videos.map(([file,description])=>videoCard('portfolio-content/essence-oil/assets/videos/'+file,description)).join('')}</div><div class="product-script-links"><a class="text-link" href="#/read/6a7ad141f475">查看视频脚本分析 <span aria-hidden="true">↗</span></a><a class="text-link" href="#/read/6a7ad141f475/${encodeURIComponent('以皮脂膜为核心的品牌科普脚本')}">品牌科普脚本分析 <span aria-hidden="true">↗</span></a></div></section></div><section class="case-section outcome" id="oil-outcome" data-top-chapter tabindex="-1"><h2>项目结果</h2><div class="result-panel"><div class="result-metrics">${metricDisplay(c)}</div><p>日夜精华油产品及套组上新首月，私域 GMV 460万+。为团队及渠道整体成绩。</p></div></section><section class="case-section complete-works" id="oil-complete" data-top-chapter tabindex="-1"><h2>更多作品</h2>${extraGroups.map((group,i)=>`<details id="oil-more-${extras[i]}" class="supplementary"><summary><span>${inline(group.title,p.source)}</span></summary><div class="supplement-body">${renderBlocks(group.blocks,p.source,'oil')}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`).join('')}</section></article></div><nav class="next-project" aria-label="继续浏览"><a class="text-link" href="#/works">← 全部作品</a><a href="#/project/kugou"><span>下一个案例</span><strong>酷狗音乐 <span aria-hidden="true">↗</span></strong></a></nav></div>`;
  }
  function productCasePage(id) {
    const c=V.cases[id],p=D.pages[id],parts=sections(p),hero=parts.shift(),complete=parts.pop();parts.pop();
    const layout=p.presentation;
    const links=[['overview','项目介绍'],['story','作品展示'],['outcome','项目结果'],['complete','更多作品']].map(([key,label])=>`<a href="#/project/${id}/${key}" data-chapter="${id}-${key}">${label}</a>`).join('');
    const topButton='<button type="button" class="back-to-top" data-back-to-top>↑ 返回顶部</button>';
    const heroImage={src:asset(c.cover),alt:c.name+'代表作品'};
    const nextId=V.order[(V.order.indexOf(id)+1)%V.order.length];
    return `<div class="case-page case-${id} product-direct"><div class="breadcrumb"><a href="#/works">← 全部作品</a><span>${esc(c.role)}</span></div><section class="case-hero" id="${id}-overview" data-top-chapter tabindex="-1"><div class="case-hero-copy"><p class="project-type">${esc(c.category)}${c.period==='新品上市项目'?'':' · '+esc(c.period)}</p><h1>${esc(c.name)}</h1><p class="hero-summary">${esc(c.summary)}</p><div class="product-role-summary" id="${id}-collaboration" tabindex="-1"><p><strong>我负责</strong><span>${esc(c.responsibilities)}</span></p></div></div><div class="case-hero-visual">${figure(heroImage,p.source,{hero:true,originalSrc:c.originalCover})}</div></section><div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>本案目录</p>${links}${topButton}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>${esc(c.name)}</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目介绍</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}${topButton}</nav></div><article class="case-main"><div id="${id}-story" class="story-group" data-top-chapter tabindex="-1">${parts.map((section,i)=>{const key=layout.sections[i];const aliases=Object.entries(layout.aliases).filter(([,target])=>target===key).map(([alias])=>`<span id="${id}-${alias}" tabindex="-1"></span>`).join('');return `<section class="case-section" id="${id}-${key}" tabindex="-1">${aliases}<h2>${inline(section.title,p.source)}</h2>${renderBlocks(section.blocks,p.source,id)}</section>`;}).join('')}</div><section class="case-section outcome" id="${id}-outcome" data-top-chapter tabindex="-1"><h2>项目结果</h2><div class="result-panel"><div class="result-metrics">${metricDisplay(c)}</div><p>${esc(c.result)}</p></div></section><section class="case-section complete-works" id="${id}-complete" data-top-chapter tabindex="-1"><h2>更多作品</h2>${cards(complete.blocks).map((group,i)=>`<details id="${id}-more-${layout.extras[i]}" class="supplementary"><summary><span>${inline(group.title,p.source)}</span></summary><div class="supplement-body">${renderBlocks(group.blocks,p.source,id)}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`).join('')}</section></article></div><nav class="next-project" aria-label="继续浏览"><a class="text-link" href="#/works">← 全部作品</a><a href="#/project/${nextId}"><span>下一个案例</span><strong>${esc(V.cases[nextId].name)} <span aria-hidden="true">↗</span></strong></a></nav></div>`;
  }
  function casePage(id) {
    if(D.pages[id].presentation)return productCasePage(id);
    if(id==='oil')return oilCasePage();
    const c=V.cases[id],p=D.pages[id],ss=sections(p),hero=ss.shift(),complete=ss.pop();ss.pop();
    const labels=id==='kugou'?['项目概览','增长与内容案例','团队与资源协同','结果与方法','完整作品']:['项目概览','关键判断与作品','协作与交付','结果与方法','完整作品'];
    const keys=['overview','story','collaboration','outcome','complete'];
    const links=keys.map((key,i)=>`<a href="#/project/${id}/${key}" data-chapter="${id}-${key}">${labels[i]}</a>`).join('');
    const image=hero.blocks.find(b=>b.kind==='images');
    const heroImage=c.originalCover?{src:asset(c.cover),alt:c.name+'代表作品'}:image?.items[0];
    const topButton='<button type="button" class="back-to-top" data-back-to-top>↑ 返回顶部</button>';
    let html=`<div class="case-page case-${id}"><div class="breadcrumb"><a href="#/works">← 全部作品</a><span>CASE ${c.number} / 05</span></div><section class="case-hero" id="${id}-overview" data-top-chapter tabindex="-1"><div class="case-hero-copy"><p class="eyebrow">${esc(c.name)} / ${esc(c.category)}</p><h1>${esc(c.title).replace('，','，<br>')}</h1><p class="hero-summary">${esc(c.summary)}</p><div class="case-role"><span>我的职责</span><strong>${esc(c.role)}</strong><span>${esc(c.period)}</span></div><div class="hero-metrics">${metricDisplay(c)}</div><p class="metric-note">${esc(c.metricNote)}</p></div><div class="case-hero-visual">${heroImage?figure(heroImage,p.source,{hero:true,originalSrc:c.originalCover}):''}</div></section><div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>IN THIS PROJECT</p>${links}${topButton}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>${esc(c.name)}</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目概览</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}${topButton}</nav></div><article class="case-main"><div class="case-brief"><p class="eyebrow">THE CONTENT CHALLENGE</p><h2>${esc(c.question)}</h2><p>${esc(c.brief)}</p><div class="key-decisions">${c.decisions.map((d,i)=>`<article><span class="index">0${i+1}.</span><h3>${esc(d[0])}</h3><p>${esc(d[1])}</p></article>`).join('')}</div></div><div id="${id}-story" class="story-group" data-top-chapter tabindex="-1"><div class="story-label"><p class="eyebrow">01 / THINKING INTO WORK</p><p>把判断，放回具体作品。</p></div>`;
    ss.forEach((section,i)=>{html+=`<section class="case-section" id="${id}-${storyIds[id][i]}" tabindex="-1"><h2>${inline(section.title,p.source)}</h2>${renderBlocks(section.blocks,p.source,id)}</section>`;});
    html+=`</div><section class="case-section collaboration" id="${id}-collaboration" data-top-chapter tabindex="-1"><p class="eyebrow">02 / COLLABORATION & DELIVERY</p><h2>${id==='kugou'?'管理两名专员，也连接跨团队资源。':'让内容主线，通过分工走向交付。'}</h2><div class="responsibility-table">${c.team.map(t=>`<div><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p></div>`).join('')}</div><p class="delivery-note">${esc(c.delivery)}</p></section><section class="case-section outcome" id="${id}-outcome" data-top-chapter tabindex="-1"><p class="eyebrow">03 / RESULTS & APPROACH</p><h2>项目结果与方法沉淀</h2><div class="result-panel"><div class="result-metrics">${metricDisplay(c)}</div><p>${esc(c.result)}</p></div><div class="takeaway"><span>从作品中提炼的方法</span><p>${esc(c.takeaway)}</p></div></section><section class="case-section complete-works" id="${id}-complete" data-top-chapter tabindex="-1"><p class="eyebrow">04 / EXPLORE THE DETAILS</p><h2>完整作品与补充阅读</h2><p class="complete-intro">按关注点展开更多图文、视频脚本与结构分析。</p>`;
    const start=complete.blocks.findIndex(b=>b.kind==='heading'&&b.level===4),groups=cards(complete.blocks.slice(start)),tail=[];
    groups.forEach((g,i)=>{
      const body=g.blocks.filter(b=>{if(b.kind==='paragraph'&&/^(?:继续查看：|图文及成片按历史|作品中的技术|图文中的配方)/.test(b.text)){tail.push(b);return false;}return true;});
      const images=body.filter(b=>b.kind==='images').reduce((n,b)=>n+b.items.length,0),movies=body.reduce((n,b)=>n+(b.text?.match(/\.mp4\)/g)||[]).length,0);
      const meta=[images?`${images} 幅图`:'',movies?`${movies} 组视频脚本`:''].filter(Boolean).join(' · ')||'文字资料';
      html+=`<details id="${id}-more-${extraIds[id][i]}" class="supplementary"><summary><span>${inline(g.title,p.source)}</span><span class="detail-meta">${meta}</span></summary><div class="supplement-body">${renderBlocks(body,p.source,id)}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`;
    });
    html+=`<div class="case-notes">${renderBlocks(tail.filter(b=>!b.text.startsWith('继续查看：')),p.source,id)}</div></section></article></div>`;
    const next=V.cases[V.order[(V.order.indexOf(id)+1)%V.order.length]];
    return html+`<nav class="next-project" aria-label="继续浏览"><a class="text-link" href="#/works">← 全部作品</a><a href="#/project/${V.order[(V.order.indexOf(id)+1)%V.order.length]}"><span>下一个案例</span><strong>${esc(next.name)} <span aria-hidden="true">↗</span></strong></a></nav></div>`;
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
    if(parts[0]==='read'&&parts[2]){
      const requested=slug(parts[2]),anchor=D.reader_anchor_aliases?.[parts[1]]?.[requested]||requested;
      return [...main.querySelectorAll('[data-anchor]')].find(n=>n.dataset.anchor===anchor);
    }
    if(parts[0]!=='project'||!project(parts[1])||!parts[2])return null;
    const id=parts[1],chapter=parts[2],group=parts[3];
    if(group&&['wireframes','wireframes-extra'].includes(chapter))return document.getElementById(`${id}-wireframe-${group}`);
    const direct=document.getElementById(`${id}-${chapter}`);if(direct)return direct;
    const maps={oil:{intro:'overview',moments:'more-moments',sales:'collaboration'},sun:{intro:'overview',strategy:'wireframes',article:'videos',moments:'more-moments',detail:'more-detail'},mask:{intro:'overview',moments:'strategy',article:'wireframes',detail:'more-detail',sales:'collaboration'},clean:{intro:'overview',wireframes:'strategy','wireframes-extra':'more-ingredients'},kugou:{intro:'overview',social:'more-social',function:'more-function',wechat:'more-wechat',videochannel:'more-videochannel'}};
    return document.getElementById(`${id}-${maps[id][chapter]||'wireframe-'+chapter}`)||document.getElementById(id+'-overview');
  }
  function applyRoute(restore=false) {
    const sequence=++routeSequence;lastUrl=location.href;let parts;
    try{parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);}catch{parts=['missing'];}
    const removedReaders={'fc642c9578b4':'oil','edb6365be578':'mask'};
    if(parts[0]==='read'&&removedReaders[parts[1]]){history.replaceState(history.state,'','#/project/'+removedReaders[parts[1]]+'/collaboration');return applyRoute(restore);}
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
    }
    document.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===(page==='about'?'about':page==='works'||page.startsWith('case:')?'works':''))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.title=(page.startsWith('case:')?project(parts[1]).name:page==='about'?'关于我':page==='works'?'全部作品':'作品集')+'｜孙岩萍 · 作品集 3.0';
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
    const image=event.target.closest('button.image-open');if(image){openImage(image);return;}
    if(event.target.closest('.skip-link')){event.preventDefault();main.focus();return;}
    const toggle=event.target.closest('#chapter-toggle');
    if(toggle){const menu=document.getElementById('mobile-chapters'),open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)menu.querySelector('a').focus({preventScroll:true});return;}
    if(event.target.closest('[data-back-to-top]')){
      closeMenu();remember();const id=currentKey.split(':')[1];
      history.replaceState({...history.state,scrollY:0},'','#/project/'+id);lastUrl=location.href;
      window.scrollTo({top:0,behavior:'auto'});const title=main.querySelector('h1');
      if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
      updateChapter();remember();return;
    }
    const collapse=event.target.closest('.collapse-detail');
    if(collapse){const d=collapse.closest('details');d.open=false;d.querySelector('summary').focus({preventScroll:true});d.scrollIntoView({block:'nearest'});remember();return;}
    if(event.target.closest('[data-return-to]')){history.back();return;}
    if(!event.target.closest('.case-bar'))closeMenu();
    const a=event.target.closest('a[href]');
    if(a&&a.getAttribute('href').startsWith('#/')&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey&&event.button===0){event.preventDefault();navigate(a.getAttribute('href'));}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!dialog.open)closeMenu(true);});
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{updateChapter();scrollFrame=null;});clearTimeout(saveTimer);saveTimer=setTimeout(remember,120);},{passive:true});
  window.addEventListener('resize',()=>{closeMenu();updateChapter();if(dialog.open)setZoom(1,true);});
  main.addEventListener('toggle',()=>{if(!restoreLock){updateChapter();remember();}},true);
  window.addEventListener('popstate',()=>applyRoute(true));
  window.addEventListener('hashchange',()=>{if(location.href!==lastUrl)applyRoute(false);});
  window.addEventListener('pagehide',remember);
  applyRoute(false);
})();
