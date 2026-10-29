'use strict';
const WIREFRAME_BASE = 'portfolio-content/skincare-wireframes/sunscreen/';
const WIREFRAME_CASES = [
  {
    id: 'launch', number: '01', name: '新品预热', pdfPage: 2,
    title: '先让新品被注意，再给出值得关注的信息。',
    task: '围绕“即将上新”建立新品记忆，给私域介绍与朋友圈种草提供预热素材。',
    structure: '标题集中呈现新品状态与高端联想，产品剪影保留悬念；数字、成分、使用感与技术词围绕主视觉，形成可继续展开的信息线索。',
    comparison: '简版线稿将标题、产品占位和卖点分区；成品通过剪影、明暗与字号进一步建立主次。文案与内容线稿由我负责，视觉表现由设计师完成。',
    points: ['标题：先传达“即将上新”', '主视觉：产品剪影形成识别', '辅助信息：给后续介绍留下话题']
  },
  {
    id: 'value', number: '02', name: '养肤价值', pdfPage: 1,
    title: '用总主张与分项信息，讲清养肤方向。',
    task: '将产品的养肤定位拆成可快速阅读的利益点，支持一对一介绍与朋友圈种草。',
    structure: '先用总标题建立产品定位，再将透亮、细腻、嘭弹与滑嫩分项呈现。保留“使用4周”和“受试者自评体验”的限定，让数字与所描述的感受对应。',
    comparison: '线稿用四个信息块明确文案层级；成品将分项信息排在人物肤感与产品主视觉旁，形成主张、信息与产品的阅读关系。',
    points: ['总标题：先给出养肤定位', '分项信息：一个数字对应一个感受', '条件说明：保留时间与自评口径']
  },
  {
    id: 'texture', number: '03', name: '肤感回应', pdfPage: 4,
    title: '把使用顾虑，拆成三个清楚的阅读点。',
    task: '围绕质地、跟妆与温和诉求组织信息，方便销售按客户关注点调用素材。',
    structure: '以“透”“贴”“敏肌友好”三个短标签组织文案，每个标签下只保留对应的解释；产品与质地画面负责补充使用体验的想象。',
    comparison: '线稿明确三个卖点及其说明；成品将文字分布在产品与乳霜质地周围，用位置、字号与引线区分阅读重点。',
    points: ['短标签：让信息容易扫读', '短说明：每组解释一个使用关注点', '图文关系：质地与产品承接体验表达']
  },
  {
    id: 'feedback', number: '04', name: '使用反馈', pdfPage: 3,
    title: '让场景和反馈分区，方便具体沟通。',
    task: '将夏日场景与历史海报中的使用者反馈组合，补充私域种草和一对一介绍素材。',
    structure: '上半部用场景和产品承接主张，下半部集中安排反馈；每条文字与对应人物图片、署名配对，避免长段文字混在一起。',
    comparison: '线稿划分场景区与反馈区，明确两组图文对应关系；成品用独立底色和错落排版，让使用反馈形成单独的阅读部分。',
    points: ['场景区：交代夏日使用语境', '反馈区：集中呈现体验表达', '对应关系：图片、文字与署名成组']
  }
];

function wireframeFigure(c, kind) {
  const isDraft = kind === 'wireframe';
  const title = `${c.name}｜${isDraft ? '内容排版线稿' : '海报成品'}`;
  const src = WIREFRAME_BASE + c.id + (isDraft ? '-wireframe.webp' : '-finished.jpg');
  const display = isDraft ? src : WIREFRAME_BASE + c.id + '-finished.webp';
  return `<figure class="wireframe-figure"><figcaption><span>${isDraft ? '01 / CONTENT STRUCTURE' : '02 / FINISHED POSTER'}</span><strong>${isDraft ? '内容排版线稿' : '海报成品'}</strong><small>${isDraft ? `简版线稿 PDF · 第${c.pdfPage}页` : '文案与线稿：孙岩萍 · 视觉设计：设计师'}</small></figcaption><button type="button" class="wireframe-image-button" data-image="${esc(src)}" data-caption="${esc(title)}" aria-label="放大查看：${esc(title)}"><img src="${esc(display)}" alt="${esc(title)}" loading="lazy" decoding="async"><span class="expand" aria-hidden="true">放大查看 ↗</span></button></figure>`;
}

function wireframeTeaser() {
  return `<section class="wireframe-teaser" aria-labelledby="wireframe-teaser-title"><div><p class="eyebrow">02 / CONTENT STRUCTURE</p><h2 id="wireframe-teaser-title">从文案线稿，<br>看见信息安排。</h2><p>防晒私域海报：四组内容排版线稿与成品对照，展开主标题、卖点层级和图文关系。</p><p class="wireframe-credit">本人负责海报文案与线稿 · 设计师完成视觉设计</p><a class="button light" href="#/wireframes">查看线稿与成品 <span aria-hidden="true">↗</span></a></div><a class="wireframe-teaser-pair" href="#/wireframes" aria-label="查看防晒海报线稿与成品"><img src="${WIREFRAME_BASE}texture-wireframe.webp" alt="肤感海报内容排版线稿" loading="lazy" width="934" height="1400"><img src="${WIREFRAME_BASE}texture-finished.webp" alt="肤感海报成品" loading="lazy" width="700" height="933"><span>内容排版线稿 <i aria-hidden="true">→</i> 海报成品</span></a></section>`;
}

function wireframesPage() {
  return `<div class="container"><div class="breadcrumb"><a href="#/works">← 全部项目</a><span> / 海报内容结构与设计沟通</span></div><section class="wireframes-hero"><p class="eyebrow">CONTENT STRUCTURE / PRIVATE DOMAIN</p><h1>海报内容结构<br>与设计沟通</h1><p class="wireframes-intro">一组防晒海报的文案、信息层级与图文关系。</p><div class="wireframes-context"><div><span>使用场景</span><p>私域一对一沟通<br>朋友圈种草</p></div><div><span>我的职责</span><p>全部海报文案<br>内容排版线稿</p></div><div><span>团队协作</span><p>设计师完成视觉设计<br>与最终排版制作</p></div></div><p class="wireframes-lead">我围绕新品预热、养肤价值、肤感回应和使用反馈，分别安排主标题、卖点主次及图文关系。以下以本人提供的简版线稿与对应成品对照，展示内容结构如何转为可执行的设计参考。</p><div class="wireframes-actions"><a class="text-link" href="${WIREFRAME_BASE}sunscreen-content-wireframes.pdf" target="_blank" rel="noopener">查看四页简版线稿 PDF ↗</a><a class="text-link" href="#/project/sun/moments">查看完整防晒项目 ↗</a></div></section></div><nav class="project-subnav wireframes-subnav" aria-label="海报内容任务"><div class="container">${WIREFRAME_CASES.map(c=>`<a href="#/wireframes/${c.id}">${c.number} ${esc(c.name)}</a>`).join('')}</div></nav><div class="container"><p class="wireframes-order-note">按内容任务整理展示，不代表实际发布顺序。</p>${WIREFRAME_CASES.map(c=>`<section class="wireframe-case" id="wireframes-${c.id}" aria-labelledby="wireframe-title-${c.id}"><div class="wireframe-case-heading"><p class="eyebrow">${c.number} / ${esc(c.name)}</p><h2 id="wireframe-title-${c.id}">${esc(c.title)}</h2><p>${esc(c.task)}</p></div><div class="wireframe-pair">${wireframeFigure(c,'wireframe')}${wireframeFigure(c,'finished')}</div><div class="wireframe-analysis"><div><span class="small-label">信息结构</span><p>${esc(c.structure)}</p></div><div><span class="small-label">线稿与成品对照</span><p>${esc(c.comparison)}</p></div></div><ul class="wireframe-points">${c.points.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>`).join('')}<p class="historical-note wireframes-footnote">简版线稿用于展示文案与信息层级，成品保留历史作品表达。图中功效、数字及用户反馈不作为本页独立验证的结论，也不作为海报的销售归因数据。项目整体成果见防晒案例。</p><div class="wireframes-bottom"><a class="button" href="#/project/sun">继续阅读防晒项目 <span aria-hidden="true">↗</span></a><a class="text-link" href="#/works">返回全部项目 ↗</a></div></div>`;
}
