'use strict';
const SUN_WIREFRAMES = [
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

const OIL_WIREFRAMES = [
  {
    "id": "day",
    "name": "日间透亮",
    "pdfPage": 1,
    "title": "把日间产品，放进提亮与妆前护理场景。",
    "task": "在日夜双瓶方案下，明确日间油的沟通重点，让一张海报能够集中讲述它的使用角色。",
    "structure": "先用产品主张与名称建立识别，再将抗氧、提亮、妆前打底分为三组短标签与解释。每组只展开一个方向，文案围绕日间护理与上妆场景组织。",
    "comparison": "简版线稿划分标题、三组卖点和产品／外盒占位；成品用字号、标签与产品主视觉建立阅读主次，底部短句收束记忆。",
    "points": [
      "标题：明确日间油的产品角色",
      "卖点：三个主题分别展开",
      "场景：连接护理与妆前使用"
    ]
  },
  {
    "id": "night",
    "name": "夜间修护",
    "pdfPage": 2,
    "title": "沿用系列结构，拉开夜间产品的表达重点。",
    "task": "让夜间油与日间油形成可比较的系列内容，同时突出各自的沟通方向。",
    "structure": "保留与日间海报一致的标题、三组卖点和收尾信息结构，将主题转向修护与抗皱护理，分别安排对应的短标签与说明。",
    "comparison": "两张线稿沿用相同的信息骨架，成品进一步以不同产品形象、色彩和文案主题区分日夜。内容结构与文案由我负责，视觉设计由设计师完成。",
    "points": [
      "系列：共同结构便于比较",
      "差异：夜间护理有独立主题",
      "收尾：补充产品技术信息"
    ]
  },
  {
    "id": "data",
    "name": "资料信息",
    "pdfPage": 3,
    "title": "让多项数字，各自对应一个清楚的信息标签。",
    "task": "将历史海报中的功效相关信息拆成标签与数字，作为产品介绍的补充素材。",
    "structure": "线稿先明确总标题，再将五项标签与数字逐一配对，并划分人物肤感和日夜双产品的画面位置，避免资料信息挤成一段。",
    "comparison": "成品将数字分组安排在人物与产品周围，通过字号与位置强调各项信息。本节关注信息编排，图内数据及标题按历史作品保留。",
    "points": [
      "对应：每个数字配一个信息标签",
      "分区：人物与双瓶各有位置",
      "层级：总标题与分项信息分开"
    ]
  }
];
const PROJECT_WIREFRAMES = {
  oil: {
    base: 'portfolio-content/skincare-wireframes/essence-oil/',
    pdf: 'oil-content-wireframes.pdf', pages: 3, featured: 2,
    scope: '日夜产品卖点与资料信息',
    intro: '在既定日夜双瓶方案下，我把两款产品的沟通重点分别写成海报文案，并通过简版线稿展示标题、卖点与图文关系。两张主展示呈现共同的系列结构和不同的产品角色，资料信息作为补充展开。',
    cases: OIL_WIREFRAMES
  },
  sun: {
    base: 'portfolio-content/skincare-wireframes/sunscreen/',
    pdf: 'sunscreen-content-wireframes.pdf', pages: 4, featured: 2,
    scope: '私域一对一沟通与朋友圈种草',
    intro: '围绕防晒的养肤价值与使用顾虑，我负责海报文案及内容排版线稿，明确主标题、卖点层级和图文关系。主展示两组，新品预热与使用反馈作为补充展开。',
    cases: [SUN_WIREFRAMES[1], SUN_WIREFRAMES[2], SUN_WIREFRAMES[0], SUN_WIREFRAMES[3]]
  }
};

function wireframeFigure(p, c, kind) {
  const cfg = PROJECT_WIREFRAMES[p.id], isDraft = kind === 'wireframe';
  const title = `${p.name}·${c.name}｜${isDraft ? '内容排版线稿' : '海报成品'}`;
  const src = cfg.base + c.id + (isDraft ? '-wireframe.webp' : '-finished.jpg');
  const display = isDraft ? src : cfg.base + c.id + '-finished.webp';
  return `<figure class="wireframe-figure"><figcaption><span>${isDraft ? '01 / CONTENT STRUCTURE' : '02 / FINISHED POSTER'}</span><strong>${isDraft ? '内容排版线稿' : '海报成品'}</strong><small>${isDraft ? `简版线稿 PDF · 第${c.pdfPage}页` : '文案与线稿：孙岩萍 · 视觉设计：设计师'}</small></figcaption><button type="button" class="wireframe-image-button" data-image="${esc(src)}" data-caption="${esc(title)}" aria-label="放大查看：${esc(title)}"><img src="${esc(display)}" alt="${esc(title)}" loading="lazy" decoding="async"><span class="expand" aria-hidden="true">放大查看 ↗</span></button></figure>`;
}

function wireframeCase(p, c, index) {
  return `<article class="wireframe-case" id="${p.id}-wireframe-${c.id}" aria-labelledby="${p.id}-wireframe-title-${c.id}"><div class="wireframe-case-heading"><p class="eyebrow">${String(index+1).padStart(2,'0')} / ${esc(c.name)}</p><h3 id="${p.id}-wireframe-title-${c.id}">${esc(c.title)}</h3><p>${esc(c.task)}</p></div><div class="wireframe-pair">${wireframeFigure(p,c,'wireframe')}${wireframeFigure(p,c,'finished')}</div><div class="wireframe-analysis"><div><span class="small-label">信息结构</span><p>${esc(c.structure)}</p></div><div><span class="small-label">线稿与成品对照</span><p>${esc(c.comparison)}</p></div></div><ul class="wireframe-points">${c.points.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></article>`;
}

function projectWireframes(p, number) {
  const cfg = PROJECT_WIREFRAMES[p.id];
  if (!cfg) return '';
  const extra=cfg.cases.slice(cfg.featured);
  return `<section class="case-section project-wireframes" id="${p.id}-wireframes" aria-labelledby="${p.id}-wireframes-title"><span class="section-num">${number} / CONTENT STRUCTURE</span><div class="section-heading"><h2 id="${p.id}-wireframes-title">海报线稿｜从内容结构到视觉成品</h2></div><p class="wireframes-lead">${esc(cfg.intro)}</p><div class="wireframe-project-meta"><span>${esc(cfg.scope)}</span><span>本人：文案与内容线稿</span><span>设计师：视觉设计与制作</span></div><div class="wireframes-actions"><a class="text-link" href="${cfg.base+cfg.pdf}" target="_blank" rel="noopener">查看${cfg.pages}页简版线稿 PDF ↗</a></div>${cfg.cases.slice(0,cfg.featured).map((c,i)=>wireframeCase(p,c,i)).join('')}${extra.length?`<details class="wireframe-more"><summary>补充查看 ${extra.length} 组：${extra.map(c=>esc(c.name)).join('、')}<span aria-hidden="true">＋</span></summary><div>${extra.map((c,i)=>wireframeCase(p,c,i+cfg.featured)).join('')}</div></details>`:''}<p class="historical-note wireframes-footnote">简版线稿用于展示文案与信息层级，成品保留历史作品表达；结构说明依据现有材料整理。图中功效、数字及用户反馈未作本次独立核验，也不作为海报的销售归因数据。展示顺序按内容任务整理。</p></section>`;
}

function wireframeTeaser() {
  const cfg=PROJECT_WIREFRAMES.oil;
  return `<section class="wireframe-teaser" aria-labelledby="wireframe-teaser-title"><div><p class="eyebrow">02 / CONTENT STRUCTURE</p><h2 id="wireframe-teaser-title">从文案线稿，<br>看见信息安排。</h2><p>在精华油与防晒项目中，结合产品任务查看海报文案、信息层级及成品对照。</p><p class="wireframe-credit">本人负责海报文案与线稿 · 设计师完成视觉设计</p><div class="wireframe-teaser-links"><a class="button light" href="#/project/oil/wireframes">精华油线稿案例 <span aria-hidden="true">↗</span></a><a class="text-link" href="#/project/sun/wireframes">防晒线稿案例 ↗</a></div></div><a class="wireframe-teaser-pair" href="#/project/oil/wireframes" aria-label="查看精华油海报线稿与成品"><img src="${cfg.base}day-wireframe.webp" alt="日间精华油内容排版线稿" loading="lazy" width="934" height="1400"><img src="${cfg.base}day-finished.webp" alt="日间精华油海报成品" loading="lazy" width="700" height="933"><span>内容排版线稿 <i aria-hidden="true">→</i> 海报成品</span></a></section>`;
}
