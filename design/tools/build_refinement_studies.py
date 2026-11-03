#!/usr/bin/env python3
"""Render UX r3 static studies from a fixed content proposal, without website code."""
from __future__ import annotations
import argparse
from hashlib import sha256
from html import escape
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from xml.etree import ElementTree as ET

from PIL import Image, ImageDraw, ImageOps
sys.dont_write_bytecode = True
from build_layout_studies import Study, blocks, BG, INK, BODY, ACCENT, MUTED, LINE, SOFT

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'design/proposals/general-ux-r3'
OUT = BASE / 'layouts'
SOURCE = ROOT / 'content/proposals/general-r4/oil.md'


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def prepare_frames():
    result = []
    for name, filename, seconds in [
        ('oil-science-frame', 'oil-sebum-education.mp4', 8),
        ('oil-person-frame', 'oil-liuxiaoqing.mp4', 25),
    ]:
        original = ROOT / 'portfolio-content/essence-oil/assets/videos' / filename
        target = BASE / 'assets' / (name + '.webp')
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(seconds),
                        '-i', str(original), '-frames:v', '1', '-c:v', 'libwebp',
                        '-quality', '90', str(target)], check=True)
        with Image.open(target) as im:
            size = list(im.size)
        result.append({'file':target.relative_to(ROOT).as_posix(),
                       'source':original.relative_to(ROOT).as_posix(),
                       'source_sha256':digest(original), 'second':seconds,
                       'size':size, 'identity':'existing compressed video frame; not an original cover'})
    return result


class Proposal(Study):
    def __init__(self, width, fonts, items, frames, source=SOURCE):
        super().__init__(source, width, fonts)
        self.x = 20 if self.mobile else 248
        self.w = width - self.x - self.margin
        self.items, self.frames = items, frames
        self.used, self.regions, self.placed_images = [], [], []
        self.anchor_y = {}
        self.hero_image_y = None

    def wrap(self, value, width, size, serif=False, weight=400):
        font=self.font(size,serif,weight)
        lines=[];line=''
        for token in re.findall(r'[A-Za-z0-9]+(?:[./+—-][A-Za-z0-9]+)*|.',value):
            if line and font.getlength(line+token)>width:
                if line[-1] in '“‘（《【':
                    carry=line[-1];lines.append(line[:-1]);line=carry+token
                elif token in '，。、；：！？）》】”’' and len(line)>1:
                    lines.append(line[:-1]);line=line[-1]+token
                else:
                    lines.append(line);line=token
            else:line+=token
        if line:lines.append(line)
        return lines

    def balanced_text(self, value, x, y, width, size, color, serif=True, weight=600, leading=None):
        leading = leading or round(size*1.5)
        lines = self.wrap(value,width,size,serif,weight)
        if len(lines)>1 and self.font(size,serif,weight).getlength(lines[-1])<size*3:
            count=len(lines)
            ideal=self.font(size,serif,weight).getlength(value)/count
            candidates=[]
            for n in range(31):
                trial=min(width,ideal+n*size/8)
                test=self.wrap(value,trial,size,serif,weight)
                if len(test)==count:
                    lengths=[self.font(size,serif,weight).getlength(s) for s in test]
                    candidates.append((max(lengths)-min(lengths),test))
            if candidates:lines=min(candidates,key=lambda pair:pair[0])[1]
        for n,line in enumerate(lines):
            self.ops.append(('text',x,y+n*leading,line,size,color,serif,weight))
        return len(lines)*leading

    def use(self, index):
        assert index not in self.used, f'Duplicate body block {index}'
        self.used.append(index)

    def image_at(self, path, x, y, width, max_height, framed=False):
        with Image.open(path) as im:
            iw, ih = im.size
        scale = min(width / iw, max_height / ih)
        dw, dh = round(iw * scale), round(ih * scale)
        if framed:
            self.rect(x, y, width, dh + 20, '#fff', LINE)
        self.ops.append(('image', path, x + (width - dw) / 2,
                         y + (10 if framed else 0), dw, dh, False))
        self.placed_images.append(path.relative_to(ROOT).as_posix())
        return dh + (20 if framed else 0)

    def chrome(self, menu=False):
        self.rect(0, 0, self.width, 28, SOFT)
        self.text('静态设计提案 · 非网页', self.margin, 6,
                  self.width-self.margin*2, 11, MUTED, leading=18)
        self.text('孙岩萍', self.margin, 47, 180, 24, INK, True, 600, 34)
        navx = self.width - self.margin - (164 if self.mobile else 240)
        self.text('作品   关于   简历 ↗', navx, 54, 240,
                  13 if self.mobile else 15, INK, leading=24)
        self.line(self.margin, 96 if not self.mobile else 98,
                  self.width-self.margin*2)
        self.y = 124 if not self.mobile else 114
        if self.mobile:
            self.rect(0, 100, self.width, 44, BG)
            case = self.items[0][2].split('｜')[0].replace('日夜','')
            self.text(case+' · 项目概览', 20, 112, 260, 14, INK, leading=24)
            self.text('关闭 ×' if menu else '目录', self.width-82,
                      112, 70, 14, ACCENT, leading=24)
            if not menu:
                self.ops.append(('line',self.width-42,120,self.width-37,125,ACCENT))
                self.ops.append(('line',self.width-37,125,self.width-32,120,ACCENT))
            self.line(0, 144, self.width)
            self.y = 168
        else:
            self.text('← 全部作品', self.x, self.y, 180, 14, ACCENT, leading=24)
            self.y += 44

    def hero(self):
        self.anchor_y['项目概览'] = self.y
        title, summary, role, result, figures = self.items[:5]
        assert title[0]=='heading' and figures[0]=='figures'
        prefix, headline = title[2].split('｜', 1)
        self.use(0)
        if self.mobile:
            self.y += self.text(prefix, self.x, self.y, self.w, 18, INK, leading=30)+8
            self.y += self.text(headline, self.x, self.y, self.w, 29, INK,
                                True, 600, 43)+20
            self.body(2, size=16)
            self.figure(4, max_height=360, framed=False)
            self.body(3, size=16, color=INK)
            self.body(1)
        else:
            top = self.y
            left = (self.w-40)*.51
            right = self.w-left-40
            self.y += self.text(prefix, self.x, self.y, left, 22, INK,
                                True, 500, 34)+12
            # Balance semantic phrases without changing the source words.
            parts = headline.split('，',1)
            for n, phrase in enumerate(parts):
                self.y += self.text(phrase+('，' if n==0 and len(parts)>1 else ''),
                                    self.x,self.y,left,42,INK,True,600,61)
            self.y += 24
            self.body(1, width=left)
            self.body(2, width=left, size=16)
            self.body(3, width=left, size=16, color=INK)
            end = self.y
            self.y = top
            self.figure(4, x=self.x+left+40, width=right,
                        max_height=470, framed=False)
            self.y = max(end, self.y)
        self.y += 24
        self.regions.append({'name':'hero','first_work_y':self.hero_image_y,
                             'bottom':round(self.y)})

    def body(self, index, width=None, size=None, color=None):
        b = self.items[index]
        assert b[0]=='paragraph'
        self.use(index)
        linked = b[2]
        weight = 500 if b[3].startswith('**') else 400
        self.y += self.text(b[1], self.x, self.y, width or min(self.w, 760),
                            size or self.fs, color or (ACCENT if linked else BODY),
                            weight=weight, leading=round((size or self.fs)*1.78))
        self.y += 20 if not linked else 25

    def heading(self, index):
        b = self.items[index]
        self.use(index)
        level, title = b[1], b[2]
        self.y += 30 if level==3 else 20
        if level==3:
            self.line(self.x, self.y, self.w)
            self.y += 27
            self.breaks.append(round(self.y))
        size = (25 if self.mobile else 30) if level==3 else (21 if self.mobile else 22)
        self.y += self.balanced_text(title,self.x,self.y,self.w,size,INK,
                                     leading=round(size*1.5))+20
        if index==5:
            self.anchor_y['策划与作品'] = round(self.y)
        if index==34:
            self.anchor_y['结果与贡献'] = round(self.y)

    def figure(self, index, x=None, width=None, max_height=None, framed=True):
        b = self.items[index]
        self.use(index)
        x = self.x if x is None else x
        width = self.w if width is None else width
        figures = b[1]
        top = self.y
        for col, (label, raw) in enumerate(figures):
            path = (self.source.parent / raw).resolve()
            paired = len(figures)==2 and not self.mobile
            cw = (width-24)/2 if paired else min(width, 600)
            xx = x+col*(cw+24) if paired else x
            yy = top if paired else self.y
            limit = max_height or (430 if self.mobile else 500)
            h = self.image_at(path, xx, yy, cw, limit, framed)
            if index==4:
                self.hero_image_y = round(yy)
            cap = self.text(label, xx, yy+h+12, cw, 14, MUTED, leading=24)
            self.text('查看原图 ↗', xx, yy+h+cap+16, cw, 14, ACCENT, leading=24)
            end = yy+h+cap+54
            self.y = max(self.y, end) if paired else end+16
        self.y += 14

    def video_card(self, title_id, text_id, link_id, frame, x, y, width):
        self.use(title_id); self.use(text_id); self.use(link_id)
        self.line(x, y, width)
        y += 21
        thumb = 104 if self.mobile else 140
        height = self.image_at(ROOT/frame['file'], x, y, thumb, 192)
        tx, tw = x+thumb+18, width-thumb-18
        hh = self.balanced_text(self.items[title_id][2],tx,y,tw,
                                19 if self.mobile else 21,INK,leading=29)+12
        hh += self.text(self.items[text_id][1], tx, y+hh, tw,
                        16, BODY, leading=28)+12
        hh += self.text(self.items[link_id][1], tx, y+hh, tw,
                        14, ACCENT, leading=24)
        self.text('压缩查阅版', x, y+height+10, thumb, 12, MUTED, leading=20)
        return y+max(height+40, hh)+28

    def primary(self):
        i = 5
        while i < 37:
            if i==25:
                width = self.w if self.mobile else (self.w-32)/2
                top = self.y
                first = self.video_card(25, 26, 27, self.frames[0],
                                        self.x, top, width)
                second = self.video_card(28, 29, 30, self.frames[1],
                                         self.x if self.mobile else self.x+width+32,
                                         first+12 if self.mobile else top, width)
                self.y = max(first,second)+12
                i = 31
                continue
            b = self.items[i]
            if b[0]=='heading':
                self.heading(i)
            elif b[0]=='paragraph':
                if i==6:
                    self.use(i)
                    self.y += self.text(b[1], self.x, self.y, self.w,
                                        28 if self.mobile else 39, INK,
                                        True, 600, 45 if self.mobile else 58)+22
                else:
                    self.body(i)
            elif b[0]=='figures':
                self.figure(i, max_height=450 if i==21 else None)
            else:
                raise ValueError(b)
            i += 1

    def supplements(self):
        self.heading(37); self.body(38)
        self.anchor_y['完整作品'] = round(self.y)
        counts = {39:'1组 · 线稿／成品',42:'2幅 · 第16、20页',
                  45:'3幅 · 需求／概念／产品',48:'2条 · 成片与结构分析',
                  51:'方法示例 · 非历史原稿'}
        for index in counts:
            self.use(index)
            self.line(self.x, self.y, self.w)
            self.y += 18
            self.y += self.balanced_text(self.items[index][2],self.x,self.y,
                                         self.w-24,18 if self.mobile else 20,
                                         INK,serif=False,weight=500,leading=30)+7
            self.y += self.text(counts[index]+'   展开查看 ＋', self.x, self.y,
                                self.w, 14, ACCENT, leading=24)+20
        self.y += 24
        self.body(55, size=15)
        self.body(56, size=15)

    def sidebar(self):
        if self.mobile:
            return
        y = 168
        self.text('本案目录', 64, y, 144, 12, MUTED, leading=22)
        for title in ['项目概览','策划与作品','结果与贡献','完整作品']:
            y += 42
            self.text(title, 64, y, 148, 14,
                      ACCENT if title=='项目概览' else INK, leading=24)

    def draw_menu(self):
        # One short dropdown; the case bar is the only sticky area in the proposal.
        x, y, width = 20, 145, self.width-40
        self.rect(x, y, width, 212, BG, LINE)
        for n, label in enumerate(['项目概览','策划与作品','结果与贡献','完整作品']):
            yy = y+20+n*47
            self.text(label, x+18, yy, width-36, 16,
                      ACCENT if n==0 else INK, leading=28)
            if n<3:
                self.line(x+18, yy+35, width-36)

    def save_new(self, name, menu=False):
        if menu:
            height = 980
            self.draw_menu()
        else:
            self.y += 32
            self.line(self.margin, self.y, self.width-self.margin*2)
            self.text('孙岩萍 · 产品内容策划与新媒体运营', self.margin,
                      self.y+22, self.width-self.margin*2, 13, MUTED, leading=24)
            height = round(self.y+80)
        assert height<16000, 'Split very long studies before WebP export'
        canvas = Image.new('RGB',(self.width,height),BG)
        draw = ImageDraw.Draw(canvas)
        svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.width}" height="{height}" viewBox="0 0 {self.width} {height}">',
               f'<title>孙岩萍 · {escape(self.source.stem)} UX r3 静态设计提案</title>',
               '<desc>来自内容r4提案，默认主叙述与具名补充入口；不可交互，不是已发布网页。</desc>',
               f'<rect width="100%" height="100%" fill="{BG}"/>']
        overflow = []
        for kind,*args in self.ops:
            if kind=='rect':
                x,y,w,h,fill,stroke = args
                draw.rectangle((x,y,x+w,y+h),fill=fill,outline=stroke)
                svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke or "none"}"/>')
            elif kind=='line':
                x,y,xx,yy,color = args
                draw.line((x,y,xx,yy),fill=color,width=1)
                svg.append(f'<path d="M{x},{y} L{xx},{yy}" stroke="{color}"/>')
            elif kind=='text':
                x,y,value,size,color,serif,weight = args
                if y>=height:continue
                font = self.font(size,serif,weight)
                if x+font.getlength(value)>self.width-5:
                    overflow.append(value)
                draw.text((x,y),value,font=font,fill=color,anchor='lt')
                family='Noto Serif SC,Songti SC,serif' if serif else 'Noto Sans SC,PingFang SC,sans-serif'
                svg.append(f'<text x="{x}" y="{y+size}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{color}">{escape(value)}</text>')
            elif kind=='image':
                path,x,y,w,h,crop = args
                if y>=height:continue
                with Image.open(path) as raw:
                    image=raw.convert('RGB').resize((round(w),round(h)),Image.Resampling.LANCZOS)
                canvas.paste(image,(round(x),round(y)))
                relative=Path(os.path.relpath(path,OUT)).as_posix()
                svg.append(f'<image href="{escape(relative)}" x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="xMidYMid meet"/>')
        assert not overflow, overflow
        svg.append('</svg>')
        vector, raster = OUT/(name+'.svg'), OUT/(name+'.webp')
        vector.write_text('\n'.join(svg)+'\n')
        ET.parse(vector)
        canvas.save(raster,format='WEBP',quality=88,method=6)
        return {'file':name, 'width':self.width, 'height':height,
                'source':self.source.relative_to(ROOT).as_posix(), 'source_sha256':digest(self.source),
                'painted_source_blocks':sorted(self.used),
                'first_work_y':self.hero_image_y,
                'source_images':self.placed_images,
                'state':'mobile menu open' if menu else 'default reading; supplements closed',
                'bytes':raster.stat().st_size, 'text_overflow':overflow}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sans',type=Path,required=True)
    parser.add_argument('--serif',type=Path,required=True)
    args=parser.parse_args(); OUT.mkdir(parents=True,exist_ok=True)
    items=blocks(SOURCE); before=digest(SOURCE)
    frames=prepare_frames(); records=[]
    expected=list(range(39))+[39,42,45,48,51,55,56]
    for name,width in [('desktop',1280),('mobile',390)]:
        study=Proposal(width,(args.sans,args.serif),items,frames)
        study.chrome(); study.hero(); study.primary(); study.supplements(); study.sidebar()
        assert sorted(study.used)==expected, 'Main body or supplement labels omitted'
        records.append(study.save_new('oil-'+name))
    menu=Proposal(390,(args.sans,args.serif),items,frames)
    menu.chrome(menu=True); menu.hero()
    records.append(menu.save_new('oil-mobile-menu',menu=True))
    assert digest(SOURCE)==before, 'Design renderer must not change content'
    manifest={'version':'general UX r3 proposal', 'content_input':before,
              'content_inputs':{p.relative_to(ROOT).as_posix():digest(p) for p in
                                [SOURCE,ROOT/'content/proposals/general-r4/kugou.md']},
              'frames':frames,'records':records,
              'supplement_reading':'Full source retained in content proposal; default layout shows named entrances only',
              'interaction':'Static design only; no HTML, playable media or browser validation'}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps([{'file':r['file'],'size':[r['width'],r['height']],
                       'first_work_y':r['first_work_y'],'bytes':r['bytes']} for r in records],ensure_ascii=False))


if __name__=='__main__':main()
