# general UI/UX r3 提案

日期：2026-11-02。此目录单独处理展示与阅读体验。依据[本轮总方案](../../../docs/REFINEMENT-PLAN.md)、[既有复核](../../reviews/general-html-r1-content-ux-review.md)及[内容r4提案](../../../content/proposals/general-r4/README.md)。现有UX r2、HTML r1不变。

- [UI视觉方案](ui-plan.md)：作品、字体、图文比例、版式节奏及候选人职业表达。
- [UX阅读与交互方案](ux-plan.md)：信息层级、导航、补充查阅、旧入口和返回行为。
- [UI视觉review](../../reviews/general-ui-r3-review.md)与[UX阅读／交互review](../../reviews/general-ux-r3-review.md)：分开记录问题与调整，不冒充已通过浏览器测试。

## 整页静态稿

| 页面 | 桌面1280px | 手机390px |
| --- | --- | --- |
| 首页 | [整页](layouts/home-desktop.webp) | [整页](layouts/home-mobile.webp) |
| 作品目录 | [整页](layouts/works-desktop.webp) | [整页](layouts/works-mobile.webp) |
| 精华油 | [整页](layouts/oil-desktop.webp) | [整页](layouts/oil-mobile.webp) |
| 酷狗音乐 | [整页](layouts/kugou-desktop.webp) | [整页](layouts/kugou-mobile.webp) |
| 防晒 | [整页](layouts/sun-desktop.webp) | [整页](layouts/sun-mobile.webp) |
| 童颜面膜 | [整页](layouts/mask-desktop.webp) | [整页](layouts/mask-mobile.webp) |
| 洁面 | [整页](layouts/cleanser-desktop.webp) | [整页](layouts/cleanser-mobile.webp) |
| 关于我 | [整页](layouts/about-desktop.webp) | [整页](layouts/about-mobile.webp) |

另有[手机目录展开](layouts/oil-mobile-menu.webp)、[阅读至结果的章节栏](layouts/oil-mobile-outcome.webp)及[面膜重建示例展开](layouts/mask-mobile-supplement.webp)三种静态状态。共19张查看图；16张整页及目录／展开状态同时保留SVG，结果位置示意为从整页原样截取后配章节栏的WebP。

静态稿使用固定内容提案，文案不是在图里另行编写。主叙述完整显示；补充阅读在默认状态以具名入口表示，展开后的全部正文仍由内容提案保留。图中视频使用现有成片的实际截帧并注明来源，不生成假作品。上述控件只是设计表达，不能点击、放大或播放。

精华油试点之后已扩展八类页面，内容、UI视觉、UX任务路径分别自审并记录调整。首页、目录和关于页全部公开正文都在整页图中显示；五案保留完整主叙述，补充部分以具名入口表示，其对应完整来源块范围记录在manifest。无需每份案例都套同一种海报模板，也不以页面高度证明阅读效果。真实交互与HTML尚未实施。

## 重建静态稿

需要Python 3、Pillow、ffmpeg及现有Noto Sans SC／Noto Serif SC字体。在仓库根目录运行：

```bash
python3 design/tools/build_refinement_batch.py --sans /path/to/NotoSansSC.ttf --serif /path/to/NotoSerifSC.ttf
```

工具只读取固定内容提案和原件，生成SVG、WebP、六张实际视频截帧及来源记录；不写HTML、CSS、JS或修改内容稿。单案工具保留为共用渲染模块，本批请运行上面的批量入口，以免只更新精华油及覆盖全批来源记录。SVG引用原有素材，位图可独立查看。来源文件校验值、正文块覆盖、补充组范围和图像路径见[导出记录](layouts/manifest.json)。
