# general UI/UX r3 提案

日期：2026-11-02。此目录单独处理展示与阅读体验。依据[本轮总方案](../../../docs/REFINEMENT-PLAN.md)、[既有复核](../../reviews/general-html-r1-content-ux-review.md)及[内容r4提案](../../../content/proposals/general-r4/README.md)。现有UX r2、HTML r1不变。

- [UI视觉方案](ui-plan.md)：作品、字体、图文比例、版式节奏及候选人职业表达。
- [UX阅读与交互方案](ux-plan.md)：信息层级、导航、补充查阅、旧入口和返回行为。
- [UI视觉review](../../reviews/general-ui-r3-review.md)与[UX阅读／交互review](../../reviews/general-ux-r3-review.md)：分开记录问题与调整，不冒充已通过浏览器测试。
- [精华油桌面静态稿](layouts/oil-desktop.webp)、[手机静态稿](layouts/oil-mobile.webp)、[手机目录状态](layouts/oil-mobile-menu.webp)。SVG与来源校验见同目录导出记录。

静态稿使用固定内容提案，文案不是在图里另行编写。主叙述完整显示；补充阅读在默认状态以具名入口表示，展开后的全部正文仍由内容提案保留。图中视频使用现有成片的实际截帧并注明来源，不生成假作品。上述控件只是设计表达，不能点击、放大或播放。

本轮先以精华油画出完整默认阅读和手机目录状态，再对照酷狗文稿检查能否使用同一套基本形式。酷狗整页视觉、其他五页、真实交互与HTML均未因试点有图就视为完成。

## 重建静态稿

需要Python 3、Pillow、ffmpeg及现有Noto Sans SC／Noto Serif SC字体。在仓库根目录运行：

```bash
python3 design/tools/build_refinement_studies.py --sans /path/to/NotoSansSC.ttf --serif /path/to/NotoSerifSC.ttf
```

工具只读取固定内容提案和原件，生成SVG、WebP、两张实际视频截帧及来源记录；不写HTML、CSS、JS或修改内容稿。SVG引用原有素材，位图可独立查看。来源文件校验值、正文块覆盖和图像路径见[导出记录](layouts/manifest.json)。
