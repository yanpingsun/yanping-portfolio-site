# 孙岩萍作品集优化

更新日期：2026-11-01。

## 目标

首要任务是形成适合求职目标的优质内容，让目标岗位读者基于真实、相关、清楚且有作品支持的信息，准确理解孙岩萍的能力、个人贡献与适配程度，形成合理预期。内容策略、UI/UX、协作和代码维护均服务于这一目标。

结合 CV 与实际主投岗位确定重点；当前保留产品内容策划和新媒体运营两类能力，不预先固定案例排序。具体判断见 [内容质量标准](OPTIMIZATION-PLAN.md#首要目标与内容质量)。

## 当前项目

- 仓库：https://github.com/yanpingsun/yanping-portfolio-site
- 正式站：https://yanpingsun.github.io/yanping-portfolio-site/
- 技术：静态 HTML/CSS/JS，GitHub Pages。
- 页面：首页、五个案例、项目目录、关于我、图片查看与线稿对照。
- 当前网站代码基线：c9fc45a4417e7a8cfca30cc6536adcbaa66bcfe0；后续以最新 main 为准。
- 改版分支：work/portfolio-revamp。
- 规范分支：docs/project-standards；[草稿 PR #1](https://github.com/yanpingsun/yanping-portfolio-site/pull/1) 尚未合入 main。

## 目前进度

仓库已完整克隆，规范已共享，协作保持正常同步、任务分支与 PR。当前只搭建从输入、定位证据、内容策略到内容／UI/UX 和 HTML 的完整 pipeline，写清制作与反馈方法；尚未据此启动新一轮岗位研究、网页内容稿、UI/UX 方案或网站实现。

三个 JS 的语法、7 个入口资源与 66 个案例本地引用已检查通过。已在本地浏览器查看首页、五个案例、目录与关于我，并以窄屏框架检查首页和精华油；尚未做真实手机测试和性能量化。

## 后续实际任务（尚未开始）

1. 在具体任务中核对 CV 版本、主投岗位和能力证据，形成一页策略底稿；当前方向与 JD 仍待明确。
2. 内容与 UI/UX 可分别制作，以同一策略为依据，用代表案例相互校准并检验方法。
3. 内容与设计可用后，再进行 HTML/CSS/JS 实现和实际验证，代码原型也留到此时。

制作方法、成果位置和问题回溯统一见 [制作 Pipeline](OPTIMIZATION-PLAN.md)。任务进度仍写在各自 PR，阶段变化才更新本文件。
