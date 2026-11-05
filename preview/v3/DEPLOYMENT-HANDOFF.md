# 作品集3.0.10：部署网址迁移交接

更新日期：2026-11-04。供huhaheng于2026-11-05接手修改部署网址时使用。

2026-11-05修复补充：本分支为3.0.11修复稿，仅更正返回顶部焦点和简历拉新单位，尚未合入main或发布；下方3.0.10网址继续表示线上基线。本分支资源清单已更新为3.0.11源码提交`f0036d67e4cbf83d7145eb2a07871ff82d54a6a5`；3.0.10原清单仍可从Git提交`61205c0`查回。网址和部署目录尚未修改。

## 当前可用基线

- 仓库：[yanpingsun/yanping-portfolio-site](https://github.com/yanpingsun/yanping-portfolio-site)，分支`main`。
- 最新作品集入口：`preview/v3/index.html`，页面版本3.0.10。
- 3.0.10运行源码基线：[`33954c0f479d416deeb8ecb34fd63dd9ad52a9d1`](https://github.com/yanpingsun/yanping-portfolio-site/commit/33954c0f479d416deeb8ecb34fd63dd9ad52a9d1)。之后的交接文档提交不改变页面内容。
- 当前网址：[作品集3.0.10](https://yanpingsun.github.io/yanping-portfolio-site/preview/v3/?v=3.0.10#/home/selected)。
- 修改位置与已确认内容见[START-HERE.md](START-HERE.md)及[HANDOFF.md](HANDOFF.md)。

此次同步已核对：本地`preview/v3/`的44个现有文件与GitHub一致；图片、录屏、PDF及其他素材也无待上传差异。图片与备份引用中的116个路径均存在。

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

[ASSET-MANIFEST.json](ASSET-MANIFEST.json)在本修复分支记录416项运行文件与资源的路径、大小、Git blob SHA-1，共184,811,096字节（含新增的用户原简历备份）；包含归档素材，不代表浏览器会一次加载这些文件。当前清单对应本修复分支的3.0.11源码提交，校验某文件可在完整克隆仓库中运行`git hash-object 文件路径`与`gitBlobSha1`比较。

## 修改新网址时的路径区别

### 保留现有目录结构

如果只是换域名或托管服务，且仍以`/preview/v3/`访问页面，应同时部署整个仓库的静态文件。当前相对路径会按新网址解析，原微信视频、公众号及邮件地址继续作为外链使用。

### 将3.0.10改为根首页或其他目录

仓库根目录的旧`index.html`是另一个版本，不能把它直接当作3.0.10入口。若要把最新页面迁到新站根目录或其他层级，需要一起调整资源根路径：

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

最终新网址尚待此次迁移确定；本次交接未替换现有部署地址。
