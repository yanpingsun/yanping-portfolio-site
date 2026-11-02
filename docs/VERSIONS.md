# 展示版本与迭代记录

更新日期：2026-11-02。管理不同岗位／面试场景的展示版本，以及同一版本后续的修改。当前已补齐原版上游基线；`general` 七份页面已形成完整内容r3，UX r1待按完整内容校准。原站、早期稿与精华油单案节点继续保留，尚未制作新的网页入口。

## 三件事分开管理

| 对象 | 管理方式 |
| --- | --- |
| 共同事实与素材 | 原始作品、履历、个人职责和成果口径继续引用现有来源。各版本可以选择不同重点，事实依据保持一致 |
| 不同展示版本 | 实际有不同投递需求时建立稳定版本 ID，例如 `general`、`product-content`、`interview-01`。定位稿记录用途、目标岗位、所用 CV 和基于哪个既有版本／提交，以及本版取舍 |
| 同一版本的迭代 | 日常修改用 Git 提交记录；到可评审、对外投递或发布等重要节点，再记录 `r1`、`r2` 等里程碑、所处阶段及固定提交。小修不必反复新建版本文件夹 |

版本名称说明“给谁看”，里程碑说明“当时是哪一版”。版本 ID 保持稳定，过往节点的记录继续保留。

## 文件与协作

| 位置 | 用途 |
| --- | --- |
| 现有原件、`portfolio-content/` 与 CV | 共用的原始材料与事实来源，不为每个展示版本复制整库、图片、视频和 PDF |
| `content/`（按需建立） | 基准版定位稿与页面内容稿，沿用 pipeline 的文件约定 |
| `content/versions/<版本ID>/`（按需建立） | 该展示版本的定位稿与完整页面稿，引用共同素材；同版后续修改直接更新这些稿件，由 Git 保留历史 |
| `design/versions/<版本ID>/`（确有差异时建立） | 该版独有的设计。共用版式时，在定位稿中说明所用设计，不重复制作 |

双方仍使用正常任务分支和 PR。每项任务及交付说明正在修改哪个展示版本；同一版本内的修改不互相覆盖，不为每轮修改复制整个项目。

重要里程碑由 agent 保留 Git 标记或只读归档分支，并在下表记录固定提交。归档引用不继续移动；后续修订产生新提交与新节点。未合入主线的里程碑也必须有保留引用，不能只依赖临时任务分支。

经核实的事实更正，先更新共同依据，再核对仍在维护且引用该事实的版本。历史归档保留原样，在索引中注明已知修正；复用旧稿前核对现行事实，不把历史口径直接带入新的投递版本。

## 已保留的节点

| 展示版本 | 用途 | 阶段／节点 | 固定提交 | 保留位置与状态 |
| --- | --- | --- | --- | --- |
| `baseline-20261101` | 本轮优化前的现有网站 | 原站源码基线 | [c9fc45a](https://github.com/yanpingsun/yanping-portfolio-site/commit/c9fc45a4417e7a8cfca30cc6536adcbaa66bcfe0) | [归档分支](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/baseline-20261101)，含该提交的页面和素材；未新增网页入口 |
| `general` | 通用基准版，首稿时方向暂定 | 内容 r1，已由 r2 接续、未投递 | [366e407](https://github.com/yanpingsun/yanping-portfolio-site/commit/366e4077ce653d26bccb276bfe0bdc23a1fde47f) | [首稿归档](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-content-r1)，含定位、证据与七份页面稿；没有对应新网页 |
| `general` | 通用基准版，用户已确认用途 | 内容 r2，编辑自查节点，当前待原版完整性校准 | [b620200](https://github.com/yanpingsun/yanping-portfolio-site/commit/b620200499655907ab45c00c1ba2114ba9e7e302) | [r2归档](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-content-r2)，原样保留当时内容；后续发现的作品选材缺口见当前对照，未制作或发布网页 |
| `general` | 基于内容 r2 的通用阅读体验 | UX r1，参考、结构与五页局部线框，待原版同层校准 | [c892af7](https://github.com/yanpingsun/yanping-portfolio-site/commit/c892af701e36932524b6243799f43f9caed0b4fc) | [UX r1归档](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-ux-r1)，原样保留当时的设计提议与静态 PDF；不是完整案例或已验证改版，没有对应新网页 |
| `general` | 以原版完整案例为起点的增量修订 | 精华油单案内容 r3，完整工作稿及改动对照，待试读 | [4ba2975](https://github.com/yanpingsun/yanping-portfolio-site/commit/4ba297564ced1583c19b99f4d4ade6320c07fe31) | [单案 r3 归档](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-oil-content-r3)，三组海报与原版核心作品入口保留；直接维护 Markdown，无新增报告 PDF 或网页；其余页面未升级为 r3 |

原版的[内容与UI/UX还原](../baseline/README.md)从上述固定源码提取，文档位于当前工作分支；没有回写或移动原站归档。它补齐比较依据，不替代原始作品与事实核对。

用户已确认先做 `general` 通用基准版，内容稿见[阅读入口](../content/README.md)。内容r1、r2、UX r1与11月1日精华油单案r3保留当时状态；当前首页、关于我和五个案例已形成完整通用内容r3，实际取舍见[逐项对照](../content/reviews/general-r3-vs-baseline.md)。各稿继续同版修订，不改写归档。尚未形成岗位定制版或已确认投递版本。后续只记录实际建立的版本与重要节点；被新节点替代时标明状态并保留旧记录。更早的迭代仍可从原站基线的Git历史查阅。

## 查看、恢复与投递

- 查看旧版时由 agent 隔离检出相应提交，保持当前工作区不受影响。需要恢复时，在当前任务分支选择性恢复相关内容或网站文件，检查后形成新提交；保留当前规范和已确认事实，不回退整个主分支历史。
- 源码归档与旧网页的独立访问入口分别处理。多版本网页入口在 HTML 阶段实现；需要保持投递时内容一致的入口应绑定具体里程碑，通用入口可随正常发布更新。
- 交付明确版本 ID、阶段、是否有固定节点及是否实际发布；内容稿的 `r1` 不代表已经制作或发布对应网页。

制作方法见 [Pipeline](OPTIMIZATION-PLAN.md)，双方操作遵循 [AGENTS](../AGENTS.md) 与 [协作说明](COLLABORATION.md)。版本管理服务于合适的内容与可靠交付，按实际需求建立，不预建全部岗位版本。
