# 孙岩萍作品集网站

面向品牌／产品内容策划及相关岗位的作品集，包含精华油、防晒、童颜面膜、洁面与酷狗音乐五个案例。

- 网站：<https://yanpingsun.github.io/yanping-portfolio-site/>
- 仓库：<https://github.com/yanpingsun/yanping-portfolio-site>
- 技术：原生 HTML、CSS、JavaScript；GitHub Pages 发布。

## 开始协作

项目规范 1.1 包含内容／开发标准与双方 agent 的协作方式。不同入口各自负责：

| 入口 | 用途 |
| --- | --- |
| [项目状态](docs/PROJECT.md) | 当前做到哪里，下一步是什么 |
| [项目规范](docs/STANDARDS.md) | 内容依据、素材、目录、代码和验证要求 |
| [协作与同步](docs/COLLABORATION.md) | owner 与协作者如何同步、解决冲突和交付 PR |
| [给 owner 的 agent](docs/OWNER-AGENT-START.md) | 可直接转交的接手提示词，以及规范尚未合入 main 时的读取方法 |
| [决定记录](docs/DECISIONS.md) | 哪些已采用，哪些仍是改版建议 |
| [优化计划](docs/OPTIMIZATION-PLAN.md) | 分阶段目标与交付物 |
| [AGENTS.md](AGENTS.md) | Codex／ChatGPT 等 AI 工具的执行入口 |

当前页面和路由参考 [2.0 实现说明](PORTFOLIO-2.0.md)。规范的本地建立、远端合并和网站发布分别记录，不互相代表完成。

## owner 提供资料时

owner 只需说明业务需求、提供文件、确认事实或页面效果。GitHub 操作交给 agent，不用先学分支、提交或 PR。

可以直接对自己的 agent 说：

- “这些是精华油的新视频，先归档资料，还不用改网页。”
- “把网站童颜面膜案例中的这句话改成下面的版本。”
- “这张图片替换防晒页面的旧图，其他内容保持现有版本。”

agent 应识别案例、补充／替换关系、个人负责部分与数据范围，只追问影响事实或交付的缺口，再按 [协作流程](docs/COLLABORATION.md) 更新文件、验证并交付任务分支／PR。

历史作品、后期复盘和重建示例分开说明。只在自己电脑上的文件不会自动同步给其他协作者，需要提交到共同使用的 GitHub 分支。

第一次接入时转交 [接手说明](docs/OWNER-AGENT-START.md) 中的提示词。规范未合入 `main` 时，明确读取 `docs/project-standards` 分支，不能只打开旧默认分支就假定已读到新规则。

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
| `portfolio-previews/` | 网页轻量预览图 |
| `docs/` | 本轮优化的项目状态、计划与协作说明 |

## 修改与发布

开发在工作分支进行；开工和 PR 交付前检查 owner 的远端更新，再整合有影响的变更。`main` 对应正式网站，合并后的发布沿用现有 GitHub Pages 配置。具体步骤见 [协作规则](docs/COLLABORATION.md)。

本轮当前分支为 `work/portfolio-revamp`。内容继续遵循已确认的个人职责与成果口径，技术和设计任务在授权范围内自主推进；事实缺口与内容含义冲突单独说明。
