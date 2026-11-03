#!/usr/bin/env python3
"""Export fixed-copy static design studies for eight pages; never writes HTML."""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
sys.dont_write_bytecode = True
from PIL import Image, ImageDraw
from build_refinement_studies import Proposal, ROOT, BASE, OUT, SOURCE, digest, prepare_frames
from build_layout_studies import blocks, plain, BG, INK, BODY, ACCENT, MUTED, LINE, SOFT

CONTENT = ROOT / 'content/proposals/general-r4'
CASES = ['oil', 'kugou', 'sun', 'mask', 'cleanser']
SUPPLEMENT_COUNTS = {
    'kugou': ['1幅 · 话题与参与内容', '1幅 · 用户内容节选', '1幅 · 静态截图',
              '2幅 · 同一篇文章', '1幅 · 互动量截图', '3幅 · 栏目与传播位置'],
    'sun': ['2组 · 线稿／成品与PDF', '4幅 · 长文片段与朋友圈',
            '2幅片段＋完整长图', '2条 · 成片与各自分析'],
    'mask': ['3组 · 线稿／成品与PDF', '4幅 · 长文与朋友圈',
             '1条成片＋1张主播文字记录', '2张完整长图＋结构说明',
             '方法示例 · 非历史原稿'],
    'cleanser': ['1组 · 线稿／成品', '1组 · 线稿／成品', '1幅海报＋3页线稿PDF'],
}


def extra_frames():
    specs = [('sun-liying', 'sunscreen', 'sunscreen-liying.mp4', 20),
             ('sun-xianghailan', 'sunscreen', 'sunscreen-xianghailan.mp4', 20),
             ('mask-luodahua', 'tongyan-mask', 'mask-luodahua-preview.mp4', 20),
             ('mask-story', 'tongyan-mask', 'mask-influencer-story-preview.mp4', 20)]
    records = {}
    for name, folder, filename, seconds in specs:
        original = ROOT/'portfolio-content'/folder/'assets/videos'/filename
        target = BASE/'assets'/(name+'-frame.webp')
        subprocess.run(['ffmpeg','-v','error','-y','-ss',str(seconds),'-i',str(original),
                        '-frames:v','1','-c:v','libwebp','-quality','90',str(target)],check=True)
        with Image.open(target) as im: size = list(im.size)
        records[name] = {'file':target.relative_to(ROOT).as_posix(),
                         'source':original.relative_to(ROOT).as_posix(),
                         'source_sha256':digest(original),'second':seconds,'size':size,
                         'identity':'frame from supplied video; not an original cover'}
    return records


class BatchStudy(Proposal):
    def __init__(self, source, width, fonts, frames):
        items = blocks(source)
        super().__init__(width, fonts, items, [], source=source)
        self.slug = source.stem
        self.case = self.slug in CASES
        self.frame_map = frames
        if not self.case:
            self.x = self.margin if self.slug in ['home','works'] else (20 if self.mobile else 192)
            self.w = width-self.x-self.margin
        self.supplement_ranges = []
        self.chapter = '项目概览'

    def chrome(self, menu=False):
        if self.case:
            super().chrome(menu)
            if self.mobile and self.chapter!='项目概览':
                self.ops=[tuple(a.replace(' · 项目概览',' · '+self.chapter) if isinstance(a,str) else a for a in op) for op in self.ops]
            return
        self.rect(0,0,self.width,28,SOFT)
        self.text('静态设计提案 · 非网页',self.margin,6,self.w,11,MUTED,leading=18)
        self.text('孙岩萍',self.margin,47,180,24,INK,True,600,34)
        self.text('作品   关于   简历 ↗',self.width-self.margin-(164 if self.mobile else 240),
                  54,240,13 if self.mobile else 15,INK,leading=24)
        self.line(self.margin,98,self.width-self.margin*2)
        self.y = 134 if self.mobile else 152

    def heading(self, index):
        b = self.items[index]; self.use(index)
        self.y += 26 if b[1]==3 else 18
        if b[1]==3:
            self.line(self.x,self.y,self.w); self.y+=27
            self.breaks.append(round(self.y))
        size = (25 if self.mobile else 30) if b[1]==3 else (21 if self.mobile else 23)
        self.y += self.balanced_text(b[2],self.x,self.y,self.w,size,INK,
                                     leading=round(size*1.5))+20
        if b[1]==3 and self.case:
            key = '结果与贡献' if '贡献' in b[2] else '完整作品' if b[2].startswith('完整作品') else '策划与作品'
            self.anchor_y.setdefault(key,round(self.y))

    def figure(self,index,**kwargs):
        if self.hero_image_y is None:
            self.hero_image_y = round(self.y)
        return super().figure(index,**kwargs)

    def quote(self,index):
        self.use(index)
        x, w, top = self.x+20, min(self.w-40,720), self.y
        yy = top+22
        ops_start = len(self.ops)
        for value in self.items[index][1]:
            yy += self.text(value,x,yy,w,20 if self.mobile else 25,INK,
                            serif=True,weight=500,leading=36 if self.mobile else 43)+18
        # Paint beneath the already laid-out quote; preserve the complete source text.
        self.ops.insert(ops_start,('rect',self.x,top,min(self.w,760),yy-top,SOFT,None))
        self.ops.insert(ops_start+1,('rect',self.x,top,3,yy-top,ACCENT,None))
        self.y = yy+24

    def one(self,index):
        b = self.items[index]
        if b[0]=='heading': self.heading(index)
        elif b[0]=='paragraph':
            if re.match(r'^\*\*(历史主张|历史原作|原作主张)',b[3]) and len(b[1])<70:
                self.use(index)
                match=re.fullmatch(r'\*\*(.+?)\*\*(.*)',b[3])
                assert match
                label,statement=plain(match[1]).split('：',1)
                self.y+=self.text(label+'：',self.x,self.y,self.w,16,INK,leading=28)+8
                size,leading=(28,46) if self.mobile else (36,56)
                phrases=statement.split('，') if self.mobile and self.font(size,True,600).getlength(statement)>self.w else [statement]
                for n,phrase in enumerate(phrases):
                    value=phrase+('，' if n<len(phrases)-1 else '')
                    self.y+=self.balanced_text(value,self.x,self.y,self.w,size,INK,leading=leading)
                self.y+=24
                if match[2].strip():
                    self.y+=self.text(plain(match[2]),self.x,self.y,min(self.w,760),self.fs,BODY,leading=round(self.fs*1.78))+20
            else:self.body(index)
        elif b[0]=='figures':self.figure(index)
        elif b[0]=='quote':self.quote(index)
        else:raise ValueError((self.slug,index,b))

    def hero(self):
        self.anchor_y['项目概览'] = round(self.y)
        end = next(i for i,b in enumerate(self.items[1:],1) if b[0]=='heading' and b[1]==3)
        assert end in [4,5]
        prefix, headline = self.items[0][2].split('｜',1); self.use(0)
        image_id = next(i for i in range(1,end) if self.items[i][0]=='figures')
        role_id = next(i for i in range(1,end) if self.items[i][0]=='paragraph' and self.items[i][3].startswith('**我的工作'))
        result_ids = [i for i in range(2,end) if self.items[i][0]=='paragraph' and i!=role_id]
        phrases = ['让粉丝兴趣','有具体的参与入口'] if self.slug=='kugou' else None
        if phrases:assert ''.join(phrases)==headline
        if self.mobile:
            self.y+=self.text(prefix,self.x,self.y,self.w,18,INK,leading=30)+8
            for phrase in (phrases or [headline]):
                self.y+=self.balanced_text(phrase,self.x,self.y,self.w,29,INK,leading=43)
            self.y+=20
            self.body(role_id,size=16,color=INK)
            self.figure(image_id,max_height=340,framed=False)
            for i in result_ids:self.body(i,size=16,color=INK)
            self.body(1)
        else:
            top=self.y; left=(self.w-40)*.53; right=self.w-left-40
            self.y+=self.text(prefix,self.x,self.y,left,22,INK,True,500,34)+12
            for phrase in (phrases or [headline]):
                self.y+=self.balanced_text(phrase,self.x,self.y,left,40,INK,leading=59)
            self.y+=24
            self.body(1,width=left)
            self.body(role_id,width=left,size=16,color=INK)
            for i in result_ids:self.body(i,width=left,size=16,color=INK)
            end_y=self.y;self.y=top
            self.figure(image_id,x=self.x+left+40,width=right,max_height=470,framed=False)
            self.y=max(end_y,self.y)
        self.y+=24
        return end

    def paired_video(self, ids, names):
        width=self.w if self.mobile else (self.w-32)/2; top=self.y
        end1=self.video_card(ids[0],ids[0]+1,ids[0]+2,self.frame_map[names[0]],self.x,top,width)
        end2=self.video_card(ids[1],ids[1]+1,ids[1]+2,self.frame_map[names[1]],
                             self.x if self.mobile else self.x+width+32,
                             end1+12 if self.mobile else top,width)
        self.y=max(end1,end2)+12

    def primary(self,start):
        end=next(i for i,b in enumerate(self.items) if b[0]=='heading' and b[1]==3 and b[2].startswith('完整作品'))
        featured={'sun':(['李颖合作','向海岚合作'],['sun-liying','sun-xianghailan']),
                  'mask':(['骆达华合作','夫妻日常'],['mask-luodahua','mask-story'])}
        ids=[]; names=[]
        if self.slug in featured:
            labels,names=featured[self.slug]
            ids=[next(i for i,b in enumerate(self.items) if b[0]=='heading' and b[2].startswith(label)) for label in labels]
            assert ids[1]==ids[0]+3
        i=start
        while i<end:
            if ids and i==ids[0]:
                self.paired_video(ids,names);i=ids[-1]+3;continue
            if self.slug=='kugou' and i==8 and not self.mobile:
                # Keep both source explanations, then compare the two actual public artifacts.
                self.body(8);self.body(10); top=self.y;cw=(self.w-28)/2
                self.figure(9,width=cw,max_height=520);first=self.y;self.y=top
                self.figure(11,x=self.x+cw+28,width=cw,max_height=520)
                self.y=max(first,self.y);i=12;continue
            self.one(i);i+=1
        assert sorted(self.used)==list(range(end)),(self.slug,'missing primary blocks')
        return end

    def supplements(self,start):
        self.heading(start);self.body(start+1)
        heads=[i for i in range(start+2,len(self.items)) if self.items[i][0]=='heading' and self.items[i][1]==4]
        counts=SUPPLEMENT_COUNTS[self.slug];assert len(heads)==len(counts)
        # The shared historical note and final navigation remain outside the expandable groups.
        tail=len(self.items)-(1 if self.slug=='kugou' else 2)
        for n,index in enumerate(heads):
            stop=heads[n+1] if n+1<len(heads) else tail
            self.supplement_ranges.append({'label_block':index,'source_blocks':list(range(index,stop)),
                                            'label':self.items[index][2],'types_count':counts[n]})
            self.use(index);self.line(self.x,self.y,self.w);self.y+=18
            self.y+=self.balanced_text(self.items[index][2],self.x,self.y,self.w-24,
                                      18 if self.mobile else 20,INK,serif=False,weight=500,leading=30)+7
            self.y+=self.text(counts[n]+'   展开查看 ＋',self.x,self.y,self.w,14,ACCENT,leading=24)+20
        self.y+=24
        for i in range(tail,len(self.items)):self.body(i,size=15)
        expected=set(range(len(self.items)))-{i for g in self.supplement_ranges for i in g['source_blocks'][1:]}
        assert set(self.used)==expected,(self.slug,'default body coverage')

    def sidebar(self):
        if self.mobile:return
        labels=['项目概览','主要任务','工作范围','完整作品'] if self.slug=='kugou' else ['项目概览','策划与作品','结果与贡献','完整作品']
        y=168
        self.text('本案目录',64,y,144,12,MUTED,leading=22)
        for label in labels:
            y+=42
            self.text(label,64,y,148,14,ACCENT if label=='项目概览' else INK,leading=24)

    def compact_work(self,index,x,y,width,height):
        self.use(index);label,raw=self.items[index][1][0]
        path=(self.source.parent/raw).resolve()
        self.rect(x,y,width,height,SOFT)
        actual=self.image_at(path,x,y,width,height)
        # Center contained, uncropped originals in a consistent specimen field.
        self.ops[-1]=('image',path,self.ops[-1][2],y+(height-actual)/2,self.ops[-1][4],self.ops[-1][5],False)
        if self.hero_image_y is None:self.hero_image_y=round(y)
        return self.text(label,x,y+height+10,width,14,MUTED,leading=24)+height+24

    def feature(self,title,summary,role,figure,link):
        self.use(title);top=self.y
        if self.mobile:
            self.y+=self.balanced_text(self.items[title][2],self.x,self.y,self.w,25,INK,leading=38)+20
            self.y+=self.compact_work(figure,self.x,self.y,self.w,300)+12
            self.body(summary);self.body(role,size=16,color=INK);self.body(link,size=15)
        else:
            iw=round(self.w*.46);tx=self.x+iw+52;tw=self.w-iw-52
            bottom=top+self.compact_work(figure,self.x,top,iw,360)
            oldx,oldw=self.x,self.w;self.x,self.w=tx,tw
            self.y+=self.balanced_text(self.items[title][2],tx,self.y,tw,30,INK,leading=46)+24
            self.body(summary);self.body(role,size=16,color=INK);self.body(link,size=15)
            self.x,self.w=oldx,oldw;self.y=max(bottom,self.y)
        self.y+=34;self.line(self.x,self.y,self.w);self.y+=34

    def home(self):
        self.use(0)
        self.y+=self.text(self.items[0][2],self.x,self.y,self.w,20,INK,leading=32)+8
        self.body(1,size=15,color=INK)
        self.use(2)
        self.y+=self.balanced_text(self.items[2][1],self.x,self.y,self.w,
                                  39 if self.mobile else 66,INK,leading=59 if self.mobile else 93)+20
        self.body(3,width=min(self.w,850));self.body(4,size=15)
        self.heading(5);self.feature(6,7,8,9,10);self.feature(11,12,13,14,15)
        self.heading(16)
        if self.mobile:
            for i in range(17,26):self.one(i)
        else:
            ox,ow=self.x,self.w;top=self.y;ends=[];cw=(self.w-64)/3
            for n,start in enumerate([17,20,23]):
                self.x,self.w=ox+n*(cw+32),cw;self.y=top
                self.heading(start);self.body(start+1);self.body(start+2,size=15);ends.append(self.y)
            self.x,self.w=ox,ow;self.y=max(ends)+18
        for i in range(26,len(self.items)):self.one(i)
        assert sorted(self.used)==list(range(len(self.items)))

    def works(self):
        self.use(0)
        self.y+=self.text(self.items[0][2],self.x,self.y,self.w,35 if self.mobile else 48,INK,True,600,70)+16
        self.body(1)
        for start in [2,7,12,17,22]:
            self.line(self.x,self.y,self.w);self.y+=28;self.use(start)
            top=self.y
            if self.mobile:
                self.y+=self.balanced_text(self.items[start][2],self.x,self.y,self.w,23,INK,leading=36)+18
                image_bottom=self.y+self.compact_work(start+3,self.x,self.y,94,126)
                ox,ow=self.x,self.w;self.x+=112;self.w-=112
                self.body(start+1,size=17);self.x,self.w=ox,ow
                self.y=max(image_bottom,self.y)+8
                self.body(start+2,size=16,color=INK);self.body(start+4,size=15)
            else:
                image_bottom=top+self.compact_work(start+3,self.x,top,180,190)
                ox,ow=self.x,self.w;self.x+=224;self.w-=224
                self.y+=self.balanced_text(self.items[start][2],self.x,self.y,self.w,26,INK,leading=40)+18
                self.body(start+1);self.body(start+2,size=16,color=INK);self.body(start+4,size=15)
                self.x,self.w=ox,ow;self.y=max(image_bottom,self.y)
            self.y+=24
        self.heading(27);self.body(28,size=15)
        assert sorted(self.used)==list(range(len(self.items)))

    def about(self):
        self.use(0);name,title=self.items[0][2].split('｜',1)
        self.y+=self.text(name,self.x,self.y,self.w,22,INK,leading=34)+12
        self.y+=self.balanced_text(title,self.x,self.y,self.w,32 if self.mobile else 44,INK,leading=49 if self.mobile else 66)+24
        for i in range(1,len(self.items)):
            if i in [10,13,16,19]:self.body(i,size=16,color=INK)
            else:self.one(i)
        assert sorted(self.used)==list(range(len(self.items)))


def outcome_viewport(fonts, source_study):
    """A labeled static scrolled state, not a screenshot or interactive simulation."""
    target=source_study.anchor_y['结果与贡献']-60
    im=Image.open(OUT/'oil-mobile.webp')
    crop=im.crop((0,round(target),390,round(target)+836))
    canvas=Image.new('RGB',(390,980),BG);canvas.paste(crop,(0,144))
    temp=Proposal(390,fonts,blocks(SOURCE),[]);temp.chrome()
    temp.ops=[]
    temp.rect(0,0,390,28,SOFT)
    temp.text('静态设计提案 · 阅读至结果',20,6,350,11,MUTED,leading=18)
    temp.rect(0,28,390,56,BG)
    temp.text('精华油 · 结果与贡献',20,45,260,14,INK,leading=24)
    temp.text('目录',308,45,65,14,ACCENT,leading=24)
    temp.ops.extend([('line',348,52,353,57,ACCENT),('line',353,57,358,52,ACCENT)])
    temp.line(0,84,390)
    # Start the source crop directly below the single case bar.
    canvas=Image.new('RGB',(390,980),BG);canvas.paste(crop,(0,84));draw=ImageDraw.Draw(canvas)
    for kind,*args in temp.ops:
        if kind=='rect':
            x,y,w,h,fill,stroke=args;draw.rectangle((x,y,x+w,y+h),fill=fill,outline=stroke)
        elif kind=='line':
            x,y,xx,yy,color=args;draw.line((x,y,xx,yy),fill=color,width=1)
        elif kind=='text':
            x,y,value,size,color,serif,weight=args;draw.text((x,y),value,font=temp.font(size,serif,weight),fill=color,anchor='lt')
    canvas.save(OUT/'oil-mobile-outcome.webp',quality=88,method=6)
    return {'file':'oil-mobile-outcome','width':390,'height':980,
            'source':SOURCE.relative_to(ROOT).as_posix(),'source_sha256':digest(SOURCE),
            'state':'static scrolled outcome illustration; one persistent case bar; no browser execution',
            'source_crop_y':round(target)}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sans',type=Path,required=True);parser.add_argument('--serif',type=Path,required=True)
    args=parser.parse_args();fonts=(args.sans,args.serif);OUT.mkdir(parents=True,exist_ok=True)
    sources=[CONTENT/(name+'.md') for name in ['home','works','oil','kugou','sun','mask','cleanser','about']]
    inputs={p.relative_to(ROOT).as_posix():digest(p) for p in sources}
    frames=prepare_frames();other=extra_frames();records=[];oil_phone=None
    for width,label in [(1280,'desktop'),(390,'mobile')]:
        oil=Proposal(width,fonts,blocks(SOURCE),frames)
        oil.chrome();oil.hero();oil.primary();oil.supplements();oil.sidebar()
        assert sorted(oil.used)==list(range(39))+[39,42,45,48,51,55,56]
        record=oil.save_new('oil-'+label)
        record['supplement_source_blocks']=[list(range(a,b)) for a,b in [(39,42),(42,45),(45,48),(48,51),(51,55)]]
        records.append(record)
        if width==390:oil_phone=oil
        for source in sources:
            if source.stem=='oil':continue
            study=BatchStudy(source,width,fonts,other);study.chrome()
            if study.slug=='home':study.home()
            elif study.slug=='works':study.works()
            elif study.slug=='about':study.about()
            else:
                start=study.hero();end=study.primary(start);study.supplements(end);study.sidebar()
            record=study.save_new(study.slug+'-'+label)
            record['supplement_source_blocks']=study.supplement_ranges
            if not study.case:record['state']='complete page, all public source blocks shown'
            records.append(record)
    menu=Proposal(390,fonts,blocks(SOURCE),frames);menu.chrome(menu=True);menu.hero()
    records.append(menu.save_new('oil-mobile-menu',menu=True))
    records.append(outcome_viewport(fonts,oil_phone))
    # One expanded supplemental group demonstrates its identity and normal reading size.
    expanded=BatchStudy(CONTENT/'mask.md',390,fonts,other);expanded.chapter='完整作品';expanded.chrome()
    complete=next(i for i,b in enumerate(expanded.items) if b[0]=='heading' and b[2].startswith('完整作品'))
    expanded.heading(complete)
    start=next(i for i,b in enumerate(expanded.items) if b[0]=='heading' and b[2]=='私域沟通：后期重建示例')
    expanded.heading(start)
    expanded.y+=expanded.text('收起 −',20,expanded.y,350,14,ACCENT,leading=24)+18
    for i in range(start+1,len(expanded.items)-2):expanded.one(i)
    rec=expanded.save_new('mask-mobile-supplement')
    rec['state']='one supplemental group open; exact source blocks, not an interactive page'
    records.append(rec)
    assert inputs=={p.relative_to(ROOT).as_posix():digest(p) for p in sources},'Renderer changed source copy'
    manifest={'version':'general UX r3 full-page proposal','content_inputs':inputs,
              'frames':frames+list(other.values()),'records':records,
              'scope':'8 full pages at 1280 and 390; menu, scrolled outcome, one expanded group',
              'supplement_reading':'Closed groups have named entrances; full source retained in linked content drafts',
              'interaction':'Static SVG/WebP only; no HTML, playable media, browser or physical-device tests'}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps([{'file':r['file'],'size':[r['width'],r['height']]} for r in records],ensure_ascii=False))


if __name__=='__main__':main()
