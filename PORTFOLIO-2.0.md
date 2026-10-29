# 孙岩萍作品集 2.0

正式网址：https://yanpingsun.github.io/yanping-portfolio-site/

2026年10月29日按确认的“杂志扉页”示意更新首页：姓名与职业定位、大字号价值主张、三项核心经历分栏；手机端按纵向排列。顶部保留五个同级项目菜单与独立“关于我”页面，首页“浏览五个项目”进入完整项目目录。洁面与精华油、防晒、童颜面膜、酷狗音乐同级展示。

## 维护文件

- `index.html`：页面入口、网站分享文案、全站导航、资源版本号。
- `portfolio-2026.js`：首页、关于我、项目目录、完整案例、路由和图片预览。`PROJECT_INTROS` 中维护五个项目的开篇标题、侧重点和摘要。
- `portfolio-2.css`：2.0 首页、菜单与响应式样式；保留原有 `portfolio-2026.css` 和线稿样式供案例正文使用。
- `portfolio-2026-content.js`：五个完整案例的职责、内容、作品链接、视频与成果。
- `portfolio-2026-wireframes.js`：四个护肤品项目的海报线稿、成品与对应说明。
- `portfolio-previews/`：项目目录和案例封面的轻量预览图；杂志扉页首页使用网页文字排版。
- `portfolio-content/` 及仓库原始素材：历史作品、PDF、视频和原图。

## 页面地址

- 首页：`#/`
- 精华油：`#/project/oil`
- 防晒：`#/project/sun`
- 童颜面膜：`#/project/mask`
- 洁面：`#/project/clean`
- 酷狗音乐：`#/project/kugou`
- 关于我：`#/about`
- 项目目录：`#/works`，由首页“浏览五个项目”进入，也用于案例之间的浏览。
- 海报线稿：`#/project/<项目id>/wireframes`。原 `#/wireframes` 入口仍跳转到防晒线稿。

直接编辑静态 HTML/CSS/JS，无需安装依赖或构建。可在仓库根目录运行 `python3 -m http.server 8765`，再访问 `http://127.0.0.1:8765/`。代码推送到 main 后由已有 GitHub Pages 流程发布。

替换素材时同步上传新文件并更新引用路径；修改脚本或样式后，更新 `index.html` 中对应的版本查询参数。

内容按已确认职责展示；个人策划、审核、团队制作各有分工。护肤品 GMV 保留团队及渠道成果口径，酷狗各数据保留原统计范围。历史作品原貌与案例分析分开呈现。
