# 作品集3.0.15：接手入口

当前版本：**3.0.16**（2026-11-12）。图片尺寸、手机视频布局及放大查看的最新改动见[RELEASE-3.0.16.md](RELEASE-3.0.16.md)；下方旧版本记录保留为历史参考。

2026-11-10交接：[本轮修改汇总与域名更新步骤](UPDATE-HANDOFF-20261110.md)。已核对本地与GitHub完整一致，后续从最新main同步部署副本。

3.0.15仅调整酷狗排版，保留原文、数据与全部作品。修改与核对见[RELEASE-3.0.15.md](RELEASE-3.0.15.md)。

3.0.14修正成品与线稿的并排对齐，内容及素材不变。原因、修改和验证见[RELEASE-3.0.14.md](RELEASE-3.0.14.md)。

发布状态（2026-11-09）：源码与GitHub Pages预览版本为3.0.15；正式域名yanpingsun.cn仍待huhaheng同步部署副本main后更新。当前部署副本停在e97a201，当前会话没有该副本写权限。请按EDGEONE-DEPLOYMENT.md同步原仓库最新main，等待EdgeOne构建并复核正式域名。

更新日期：2026-11-09。供huhaheng后续修改使用。

3.0.12精简首页与精华油案例，先说明项目及本人职责，再展示真实作品。精华油视频脚本不标数量。详见[本次修改说明](RELEASE-3.0.12.md)。

3.0.11修正返回顶部的标题焦点，并统一简历第一页拉新单位，通过[PR #8](https://github.com/yanpingsun/yanping-portfolio-site/pull/8)交付。2026-11-07复用该版本部署至新域名，内容与设计不变；GitHub Pages原根首页和预览继续保留。修复与验证见[HANDOFF.md](HANDOFF.md)，新托管配置见[EDGEONE-DEPLOYMENT.md](EDGEONE-DEPLOYMENT.md)。

修改部署网址请先看[部署迁移交接](DEPLOYMENT-HANDOFF.md)，其中列出完整素材位置、资源校验清单和目录迁移时的路径调整点。

## 当前版本

- 仓库：[yanpingsun/yanping-portfolio-site](https://github.com/yanpingsun/yanping-portfolio-site)
- 分支：`main`
- 源码目录：`preview/v3/`
- 页面版本：**3.0.15**
- 3.0.15运行源码提交：71d82dcf680f8c3401eddb87a04a8da877c14df2
- 3.0.14运行源码提交：83713139e4fa6010ce8da0b39b06acd53aec7a87
- 3.0.13运行源码提交：`070b3112bf3ae1c0beb2fb24e83f762ced62fb5b`
- 本次修改：[RELEASE-3.0.15.md](RELEASE-3.0.15.md)；图片对齐修复：[RELEASE-3.0.14.md](RELEASE-3.0.14.md)；上次内容改版：[RELEASE-3.0.13.md](RELEASE-3.0.13.md)；内容依据：[已确认文案](APPROVED-PRODUCT-COPY.md)
- 3.0.12运行源码提交：`428350de086e4c66df13aa2fb22ff2227aef7e40`
- 历史3.0.10运行源码基线提交：[`33954c0f479d416deeb8ecb34fd63dd9ad52a9d1`](https://github.com/yanpingsun/yanping-portfolio-site/commit/33954c0f479d416deeb8ecb34fd63dd9ad52a9d1)
- 3.0.11运行源码提交：[`f0036d6`](https://github.com/yanpingsun/yanping-portfolio-site/commit/f0036d67e4cbf83d7145eb2a07871ff82d54a6a5)；发布交接文档不改变运行源码。
- [正式域名（待同步3.0.15）](https://yanpingsun.cn/)
- [保留的GitHub Pages预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/v3/?v=3.0.15#/home/selected)
- 新域名部署仓库：`huhaheng/yanping-portfolio-site`，`main`；原仓库合入后需同步此副本才会更新新域名。
- [完整分工、事实口径与历史修改记录](HANDOFF.md)

本版已接入9张视频封面、更新跨垂类达人脚本策划名称与分析，并替换已下架的李颖视频展示。开始新修改时，以GitHub上最新`main`为基础。

请克隆完整仓库后修改`preview/v3/`。原图、线稿、历史视频和文章备份还引用仓库根目录下的`portfolio-content/`等路径，单独下载本目录不能获得完整素材站。根首页和其他预览目录是独立版本。

## 修改位置

| 要改的内容 | 位置 |
| --- | --- |
| 首页、项目目录、关于页 | `app.js`中的`homePage`、`featureCard`、`worksPage`、`aboutPage` |
| 产品案例 | 精华油为`oilCasePage`；面膜、防晒、洁颜霜为`productCasePage`。正文及章节配置在`data.js`，职责与摘要在`content.js` |
| 项目标题、摘要、职责与成果 | `content.js`中的`PORTFOLIO_V3.cases` |
| 案例叙事与补充分析 | `data.js`中的`GENERAL_PORTFOLIO.pages`、`materials` |
| 字体、留白、图框与手机布局 | `styles.css` |
| 视频封面、原视频与公众号链接 | `media.js`中的`PORTFOLIO_MEDIA.videos`、`articles` |
| 精华油与酷狗导航封面 | `app.js`的`projectArtwork`，及`styles.css`的`art-editorial-cover` |
| 简历 | `assets/resume.pdf`，仅更正拉新单位的PDF；用户原件在`assets/archive/`；`resume-source.md`仅供文字提取参考 |

首页和关于页有专用模板，仅改`data.js`中的旧首页文字不会更新它们。

## 旧版导航封面归档

首页3.0.12已改用真实作品组合：精华油日夜海报、酷狗活动页面与内容合集。作品目录仍使用以下导航封面，PNG原稿继续保留。

- 精华油：`assets/oil-editorial-cover-v309.webp`。
- 酷狗：`assets/kugou-platform-cover-v308.webp`。
- 二者为1448×1086、4:3，使用同一`art-editorial-cover`规则，0内边距，`contain`完整显示。保留类别标签位置与主体安全留白。
- PNG原稿与编辑提示词在[design-sources/](design-sources/README.md)。这些是根据用户要求制作的作品集导航封面；案例内的历史原始作品仍保留原路径。
- 首页真实作品在`featureCard`中指定；作品目录导航封面在`projectArtwork`中独立指定；仅替换`content.js`的`cover`字段不会同步替换这两个入口。该字段仍服务案例首屏等原作品展示。

## 已完成的视频封面替换与后续维护

用户已提供9张封面，按“项目＋具体视频名称＋图片”逐条匹配，完整对照见[VIDEO-COVERS.md](VIDEO-COVERS.md)。文件副本位于assets/video-covers/，当前保留用户原PNG；`media.js`记录逐条poster及原文件名、宽高。

后续修改时保留原视频和分析地址。原“夫妻日常视频”现名为“跨垂类达人脚本策划”，旧分析锚点继续兼容。李颖视频按用户确认已下架，不应重新启用previousUrl为观看地址。

封面使用3:4图框、contain完整显示，类别标签在文字区。“放大封面”可查看原PNG，点击封面进入原视频。替换时核对人物、产品、文字及桌面手机显示。

## 需延续的已确认内容

- 四款产品统一“上新首月GMV”；精华油和防晒保留私域渠道范围。成果为团队及渠道整体口径。
- 酷狗整体项目256万人次引流、21万名纯新增；电台2021.02.06—2021.10.13拉新60,590人、拉活71,999人，各自独立口径。
- 电台已替换为单依纯海报；直播仅展示两张重点截图。
- 脚本分析已删除逐段时间表及指定比较、改进小节；直播分析已删除7处片段时码。产品使用时长和电台22:30更新排期继续保留。
- 精华油暂无原发布地址的科普内容保留分析入口，不添加占位播放链接。

完整事实依据与链接核对状态以[HANDOFF.md](HANDOFF.md)、[LINKS-TO-COMPLETE.md](LINKS-TO-COMPLETE.md)为准。

## 本地预览、验证与发布

静态HTML/JS，无需安装依赖或构建。在仓库根目录启动HTTP静态服务，打开`/preview/v3/`。

修改后检查受影响页面、封面点击、原图与分析入口，以及320、390、1280px下文字和图片是否溢出。3.0.9已做这三种宽度下首页、目录和精华油案例共9组检查，并核对线上图片和封面跳转；不等同于真机Safari验证。

3.0.10在这三种宽度下核对三个视频案例与面膜新旧分析锚点，共18组，无横向溢出或封面裁切；9张封面逐一放大核对原始尺寸，新增分析入口已实际点击。

脚本、样式和简历的当前缓存参数为`?v=3.0.15`。后续有页面改动时同步更新`index.html`、`app.js`等相关缓存参数及版本记录。

原仓库修改合入`main`后，按[同步说明](EDGEONE-DEPLOYMENT.md#后续代码更新与副本同步)同步部署副本，等待EdgeOne构建成功后核对新域名。GitHub Pages仍独立等待其`pages build and deployment`成功并核对。微信外链仍需在允许访问的环境内复核，不能把仅配置了地址写成已验证播放。
