# 作品集3.0.13：部署网址迁移交接

发布状态（2026-11-09）：源码与GitHub Pages预览版本为3.0.13；正式域名yanpingsun.cn仍待huhaheng同步部署副本main后更新。当前部署副本停在e97a201，当前会话没有该副本写权限。请按EDGEONE-DEPLOYMENT.md同步原仓库最新main，等待EdgeOne构建并复核正式域名。

更新日期：2026-11-09。供huhaheng及后续维护者核对部署网址时使用。

2026-11-07 部署更新：不含中国大陆区域的新项目 `yanping-portfolio-overseas` 已部署成功，`yanpingsun.cn` 已绑定生产环境，DNS 已生效，免费 HTTPS 证书已部署。实际配置和验收见 [EDGEONE-DEPLOYMENT.md](EDGEONE-DEPLOYMENT.md)。新域名根目录复用 3.0.11，不替换现有 GitHub Pages 根首页。

2026-11-05修复记录：3.0.11仅更正返回顶部焦点和简历拉新单位，通过[PR #8](https://github.com/yanpingsun/yanping-portfolio-site/pull/8)交付。资源清单已更新为3.0.11源码提交`f0036d67e4cbf83d7145eb2a07871ff82d54a6a5`；3.0.10原清单仍可从Git提交`61205c0`查回。当时尚未修改网址和部署目录；本次新域名迁移状态以上述2026-11-07记录为准。

2026-11-09内容更新：3.0.12精简首页与精华油案例，保留新域名部署方式，运行源码提交为`428350de086e4c66df13aa2fb22ff2227aef7e40`。具体改动与检查见[RELEASE-3.0.12.md](RELEASE-3.0.12.md)。

3.0.13运行源码提交：`070b3112bf3ae1c0beb2fb24e83f762ced62fb5b`。三个产品的统一排版和已确认文案见[RELEASE-3.0.13.md](RELEASE-3.0.13.md)。

## 当前可用基线

- 仓库：[yanpingsun/yanping-portfolio-site](https://github.com/yanpingsun/yanping-portfolio-site)，分支`main`。
- 最新作品集入口：`preview/v3/index.html`，页面版本3.0.13。
- 历史3.0.11运行源码基线：[`f0036d6`](https://github.com/yanpingsun/yanping-portfolio-site/commit/f0036d67e4cbf83d7145eb2a07871ff82d54a6a5)。3.0.12运行源码提交见上方记录。
- 当前新域名：[正式域名（待同步3.0.13）](https://yanpingsun.cn/)；[GitHub Pages预览](https://yanpingsun.github.io/yanping-portfolio-site/preview/v3/?v=3.0.13#/home/selected)继续保留。
- 修改位置与已确认内容见[START-HERE.md](START-HERE.md)及[HANDOFF.md](HANDOFF.md)。

3.0.10交接时已核对：本地`preview/v3/`的44个现有文件与GitHub一致；图片、录屏、PDF及其他素材也无待上传差异。图片与备份引用中的116个路径均存在。

## 下载与迁移范围

请克隆或下载**整个仓库**，保留目录关系。最新页面不只是`preview/v3/`这一个文件夹：

| 内容 | 仓库位置 |
| --- | --- |
| 最新运行源码 | `preview/v3/index.html`、`app.js`、`styles.css`、`data.js`、`content.js`、`media.js` |
| 当前封面、简历、电台图片 | `preview/v3/assets/` |
| 9张原始视频封面PNG | `preview/v3/assets/video-covers/`，对应表见[VIDEO-COVERS.md](VIDEO-COVERS.md) |
| 两张导航封面无损PNG和编辑提示词 | [design-sources/](design-sources/README.md) |
| 原作品、海报线稿、录屏、文章备份等 | 仓库根目录`portfolio-content/`及相关`portfolio-*`文件 |
| 原内容稿与归档材料 | 仓库根目录`content/`及现有材料目录 |

[ASSET-MANIFEST.json](ASSET-MANIFEST.json)记录416项运行文件与资源的路径、大小、Git blob SHA-1，共184,815,983字节（含新增的用户原简历备份）；包含归档素材，不代表浏览器会一次加载这些文件。当前清单对应3.0.13源码提交，校验某文件可在完整克隆仓库中运行`git hash-object 文件路径`与`gitBlobSha1`比较。

## 修改新网址时的路径区别

### 保留现有目录结构

如果只是换域名或托管服务，且仍以`/preview/v3/`访问页面，应同时部署整个仓库的静态文件。当前相对路径会按新网址解析，原微信视频、公众号及邮件地址继续作为外链使用。

### 将当前版本改为根首页或其他目录

仓库根目录的旧`index.html`是另一个版本，不能把它直接当作3.0.11入口。若要把最新页面迁到新站根目录或其他层级，需要一起调整资源根路径：

- `app.js`顶部：`const root = new URL('../../', document.baseURI)`。
- `index.html`的站点图标路径：`../../portfolio-2026-favicon.svg`。
- `content.js`、`media.js`、`data.js`中的`preview/v3/assets/`等仓库根相对资源路径。
- `app.js`中`projectArtwork`的两张导航封面是相对当前页面的`assets/...`；简历同样以当前页面的`assets/resume.pdf`为入口。
- 原件路径经各内容稿的`source`计算，详情页原图、录屏和分析正文不能只按当前HTML目录拼接。
- 如同时迁移GitHub仓库，检查`app.js`中Markdown回退链接的仓库地址及`work/general-ux-r1`分支引用。

按实际新目录结构调整这些位置，并用真实请求核对资源地址；不要只移动HTML或只修改页面展示的网址。旧版本与历史资料应保留可恢复记录。

当前页面使用`#/project/...`、`#/read/...`形式的哈希路由。迁移后验证带完整哈希的直接访问与刷新，尤其是中文分析锚点及旧名称兼容。

## 上线前后核对

1. 首页、作品目录、五个案例、关于页、简历PDF均可从新网址打开。
2. 两张导航封面、9张视频封面与放大原图正常显示；视频封面使用3:4图框、contain完整展示。
3. 面膜“跨垂类达人脚本策划”的新分析内容可见；旧“夫妻日常视频”和“第三条”分析锚点仍能定位。
4. 防晒主展示为达人讲述和向海岚；已下架的李颖观看地址不应重新启用。
5. 原图、PDF、补充作品折叠、分析跳转与返回位置正常；控制台及网络请求无缺失资源。
6. 在320、390、1280px窗口核对文字、图框和目录；窗口检查不替代真机测试。
7. 对实际改动的脚本、样式更新缓存版本；网站文档中的正式访问地址也应同步为最终新网址。

若继续沿用现有GitHub Pages流程，提交后确认对应提交的`pages build and deployment`成功，再核对新网址。新域名或新托管服务的域名、HTTPS设置由实际部署方案决定。微信外链仅保留已有配置，不将配置地址或浏览器受限结果当作已验证播放。

新网址已确定为 `https://yanpingsun.cn/`，托管于 EdgeOne 的不含中国大陆区域项目。现有 GitHub Pages 根首页和预览地址均保留。
