# 孙岩萍作品集优化

更新日期：2026-11-02。

## 目标

首要任务是形成适合求职目标的优质内容，让目标岗位读者基于真实、相关、清楚且有作品支持的信息，准确理解孙岩萍的能力、个人贡献与适配程度，形成合理预期。内容策略、UI/UX、协作和代码维护均服务于这一目标。

用户已确认先制作通用基准版，保留产品内容策划和新媒体运营两类能力；实际岗位定制留到后续需要时开展。案例主次可依据内容反馈调整，具体判断见 [内容质量标准](OPTIMIZATION-PLAN.md#首要目标与内容质量)。

## 当前项目

- 仓库：https://github.com/yanpingsun/yanping-portfolio-site
- 正式站：https://yanpingsun.github.io/yanping-portfolio-site/
- 技术：静态 HTML/CSS/JS，GitHub Pages。
- 页面：首页、五个案例、项目目录、关于我、图片查看与线稿对照。
- 根目录正式网站仍为原代码基线 c9fc45a4417e7a8cfca30cc6536adcbaa66bcfe0；main已另增独立预览目录，后续以最新main为准。
- 改版分支：work/portfolio-revamp。
- 内容工作分支：`work/general-content-r1`，沿用原任务分支；[内容草稿 PR #2](https://github.com/yanpingsun/yanping-portfolio-site/pull/2) 基于已共享的规范分支工作。
- 当前工作分支：`work/general-ux-r1`，基于内容分支，保留原版基线、[通用内容r3](../content/README.md)、[UX r2](../design/README.md)与HTML r1完整源码／生成工具；沿用[草稿 PR #3](https://github.com/yanpingsun/yanping-portfolio-site/pull/3)。仅预览文件已由独立PR #4合入main，其余工作稿未合入，固定节点见版本记录。
- 规范分支：docs/project-standards；[草稿 PR #1](https://github.com/yanpingsun/yanping-portfolio-site/pull/1) 尚未合入 main。
- 原站源码归档：`archive/baseline-20261101`，固定到上述代码基线；岗位版本及重要节点统一见 [版本记录](VERSIONS.md)。

## 目前进度

`general`通用基准版已走完本轮“原版还原 → 内容r3 → UX r2 → HTML r1独立预览”的制作过程，现阶段按[本轮改造方案](REFINEMENT-PLAN.md)分别推进内容、UI视觉、UX阅读与交互提案及分项review，尚未确认投递或替换正式入口。内容好坏仍以相关、真实、清楚且有作品支持为准，完成实现不等于已证明整体优于原版。

[打开通用版预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/general/)；[现有正式网站](https://yanpingsun.github.io/yanping-portfolio-site/)保持原版。首页、作品目录、关于与五个完整案例均已接入，14组海报、11条视频及13份补充分析阅读页可查阅。原图、全文PDF、Word及视频复用原件；没有新增报告PDF。

内容仍以[七份Markdown正文](../content/README.md)为准，编辑说明不进入页面，生成工具负责同步到预览数据。完整内容与原版86项核心引用的取舍见[逐项对照](../content/reviews/general-r3-vs-baseline.md)，原版八页正文、策略、UI/UX与来源仍见[基线](../baseline/README.md)。本人最终措辞、CV与已列明的数据差异仍待核对，未补造事实或将团队结果归为个人。

HTML r1只新增`preview/general/`五个静态文件，经[PR #4](https://github.com/yanpingsun/yanping-portfolio-site/pull/4)合入main并由原GitHub Pages流程部署成功；正式根入口及其他文件与此前main逐项一致，未更改发布源。已实际打开公开预览的八条主要路径，验证公开站视频与原图，并再次打开原正式站核对。部署与完整验证范围见[HTML检查记录](HTML-REVIEW.md)。

桌面及320／390px浏览器框架已核对完整正文、排版、资源和交互；尚未覆盖真实手机触控、Safari或招聘读者试读。固定代码、早期内容及UX节点继续保留，见[版本记录](VERSIONS.md)。

本轮已完成[内容方案与精华油／酷狗两案r4试点](../content/proposals/general-r4/README.md)，保留全部对应原件入口；[UI方案](../design/proposals/general-ux-r3/ui-plan.md)与[UX方案](../design/proposals/general-ux-r3/ux-plan.md)独立维护，精华油已有桌面、手机和目录状态静态稿。已分别记录[内容自审](../content/reviews/general-r4-pilot-review.md)、[UI自审](../design/reviews/general-ui-r3-review.md)、[UX自审](../design/reviews/general-ux-r3-review.md)及实际调整。它们是工作提案，未接入HTML；其余五份r4正文、酷狗整页视觉与其他页面仍待扩展，不将试点视为全站完成。

## 后续重点

1. 对照原版、现预览和两案内容／精华油静态提案试读，分别反馈内容、UI与UX；按各自记录调整，之后再扩展其余页面。主要论证、完整证据和关键身份都要保留清楚去向。
2. 结合本人反馈核对CV及已列明的事实缺口；没有确认的新数字继续不刊出。需要真实设备时补测触控、文件打开与长图阅读。
3. 用户明确确认对应版本后，再按授权处理正式入口替换并保留恢复节点。普通同步或继续优化不自动代表正式切换。

制作方法、成果位置和问题回溯统一见[制作Pipeline](OPTIMIZATION-PLAN.md)。日常进度写在各自PR，阶段变化才更新本文件。
