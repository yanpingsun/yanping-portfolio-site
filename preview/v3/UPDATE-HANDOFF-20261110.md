# 作品集本轮修改与域名更新交接

交接日期：2026-11-10。当前页面版本：**3.0.15**。

## 获取最新版

- 协作源仓库：[yanpingsun/yanping-portfolio-site](https://github.com/yanpingsun/yanping-portfolio-site)，拉取最新 `main`。
- 网站源码：`preview/v3/`。请获取完整仓库，保留根目录下的原图、视频、文章备份及线稿路径。
- 本轮运行源码提交：`71d82dcf680f8c3401eddb87a04a8da877c14df2`。
- 交接前源码基线：`9234d40a3dbfa6be356754eebdb796296927f5fe`。本次新增交接文档不改变运行文件。
- [最新版预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/v3/?v=3.0.15#/project/kugou)。

## 本轮已完成

| 版本 | 修改 |
| --- | --- |
| 3.0.12 | 精简首页与精华油案例，突出项目、本人职责与真实作品；不标精华油脚本数量。 |
| 3.0.13 | 按用户确认稿统一童颜面膜、防晒、洁颜霜的内容与手机排版，去掉视频制作分工，保留本人脚本职责及海报视觉设计归属。 |
| 3.0.14 | 修复成品与线稿错位，统一标题、图框、说明及原图链接的位置；14组对照均已检查。 |
| 3.0.15 | 酷狗保留原文、数据与五个章节，仅统一字体、首屏层级、长图预览、数据区和手机布局。67项原正文、标题及图片说明核对无缺失。 |

原视频、公众号入口、9张视频封面、简历、原图、线稿及历史素材继续保留。详细记录见 `RELEASE-3.0.12.md` 至 `RELEASE-3.0.15.md`。

## 上传与验证状态

2026-11-10核对基线提交的459个已有仓库文件：本地与GitHub路径、大小及Git blob SHA-1全部一致，无待上传差异；本次另外补充本交接文档。

`ASSET-MANIFEST.json`对应3.0.15运行源码，包含416项运行文件及素材，共184,822,771字节。EdgeOne构建校验通过，输出450个文件、194,172,786字节。资源数量包含归档素材，不代表页面同时加载这些文件。

GitHub Pages的3.0.15构建已成功，桌面与手机预览已核对。域名更新还需要同步下方部署副本。

## huhaheng更新域名

部署仓库：`huhaheng/yanping-portfolio-site`，分支 `main`。2026-11-10核对仍停在 `e97a201`，尚未包含本轮修改。当前会话没有该副本写权限，需由维护者完成同步。

沿用现有 `yanpingsun.cn`、HTTPS和EdgeOne配置：

1. 将协作源仓库最新 `main` 同步到部署副本 `main`。
2. 等待EdgeOne从部署副本触发构建；现有命令为 `node tools/build_edgeone.mjs`，输出目录 `dist-edgeone`。
3. 构建成功后，在 [yanpingsun.cn](https://yanpingsun.cn/) 核对实际页面。

若本地 `origin` 指向协作源仓库，`deploy` 指向部署副本，可按现有流程快进同步：

```sh
git fetch origin main:refs/remotes/origin/main
git fetch deploy main:refs/remotes/deploy/main
git merge-base --is-ancestor deploy/main origin/main
git push deploy refs/remotes/origin/main:refs/heads/main
```

如部署副本有独立提交，先核对并保留，再处理同步。现有托管、目录和完整同步说明见 [EDGEONE-DEPLOYMENT.md](EDGEONE-DEPLOYMENT.md)。

## 上线后核对

- 首页直接介绍经历与职责，代表项目使用真实作品。
- 四个产品案例使用统一结构；精华油不写脚本条数，面膜／防晒／洁颜霜不展示视频制作分工。
- 成品与线稿对齐，手机可展开线稿并查看完整原图。
- 酷狗主标题为“酷狗音乐”，原标题保留为副标题，五个章节与原内容完整。
- 酷狗整体引流256万人次、21万名纯新增；电台拉新60,590人、拉活71,999人保留各自统计口径。
- 视频封面、分析、公众号、简历与原图入口正常。微信外链播放需在实际使用环境检查。
- 桌面与手机无横向溢出，浏览器加载的脚本和样式缓存参数为 `3.0.15`。
