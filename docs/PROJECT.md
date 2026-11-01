# 作品集优化项目

更新日期：2026-11-01。

## 目标与范围

基于已有作品材料，逐步优化作品集的内容结构、页面表达、交互与代码维护。当前先按品牌／产品内容策划及相关岗位的展示需求规划，具体目标岗位与首屏定位在内容蓝图阶段进一步明确。

本项目的代码实施范围为 `yanpingsun/yanping-portfolio-site`。其他资料仓库需要明确指定后再纳入工作，不与本站自动双向同步。

## 协作角色

| 角色 | 主要职责 |
| --- | --- |
| owner：孙岩萍／`yanpingsun` | 提供作品材料，确认事实、个人职责及表达 |
| 技术协作者：`huhaheng` | 推进优化范围、优先级与交付检查 |
| AI 开发协作 | 读取当前仓库，整理方案，实现与验证，维护交接记录 |

owner 会继续修改仓库。双方通过 GitHub 提交交换更新，工作分支负责隔离改版，PR 负责交付整合。

## 项目规范 1.1

- [README](../README.md)：人的项目入口与预览说明。
- [AGENTS](../AGENTS.md)：AI 执行入口。
- [项目规范](STANDARDS.md)：内容依据、发布内容、素材、实现和验证标准。
- [协作规则](COLLABORATION.md)：并行修改与 Git 交付。
- [owner agent 接手说明](OWNER-AGENT-START.md)：可转交的提示词及接入方法。
- [PR 模板](../.github/PULL_REQUEST_TEMPLATE.md)：双方 agent 的任务交接字段。
- [决定记录](DECISIONS.md)：已采用规则与尚待明确的改版事项。

这些规范已在当前工作分支采用；具体首页和案例方案仍按计划推进，未因规范建立而自动定稿。

## 项目建立时的基线

- 正式网站：<https://yanpingsun.github.io/yanping-portfolio-site/>
- 仓库：<https://github.com/yanpingsun/yanping-portfolio-site>
- 正式分支：`main`。
- 当前工作分支：`work/portfolio-revamp`。
- 规范分享分支：`docs/project-standards`，与后续改版代码分开交付。
- 克隆基线：`c9fc45a4417e7a8cfca30cc6536adcbaa66bcfe0`。
- 基线提交日期：2026-10-29。
- 基线说明：`Replace portfolio homepage with approved magazine opening layout`。
- 建立时完整克隆包含 37 个提交、383 个已跟踪文件，非浅克隆。

上述数量和 SHA 只记录项目建立时状态；之后以实际 Git 记录为准。

## 当前网站

- 原生 HTML/CSS/JS，GitHub Pages 发布，无安装或构建步骤。
- 首页为作品集 2.0 杂志扉页布局。
- 五个案例：精华油、防晒、童颜面膜、洁面、酷狗音乐。
- 另含项目目录、关于我、线稿与成品对照、图片查看及原生视频播放器。
- 现有图片预览、原件、PDF、视频与历史资料路径继续保留。

## 当前进度

| 工作 | 状态 |
| --- | --- |
| 仓库源码与材料初审 | 已完成第一轮 |
| 完整克隆与独立工作分支 | 已建立 |
| 项目入口、协作说明与优化计划 | 已共享至规范分支 |
| 项目规范 1.1 | 已明确双方 agent 分工、GitHub 操作、资料／页面状态、接手提示词和 PR 模板 |
| 规范分享分支与草稿 PR | 已共享 [草稿 PR #1](https://github.com/yanpingsun/yanping-portfolio-site/pull/1)，未合入 main |
| 首页与案例改版 | 尚未开始 |
| 本轮页面浏览器／手机／性能验证 | 尚未执行 |
| 页面改版分支推送、PR、合并或上线 | 待后续交付阶段；与规范文档分享分开记录 |

已执行文档本地引用与 Git 空白检查；本次未修改页面，不要求额外执行页面回归。规范已通过独立分支和草稿 PR 分享，不代表设计方案验收、合入 main 或网站更新。

## 下一步

对方 agent 现在可按接手说明读取规范分支；规范草稿 PR 保持待审。接下来形成全站内容与页面蓝图，以首页和精华油主案例建立样板。其他案例扩展、代码整理与发布按 [优化计划](OPTIMIZATION-PLAN.md) 推进。

新任务开始时，先按 [协作规则](COLLABORATION.md) 获取 owner 的最新远端状态。
