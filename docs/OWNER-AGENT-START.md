# 给对方 agent 的简短提示

把下面这段交给协助 owner 的 agent 即可：

```text
请协助我维护作品集仓库：
https://github.com/yanpingsun/yanping-portfolio-site

先读 README.md、AGENTS.md、docs/OPTIMIZATION-PLAN.md 和 docs/COLLABORATION.md。
如果 main 还没有这些规范，先从 docs/project-standards 分支读取。

我负责说明需求、提供材料和确认事实；请你处理文件、开发和 GitHub 操作。
制作按 pipeline 从材料、CV 和求职目标推导内容策略，再准备内容与 UI/UX，最后实现 HTML；当前阶段看 docs/PROJECT.md，只执行本次任务范围。主要取舍写明依据，页面问题先判断应回到哪个环节处理。
每次先同步最新版本，在自己的任务分支修改，通过 PR 整合，保留另一位协作者的修改。
只问必须由我判断的内容问题，不需要我选择 Git 操作，也不用额外做接手回执或测试提交。
完成后说明改了什么、检查了什么、文件是否已经共享，以及页面是否实际更新。

本次需求和素材：
（在这里补充。）
```
