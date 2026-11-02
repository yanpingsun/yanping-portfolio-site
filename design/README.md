# 通用基准版 UX r2

版本ID：`general`。日期：2026-11-02。依据[完整内容r3](../content/README.md)与[原版UI/UX](../baseline/ui-ux.md)完成阅读结构和静态排版校准，现已用于HTML r1独立预览；以下保留UX r2的设计依据与静态产物。

先看首页设计，再按需要查阅完整案例和[八个页面的安排](page-structure.md)。图中使用真实正文与作品；所有补充组在审阅状态展开，视频是有明确标识的静态区域。它们不能点击或播放，不是网页预览。

## 静态设计图

| 页面 | 桌面 | 手机 |
| --- | --- | --- |
| 首页：全部正文与五案入口 | [查看整页](layouts/home-desktop.webp) | [查看整页](layouts/home-mobile.webp) |
| 精华油：全部正文、13幅图与四条视频安排 | [查看整页](layouts/oil-desktop.webp) | [上段](layouts/oil-mobile-01.webp) · [下段](layouts/oil-mobile-02.webp) |
| 酷狗：全部正文与14幅代表图／截图 | [查看整页](layouts/kugou-desktop.webp) | [上段](layouts/kugou-mobile-01.webp) · [下段](layouts/kugou-mobile-02.webp) |

长手机图按章节切成连续部分，内容没有省略；完整可编辑SVG分别为[首页桌面](layouts/home-desktop.svg)、[首页手机](layouts/home-mobile.svg)、[精华油桌面](layouts/oil-desktop.svg)、[精华油手机](layouts/oil-mobile.svg)、[酷狗桌面](layouts/kugou-desktop.svg)、[酷狗手机](layouts/kugou-mobile.svg)。SVG引用仓库原件，下载使用时保持目录关系；在线看位图即可。分片坐标、内容块与来源校验见[导出记录](layouts/manifest.json)。

## 这轮具体确定了什么

- 保留原版暖底、深绿、宋体标题与编辑式视觉，调整正文、导航和图注尺寸。
- 首页给精华油、酷狗两类能力入口，三个互补项目仍直接可选；目录保留全部五案。
- 四个护肤品案例继承7组主展示、7组补充，全部14组海报与11条视频有展示位置；价格问答、直播、平台独特作品各自保留。
- 手机同组线稿与成品上下排列，图片保持原比例；超长图给文字说明、缩略预览与原图查阅。
- 明确章节、补充展开、图片关闭、媒体失败及返回位置的行为。完整要求见[UX方案](ux-plan.md)，逐案去向见[页面安排](page-structure.md)。

本轮已核对完整内容块、作品引用、静态图排布与颜色配对。面膜、防晒、洁面、目录、关于页已逐段安排，尚未分别绘制整页视觉图；320／390px响应式排版、键盘、滚动和媒体操作已在HTML r1阶段另行核对，实际范围见[HTML检查记录](../docs/HTML-REVIEW.md)；手机宽度使用浏览器同源框架，未代替真实设备触控检查。没有新增读者试读、CV确认或数据结论。

## 重建静态设计

需要Python 3、Pillow，以及官方[Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc)和[Noto Serif SC](https://github.com/google/fonts/tree/main/ofl/notoserifsc)。字体不提交为网站依赖；安装时保留各字体OFL许可，既有Sans许可见[NotoSansSC-OFL.txt](tools/NotoSansSC-OFL.txt)。

在仓库根目录运行：

```bash
python3 design/tools/build_layout_studies.py --sans /path/to/NotoSansSC.ttf --serif /path/to/NotoSerifSC.ttf
```

仅生成SVG与WebP静态设计，不生成HTML/CSS/JS。位图用于查看，SVG保留文字与原件引用；它们不会修改内容稿或源图片。

## 历史设计

[UX r1固定归档](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-ux-r1)保留当时方案与[五页局部线框PDF](output/pdf/general-ux-r1.pdf)。该PDF仍为旧的局部稿，不是本轮完整案例或已更新的设计。参考站点的11月1日观察与本轮交互依据见[参考记录](references.md)。

[HTML r1独立预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/general/)已制作，接下来由用户实际试读并针对问题修订。正式入口、原件与旧版本均保留。
