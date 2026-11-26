'use strict';
(() => {
  const D = window.GENERAL_PORTFOLIO;
  const V = window.PORTFOLIO_V3;
  const M = window.PORTFOLIO_MEDIA;
  const main = document.getElementById('main');
  const assetBase = document.body.dataset.assetBase || document.baseURI;
  const root = new URL('../../', assetBase);
  const dialog = document.getElementById('image-viewer');
  const stage = document.getElementById('viewer-stage');
  const fullImage = document.getElementById('viewer-image');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const plain = s => s.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/\*\*|`/g,'').trim();
  const slug = s => plain(s).toLowerCase().replace(/\s+/g,'-').replace(/[^\p{L}\p{N}_-]/gu,'');
  const standaloneProjects = new Map([
    ['xiaohongshu',{
      id:'xiaohongshu',name:'胶原炮面膜',category:'小红书达人种草',
      short:'围绕 30+ 女性的护理需求，策划并参与撰写场景种草与真人测评笔记。',
      cover:'assets/collagen/project-cover.png',width:1280,height:1707,alt:'原生密码胶原炮面膜的产品展示图'
    }],
    ['videochannel',{
      id:'videochannel',name:'逆时光颜研究院',category:'品牌科普视频号从 0 到 1',
      short:'负责科普号的内容定位、早期选题和原创脚本。',
      cover:'assets/videochannel-project-cover.png',width:1320,height:1468,alt:'逆时光颜研究院视频号主页'
    }]
  ]);
  const workOrder = [...V.order,...standaloneProjects.keys()];
  const listedProject = id => standaloneProjects.get(id) || V.cases[id];
  const project = id => standaloneProjects.get(id) || D.projects.find(p => p.id === id);
  const absolute = (raw, source) => new URL(raw, new URL(source, root));
  const relative = url => decodeURIComponent(url.pathname.slice(root.pathname.length));
  let currentKey = '', lastUrl = '', routeSequence = 0, restoreLock = false;
  let saveTimer, scrollFrame, lastTrigger, oldOverflow = '', imageScrollY = 0, zoom = 1, zoomMode = 'contain';
  history.scrollRestoration = 'manual';

  function destination(raw, source) {
    if (raw.startsWith('mailto:')) return {href:raw};
    if (/^https?:/.test(raw)) return {href:raw, external:true};
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return {href:'#/works'};
    if (raw.startsWith('#')) return {href:'#/home/selected'};
    const url=absolute(raw,source), rel=relative(url), fragment=decodeURIComponent(url.hash.slice(1));
    if(M.articles[rel]) return {href:M.articles[rel].url,external:true};
    if(M.videos[rel]) return {href:M.videos[rel].originalUrl||M.videos[rel].analysis,external:!!M.videos[rel].originalUrl};
    if(rel==='portfolio-resume.pdf') return {href:new URL('assets/resume.pdf?v=3.0.16',assetBase).href,external:true};
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
    const url=absolute(item.src,source),info=D.images[relative(url)]||{width:item.width,height:item.height};
    const preview=info.preview?new URL(info.preview,root).href:url.href;
    const fullUrl=options.originalSrc?new URL(options.originalSrc,root).href:url.href;
    const artworkType=/-(wireframe|finished)\./.exec(item.src)?.[1];
    const longPreview=options.caseId==='kugou'&&!options.hero&&info.height/info.width>2.4;
    const landscapePreview=!options.hero&&info.width/info.height>=1.35;
    const artworkLabel=artworkType&&!options.hideTypeLabel?`<p class="work-type-label">${artworkType==='wireframe'?'内容线稿':'设计成品'}</p>`:'';
    const group=/\/([^/]+)-wireframe\./.exec(item.src)?.[1];
    const id=group&&options.caseId?` id="${options.caseId}-wireframe-${esc(group)}" tabindex="-1"`:'';
    return `<figure${id} class="work-figure ${options.hero?'hero-work':''}${longPreview?' artwork-long-preview':''}${landscapePreview?' artwork-landscape':''}">${artworkLabel}<button type="button" class="image-open" data-full-src="${esc(fullUrl)}" data-caption="${esc(item.alt)}" aria-label="放大查看：${esc(item.alt)}"><img src="${esc(preview)}" alt="${esc(item.alt)}" ${info.width?`width="${info.width}" height="${info.height}"`:''} loading="${options.hero?'eager':'lazy'}" decoding="async"><span class="image-placeholder" hidden>图片暂时无法载入，可查看原图。</span></button><figcaption>${esc(item.alt)}</figcaption><a class="original-link" href="${esc(fullUrl)}" target="_blank" rel="noopener">查看原图 ↗</a></figure>`;
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
        return `<div class="poster-work">${figure(b.items[1],source,{caseId})}<details id="${caseId}-linework-${group}" class="supplementary poster-linework"${window.matchMedia('(min-width:761px)').matches?' open':''}><summary aria-label="查看文案与排版线稿"><span>内容线稿</span></summary><div class="supplement-body">${figure(b.items[0],source,{caseId,hideTypeLabel:true})}</div></details></div>`;
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
  function standaloneCover(c,alt=c.alt) {
    return `<img src="${esc(new URL(c.cover,document.baseURI).href)}" alt="${esc(alt)}" width="${c.width}" height="${c.height}" loading="lazy">`;
  }
  function projectArtwork(c) {
    if(standaloneProjects.has(c.id)) return `<div class="project-art art-editorial-cover">${standaloneCover(c)}</div>`;
    if(c===V.cases.oil) return `<div class="project-art art-oil art-editorial-cover"><img src="${esc(new URL('assets/oil-editorial-cover-v309.webp',assetBase).href)}" alt="日夜精华油：昼夜分护、仿生皮脂膜，日间与夜间双瓶组合" width="1448" height="1086" loading="lazy"><span class="art-label">${esc(c.number)} / ${esc(c.category)}</span></div>`;
    if(c===V.cases.kugou) return `<div class="project-art art-kugou art-kugou-cover art-editorial-cover"><img src="${esc(new URL('assets/kugou-platform-cover-v308.webp',assetBase).href)}" alt="酷狗音乐：微博、微信公众号、小红书、抖音多平台内容传播" width="1448" height="1086" loading="lazy"><span class="art-label">${esc(c.number)} / ${esc(c.category)}</span></div>`;
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
    const descriptions={mask:'升级卖点、达人脚本与直播讲解',sun:'产品卖点、销售话术与达人脚本',clean:'产品主张、海报文案与上新文章'};
    const c=listedProject(id);
    const cover=standaloneProjects.has(id)?standaloneCover(c,''):`<img src="${esc(asset(c.cover))}" alt="" width="100" height="110" loading="lazy">`;
    return `<a class="compact-project compact-${id}" href="#/project/${id}">${cover}<span class="compact-copy"><strong>${esc(c.name)}</strong><span>${esc(descriptions[id]||c.category)}</span></span><span class="project-arrow" aria-hidden="true">↗</span></a>`;
  }
  function contactBand() {
    return `<section class="contact-band" id="about-contact"><div><p class="eyebrow">LET’S MAKE GOOD CONTENT.</p><h2>下一次，让内容为你的品牌说话。</h2><p>求职方向：内容营销经理 / 内容团队组长 · 广州</p></div><div>${cta('mailto:beibiduo@163.com','邮件联系','contact-link')}<a href="assets/resume.pdf?v=3.0.16" target="_blank" rel="noopener">查看简历 PDF ↗</a></div></section>`;
  }
  function homePage() {
    const featured=['oil','kugou'];
    const otherWork=workOrder.filter(id=>!featured.includes(id));
    return `<div class="page-home home-direct"><section class="home-intro"><p class="intro-name">孙岩萍 · 作品集</p><h1>内容营销与<br class="mobile-break">新媒体运营</h1><p class="intro-description">9年以上经验，做过护肤品新品内容策划、酷狗音乐新媒体运营，并管理过两名专员。</p><p class="intro-target">求职方向：内容营销经理 / 内容团队组长 · 广州</p><div class="hero-actions">${cta('#/home/selected','查看作品')}${cta('assets/resume.pdf?v=3.0.16','查看简历','text-link')}</div></section><section class="selected-section" id="home-selected" tabindex="-1"><div class="section-heading"><h2>代表项目</h2></div><div class="featured-grid">${featured.map(featureCard).join('')}</div></section><section class="more-section"><div class="section-heading"><h2>其他作品</h2><a class="text-link" href="#/works">全部作品 <span aria-hidden="true">↗</span></a></div><div>${otherWork.map(compactProject).join('')}</div></section><section class="home-contact" id="about-contact"><div><h2>联系我</h2><p>求职方向：内容营销经理 / 内容团队组长</p></div><a href="mailto:beibiduo@163.com">beibiduo@163.com <span aria-hidden="true">↗</span></a></section></div>`;
  }

  const collagenNotes = {
    workplace: {
      author: '禾禾暖',
      audience: '30+ 职场女性',
      title: '从一次见客户的经历讲起',
      summary: '先写见客户时对年龄和状态的感受，再自然带到她日常怎么做护理。',
      file: 'collagen-note-hehe.webp',
      alt: '禾禾暖原笔记首图，展示职场人物和胶原炮面膜',
      metrics: '252 赞 · 148 收藏 · 36 评论',
      url: 'https://www.xiaohongshu.com/explore/6a1018d0000000003603013e'
    },
    home: {
      author: '七七年年',
      audience: '宝妈居家护理',
      title: '送完孩子，留点时间敷面膜',
      summary: '用送孩子上学后的空档开场，接着写回到家怎么安排白膜和金膜。',
      file: 'collagen-note-qiqi.webp',
      alt: '七七年年在家贴敷金膜的原笔记首图',
      metrics: '122 赞 · 79 收藏 · 14 评论',
      url: 'https://www.xiaohongshu.com/explore/6a1c111600000000350259b7'
    },
    review: {
      author: '圆圆宝团子',
      title: '白膜和金膜，敷起来哪里不同？',
      file: 'collagen-note-yuanyuan.webp',
      alt: '圆圆宝团子贴敷金膜的原笔记首图',
      metrics: '110 赞 · 86 收藏 · 39 评论',
      url: 'https://www.xiaohongshu.com/explore/6a0d8c6a0000000035020f91'
    }
  };
  const collagenRoute = '#/project/xiaohongshu';
  const collagenReader = '#/read/xiaohongshu-analysis';

  function collagenFigure({file, alt}, caption) {
    const image = new URL('new-media-portfolio/' + file, root).href;
    return `<figure class="collagen-figure">
      <button type="button" class="image-open" data-full-src="${esc(image)}" data-caption="${esc(caption)}" aria-label="放大查看 ${esc(caption)}">
        <img src="${esc(image)}" width="1080" height="1440" alt="${esc(alt)}" loading="lazy" decoding="async">
        <span class="image-placeholder" hidden>图片暂时无法载入。</span>
      </button>
    </figure>`;
  }

  function collagenSource(note) {
    return `<div class="collagen-source">
      <span>${esc(note.metrics)}</span>
      <a class="text-link" href="${esc(note.url)}" target="_blank" rel="noopener">查看原笔记</a>
    </div>`;
  }

  function collagenScene(note) {
    return `<article class="collagen-note">
      ${collagenFigure(note, note.author + '的笔记首图')}
      <div class="collagen-example-copy">
        <p class="eyebrow">${esc(note.audience)} · ${esc(note.author)}</p>
        <h3>${esc(note.title)}</h3>
        <p>${esc(note.summary)}</p>
        ${collagenSource(note)}
      </div>
    </article>`;
  }

  function collagenCasePage() {
    const {workplace, home, review} = collagenNotes;
    return `<article class="collagen-page">
      <div class="breadcrumb"><a href="#/works">← 全部作品</a></div>
      <div class="collagen-top" id="xiaohongshu-overview" tabindex="-1">
        <header>
          <p class="eyebrow">原生密码 · 小红书达人种草</p>
          <h1>胶原炮面膜</h1>
          <p class="collagen-lead">从生活场景切入，再把使用感受讲清楚。</p>
          <p class="collagen-role"><strong>我负责</strong>选题、达人 Brief、图文与视频脚本及初稿审核，并参与下方三篇笔记的撰写。</p>
          <div class="collagen-jump">${cta(collagenRoute + '/cases','查看成品笔记','text-link')}</div>
        </header>
        <section class="collagen-strategy" id="xiaohongshu-strategy" aria-labelledby="collagen-strategy-title" tabindex="-1">
          <h2 id="collagen-strategy-title">我的内容策略</h2>
          <dl>
            <div><dt>刷到时先有人群代入</dt><dd>面向 30+ 女性，从见客户、送孩子上学这类生活片段引出护理需求。</dd></div>
            <div><dt>搜到时先解决一个问题</dt><dd>围绕白膜和金膜的实际感受展开，让读者在购买前知道两种膜布用起来有什么区别。</dd></div>
          </dl>
        </section>
      </div>
      <section class="collagen-section" id="xiaohongshu-cases" aria-labelledby="collagen-scenes-title" tabindex="-1">
        <div class="collagen-section-title">
          <h2 id="collagen-scenes-title">不同人群的场景化代入</h2>
          <p class="caption">互动数据为 2026 年 11 月 25 日查阅记录</p>
        </div>
        <div class="collagen-scene-grid">
          ${collagenScene(workplace)}
          ${collagenScene(home)}
        </div>
      </section>
      <section class="collagen-section collagen-review" id="xiaohongshu-review" aria-labelledby="collagen-review-title" tabindex="-1">
        <div class="collagen-section-title"><h2 id="collagen-review-title">问题为导向真人测评</h2></div>
        <article class="collagen-review-note">
          <div class="collagen-pair">
            ${collagenFigure(review, '圆圆宝团子的贴敷原图')}
            ${collagenFigure({file:'collagen-note-yuanyuan-product.webp',alt:'圆圆宝团子手持胶原炮面膜包装的原笔记照片'}, '圆圆宝团子的产品实拍')}
          </div>
          <div class="collagen-example-copy">
            <p class="eyebrow">${esc(review.author)}</p>
            <h3>${esc(review.title)}</h3>
            <p>作者写到白膜敷着润，金膜按得太紧时感觉发热，揭膜后短暂泛红。</p>
            <p>评论里有人接着问金膜的发热感，以及揭膜后能否直接涂护肤品。</p>
            ${collagenSource(review)}
          </div>
        </article>
        <div class="collagen-jump">${cta(collagenReader,'查看选题与审稿复盘','text-link')}</div>
      </section>
      ${nextProjectNav('xiaohongshu','#/','← 返回作品集首页')}
    </article>`;
  }

  function collagenAnalysisPage() {
    return `<article class="collagen-page">
      <div class="breadcrumb"><a href="${collagenRoute}/cases">← 返回笔记案例</a></div>
      <h1>选题与审稿复盘</h1>
      <p class="collagen-lead">两篇场景稿各有一个具体开头，测评稿则把买前最想问的问题放在前面。</p>
      <section class="collagen-section collagen-analysis" aria-labelledby="collagen-analysis-title">
        <h2 id="collagen-analysis-title">我会怎么审这三篇稿</h2>
        <dl>
          <div><dt>禾禾暖 · 留下见客户这件事</dt><dd>一次见客户的经历让读者知道她在什么场合注意到了年龄和状态。护肤习惯顺着经历带出，开头保留人物自己的感受。</dd></div>
          <div><dt>七七年年 · 写清楚空档从哪来</dt><dd>把「孩子上学后」放在开头，读者能立刻代入自己的作息。后文接住这个场景，写她回家后怎么安排两种膜布。</dd></div>
          <div><dt>圆圆宝团子 · 把两种肤感分开讲</dt><dd>首图配合产品实拍帮助读者识别同款，正文分别交代白膜和金膜的感受。评论里的发热程度和后续护理，可以成为下篇稿要回答的问题。</dd></div>
        </dl>
      </section>
      <aside class="collagen-analysis-reference" aria-labelledby="collagen-reference-title">
        <p class="eyebrow">公开测评参考 · 帅姐不帅 Amber</p>
        <h2 id="collagen-reference-title">用栏目编号承接单品搜索</h2>
        <p>「面膜测评 Day 74」沿用固定栏目名，标题同时写明原生密码胶原炮，方便想了解这款面膜的人找到本期。</p>
        <a class="text-link" href="https://www.xiaohongshu.com/explore/67fc73d9000000001c033248" target="_blank" rel="noopener">查看原视频</a>
      </aside>
      <p class="collagen-back"><a class="text-link" href="${collagenRoute}/cases">← 返回笔记案例</a></p>
    </article>`;
  }

  const channelRoute = '#/project/videochannel';
  const channelScreenshots = {
    account:{file:'antiaging-channel-overview.webp',alt:'账号主页与留存数据',width:1960,height:1156},
    videos:{file:'antiaging-channel-videos.webp',alt:'账号公开视频的留存截图',width:1948,height:1060}
  };
  const channelSteps = [
    ['定定位','面向 30 岁以上女性，围绕女性励志和抗老做内容。'],
    ['找选题','调研视频号和抖音，整理适合讲成故事的人物和日常抗老问题。'],
    ['筛题试发','尝试不同题材。选题前先问，看完会发给谁，有什么值得存下来再看？'],
    ['写脚本','人物故事从有反差的画面讲起。科普先抛一个具体问题，再逐点回答。'],
    ['看反馈','参考单条视频的转发和收藏，决定下一轮继续试哪些题材。']
  ];
  function channelFigure({file,alt,width,height}) {
    const src=new URL('assets/'+file,document.baseURI).href;
    return figure({src,alt,width,height},'preview/v3/index.html');
  }
  function channelCasePage() {
    return `<article class="collagen-page channel-page">
      <div class="breadcrumb"><a href="#/works">← 全部作品</a></div>
      <header id="videochannel-overview" tabindex="-1">
        <p class="eyebrow">无添加主义 · 微信视频号</p><h1>逆时光颜研究院</h1>
        <p class="collagen-lead">从 0 到 1 搭建品牌科普号，为后续直播带货积累目标粉丝。</p>
        <p class="collagen-role"><strong>我负责</strong> 内容定位、早期选题与原创脚本。</p>
      </header>
      <section class="collagen-section channel-results" id="videochannel-results" aria-labelledby="channel-results-title" tabindex="-1">
        <div>
          <h2 id="channel-results-title">账号历史数据</h2>
          <div class="channel-metrics">
            <div class="metric-item"><strong>3.1 万+</strong><span>粉丝</span></div>
            <div class="metric-item"><strong>53</strong><span>条原创视频</span></div>
            <div class="metric-item"><strong>60 万+</strong><span>转发与收藏</span></div>
          </div>
          <p class="caption">账号累计数据，来源为留存资料。</p>
        </div>
        ${channelFigure(channelScreenshots.account)}
      </section>
      <section class="collagen-section" id="videochannel-sop" aria-labelledby="channel-strategy-title" tabindex="-1">
        <h2 id="channel-strategy-title">视频号起号 SOP</h2>
        <ol class="channel-steps">
          ${channelSteps.map(([title,description])=>`<li><strong>${esc(title)}</strong><p>${esc(description)}</p></li>`).join('')}
        </ol>
      </section>
      <section class="collagen-section" id="videochannel-cases" aria-labelledby="channel-case-title" tabindex="-1">
        <h2 id="channel-case-title">视频案例与分析</h2>
        <div class="channel-example">
          <div class="channel-example-copy">
            <p class="eyebrow">公开视频复盘 · 2025 年 12 月 10 日发布</p>
            <h3>平民妈妈击败亿万富豪</h3>
            <dl>
              <div><dt>选题</dt><dd>封面把普通妈妈和富豪放在一起，用身份和年龄的反差引出一个问题：普通人有哪些生活习惯可以借鉴？</dd></div>
              <div><dt>脚本</dt><dd>开头交代两个人的对照，再按生活习惯分段。画面上方的章节条让人知道后面会讲什么，也方便回找某一段。</dd></div>
            </dl>
            <p class="caption"><strong>分享 10 万+</strong> · 2026 年 11 月 19 日查阅<br>留存截图中显示 6.9 万。</p>
          </div>
          <div class="channel-video-figure">${channelFigure({...channelScreenshots.videos,alt:'「平民妈妈击败亿万富豪」原视频截图'})}</div>
        </div>
        <details class="supplementary channel-gallery" id="videochannel-gallery">
          <summary><span>查看更多视频截图</span></summary>
          <div class="supplement-body">${channelFigure(channelScreenshots.videos)}</div>
        </details>
      </section>
      <p class="collagen-back"><a class="text-link" href="#/">← 返回作品集首页</a></p>
    </article>`;
  }
  function workIndexCard(id) {
    const c=listedProject(id);
    const href='#/project/'+id;
    return `<article class="work-row">
      <a class="work-row-art" href="${href}" aria-label="查看${esc(c.name)}案例">${projectArtwork(c)}</a>
      <div class="work-row-copy">
        <p class="eyebrow">${c.number?esc(c.number)+' / ':''}${esc(c.category)}</p>
        <h2><a href="${href}">${esc(c.name)}<span aria-hidden="true">↗</span></a></h2>
        ${c.title?`<p class="work-row-title">${esc(c.title)}</p>`:''}
        <p>${esc(c.short)}</p>
        ${c.role?`<p class="caption">我的职责：${esc(c.role)} · ${esc(c.tags.join(' / '))}</p>`:''}
        ${cta(href,'查看完整案例','text-link')}
      </div>
    </article>`;
  }
  function nextProjectNav(id,backHref='#/works',backLabel='← 全部作品') {
    const next=workOrder[(workOrder.indexOf(id)+1)%workOrder.length];
    return `<nav class="next-project" aria-label="继续浏览"><a class="text-link" href="${backHref}">${backLabel}</a><a href="#/project/${next}"><span>下一个案例</span><strong>${esc(listedProject(next).name)} <span aria-hidden="true">↗</span></strong></a></nav>`;
  }
  function worksPage() {
    return `<section class="page-works"><p class="eyebrow">PROJECT INDEX</p><div class="section-heading"><h1>从产品价值，<br>到用户参与。</h1><p>产品内容策略、升级沟通、<br>平台运营与团队协作。</p></div><div class="work-index">${workOrder.map(workIndexCard).join('')}</div></section>${contactBand()}`;
  }
  function aboutPage() {
    const jobs=[['2024.03—2026.09','广州无添加主义化妆品有限公司','企划（产品内容方向）','负责护肤品产品内容与新品上市传播，完成卖点、长图文、内容结构与视频脚本，协同产品、研发、设计、运营与销售推进交付。'],['2019.06—2024.01','广州酷狗计算机科技有限公司','新媒体运营经理','独立负责微博内容与活动，管理两名专员，统筹多平台内容审核；推动公众号定位调整、视频号从0到1运营与客户端引流合作。'],['2018.02—2019.04','China Marketing Development Center 首尔分部','新媒体运营','参与韩国品牌在中国市场的本地化内容、线上推广及小红书种草项目执行。'],['2017.01—2018.01','上海沪江网教育技术有限公司','新媒体编辑','围绕韩语学习需求、活动及课程推广组织新媒体内容与表达。']];
    return `<article class="page-about"><section class="about-hero"><p class="eyebrow">ABOUT & APPROACH</p><h1>讲清产品价值，<br>也推动内容走到用户面前。</h1><div class="about-lead"><p class="about-label">孙岩萍<br><span>产品内容营销 / 内容策略 / 团队协作</span></p><div><p>9年以上内容策划与新媒体运营经验，经历从品牌本地化、音乐平台运营，延伸到护肤品新品内容与上市传播。</p><p>在护肤品项目中，我负责卖点、内容主线、文案与视频脚本；在酷狗音乐，我独立负责微博内容与活动，管理两名专员，并统筹其他平台内容与脚本审核。</p><a class="text-link" href="assets/resume.pdf?v=3.0.16" target="_blank" rel="noopener">查看完整简历 ↗</a></div></div></section><section class="about-section"><div class="section-heading"><div><p class="eyebrow">MY CONTRIBUTION</p><h2>把专业判断，落实到具体交付。</h2></div></div><div class="about-principles"><article><span class="index">01.</span><h3>选择这一轮的沟通重点</h3><p>精华油先建立共同特点与日夜角色；防晒兼顾价格解释和肤感顾虑；升级产品需要承接已有认知。</p></article><article><span class="index">02.</span><h3>根据触点调整信息与讲述</h3><p>从海报、公众号、人物视频到详情页和销售沟通，为不同形式安排合适的任务与信息层级。</p></article><article><span class="index">03.</span><h3>通过分工推进内容</h3><p>独立撰写与统筹审核分别说明，对接设计、达人及内部团队；在酷狗承担两名专员的管理与内容审核。</p></article></div></section><section class="about-section"><p class="eyebrow">EXPERIENCE</p><h2>工作经历</h2><div class="timeline">${jobs.map(j=>`<article><p class="job-date">${j[0]}</p><div><h3>${j[1]}</h3><p class="job-role">${j[2]}</p><p>${j[3]}</p></div></article>`).join('')}</div></section><section class="education"><div><p class="eyebrow">EDUCATION & LANGUAGE</p><h2>教育与语言</h2></div><div><p>釜山大学 · 对外韩语教育硕士 · 2015—2017<br>三江学院 · 国际旅游管理本科 · 2010—2014</p><p>韩国语 TOPIK 6级<br>日常使用 ChatGPT、Gemini 辅助资料整理、选题与脚本优化。</p></div></section></article>${contactBand()}`;
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
    return `<div class="case-page case-oil product-direct"><div class="breadcrumb"><a href="#/works">← 全部作品</a><span>产品内容策划 / 文案</span></div><section class="case-hero" id="oil-overview" data-top-chapter tabindex="-1"><div class="case-hero-copy"><p class="project-type">新品上市内容策划 · ${esc(c.period)}</p><h1>日夜精华油</h1><p class="hero-summary">我用「表补油，里补精华」统一两款产品的表达。海报讲清日夜卖点，公众号解释早晚怎么选，达人视频示范具体用法。</p><div class="product-role-summary" id="oil-collaboration" tabindex="-1"><p><strong>我负责</strong><span>卖点提炼、海报文案与信息层级、公众号文章、视频脚本。</span></p><p class="product-team-note"><strong>合作分工</strong><span>设计师负责视觉；相关团队负责产品方案、拍摄、剪辑及商务。</span></p></div></div><div class="case-hero-visual">${figure(parts[0].blocks.find(b=>b.kind==='images').items[0],p.source,{hero:true})}</div></section><div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>本案目录</p>${links}${topButton}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>日夜精华油</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目介绍</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}${topButton}</nav></div><article class="case-main"><div id="oil-story" class="story-group" data-top-chapter tabindex="-1"><section class="case-section" id="oil-wireframes" tabindex="-1"><h2>海报文案与信息层级</h2><div id="oil-strategy" tabindex="-1">${renderBlocks(parts[1].blocks,p.source,'oil')}</div>${renderBlocks(parts[2].blocks,p.source,'oil')}</section><section class="case-section" id="oil-article" tabindex="-1"><h2>公众号上新文章</h2>${renderBlocks(parts[3].blocks,p.source,'oil')}</section><section class="case-section" id="oil-videos" tabindex="-1"><span id="oil-more-videos" tabindex="-1"></span><h2>视频脚本</h2><p>我负责脚本撰写，并结合人物风格与发布要求调整表达。</p><div class="product-video-list">${videos.map(([file,description])=>videoCard('portfolio-content/essence-oil/assets/videos/'+file,description)).join('')}</div><div class="product-script-links"><a class="text-link" href="#/read/6a7ad141f475">查看视频脚本分析 <span aria-hidden="true">↗</span></a><a class="text-link" href="#/read/6a7ad141f475/${encodeURIComponent('以皮脂膜为核心的品牌科普脚本')}">品牌科普脚本分析 <span aria-hidden="true">↗</span></a></div></section></div><section class="case-section outcome" id="oil-outcome" data-top-chapter tabindex="-1"><h2>项目结果</h2><div class="result-panel"><div class="result-metrics">${metricDisplay(c)}</div><p>日夜精华油产品及套组上新首月，私域 GMV 460万+。为团队及渠道整体成绩。</p></div></section><section class="case-section complete-works" id="oil-complete" data-top-chapter tabindex="-1"><h2>更多作品</h2>${extraGroups.map((group,i)=>`<details id="oil-more-${extras[i]}" class="supplementary"><summary><span>${inline(group.title,p.source)}</span></summary><div class="supplement-body">${renderBlocks(group.blocks,p.source,'oil')}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`).join('')}</section></article></div>${nextProjectNav('oil')}</div>`;
  }
  function productCasePage(id) {
    const c=V.cases[id],p=D.pages[id],parts=sections(p),hero=parts.shift(),complete=parts.pop();parts.pop();
    const layout=p.presentation;
    const links=[['overview','项目介绍'],['story','作品展示'],['outcome','项目结果'],['complete','更多作品']].map(([key,label])=>`<a href="#/project/${id}/${key}" data-chapter="${id}-${key}">${label}</a>`).join('');
    const topButton='<button type="button" class="back-to-top" data-back-to-top>↑ 返回顶部</button>';
    const heroImage={src:asset(c.cover),alt:c.name+'代表作品'};
    return `<div class="case-page case-${id} product-direct"><div class="breadcrumb"><a href="#/works">← 全部作品</a><span>${esc(c.role)}</span></div><section class="case-hero" id="${id}-overview" data-top-chapter tabindex="-1"><div class="case-hero-copy"><p class="project-type">${esc(c.category)}${c.period==='新品上市项目'?'':' · '+esc(c.period)}</p><h1>${esc(c.name)}</h1><p class="hero-summary">${esc(c.summary)}</p><div class="product-role-summary" id="${id}-collaboration" tabindex="-1"><p><strong>我负责</strong><span>${esc(c.responsibilities)}</span></p></div></div><div class="case-hero-visual">${figure(heroImage,p.source,{hero:true,originalSrc:c.originalCover})}</div></section><div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>本案目录</p>${links}${topButton}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>${esc(c.name)}</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目介绍</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}${topButton}</nav></div><article class="case-main"><div id="${id}-story" class="story-group" data-top-chapter tabindex="-1">${parts.map((section,i)=>{const key=layout.sections[i];const aliases=Object.entries(layout.aliases).filter(([,target])=>target===key).map(([alias])=>`<span id="${id}-${alias}" tabindex="-1"></span>`).join('');return `<section class="case-section" id="${id}-${key}" tabindex="-1">${aliases}<h2>${inline(section.title,p.source)}</h2>${renderBlocks(section.blocks,p.source,id)}</section>`;}).join('')}</div><section class="case-section outcome" id="${id}-outcome" data-top-chapter tabindex="-1"><h2>项目结果</h2><div class="result-panel"><div class="result-metrics">${metricDisplay(c)}</div><p>${esc(c.result)}</p></div></section><section class="case-section complete-works" id="${id}-complete" data-top-chapter tabindex="-1"><h2>更多作品</h2>${cards(complete.blocks).map((group,i)=>`<details id="${id}-more-${layout.extras[i]}" class="supplementary"><summary><span>${inline(group.title,p.source)}</span></summary><div class="supplement-body">${renderBlocks(group.blocks,p.source,id)}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`).join('')}</section></article></div>${nextProjectNav(id)}</div>`;
  }
  function kugouDisplayBlocks(blocks) {
    const at=blocks.findIndex(b=>b.kind==='metrics');
    if(at<0)return blocks;
    const metrics=[blocks[at]];
    if(blocks[at+1]?.kind==='paragraph'&&blocks[at+1].text.includes('radio-growth-stats.png'))metrics.push(blocks[at+1]);
    const remaining=blocks.filter(b=>!metrics.includes(b));
    const quoteAt=remaining.findIndex(b=>b.kind==='quote');
    remaining.splice(quoteAt<0?remaining.length:quoteAt,0,...metrics);
    return remaining;
  }
  function casePage(id) {
    if(id==='xiaohongshu')return collagenCasePage();
    if(id==='videochannel')return channelCasePage();
    if(D.pages[id].presentation)return productCasePage(id);
    if(id==='oil')return oilCasePage();
    const c=V.cases[id],p=D.pages[id],ss=sections(p),hero=ss.shift(),complete=ss.pop();ss.pop();
    const labels=id==='kugou'?['项目概览','增长与内容案例','团队与资源协同','结果与方法','完整作品']:['项目概览','关键判断与作品','协作与交付','结果与方法','完整作品'];
    const keys=['overview','story','collaboration','outcome','complete'];
    const links=keys.map((key,i)=>`<a href="#/project/${id}/${key}" data-chapter="${id}-${key}">${labels[i]}</a>`).join('');
    const image=hero.blocks.find(b=>b.kind==='images');
    const heroImage=id==='kugou'?{src:asset('portfolio-content/kugou/assets/weibo/fatang-rules.jpg'),alt:image.items[0].alt}:c.originalCover?{src:asset(c.cover),alt:c.name+'代表作品'}:image?.items[0];
    const topButton='<button type="button" class="back-to-top" data-back-to-top>↑ 返回顶部</button>';
    let html=`<div class="case-page case-${id}${id==='kugou'?' product-direct kugou-direct':''}"><div class="breadcrumb"><a href="#/works">← 全部作品</a><span>CASE ${c.number} / 05</span></div><section class="case-hero" id="${id}-overview" data-top-chapter tabindex="-1"><div class="case-hero-copy"><p class="project-type">${esc(c.category)} · ${esc(c.period)}</p><h1>${esc(c.name)}</h1><p class="kugou-subtitle">${esc(c.title)}</p><div class="product-role-summary"><p><strong>我负责</strong><span>${esc(c.summary)}</span></p><p class="kugou-position">${esc(c.role)}</p></div><div class="hero-metrics">${metricDisplay(c)}</div><p class="metric-note">${esc(c.metricNote)}</p></div><div class="case-hero-visual">${heroImage?figure(heroImage,p.source,{hero:true,originalSrc:c.originalCover}):''}<p class="caption preview-note">局部预览，点击查看完整长图。</p></div></section><div class="case-layout"><nav class="case-nav" aria-label="本案目录"><p>IN THIS PROJECT</p>${links}${topButton}<a class="all-works" href="#/works">全部作品 ↗</a></nav><div class="case-bar"><span>${esc(c.name)}</span><button type="button" id="chapter-toggle" aria-expanded="false" aria-controls="mobile-chapters"><span id="chapter-current">项目概览</span><span aria-hidden="true">⌄</span></button><nav id="mobile-chapters" aria-label="本案章节" hidden>${links}${topButton}</nav></div><article class="case-main"><div class="case-brief"><p class="eyebrow">THE CONTENT CHALLENGE</p><h2>${esc(c.question)}</h2><p>${esc(c.brief)}</p><div class="key-decisions">${c.decisions.map((d,i)=>`<article><span class="index">0${i+1}.</span><h3>${esc(d[0])}</h3><p>${esc(d[1])}</p></article>`).join('')}</div></div><div id="${id}-story" class="story-group" data-top-chapter tabindex="-1"><div class="story-label"><p class="eyebrow">01 / THINKING INTO WORK</p><p>把判断，放回具体作品。</p></div>`;
    ss.forEach((section,i)=>{html+=`<section class="case-section" id="${id}-${storyIds[id][i]}" tabindex="-1"><h2>${inline(section.title,p.source)}</h2>${renderBlocks(id==='kugou'?kugouDisplayBlocks(section.blocks):section.blocks,p.source,id)}</section>`;});
    html+=`</div><section class="case-section collaboration" id="${id}-collaboration" data-top-chapter tabindex="-1"><p class="eyebrow">02 / COLLABORATION & DELIVERY</p><h2>${id==='kugou'?'管理两名专员，也连接跨团队资源。':'让内容主线，通过分工走向交付。'}</h2><div class="responsibility-table">${c.team.map(t=>`<div><h3>${esc(t[0])}</h3><p>${esc(t[1])}</p></div>`).join('')}</div><p class="delivery-note">${esc(c.delivery)}</p></section><section class="case-section outcome" id="${id}-outcome" data-top-chapter tabindex="-1"><p class="eyebrow">03 / RESULTS & APPROACH</p><h2>项目结果与方法沉淀</h2><div class="result-panel"><div class="result-metrics">${metricDisplay(c)}</div><p>${esc(c.result)}</p></div><div class="takeaway"><span>从作品中提炼的方法</span><p>${esc(c.takeaway)}</p></div></section><section class="case-section complete-works" id="${id}-complete" data-top-chapter tabindex="-1"><p class="eyebrow">04 / EXPLORE THE DETAILS</p><h2>完整作品与补充阅读</h2><p class="complete-intro">按关注点展开更多图文、视频脚本与结构分析。</p>`;
    const start=complete.blocks.findIndex(b=>b.kind==='heading'&&b.level===4),groups=cards(complete.blocks.slice(start)),tail=[];
    groups.forEach((g,i)=>{
      const body=g.blocks.filter(b=>{if(b.kind==='paragraph'&&/^(?:继续查看：|图文及成片按历史|作品中的技术|图文中的配方)/.test(b.text)){tail.push(b);return false;}return true;});
      const images=body.filter(b=>b.kind==='images').reduce((n,b)=>n+b.items.length,0),movies=body.reduce((n,b)=>n+(b.text?.match(/\.mp4\)/g)||[]).length,0);
      const meta=[images?`${images} 幅图`:'',movies?`${movies} 组视频脚本`:''].filter(Boolean).join(' · ')||'文字资料';
      html+=`<details id="${id}-more-${extraIds[id][i]}" class="supplementary"><summary><span>${inline(g.title,p.source)}</span><span class="detail-meta">${meta}</span></summary><div class="supplement-body">${renderBlocks(body,p.source,id)}<button type="button" class="collapse-detail">收起本组 ↑</button></div></details>`;
    });
    html+=`<div class="case-notes">${renderBlocks(tail.filter(b=>!b.text.startsWith('继续查看：')),p.source,id)}</div></section></article></div>`;
    return html+nextProjectNav(id)+'</div>';
  }
  function materialPage(key) {
    if(key==='xiaohongshu-analysis')return collagenAnalysisPage();
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
    return document.getElementById(`${id}-${maps[id]?.[chapter]||'wireframe-'+chapter}`)||document.getElementById(id+'-overview');
  }
  function applyRoute(restore=false) {
    const sequence=++routeSequence;lastUrl=location.href;let parts;
    try{parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);}catch{parts=['missing'];}
    if(parts[0]==='works'&&standaloneProjects.has(parts[1])){
      history.replaceState(history.state,'','#/project/'+parts[1]);
      return applyRoute(restore);
    }
    if(parts[0]==='read'&&parts[1]==='videochannel-analysis'){
      history.replaceState(history.state,'',channelRoute+'/cases');
      return applyRoute(restore);
    }
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
    document.title=(page.startsWith('case:')?project(parts[1]).name:page==='read:xiaohongshu-analysis'?'胶原炮面膜笔记解析':page==='about'?'关于我':page==='works'?'全部作品':'作品集')+'｜孙岩萍 · 作品集 3.0';
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
  function setZoom(value,mode='manual') {
    if(!fullImage.naturalWidth)return;
    const padding=getComputedStyle(stage);
    const width=Math.max(1,stage.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight));
    const height=Math.max(1,stage.clientHeight-parseFloat(padding.paddingTop)-parseFloat(padding.paddingBottom));
    zoom=mode==='contain'?Math.min(1,width/fullImage.naturalWidth,height/fullImage.naturalHeight):mode==='width'?Math.min(1,width/fullImage.naturalWidth):Math.min(4,Math.max(.1,value));
    zoomMode=mode;
    stage.classList.toggle('viewer-overview',mode==='contain');
    fullImage.style.width=Math.max(1,Math.floor(fullImage.naturalWidth*zoom))+'px';
    fullImage.hidden=false;
    document.getElementById('zoom-value').textContent=Math.round(zoom*100)+'%';
    document.getElementById('zoom-fit').setAttribute('aria-pressed',String(mode==='contain'));
    document.getElementById('zoom-width').setAttribute('aria-pressed',String(mode==='width'));
    document.getElementById('zoom-actual').setAttribute('aria-pressed',String(mode==='manual'&&zoom===1));
    if(mode!=='manual')stage.scrollTo(0,0);
  }
  function openImage(button){
    lastTrigger=button;document.getElementById('viewer-title').textContent=button.dataset.caption;document.getElementById('viewer-original').href=button.dataset.fullSrc;
    document.getElementById('viewer-error').hidden=true;fullImage.hidden=true;fullImage.alt=button.dataset.caption;fullImage.src=button.dataset.fullSrc;
    imageScrollY=window.scrollY;oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();stage.scrollTo(0,0);document.getElementById('viewer-close').focus();
    if(fullImage.complete&&fullImage.naturalWidth)setZoom(1,'contain');
  }
  fullImage.addEventListener('load',()=>setZoom(1,'contain'));
  fullImage.addEventListener('error',()=>{fullImage.hidden=true;document.getElementById('viewer-error').hidden=false;});
  document.getElementById('viewer-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;window.scrollTo(0,imageScrollY);if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
  document.getElementById('zoom-in').addEventListener('click',()=>setZoom(zoom*1.3));
  document.getElementById('zoom-out').addEventListener('click',()=>setZoom(zoom/1.3));
  document.getElementById('zoom-fit').addEventListener('click',()=>setZoom(1,'contain'));
  document.getElementById('zoom-width').addEventListener('click',()=>setZoom(1,'width'));
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
  window.addEventListener('resize',()=>{closeMenu();updateChapter();if(dialog.open&&zoomMode!=='manual')setZoom(1,zoomMode);});
  main.addEventListener('toggle',()=>{if(!restoreLock){updateChapter();remember();}},true);
  window.addEventListener('popstate',()=>applyRoute(true));
  window.addEventListener('hashchange',()=>{if(location.href!==lastUrl)applyRoute(false);});
  window.addEventListener('pagehide',remember);
  applyRoute(false);
})();

