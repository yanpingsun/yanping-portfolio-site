#!/usr/bin/env python3
"""Build five static review sheets; this is not a website or code prototype."""
from __future__ import annotations
import argparse
from pathlib import Path
from tempfile import TemporaryDirectory
from xml.sax.saxutils import escape

from fontTools.ttLib import TTFont as FontFile
from fontTools import subset
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[2]
WIDTH, HEIGHT = landscape(A3)
INK = colors.HexColor('#20272B')
MUTED = colors.HexColor('#586269')
LINE = colors.HexColor('#CAD0D4')
PAPER = colors.HexColor('#F1F3F4')
OIL = 'portfolio-content/essence-oil/assets/'
KUGOU = 'portfolio-content/kugou/assets/'
SUN = 'portfolio-content/sunscreen/assets/'


class Sheet:
    def __init__(self, target):
        self.c = Canvas(str(target), pagesize=(WIDTH, HEIGHT), invariant=1)
        self.c.setTitle('孙岩萍作品集 | general 通用版 UX r1')
        self.c.setAuthor('yanping-portfolio-site')

    def box(self, x, y, w, h, fill=colors.white):
        self.c.setFillColor(fill)
        self.c.setStrokeColor(LINE)
        self.c.setLineWidth(.65)
        self.c.roundRect(x, HEIGHT-y-h, w, h, 2, fill=1, stroke=1)

    def text(self, x, y, w, value, size=10.5, leading=None, bold=False, color=INK):
        style = ParagraphStyle('body', fontName='SC-Bold' if bold else 'SC',
                               fontSize=size, leading=leading or size*1.55,
                               textColor=color, wordWrap='CJK', splitLongWords=True)
        p = Paragraph(escape(value).replace('\n', '<br/>'), style)
        _, h = p.wrap(w, HEIGHT)
        if y+h > HEIGHT-20:
            raise ValueError(f'Text exceeds page: {value[:35]}')
        p.drawOn(self.c, x, HEIGHT-y-h)
        return h

    def image(self, x, y, w, h, path):
        self.box(x, y, w, h, PAPER)
        with Image.open(ROOT/path) as source:
            preview = source.copy()
        preview.thumbnail((round((w-10)*2), round((h-10)*2)), Image.Resampling.LANCZOS)
        self.c.drawImage(ImageReader(preview), x+5, HEIGHT-y-h+5, width=w-10,
                         height=h-10, preserveAspectRatio=True, anchor='c', mask='auto')

    def button(self, x, y, w, label, primary=False):
        self.box(x, y, w, 28, INK if primary else colors.white)
        self.text(x+10, y+5, w-20, label, 9.5, bold=True,
                  color=colors.white if primary else INK)

    def frame(self, x, w, mobile=False):
        self.box(x, 122, w, 580)
        self.box(x, 122, w, 34, PAPER)
        self.text(x+15, 131, 80, '孙岩萍', 10, bold=True)
        navw = 140 if mobile else 185
        self.text(x+w-navw-12, 132, navw, '作品   关于   简历 PDF', 8.5)
        return x+18, 171, w-36

    def continuation(self, x, w, value):
        self.box(x, 650, w, 34, PAPER)
        self.text(x+10, 656, w-20, '下方继续：'+value, 8.5, leading=11, color=MUTED)

    def header(self, n, title, description):
        self.text(36, 22, 1000, 'YANPING SUN / GENERAL / UX R1', 9, bold=True, color=MUTED)
        self.text(36, 42, 1100, f'{n:02d}  {title}', 23, leading=29, bold=True)
        self.text(36, 78, 1100, description, 10.5, color=MUTED)
        self.text(36, 104, 760, '桌面 / 主要内容与作品可以并读', 9, bold=True)
        self.text(836, 104, 270, '手机 / 单列阅读，入口常显', 9, bold=True)

    def footer(self, n, notes):
        for i, (label, body) in enumerate(notes):
            x = 36+i*372
            self.text(x, 721, 345, label, 10, bold=True)
            self.text(x, 741, 345, body, 9, leading=13, color=MUTED)
        self.c.setStrokeColor(LINE)
        self.c.line(36, 36, WIDTH-36, 36)
        self.text(36, 809, 1000, '静态结构示意：按钮仅示意；后续区块以续读条表示；不是等比例整页或最终视觉稿。', 8, color=MUTED)
        self.text(WIDTH-78, 809, 50, f'{n} / 5', 8, color=MUTED)
        self.c.showPage()

    def home(self):
        self.header(1, '首页 | 先判断方向，再选作品', '两个主案例共同支撑通用定位，三个补充案例展开不同的内容问题。')
        x, y, w = self.frame(36, 760)
        intro = '在护肤品项目中，我梳理产品卖点，写上新长文、图文文案和视频脚本；在酷狗音乐，我负责官方新媒体内容、粉丝活动和多平台统筹。以下五个项目呈现具体的策划判断、作品与协作分工。'
        self.text(x, y, w, '我是孙岩萍  /  产品内容策划 · 新媒体运营', 11, color=MUTED)
        self.text(x, y+29, w, '讲清产品价值，也让用户愿意参与。', 24, leading=31, bold=True)
        self.text(x, y+75, 650, intro, 11, leading=18)
        self.button(x, y+145, 120, '看代表项目', True)
        self.button(x+132, y+145, 120, '查看简历 PDF')
        self.text(x, 365, w, '代表项目', 15, bold=True)
        cards = [
            ('日夜精华油', '把产品资料组织成一条沟通主线', '卖点梳理、文案、图文结构与视频脚本。', OIL+'wechat/04-day-night.png'),
            ('酷狗音乐', '把粉丝互动连接到客户端参与', '内容与活动策划、资源沟通、团队管理与统筹审核。', KUGOU+'weibo/fatang-weibo.jpg'),
        ]
        for i, (name, title, role, image) in enumerate(cards):
            cx = x+i*370
            self.box(cx, 394, 354, 166)
            self.image(cx+10, 404, 112, 146, image)
            self.text(cx+134, 405, 208, name, 12, bold=True)
            self.text(cx+134, 433, 208, title, 11.5, bold=True)
            self.text(cx+134, 479, 208, '我的工作：'+role, 9.5, leading=14)
            self.text(cx+134, 534, 208, '查看案例  >', 9.5, bold=True)
        self.text(x, 578, w, '更多项目，展开不同的内容问题', 12, bold=True)
        self.text(x, 605, w, '童颜面膜：讲清升级价值   /   高客单防晒：价值与肤感顾虑   /   洁面：一句话回应两种顾虑', 9.5)
        self.continuation(x, w, '我的经历与关于页入口；邮件联系与完整简历')
        mx, my, mw = self.frame(836, 270, True)
        self.text(mx, my, mw, '我是孙岩萍\n产品内容策划 · 新媒体运营', 9.5, leading=15, color=MUTED)
        self.text(mx, my+45, mw, '讲清产品价值，\n也让用户愿意参与。', 18, leading=26, bold=True)
        ih = self.text(mx, my+111, mw, intro, 9.5, leading=15)
        by = my+111+ih+14
        self.button(mx, by, 106, '看代表项目', True)
        self.button(mx+114, by, 120, '查看简历 PDF')
        self.text(mx, by+48, mw, '代表项目', 12, bold=True)
        cy = by+77
        self.box(mx, cy, mw, 155)
        self.image(mx+9, cy+9, 77, 136, cards[0][3])
        self.text(mx+96, cy+10, mw-106, '日夜精华油', 11, bold=True)
        self.text(mx+96, cy+37, mw-106, cards[0][1], 10, leading=15)
        self.text(mx+96, cy+78, mw-106, '卖点、文案、图文结构与脚本', 8.5, leading=13)
        self.text(mx+96, cy+119, mw-106, '查看案例 >', 9, bold=True)
        self.continuation(mx, mw, '酷狗同等入口；面膜／防晒／洁面；经历与联系')
        self.footer(1, [('内容重点', '主张、简介、代表作品各司其职；成果数字回到各案例，保留范围。'), ('手机变化', '保留真实简介，让作品自然顺延。两份主案例同样清楚，不缩字强塞一屏。'), ('后续校准', '封面在案例内查看完整原图；实际卡片裁切和视觉层级仍需校准。')])

    def oil(self):
        self.header(2, '精华油 | 贡献在前，判断与作品相邻', '完整主案例保留公众号、朋友圈、四类视频，以及有明确身份的后期重建稿。')
        x, y, w = self.frame(36, 760)
        intro = '品牌已有日用、夜用两款精华油的方案，需要让消费者看懂产品特点，以及两款产品怎样放进早晚护理场景。'
        self.text(x, y, w, '< 全部作品  /  日夜精华油', 9, color=MUTED)
        self.text(x, y+25, 530, '把产品资料组织成一条沟通主线', 20, bold=True)
        self.text(x, y+64, 510, intro, 10.5, leading=17)
        self.box(x, y+119, 510, 80, PAPER)
        self.text(x+12, y+129, 486, '我的工作：产品内容策划、文案与视频脚本。', 10.5, bold=True)
        self.text(x+12, y+153, 486, '负责卖点、长文、图内文案与版式规划、朋友圈及脚本。产品方案、视觉制作、拍摄剪辑与明星商务由相关团队完成。', 9.5, leading=15)
        self.image(x+548, y+25, 174, 174, OIL+'wechat/04-day-night.png')
        self.text(x, 391, 119, '本页目录\n内容判断\n图文作品\n四类视频\n结果与补充', 9.5, leading=24, color=MUTED)
        bx, bw = x+145, 578
        self.text(bx, 391, bw, '先找到理解入口，再提炼记忆表达与使用场景', 13, bold=True)
        self.text(bx, 424, bw, '从护理困扰进入，以“皮脂膜”作为解释线索；用“表补油，里补精华”形成记忆表达，再把既定双瓶方案放进早晚护理场景。', 10, leading=16)
        self.text(bx, 476, bw, '公众号：正文衔接问题，每张配图解释一个主题', 11.5, bold=True)
        for i, (path, label) in enumerate([('03-essence-structure.png', '精华入油结构'), ('04-day-night.png', '日夜双瓶'), ('07-usage.png', '三种使用方式分组')]):
            ix = bx+i*195
            self.image(ix, 509, 184, 100, OIL+'wechat/'+path)
            self.text(ix, 615, 184, label+' / 查看原图', 8.8)
        self.continuation(x, w, '公众号25页全文；朋友圈三张；品牌科普／刘晓庆合作／达人答疑／使用场景四条视频；结果与后期重建示例')
        mx, my, mw = self.frame(836, 270, True)
        self.text(mx, my, mw, '< 全部作品', 9, color=MUTED)
        self.text(mx, my+25, mw, '日夜精华油', 18, bold=True)
        self.text(mx, my+60, mw, '把产品资料组织成\n一条沟通主线', 12.5, leading=19, bold=True)
        self.text(mx, my+113, mw, intro, 9.5, leading=15)
        self.box(mx, 370, mw, 102, PAPER)
        self.text(mx+10, 380, mw-20, '我的工作：内容策划、文案与视频脚本。', 10, bold=True)
        self.text(mx+10, 418, mw-20, '产品方案、视觉制作、拍摄剪辑与明星商务由相关团队完成。', 9, leading=14)
        self.text(mx, 489, mw, '本页：内容判断 / 图文作品\n四类视频 / 结果与补充', 9, leading=15)
        self.image(mx, 535, mw, 80, OIL+'wechat/04-day-night.png')
        self.text(mx, 620, mw, '图注贴近作品，查看原图入口常显。', 8.5)
        self.continuation(mx, mw, '完整图文、四条独立视频；结果、重建稿与酷狗案例')
        self.footer(2, [('个人贡献', '产品方案、视觉与拍摄分工放在靠前位置，读者不必从成品反推职责。'), ('素材查阅', '四条视频各有标题与脚本说明；公众号全文与原图都可单独打开。'), ('成果语境', '460万+是产品／套组上市两周的私域项目整体成绩，不是个人内容销售归因。')])

    def kugou(self):
        self.header(3, '酷狗 | 看懂参与机制，也看清平台分工', '发糖机作为主线，其他平台和电台补充展示统筹与资源协作。')
        x, y, w = self.frame(36, 760)
        intro = '我参与微博到客户端的引流合作，策划互动机制，并协调产品和运营资源推进落地。'
        self.text(x, y, w, '< 全部作品  /  酷狗音乐', 9, color=MUTED)
        self.text(x, y+25, w, '把粉丝互动连接到客户端参与', 20, bold=True)
        self.text(x, y+66, w, intro, 11, leading=18)
        self.box(x, y+110, w, 73, PAPER)
        self.text(x+12, y+120, w-24, '微博内容与活动独立负责；管理两位专员，统筹其他平台的方向、脚本与内容审核。', 10.5, bold=True)
        self.text(x+12, y+149, w-24, '本人提出合作和内容方案、组织玩法并推动协作；具体技术开发由产品等团队完成。', 9.5)
        self.text(x, 376, 140, '本页目录\n任务与分工\n发糖机\n平台统筹\n补充项目', 9.5, leading=24, color=MUTED)
        bx = x+157
        self.text(bx, 376, 565, '发糖机：把艺人节点写成具体的参与内容', 13, bold=True)
        self.text(bx, 408, 565, '2022.11.23期次：微博同时给出网页链接和客户端搜索口令，规则图将指定参与序号与相应福利配对。', 10, leading=16)
        self.image(bx, 459, 172, 163, KUGOU+'weibo/fatang-weibo.jpg')
        self.image(bx+188, 459, 172, 163, KUGOU+'weibo/fatang-rules.jpg')
        self.text(bx+380, 462, 185, '看作品时关注', 10.5, bold=True)
        self.text(bx+380, 490, 185, '话题与参与理由\n链接与搜索口令\n参与序号与福利规则', 9.5, leading=23)
        self.text(bx, 627, 360, '发布微博与规则长图 / 分别查看原图', 8.8)
        self.continuation(x, w, '小红书具体参与动作；抖音静态截图；公众号功能介绍；电台栏目补充；精华油与简历')
        mx, my, mw = self.frame(836, 270, True)
        self.text(mx, my, mw, '< 全部作品', 9, color=MUTED)
        self.text(mx, my+25, mw, '酷狗音乐', 18, bold=True)
        self.text(mx, my+60, mw, '把粉丝互动连接到\n客户端参与', 12.5, leading=19, bold=True)
        self.text(mx, my+114, mw, intro, 9.5, leading=15)
        self.box(mx, 353, mw, 104, PAPER)
        self.text(mx+10, 363, mw-20, '微博独立负责；管理两位专员；其他平台统筹审核。', 10, leading=16, bold=True)
        self.text(mx+10, 411, mw-20, '技术开发由产品等团队完成。', 9, leading=14)
        self.text(mx, 474, mw, '本页：任务与分工 / 发糖机\n平台统筹 / 补充项目', 9, leading=15)
        self.text(mx, 518, mw, '发糖机 · 2022.11.23', 11, bold=True)
        self.image(mx, 548, mw, 70, KUGOU+'weibo/fatang-weibo.jpg')
        self.text(mx, 624, mw, '先解释入口与规则，再打开长图细看。', 8.5)
        self.continuation(mx, mw, '奖励规则；各平台内容与分工；电台；简历')
        self.footer(3, [('内容关系', '不同平台对应不同任务与职责，不把任职期间的作品写成同一场活动。'), ('手机查阅', '微博与规则图依次出现，先读文字解释再放大；抖音作品标明静态截图。'), ('数字处理', '未核齐的引流数字不进入视觉重点；16.8万为截图时点的话题浏览次数。')])

    def sun(self):
        self.header(4, '补充案例 | 按一个问题组织，保留完整作品', '以防晒为例；面膜聚焦升级价值，洁面可更短，不强制填满相同模板。')
        x, y, w = self.frame(36, 760)
        self.text(x, y, w, '< 全部作品  /  高客单防晒', 9, color=MUTED)
        self.text(x, y+25, w, '解释护理价值，也回应肤感顾虑', 20, bold=True)
        self.text(x, y+65, w, '品牌已确定高客单定位，内容既要解释产品为什么值得关注，也要回应厚重、假白、搓泥等日常使用顾虑。', 11, leading=18)
        self.box(x, 289, w, 63, PAPER)
        self.text(x+12, 300, w-24, '我的工作：卖点与内容主线，公众号、朋友圈、销售话术、详情页及四条视频脚本。', 10.5, bold=True)
        self.text(x+12, 327, w-24, '既定价格与产品方案不归入个人决策；视觉由设计师制作。', 9.5)
        self.text(x, 374, 352, '价值信息：先建立品类联想', 13, bold=True)
        self.text(x, 406, 352, '“1支防晒半支精华，外防光老化，内养冷白皮”是历史传播表达，承担记忆与价值沟通任务。', 10, leading=16)
        self.text(x+373, 374, 350, '使用疑问：单独回应肤感顾虑', 13, bold=True)
        self.text(x+373, 406, 350, '轻薄肤感和日常使用单独成段，让价值解释与具体疑问分别展开，再由作品继续说明。', 10, leading=16)
        self.image(x, 467, 350, 112, SUN+'wechat/wechat-01.png')
        self.image(x+373, 467, 350, 112, SUN+'wechat/wechat-05.png')
        self.text(x, 587, 350, '护理价值片段 / 查看原图', 9)
        self.text(x+373, 587, 350, '肤感顾虑片段 / 查看原图', 9)
        self.text(x, 619, w, '全文 PDF · 31页    /    完整详情页    /    护理搭配朋友圈', 9.5, bold=True)
        self.continuation(x, w, '项目结果与贡献；历史作品语境；洁面案例或全部作品')
        mx, my, mw = self.frame(836, 270, True)
        self.text(mx, my, mw, '< 全部作品', 9, color=MUTED)
        self.text(mx, my+25, mw, '高客单防晒', 18, bold=True)
        self.text(mx, my+60, mw, '解释护理价值，\n也回应肤感顾虑', 12.5, leading=19, bold=True)
        self.text(mx, my+114, mw, '品牌已确定高客单定位，内容既要解释价值，也要回应厚重、假白、搓泥等使用顾虑。', 9.5, leading=15)
        self.box(mx, 353, mw, 95, PAPER)
        self.text(mx+10, 362, mw-20, '我的工作：卖点、内容主线、长短图文、详情页及视频脚本。', 10, leading=16, bold=True)
        self.text(mx+10, 413, mw-20, '价格与产品方案由团队确定。', 9)
        self.text(mx, 466, mw, '价值信息与使用疑问，分段展开', 11, bold=True)
        self.image(mx, 503, mw, 82, SUN+'wechat/wechat-05.png')
        self.text(mx, 591, mw, '作品下保留图注与原图入口。', 8.5)
        self.text(mx, 619, mw, '查看公众号全文 · PDF 31页', 9.5, bold=True)
        self.continuation(mx, mw, '护理搭配与详情页；结果与贡献；互补案例')
        self.footer(4, [('篇幅差异', '面膜展示升级、双膜与详情页；洁面用短文案、海报和30页全文说明重点即可。'), ('成果范围', '防晒是上新半个月私域GMV120万+，结果区保留团队与渠道共同完成的说明。'), ('历史作品', '“半支精华”为原传播文案，不能将视觉重点处理成已独立核实的配方比例。')])

    def about(self):
        self.header(5, '关于我 | 履历能与作品相互印证', '近两段工作提供案例入口；完整 CV 与联系入口明显，教育及语言放在后面。')
        x, y, w = self.frame(36, 760)
        intro = '我的经历从新媒体编辑、品牌本地化内容，延伸到音乐平台官方新媒体运营，随后聚焦护肤品新品内容。工作包括长文和脚本的独立撰写，也包括活动策划、多平台内容审核与跨团队配合。'
        self.text(x, y, 510, '孙岩萍', 22, bold=True)
        self.text(x, y+41, 510, '产品内容策划与新媒体运营', 14, bold=True)
        self.text(x, y+77, 500, intro, 10.5, leading=17)
        self.box(x+534, y, 189, 146, PAPER)
        self.text(x+548, y+14, 161, '继续了解', 12, bold=True)
        self.button(x+548, y+48, 159, '简历 PDF · 3页', True)
        self.text(x+548, y+91, 161, 'beibiduo@163.com\n邮件联系', 9.5, leading=19)
        self.text(x, 343, w, '工作经历', 14, bold=True)
        jobs = [
            ('2024.03-2026.09', '广州无添加主义化妆品有限公司', '企划（产品内容方向）  /  看产品内容案例 >'),
            ('2019.06-2024.01', '广州酷狗计算机科技有限公司', '新媒体运营经理  /  看酷狗案例 >'),
            ('2018.02-2019.04', 'China Marketing Development Center 首尔分部', '新媒体运营  /  品牌本地化内容及项目执行'),
            ('2017.01-2018.01', '上海沪江网教育技术有限公司', '新媒体编辑  /  韩语学习内容、活动与课程推广'),
        ]
        for i, (dates, company, detail) in enumerate(jobs):
            jy = 379+i*57
            self.text(x, jy, 143, dates, 9, color=MUTED)
            self.text(x+156, jy, w-156, company, 10.5, bold=True)
            self.text(x+156, jy+23, w-156, detail, 9.5)
        self.text(x, 619, w, '教育与语言：釜山大学硕士 / 三江学院本科 / TOPIK 6级', 10, bold=True)
        self.continuation(x, w, '工具使用；完整简历、代表作品与邮件联系')
        mx, my, mw = self.frame(836, 270, True)
        self.text(mx, my, mw, '孙岩萍', 18, bold=True)
        self.text(mx, my+36, mw, '产品内容策划与新媒体运营', 11.5, bold=True)
        self.text(mx, my+72, mw, intro, 9.5, leading=15)
        self.button(mx, 357, 124, '简历 PDF · 3页', True)
        self.text(mx+138, 363, 92, '邮件联系', 9.5, bold=True)
        self.text(mx, 407, mw, '工作经历', 12, bold=True)
        self.text(mx, 442, mw, '2024.03-2026.09\n广州无添加主义化妆品有限公司', 9.5, leading=16, bold=True)
        self.text(mx, 482, mw, '企划（产品内容方向）\n看产品内容案例 >', 9.5, leading=19)
        self.text(mx, 542, mw, '2019.06-2024.01\n广州酷狗计算机科技有限公司', 9.5, leading=16, bold=True)
        self.text(mx, 582, mw, '新媒体运营经理\n看酷狗案例 >', 9.5, leading=19)
        self.continuation(mx, mw, '更早经历；教育、语言、工具使用；简历与联系')
        self.footer(5, [('履历与证据', '最近两段经历可查看对应主案例；关于页不重复五份项目长摘要。'), ('内容边界', '公司、职位与时间沿用现有CV，仍需本人核对是否最新；年龄与薪资不搬入页面。'), ('下一步验证', '实现时检查简历、邮件入口、分享路径、返回位置与手机阅读行为。')])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font', type=Path, required=True, help='Official Noto Sans SC TTF')
    parser.add_argument('--output', type=Path, default=ROOT/'design/output/pdf/general-ux-r1.pdf')
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix='yanping-ux-fonts-') as temp:
        font = FontFile(args.font)
        subsetter = subset.Subsetter()
        subsetter.populate(text=Path(__file__).read_text(encoding='utf-8'))
        subsetter.subset(font)
        subset_path = Path(temp)/'subset.ttf'
        font.save(subset_path)
        font.close()
        for name, weight in [('SC', 400), ('SC-Bold', 600)]:
            font = FontFile(subset_path)
            if 'fvar' in font:
                font = instantiateVariableFont(font, {'wght': weight}, inplace=True)
            target = Path(temp)/(name+'.ttf')
            font.save(target)
            font.close()
            pdfmetrics.registerFont(TTFont(name, str(target)))
        sheet = Sheet(args.output)
        for page in [sheet.home, sheet.oil, sheet.kugou, sheet.sun, sheet.about]:
            page()
        sheet.c.save()
    print(args.output)


if __name__ == '__main__':
    main()
