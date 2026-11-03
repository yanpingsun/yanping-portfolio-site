#!/usr/bin/env python3
"""Compile the approved Markdown sources into read-only preview data."""
from pathlib import Path
from hashlib import sha256
import json
import re
import argparse
import shutil
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'preview/general'
LINK = re.compile(r'!?\[[^\]]*\]\(([^)]+)\)')


def parse(text):
    lines, blocks, i = text.strip().splitlines(), [], 0
    while i < len(lines):
        line = lines[i].strip()
        if not line: i += 1; continue
        if line.startswith('```'):
            code=[];i+=1
            while i<len(lines) and not lines[i].strip().startswith('```'):
                code.append(lines[i]);i+=1
            blocks.append({'kind':'code','text':'\n'.join(code)});i+=1;continue
        if line.startswith('!['):
            items=[]
            while i<len(lines) and lines[i].strip().startswith('!['):
                m=re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)',lines[i].strip())
                if not m:raise ValueError(lines[i])
                items.append({'alt':m[1],'src':m[2]});i+=1
            blocks.append({'kind':'images','items':items});continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                row=[s.strip() for s in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?',s) for s in row):rows.append(row)
                i+=1
            blocks.append({'kind':'table','rows':rows});continue
        if line.startswith('>'):
            items=[]
            while i<len(lines) and lines[i].strip().startswith('>'):
                q=lines[i].strip()[1:].strip()
                if q:items.append(q)
                i+=1
            blocks.append({'kind':'quote','items':items});continue
        if re.match(r'^(?:[-*] |\d+\. )',line):
            items=[];ordered=bool(re.match(r'^\d+\.',line))
            while i<len(lines) and re.match(r'^(?:[-*] |\d+\. )',lines[i].strip()):
                items.append(re.sub(r'^(?:[-*] |\d+\. )','',lines[i].strip()));i+=1
            blocks.append({'kind':'list','items':items,'ordered':ordered});continue
        if line.startswith('#'):
            m=re.fullmatch(r'(#{1,6}) (.+)',line)
            if m:blocks.append({'kind':'heading','level':len(m[1]),'text':m[2]});i+=1;continue
        blocks.append({'kind':'paragraph','text':line});i+=1
    return blocks


def path_for(source, raw):
    if raw.startswith(('https:','http:','mailto:','#')):return None
    path=(source.parent/raw.split('#')[0]).resolve()
    if not path.is_relative_to(ROOT):raise ValueError(raw)
    return path


def public(source):
    text=source.read_text()
    return text.split('## 网页正文',1)[1].split('## 编辑依据与呈现说明',1)[0].strip()


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--refined',action='store_true',help='Build the separately reviewed r4 sources into preview/general-r2')
    args=parser.parse_args()
    out=ROOT/'preview/general-r2' if args.refined else OUT
    out.mkdir(parents=True,exist_ok=True)
    pages={};materials={};paths={};images={};source_hashes={}
    files={'home':'content/home.md','about':'content/about.md','oil':'content/projects/oil.md',
           'kugou':'content/projects/kugou.md','sun':'content/projects/sun.md',
           'mask':'content/projects/mask.md','clean':'content/projects/cleanser.md'}
    if args.refined:
        files={key:f'content/proposals/general-r4/{"cleanser" if key=="clean" else key}.md' for key in [*files,'works']}
    for key,name in files.items():
        source=ROOT/name;text=public(source)
        pages[key]={'source':name,'blocks':parse(text)}
        source_hashes[name]=sha256(source.read_bytes()).hexdigest()
        for raw in LINK.findall(text):
            path=path_for(source,raw)
            if path and path.suffix=='.md' and path.is_relative_to(ROOT/'portfolio-content'):
                rel=path.relative_to(ROOT).as_posix();mid=sha256(rel.encode()).hexdigest()[:12]
                paths[rel]=mid
                if mid not in materials:materials[mid]={'source':rel,'blocks':parse(path.read_text()),'parents':[]}
                if key not in materials[mid]['parents']:materials[mid]['parents'].append(key)
                source_hashes[rel]=sha256(path.read_bytes()).hexdigest()
    for page in [*pages.values(),*materials.values()]:
        source=ROOT/page['source']
        for block in page['blocks']:
            if block['kind']!='images':continue
            for item in block['items']:
                path=path_for(source,item['src']);rel=path.relative_to(ROOT).as_posix()
                assert path.exists(),rel
                with Image.open(path) as im:width,height=im.size
                thumb=path.with_suffix('.webp')
                preview=thumb if path.suffix.lower() in ('.jpg','.jpeg') and thumb.exists() else path
                images[rel]={'width':width,'height':height,'preview':preview.relative_to(ROOT).as_posix()}
    project_meta=[('oil','日夜精华油','产品主线 · 图文结构 · 四类视频脚本'),
                  ('kugou','酷狗音乐','活动机制 · 多平台统筹 · 资源协作'),
                  ('mask','童颜面膜','升级沟通 · 故事脚本 · 直播讲解'),
                  ('sun','高客单防晒','价值沟通 · 价格话术 · 使用体验'),
                  ('clean','逆时光洁颜霜','短文案提炼 · 海报信息层级')]
    projects=[]
    for key,name,scope in project_meta:
        title=pages[key]['blocks'][0]['text']
        projects.append({'id':key,'name':name,'title':title,'scope':scope,
                         'cover':f'portfolio-previews/{key}.webp'})
    data={'version':'general-html-r1','content':'general-content-r3','ux':'general-ux-r2',
          'pages':pages,'projects':projects,'materials':materials,'material_paths':paths,
          'images':images,'source_hashes':source_hashes}
    if args.refined:
        data.update(version='general-html-r2',content='general-content-r4',ux='general-ux-r3')
        data['frames']={}
        manifest=json.loads((ROOT/'design/proposals/general-ux-r3/layouts/manifest.json').read_text())
        for frame in manifest['frames']:
            target=out/'assets'/Path(frame['file']).name
            target.parent.mkdir(exist_ok=True)
            shutil.copyfile(ROOT/frame['file'],target)
            data['frames'][frame['source']]={'preview':target.relative_to(out).as_posix(),'second':frame['second']}
    text=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    (out/'data.js').write_text('window.GENERAL_PORTFOLIO = '+text+';\n')
    print(f'Compiled {len(pages)} pages, {len(materials)} supplementary documents and {len(images)} image records')


if __name__=='__main__':main()
