# 孙岩萍作品集网站

面向品牌／产品内容策划及相关岗位的作品集，包含精华油、防晒、童颜面膜、洁面与酷狗音乐五个案例。

- 网站：<https://yanpingsun.github.io/yanping-portfolio-site/>
- 仓库：<https://github.com/yanpingsun/yanping-portfolio-site>
- 技术：原生 HTML、CSS、JavaScript；GitHub Pages 发布。

## 开始协作

先读 [项目状态](docs/PROJECT.md) 了解进度，开发遵循 [AGENTS.md](AGENTS.md)。双方使用正常的 [同步、分支与 PR 流程](docs/COLLABORATION.md)。

项目只有 owner 与另一位协作者，两边 agent 遵守同一套规范。owner 没有开发和 Git 背景，只需说明需求、提供素材和确认事实；agent 负责版本同步和技术操作，遇到不准确的技术说法时按意图引导。需要给对方 agent 上下文时，可转交 [简短接手提示](docs/OWNER-AGENT-START.md)。规范尚未合入 main 时，从 docs/project-standards 分支读取。

## 制作方法

先读 [制作 Pipeline](docs/OPTIMIZATION-PLAN.md)：既有网站先还原原版内容与 UI/UX，再从材料、CV 和目标推导修订，最后实现 HTML。[原版基线](baseline/README.md)已补齐完整正文、内容策略、UI/UX 和同层对照。当前[通用内容r3](content/README.md)已形成首页、关于我和五个完整案例，并附[逐项对照](content/reviews/general-r3-vs-baseline.md)；[UX r2](design/README.md)已按完整内容安排阅读层级，并提供首页、精华油、酷狗的桌面／手机静态图。内容直接维护Markdown；[HTML r1独立预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/general/)已按完整稿接入，等待实际试读反馈，现有正式入口保留。

不同岗位版本、同版迭代与旧版保留见 [版本记录](docs/VERSIONS.md)。现有网站源码已保留归档分支；多版本网页访问入口留到 HTML 阶段实现。

## 最新可试读版本

本轮内容r4与UI／UX r3已接入[HTML r2独立预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/general-r2/)，含八页、四项案例导航、手机常驻章节栏及一层具名补充作品。[实际检查范围](docs/HTML-R2-REVIEW.md)分别记录内容、UI和UX；真实手机与Safari仍待试用。[上一版预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/general/)及原正式网站继续保留。完整生成工具通过PR #5共享，PR #6只发布新预览目录。

## 本地预览

在仓库根目录执行：

```bash
python3 -m http.server 8765
```

浏览器访问 <http://127.0.0.1:8765/>。无需安装依赖或构建。

## 当前文件分工

| 路径 | 用途 |
| --- | --- |
| `index.html` | 页面入口、导航、分享信息、脚本和样式引用 |
| `portfolio-2026.js` | 首页、关于我、项目目录、案例渲染、路由与图片查看 |
| `portfolio-2026-content.js` | 五个案例当前用于网页展示的内容数据 |
| `portfolio-2026-wireframes.js` | 四个护肤品项目的线稿与成品对照 |
| `portfolio-2026.css`、`portfolio-2.css`、`portfolio-2026-wireframes.css` | 当前样式；实际应用顺序见 `index.html` |
| `portfolio-content/` | 项目文稿、来源说明、原件及展示素材 |
| `baseline/` | 固定原版的完整正文、内容策略与 UI/UX 还原，以及与新稿的同层对照 |
| `content/` | 本轮准备进入网页的内容稿与选材说明 |
| `design/` | UI/UX参考、完整页面安排、SVG／WebP静态图及历史线框 |
| `portfolio-previews/` | 网页轻量预览图 |
| `docs/` | 本轮优化的项目状态、计划与协作说明 |
| `preview/general/` | 通用版独立网页预览及生成数据，复用现有原件 |
| `tools/build_general_preview.py` | 将网页正文与补充资料生成预览数据 |

## 修改与发布

开发在工作分支进行；开工和 PR 交付前检查 owner 的远端更新，再整合有影响的变更。正式站继续沿用现有 GitHub Pages；新版 HTML 先提供独立预览链接，用户实际查看并确认对应版本后，再更新正式入口，保留可恢复的旧版节点。当前[通用版预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/general/)由[PR #4](https://github.com/yanpingsun/yanping-portfolio-site/pull/4)只新增独立目录发布，未替换正式首页；[验证范围](docs/HTML-REVIEW.md)与内容、UX来源均有记录。具体步骤见 [协作规则](docs/COLLABORATION.md)。

当前 UX 任务分支为 `work/general-ux-r1`，基于内容分支 `work/general-content-r1`；各草稿 PR 与实际阶段见项目状态。内容继续遵循已确认的个人职责与成果口径，技术和设计任务在授权范围内自主推进；事实缺口与内容含义冲突单独说明。

本轮试读后的改造安排见[总方案](docs/REFINEMENT-PLAN.md)：内容、UI视觉、UX阅读与交互分别提案、调整和review，已补齐[八份内容提案](content/proposals/general-r4/README.md)及[八页桌面／手机静态设计](design/proposals/general-ux-r3/README.md)，内容、UI和UX分别完成自审及已发现问题调整。提案目录不自动进入现有预览数据；HTML仍在最后。
