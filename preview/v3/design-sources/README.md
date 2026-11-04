# 导航封面原稿与编辑指令

供3.0.9后续维护使用，已随源码上传GitHub。

| 项目 | 无损PNG原稿 | 网站使用的WebP | 编辑提示词 |
| --- | --- | --- | --- |
| 酷狗 | [kugou-cover-v308.png](kugou-cover-v308.png) | [kugou-platform-cover-v308.webp](../assets/kugou-platform-cover-v308.webp) | [kugou-cover-v308-prompt.txt](kugou-cover-v308-prompt.txt) |
| 精华油 | [oil-cover-v309.png](oil-cover-v309.png) | [oil-editorial-cover-v309.webp](../assets/oil-editorial-cover-v309.webp) | [oil-cover-v309-prompts.md](oil-cover-v309-prompts.md) |

两张PNG均为1448×1086、4:3，是内置imagegen输出的最终合成图，无PSD分层文件。WebP由最终PNG转码供网站加载。

修改时延续浅暖灰背景、深色标题、主体周围留白以及底部类别标签的安全空间；在首页把两个项目并排检查，并核对手机显示。类别标签由HTML叠加，图片本身不需要写入该标签。

原产品海报为仓库根目录的`portfolio-essence-oil-original.png`。酷狗原用户参考图未作为历史传播作品发布；本目录保存的是最终导航设计。案例正文仍引用原有历史作品。

网站资源路径由`app.js`的`projectArtwork`指定，替换原稿后应同步更新WebP及相应缓存参数。详见[接手说明](../START-HERE.md)。
