# 通用基准版 UX r1

版本 ID：`general`。日期：2026-11-01。基于[内容 r2](../content/README.md)的 UX r1 保留提议；现已回到[原版 UI/UX 基线](../baseline/ui-ux.md)与[同层对照](../baseline/comparison.md)校准，尚未接入网站。原版已有的视觉、内容分层和交互先作为默认起点。

先看原版基线和对照，再按需查看[五页局部线框](output/pdf/general-ux-r1.pdf)、[设计提议](ux-plan.md)和[外部参考](references.md)。线框覆盖首页、精华油、酷狗、防晒、关于我的开头与部分模块，大量后续内容只以续读条概括；它不是完整案例审阅稿，不能用来判断全部内容是否充实。区块并非整页等比例缩小，也不作为最终配色或完整网页。PDF 内的图片用于结构预览，细节仍以原作品为准。

本轮重点：两个主案例保持相当的入口权重；个人贡献在作品前交代；长图、四条精华油视频和完整 PDF 各有入口；三个补充案例按不同问题组织，不强行写成同等篇幅。

## 怎样检查这版

直接试读三个任务即可：从首页选择一个能说明产品内容能力的案例；在酷狗案例找出本人独立负责与统筹审核的部分；在手机方案里找到完整作品、简历与返回项目的入口。记录具体卡在哪里，回到对应内容或布局修订。当前完成的是编辑与结构自查，尚未进行真实招聘读者试读或网页交互测试。

[通用内容r3完整稿](../content/README.md)及[原版对照](../content/reviews/general-r3-vs-baseline.md)现已形成，下一步据此校准UX。内容直接阅读Markdown，不另制作报告PDF；原五页线框维持历史稿状态，不能当作已更新的完整设计。内容事实仍以[证据说明](../content/evidence.md)为准；CV 是否最新及成果口径的本人核对继续保留。

## 重建线框

需要 Python 3、`reportlab`、`fonttools` 和 `Pillow`，以及官方 [Noto Sans SC](https://github.com/google/fonts/tree/main/ofl/notosanssc) 字体。字体不作为网站依赖，PDF 中只嵌入使用到的字形；许可附在 [NotoSansSC-OFL.txt](tools/NotoSansSC-OFL.txt)。

在仓库根目录运行：

```bash
python3 design/tools/build_wireframes.py --font /path/to/NotoSansSC.ttf
```

脚本仅生成静态审阅 PDF，不生成或修改 HTML/CSS/JS。网站原有 `portfolio-2026-wireframes.js` 是历史项目内容对照，与本轮 UX 线框不同。
