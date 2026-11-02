# general：HTML 预览 r1

日期：2026-11-02。基于 `general-content-r3` 与 `general-ux-r2`，供实际试读和比较；尚未确认替换正式入口。

- 预览：<https://yanpingsun.github.io/yanping-portfolio-site/preview/general/>
- 现有网站：<https://yanpingsun.github.io/yanping-portfolio-site/>
- 完整工作稿、生成工具与协作规范：[工作分支](https://github.com/yanpingsun/yanping-portfolio-site/tree/work/general-ux-r1)。
- 固定内容来源：[内容 r3](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-content-r3)；固定展示方案：[UX r2](https://github.com/yanpingsun/yanping-portfolio-site/tree/archive/general-ux-r2)。

首页、目录、关于与五个完整案例均可阅读，另有13份补充分析阅读页。14组海报按7组主展示、7组补充组织；11条视频独立播放，原图、全文PDF及原文件继续引用仓库现有素材。保留原有项目、章节、具体海报及联系哈希入口。

## 维护

本目录只放静态预览产物；新增这一路径不修改根目录的正式页面和素材，不切换 Pages 发布源。预览通过独立 PR 合入 main，完整方法与内容工作稿继续通过原草稿 PR 评审。

文案先修改完整工作分支的 `content/` Markdown，各稿仅“网页正文”进入页面；编辑说明不进入展示。补充材料引用 `portfolio-content/`。随后在仓库根目录运行：

```bash
python3 tools/build_general_preview.py
node --check preview/general/app.js
node --check preview/general/data.js
```

生成工具需要 Python 3 和 Pillow，仅用于读取图片尺寸；网站运行不依赖 Python 或构建服务。`data.js` 由工具生成，不单独手改；内含来源校验值。需要改版式与交互时维护本目录的 `index.html`、`styles.css`、`app.js`。

从仓库根目录启动任意静态文件服务，访问 `/preview/general/`。在 Codex 托管环境采用环境提供的预览服务，不另起冲突服务器。只下载本目录无法打开共用原件；本地查看应使用完整仓库。

验证范围与后续事实核对见完整工作分支的项目状态及 HTML 检查记录。当前预览不是已确认的投递版本，也不表示内容已取得本人最终确认或招聘读者试读。
