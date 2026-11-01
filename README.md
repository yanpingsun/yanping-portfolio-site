# 孙岩萍作品集网站

面向品牌／产品内容策划及相关岗位的作品集，包含精华油、防晒、童颜面膜、洁面与酷狗音乐五个案例。

- 网站：<https://yanpingsun.github.io/yanping-portfolio-site/>
- 仓库：<https://github.com/yanpingsun/yanping-portfolio-site>
- 技术：原生 HTML、CSS、JavaScript；GitHub Pages 发布。

## 开始协作

先读 [项目状态](docs/PROJECT.md) 了解进度，开发遵循 [AGENTS.md](AGENTS.md)。双方使用正常的 [同步、分支与 PR 流程](docs/COLLABORATION.md)。

owner 只需说明需求、提供素材和确认事实，GitHub 操作由 agent 处理。需要给对方 agent 上下文时，可转交 [简短接手提示](docs/OWNER-AGENT-START.md)。规范尚未合入 main 时，从 docs/project-standards 分支读取。

## 制作方法

先读 [制作 Pipeline](docs/OPTIMIZATION-PLAN.md)：如何从原始材料、CV 和求职目标推导定位、证据、内容策略，再分别准备内容与 UI/UX，最后实现并验证 HTML。文档同时说明选材与展示的理由、写作者的交付方式，以及页面问题应回到哪个环节处理。当前先搭建这套方法，具体研究与制作尚未开始。

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
| `content/`（按需建立） | 本轮准备进入网页的内容稿与选材说明 |
| `design/`（按需建立） | UI/UX 参考、版式与页面设计稿 |
| `portfolio-previews/` | 网页轻量预览图 |
| `docs/` | 本轮优化的项目状态、计划与协作说明 |

## 修改与发布

开发在工作分支进行；开工和 PR 交付前检查 owner 的远端更新，再整合有影响的变更。`main` 对应正式网站，合并后的发布沿用现有 GitHub Pages 配置。具体步骤见 [协作规则](docs/COLLABORATION.md)。

本轮当前分支为 `work/portfolio-revamp`。内容继续遵循已确认的个人职责与成果口径，技术和设计任务在授权范围内自主推进；事实缺口与内容含义冲突单独说明。
