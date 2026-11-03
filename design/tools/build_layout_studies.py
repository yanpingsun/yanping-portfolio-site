#!/usr/bin/env python3
"""Render static SVG/WebP design studies from canonical Markdown; no website code."""
from __future__ import annotations
import argparse
from functools import lru_cache
from hashlib import sha256
from html import escape
import json
from pathlib import Path
import re
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'design/layouts'
BG, INK, BODY, ACCENT = '#f6f4ef', '#26382f', '#46534a', '#a65336'
MUTED, LINE, SOFT = '#626c62', '#cdd2c7', '#eceee5'
LINK = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')


def plain(s):
    return LINK.sub(lambda m: m[1], s).replace('**', '').replace('`', '').strip()


def blocks(source):
    text = source.read_text().split('## 网页正文', 1)[1].split('## 编辑依据与呈现说明', 1)[0]
    lines = text.strip().splitlines()
    result, i = [], 0
    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue
        if s.startswith('!['):
            figures = []
            while i < len(lines) and lines[i].strip().startswith('!['):
                m = re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)', lines[i].strip())
                figures.append((m[1], m[2])); i += 1
            result.append(('figures', figures)); continue
        if s.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                row = [x.strip() for x in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', x) for x in row):
                    rows.append([plain(x) for x in row])
                i += 1
            result.append(('table', rows)); continue
        if s.startswith('#'):
            m = re.fullmatch(r'(#+) (.+)', s)
            result.append(('heading', len(m[1]), plain(m[2]))); i += 1; continue
        if s.startswith('>'):
            quote = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                q = plain(lines[i].strip()[1:])
                if q: quote.append(q)
                i += 1
            result.append(('quote', quote)); continue
        result.append(('paragraph', plain(s), bool(LINK.search(s)), s))
        i += 1
    return result


class Study:
    def __init__(self, source, width, fonts):
        self.source, self.width, self.fonts = source, width, fonts
        self.mobile = width < 600
        self.margin = 20 if self.mobile else 64
        self.x = self.margin if self.mobile or source.stem == 'home' else 280
        self.w = width-self.x-self.margin
        self.y, self.ops, self.seen, self.figures, self.breaks = 0, [], [], [], []
        self.fs = 17 if self.mobile else 18

    @lru_cache(maxsize=64)
    def font(self, size, serif=False, weight=400):
        f = ImageFont.truetype(str(self.fonts[1 if serif else 0]), size)
        f.set_variation_by_axes([weight])
        return f

    def rect(self, x, y, w, h, fill, stroke=None):
        self.ops.append(('rect', x, y, w, h, fill, stroke))

    def line(self, x, y, w):
        self.ops.append(('line', x, y, x+w, y, LINE))

    def wrap(self, text, width, size, serif=False, weight=400):
        font, lines, line = self.font(size, serif, weight), [], ''
        for char in re.findall(r'[A-Za-z0-9]+(?:[./+—-][A-Za-z0-9]+)*|.',text):
            if line and font.getlength(line+char) > width:
                if char in '，。、；：！？）》】”’' and len(line) > 1:
                    lines.append(line[:-1]); line = line[-1]+char
                else:
                    lines.append(line); line = char
            else: line += char
        if line: lines.append(line)
        return lines

    def text(self, text, x, y, width, size=None, color=BODY, serif=False, weight=400, leading=None):
        size = size or self.fs
        leading = leading or round(size*1.78)
        lines = self.wrap(text, width, size, serif, weight)
        for i, line in enumerate(lines):
            self.ops.append(('text', x, y+i*leading, line, size, color, serif, weight))
        return len(lines)*leading

    def paragraph(self, text, link=False, width=None):
        self.y += self.text(text, self.x, self.y, width or min(self.w, 760),
                            color=ACCENT if link else BODY)
        self.y += 18 if not self.mobile else 17

    def figure(self, label, raw, x, y, width, max_height=340):
        path = (self.source.parent/raw).resolve()
        with Image.open(path) as im: iw, ih = im.size
        cover = self.source.stem=='kugou' and not self.figures
        scale = min(width/iw, max_height/ih)
        dw, dh = (round(width),240 if self.mobile else 280) if cover else (round(iw*scale),round(ih*scale))
        self.rect(x, y, width, dh+24, '#fff', LINE)
        self.ops.append(('image', path, x+(width-dw)//2, y+12, dw, dh, 'top' if cover else False))
        cap = self.text(label+('（封面节选）' if cover else ''), x, y+dh+34, width, 14, MUTED, leading=23)
        button_y = y+dh+34+cap+4
        self.text('查看原图', x, button_y, width, 14, ACCENT, leading=24)
        self.figures.append(raw)
        return button_y+40-y

    def header(self):
        self.rect(0, 0, self.width, 44, SOFT)
        note = 'UX r2 · 静态结构稿 · 全部补充展开 · 不可交互'
        self.text(note, self.margin, 12, self.width-self.margin*2, 11, MUTED, leading=18)
        y = 72
        self.text('孙岩萍', self.margin, y, 200, 25, INK, True, 600, 38)
        nav_x = self.margin if self.mobile else self.width-self.margin-270
        nav_y = y+52 if self.mobile else y+3
        self.text('作品     关于     简历 PDF', nav_x, nav_y, 280, 14, INK, leading=25)
        self.y = nav_y+52 if self.mobile else y+72
        self.line(self.margin, self.y, self.width-self.margin*2)
        self.y += 36
        if self.source.stem != 'home':
            labels = {'oil':['任务与分工','内容判断','海报对照','公众号','朋友圈','视频脚本','销售沟通','项目结果'],
                      'kugou':['任务与分工','发糖机','小红书','抖音','微信渠道','晚安电台','工作总结']}[self.source.stem]
            self.text('全部作品', self.x, self.y, self.w, 14, ACCENT, leading=25)
            self.y += 46
            if not self.mobile:
                sy = self.y
                self.text('本案目录', 64, sy, 160, 13, MUTED, leading=24)
                for label in labels:
                    sy += 44
                    self.text(label, 64, sy, 160, 14, INK, leading=24)
            else:
                self.y += self.text('本案目录：'+' / '.join(labels), self.x,
                                    self.y, self.w, 13, MUTED, leading=22)+26

    def render(self, items):
        i=0
        while i<len(items):
            block=items[i];i+=1
            kind = block[0]
            self.seen.append(block)
            if kind == 'heading':
                _, level, value = block
                first = level == 3 and not any(b[0]=='heading' for b in self.seen[:-1])
                if level==3:self.breaks.append(round(self.y))
                if not first:
                    self.y += 34
                    if level == 3:
                        self.line(self.x, self.y-14, self.w)
                if self.source.stem=='oil' and value.startswith('资料信息：'):
                    self.rect(self.x, self.y, self.w, 40, SOFT, LINE)
                    self.text('补充查看：资料信息（本图已展开）', self.x+12, self.y+10,
                              self.w-24, 12, MUTED, leading=20)
                    self.y += 56
                size = (34 if self.mobile else 46) if first else (25 if self.mobile else 30) if level==3 else (21 if self.mobile else 23)
                if first and self.source.stem=='home':size=22
                self.y += self.text(value, self.x, self.y, self.w, size, INK, True, 600, round(size*1.55))+20
                if self.source.stem=='oil' and level==3 and value.startswith('四类视频'):
                    end=i
                    while end<len(items) and not (items[end][0]=='heading' and items[end][1]==3):end+=1
                    chapter=items[i:end];start=0
                    while start<len(chapter) and chapter[start][0]!='heading':start+=1
                    self.render(chapter[:start]);cards=[];tail=start
                    while tail<len(chapter) and chapter[tail][0]=='heading':
                        j=tail+1
                        while j<len(chapter):
                            if chapter[j][0]=='paragraph' and '.mp4)' in chapter[j][3]:j+=1;break
                            j+=1
                        cards.append(chapter[tail:j]);tail=j
                    self.cards(cards)
                    self.render(chapter[tail:]);i=end
            elif kind == 'paragraph':
                _, value, linked, raw = block
                if self.source.stem=='home' and value=='讲清产品价值，也让用户愿意参与。':
                    size=34 if self.mobile else 58
                    for phrase in ['讲清产品价值，','也让用户愿意参与。']:
                        self.y+=self.text(phrase,self.x,self.y,self.w,size,INK,True,600,round(size*1.5))
                    self.y+=24;continue
                self.paragraph(value, linked)
                if '.mp4)' in raw:
                    height=490 if self.mobile else 320
                    self.rect(self.x,self.y,self.w,height,SOFT,LINE)
                    self.text('视频区域示意',self.x+16,self.y+24,self.w-32,14,MUTED,leading=24)
                    self.text('手动播放 · 可另开文件',self.x+16,self.y+height-50,self.w-32,14,MUTED,leading=24)
                    self.y+=height+28
            elif kind == 'quote':
                start = self.y
                self.y += 14
                for value in block[1]:
                    self.y += self.text(value, self.x+18, self.y, self.w-36, self.fs, INK)+12
                self.ops.insert(len(self.ops)-sum(len(self.wrap(v,self.w-36,self.fs)) for v in block[1]),
                                ('rect',self.x,start,3,self.y-start,ACCENT,None))
                self.y += 12
            elif kind == 'figures':
                figures = block[1]
                if len(figures)==2 and not self.mobile:
                    widths=(self.w-24)/2
                    heights=[self.figure(label,raw,self.x+i*(widths+24),self.y,widths)
                             for i,(label,raw) in enumerate(figures)]
                    self.y += max(heights)+20
                else:
                    for label,raw in figures:
                        width=min(self.w,560)
                        self.y += self.figure(label,raw,self.x,self.y,width,2000 if self.mobile else 450)+24
            elif kind == 'table':
                rows = block[1]
                headers = rows[0]
                for n,row in enumerate(rows):
                    if self.mobile:
                        if n==0: continue
                        self.rect(self.x,self.y,self.w,4,LINE)
                        self.y += 16
                        for label,value in zip(headers,row):
                            self.y += self.text(label,self.x,self.y,self.w,13,MUTED,leading=23)+3
                            self.y += self.text(value,self.x,self.y,self.w,self.fs)+13
                    else:
                        cw=self.w/len(row)
                        heights=[len(self.wrap(v,cw-26,16))*28+24 for v in row]
                        height=max(heights)
                        if n==0:self.rect(self.x,self.y,self.w,height,SOFT)
                        for column,value in enumerate(row):
                            self.text(value,self.x+column*cw+12,self.y+12,cw-26,16,INK if n==0 else BODY,leading=28)
                        self.y += height
                        self.line(self.x,self.y,self.w)
                self.y += 24

    def cards(self, cards):
        if self.mobile:
            for card in cards:self.render(card)
            return
        ox,ow=self.x,self.w;cw=(ow-24)/2
        for start in range(0,len(cards),2):
            top=self.y;bottom=top
            for col,card in enumerate(cards[start:start+2]):
                self.x=ox+col*(cw+24);self.w=cw;self.y=top
                self.render(card);bottom=max(bottom,self.y)
            self.x,self.w=ox,ow;self.y=bottom+24

    def home(self, items):
        split=next(i for i,b in enumerate(items) if b[0]=='heading' and b[1]==4)
        self.render(items[:split])
        cards=[];i=split
        while i<len(items) and items[i][0]=='heading' and items[i][1]==4:
            j=i+1
            while j<len(items) and items[j][0]!='heading':j+=1
            cards.append(items[i:j]);i=j
        top=self.y;bottom=top
        width=self.w if self.mobile else (self.w-32)/2
        covers=['portfolio-content/essence-oil/assets/posters/oil-product.png',
                'portfolio-content/kugou/assets/weibo/fatang-weibo.jpg']
        for index,card in enumerate(cards):
            oldx,oldw=self.x,self.w
            self.x=oldx if self.mobile else oldx+index*(width+32)
            self.w=width;self.y=bottom+24 if self.mobile and index else top
            self.ops.append(('image',ROOT/covers[index],self.x,self.y,width,220,True))
            self.y += 246
            self.render(card)
            bottom=max(bottom,self.y)
            self.x,self.w=oldx,oldw
        self.y=bottom+26
        self.render(items[i:])

    def save(self, name):
        self.y += 44
        self.line(self.margin,self.y,self.width-self.margin*2)
        self.text('孙岩萍 / 产品内容策划 · 新媒体运营',self.margin,self.y+25,
                  self.width-self.margin*2,13,MUTED,leading=23)
        height=round(self.y+90)
        canvas=Image.new('RGB',(self.width,height),BG);draw=ImageDraw.Draw(canvas)
        svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" height="{height}" viewBox="0 0 {self.width} {height}">',
             '<title>孙岩萍作品集 · UX r2 静态结构稿</title>',
             '<desc>来自完整内容r3，全部补充展开；不包含可操作控件或网页实现。</desc>',
             f'<rect width="100%" height="100%" fill="{BG}"/>']
        for op in self.ops:
            kind,*args=op
            if kind=='rect':
                x,y,w,h,fill,stroke=args
                draw.rectangle((x,y,x+w,y+h),fill=fill,outline=stroke)
                svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke or "none"}"/>')
            elif kind=='line':
                x,y,xx,yy,color=args;draw.line((x,y,xx,yy),fill=color,width=1)
                svg.append(f'<path d="M{x},{y} L{xx},{yy}" stroke="{color}"/>')
            elif kind=='text':
                x,y,value,size,color,serif,weight=args
                draw.text((x,y),value,font=self.font(size,serif,weight),fill=color,anchor='lt')
                family='Noto Serif SC,Songti SC,serif' if serif else 'Noto Sans SC,PingFang SC,Microsoft YaHei,sans-serif'
                svg.append(f'<text x="{x}" y="{y+size}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(value)}</text>')
            elif kind=='image':
                path,x,y,w,h,crop=args;w,h=round(w),round(h)
                with Image.open(path) as raw:im=raw.convert('RGB')
                im=ImageOps.fit(im,(w,h),method=Image.Resampling.LANCZOS,centering=(.5,0 if crop=='top' else .5)) if crop else im.resize((w,h),Image.Resampling.LANCZOS)
                canvas.paste(im,(round(x),round(y)))
                relative='../../'+path.relative_to(ROOT).as_posix()
                mode='xMidYMin slice' if crop=='top' else 'xMidYMid slice' if crop else 'xMidYMid meet'
                svg.append(f'<image href="{escape(relative)}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="{mode}"/>')
        svg.append('</svg>')
        vector=OUT/(name+'.svg');raster=OUT/(name+'.webp')
        vector.write_text('\n'.join(svg)+'\n')
        ET.parse(vector)
        for previous in OUT.glob(name+'*.webp'):previous.unlink()
        ranges=[];start=0
        while start<height:
            end=min(height,start+14000)
            if end<height:
                candidates=[v for v in self.breaks if start+6000<v<=end]
                if candidates:end=max(candidates)
            ranges.append((start,end));start=end
        parts=[]
        for i,(start,end) in enumerate(ranges):
            part=raster if len(ranges)==1 else OUT/(name+f'-{i+1:02}.webp')
            canvas.crop((0,start,self.width,end)).save(part,format='WEBP',quality=93,method=6)
            parts.append({'file':part.name,'from_y':start,'to_y':end,'bytes':part.stat().st_size})
        return {'file':name,'width':self.width,'height':height,'source':self.source.relative_to(ROOT).as_posix(),
                'source_sha256':sha256(self.source.read_bytes()).hexdigest(),
                'blocks':len(self.seen),'figures':len(self.figures),'parts':parts}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sans',type=Path,required=True)
    parser.add_argument('--serif',type=Path,required=True)
    args=parser.parse_args();OUT.mkdir(exist_ok=True)
    records=[]
    for name in ['home','oil','kugou']:
        source=ROOT/'content'/('home.md' if name=='home' else f'projects/{name}.md')
        content=blocks(source)
        for label,width in [('desktop',1280),('mobile',390)]:
            study=Study(source,width,(args.sans,args.serif));study.header()
            if name=='home':study.home(content)
            else:study.render(content)
            assert study.seen==content,'Public body blocks omitted or reordered'
            records.append(study.save(name+'-'+label))
    (OUT/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(records,ensure_ascii=False))


if __name__=='__main__':main()
