# EdgeOne Pages 部署与新域名

2026-11-09：页面更新至3.0.12，精简首页与精华油案例。托管、域名、DNS与HTTPS配置沿用本说明；本次修改见[RELEASE-3.0.12.md](RELEASE-3.0.12.md)。当前构建仍校验416项资源并输出450个文件，194,169,612字节。下方2026-11-07配置与验证记录保留为迁移历史。

更新日期：2026-11-07。迁移复用现有 3.0.11 页面、设计和素材。现有 GitHub Pages 根首页和预览地址继续保留，运行文件没有改写。

## 目前状态

用户已购买并完成 `yanpingsun.cn` 实名认证。新域名已绑定到生产环境，DNS 已生效，免费 HTTPS 证书已部署。当前证书有效期至 2027-02-04，平台会在到期前 15 天自动续期；强制 HTTPS 已启用，301 跳转已保存并重新打开配置核对。

| 项目 | 当前配置 |
| --- | --- |
| 新域名 | `https://yanpingsun.cn/`，入口为网站根目录 |
| 内容协作源仓库 | [yanpingsun/yanping-portfolio-site](https://github.com/yanpingsun/yanping-portfolio-site) |
| 托管使用的部署副本 | [huhaheng/yanping-portfolio-site](https://github.com/huhaheng/yanping-portfolio-site)，`main` |
| EdgeOne 项目 | `yanping-portfolio-overseas`，ID `makers-unagnz0yaijv` |
| 加速区域 | **全球可用区（不含中国大陆）** |
| 控制台 | [项目概览](https://console.cloud.tencent.com/edgeone/makers/project/makers-unagnz0yaijv/index) |
| 平台默认域名 | `yanping-portfolio-overseas-8ghtvlwd.edgeone.dev`，不用作求职投递地址 |
| 构建产物 | `dist-edgeone/`，450 个文件、194,149,436 字节 |

原 EdgeOne 项目 `yanping-portfolio-site`（`makers-exop6jxam5ic`）实际使用“全球可用区（含中国大陆）”，因此未备案域名在绑定时被拦截。未找到创建后修改区域的入口，现已保留原项目，另建上述不含大陆区域项目。新项目的首次部署 `dpo4grmc0wei` 已成功。

域名在 DNSPod 使用以下记录，保留已有验证记录及默认 NS：

| 主机记录 | 类型 | 线路 | 记录值 | TTL |
| --- | --- | --- | --- | --- |
| `@` | CNAME | 默认 | `yanpingsun.cn.pages.dnsoe6.com` | 600 秒 |
| `edgeonereclaim` | TXT | 默认 | EdgeOne 生成的归属验证值，已验证通过 | 600 秒 |

证书使用 EdgeOne 免费托管证书、RSA 2048、自动验证方式，控制台状态为“已部署”。证书入口为“域名管理 → 目标域名 HTTPS 列的配置 → 边缘 HTTPS 证书”，与只含 HTTP/2、IPv6、关联环境的通用域名配置抽屉不同。不要重复申请，不删除已生效的根 CNAME；平台依赖该指向完成验证和后续续期。托管及证书均未购买付费服务。

## 账号与访问验收

1. 域名已确认为 `yanpingsun.cn`，注册和实名认证已完成，无需重复提交个人资料。
2. 控制台操作使用用户本人腾讯云账号授权的会话，不提供密码、验证码或密钥。
3. 用户还需用关闭 VPN 的手机流量和国内宽带打开新网址，核对实际加载效果。执行环境检查不能证明国内各运营商的访问稳定性。

只使用静态托管，无需购买云服务器。GitHub Pages 原根首页和 `/preview/v3/` 继续保留，不添加跳转，也不删除旧项目。

## 生成部署目录

在完整仓库中运行（Node.js 22，无需安装依赖）：

```sh
node tools/build_edgeone.mjs
python3 -m http.server 8080 --directory dist-edgeone
```

打开 `http://localhost:8080/`，新版从网站根目录进入。`dist-edgeone/` 是生成产物，已忽略，不提交到 Git。

工具按 `ASSET-MANIFEST.json` 核对全部 416 项资源的大小与 Git blob SHA-1，再复制到输出目录。保留原目录，同时将六个运行文件和 `preview/v3/assets/` 复制到网站根目录对应位置；两张导航封面、简历、原图及内容源相对链接因此都能解析。运行文件不作改写，现有 `/preview/v3/` 入口也继续可用。

本方案用于独立域名的根目录；不要把产物放入额外的子目录。以后修改运行文件或素材，应评审修改并同步资源清单后再构建，校验失败时不要跳过检查。

## 托管与构建配置

1. 在腾讯云的 EdgeOne Pages 控制台创建项目，使用 `huhaheng` 连接 GitHub，只授权部署副本 `huhaheng/yanping-portfolio-site`。如列表未显示新副本，在 GitHub 应用的仓库授权中将其勾选，再返回 EdgeOne 刷新。
2. 仓库选择 `huhaheng/yanping-portfolio-site`，分支选择 `main`。部署配置已合入主分支，无需再选择历史任务分支。
3. 项目根目录用仓库根目录，框架选其他／自定义。`edgeone.json` 提供构建配置：安装命令 `node --version`（无依赖，仅检查运行环境）、构建命令 `node tools/build_edgeone.mjs`、输出目录 `dist-edgeone`、Node 22.11.0。
4. **加速区域选择“全球可用区（不含中国大陆）”**。该区域绑定自定义域名无需 ICP 备案；不选包含大陆节点的区域。
5. 部署成功后添加自定义域名，配置域名验证、DNS CNAME 和免费 HTTPS。当前域名这三项已完成；未来迁移时仍使用目标项目实际生成的记录值。
6. 用绑定后的自有域名验收，再将该地址用于求职。平台默认项目／部署域名在大陆访问会返回 401，不能作为投递地址。

Git 导入复用已有源码。上述构建配置已在新项目实际部署成功；不会覆盖 GitHub Pages 原根目录入口。

## 后续代码更新与副本同步

内容与设计继续以 `yanpingsun/yanping-portfolio-site` 为协作源仓库，通过任务分支和 PR 合入原仓库 `main`，不另在副本独立维护页面。GitHub Fork 不会自动获得原仓库的新提交；每次原仓库修改合入后，维护者需核对并同步部署副本 `main`，EdgeOne 才会从副本触发新构建。

在本地仓库核对 `origin` 指向原协作仓库，`deploy` 指向 `https://github.com/huhaheng/yanping-portfolio-site.git`；未配置 `deploy` 时先添加。确认副本没有独立修改后，用普通快进推送同步：

```sh
set -e
git fetch origin main:refs/remotes/origin/main
git fetch deploy main:refs/remotes/deploy/main
git merge-base --is-ancestor deploy/main origin/main
git push deploy refs/remotes/origin/main:refs/heads/main
```

当前连接调用 GitHub `merge-upstream` 接口返回 403，普通 Git 推送已验证可用。不使用强制覆盖；如副本出现额外提交，先核对并保留相关改动，再处理同步。原站发布、Fork 同步、EdgeOne 构建成功及新域名实际可访问分别记录。

## 备用方式：直接上传

将 `dist-edgeone/` 的**内容**压缩为 ZIP，确保压缩包第一层就是 `index.html`，然后在“直接上传”中上传。无需在云端执行构建。不要上传整个 Git 仓库，也不要多套一层 `dist-edgeone/`。

直接上传项目不能原地切换到 Git 集成，如以后需要自动部署，需新建 Git 项目再绑定域名。因此优先使用 Git 导入；ZIP 留作不方便连接 GitHub 时的备用。

## 本地验证（2026-11-05）

- 416 项清单资源的大小、Git blob SHA-1 与输出副本全部一致；根目录六个运行文件与现有 3.0.11 逐字节一致。
- 产物 450 个文件、194,149,436 字节；最大单文件 14,824,785 字节，满足当前 20,000 文件、单文件 25 MB 限制。ZIP 第一层包含 `index.html`，压缩包完整性检查通过。
- Chromium 在 320、390、1280px 下检查八个主页面，共 24 组；11 个分析页共 33 组。无横向溢出、脚本异常或 HTTP 错误。
- 82 个站内图片地址、九张有效视频封面均可请求；图片放大、面膜新旧中文分析锚点、返回顶部焦点、原 `/preview/v3/` 入口和当前简历校验通过。
- 已有 GitHub Pages 根首页、运行脚本、样式及 `preview/v3/` 运行文件无修改。以上为本地 Chromium 验证，不代表腾讯云构建、国内网络或真机 Safari 验收。

## 发布验收与回退

2026-11-07 已在新域名根目录检查 320、390、1280px 下八个主页面，共 24 组；82 个站内图片地址、中文分析新旧锚点、图片放大、返回顶部焦点、旧 `/preview/v3/` 入口和简历均通过。未见脚本异常、HTTP 错误或横向溢出。简历 SHA-256 仍为 `3ec379224e1b29a21b3a53d7633987f7d8e3b661b9cee722289339e851782330`。

首页、脚本、样式和简历已与 3.0.11 原文件逐字节核对一致。Google 与阿里 DNS 均解析到上述 CNAME，控制台证书已部署；独立浏览器打开 HTTPS 无证书警告，HTTP 入口跳转至 HTTPS 并显示同一作品集。国内手机流量、宽带及真机 Safari 的实际访问效果仍待用户实测。

从自有域名根目录检查首页、作品目录、关于页、五个案例、分析锚点（含中文和旧名称）、图片放大、九张视频封面、简历 PDF，以及手机与桌面显示。检查刷新后的深链接和网络请求无资源缺失。

微信原视频和文章保持现有链接，不将站内封面与地址正确等同于外链在所有网络可播放。当前地区访问效果必须等自有域名上线后实际测试；如不理想，可以沿用该域名改接香港托管方案。

本阶段不向现有 GitHub Pages 添加跳转、不切换其根首页。回退时停用新域名或新项目即可，原站继续提供服务。

## 官方依据

- [域名与加速区域：备案条件和默认域名 401 规则](https://edgeone.cloud.tencent.com/pages/document/175191784523485184)
- [edgeone.json：构建命令、输出目录和 Node 版本](https://pages.edgeone.ai/zh/document/edgeone-json)
- [直接上传：ZIP 结构、文件限制和 Git 集成限制](https://cloud.tencent.com/document/product/1552/127371)
