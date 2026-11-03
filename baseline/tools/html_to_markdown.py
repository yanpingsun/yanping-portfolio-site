#!/usr/bin/env python3
"""Turn the original renderer's output into reviewable, complete Markdown."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from html.parser import HTMLParser
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'baseline'
PAGES = BASE/'pages'
VOID = {'img', 'source', 'br', 'hr', 'meta', 'link', 'input'}


class Node:
    def __init__(self, tag='root', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []


class Reader(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        self.stack[-1].children.append(text)


def text_of(n):
    if isinstance(n, str):
        return re.sub(r'\s+', ' ', n)
    if n.attrs.get('aria-hidden') == 'true':
        return ''
    return ''.join(text_of(x) for x in n.children)


def walk(n):
    if isinstance(n, str):
        return
    yield n
    for child in n.children:
        yield from walk(child)


def compact(s):
    return re.sub(r'\s+', '', s)


def original_text_chunks(n):
    if isinstance(n, str):
        if re.search(r'[\u3400-\u9fff]', n):
            yield re.sub(r'\s+', ' ', n).strip()
        return
    if n.attrs.get('aria-hidden') == 'true' or n.tag in {'video', 'script', 'style'}:
        return
    for child in n.children:
        yield from original_text_chunks(child)


def main():
    data = json.load(sys.stdin)
    PAGES.mkdir(parents=True, exist_ok=True)
    destinations = {p['id']: PAGES/p['file'] for p in data['pages']}
    media = {}
    audit = []

    def record(raw, kind, page):
        if raw and not raw.startswith(('#', 'mailto:', 'http:', 'https:')):
            name = unquote(raw.split('#')[0].split('?')[0])
            entry = media.setdefault(name, {'path':name, 'kinds':set(), 'pages':set()})
            entry['kinds'].add(kind)
            entry['pages'].add(page)

    def link(raw, dest):
        if raw.startswith('#/'):
            bits = raw[2:].split('/')
            target = bits[1] if bits[0] == 'project' else bits[0] or 'home'
            target = 'about' if target == 'contact' else target
            if target in destinations:
                # Markdown is a content transcript; full routing stays in the UI record.
                return os.path.relpath(destinations[target], dest.parent).replace(os.sep, '/')
        if raw.startswith(('#', 'mailto:', 'http:', 'https:')):
            return raw
        return os.path.relpath(ROOT/unquote(raw), dest.parent).replace(os.sep, '/')

    def render(n, dest, page):
        if isinstance(n, str):
            return re.sub(r'\s+', ' ', n)
        if n.attrs.get('aria-hidden') == 'true' or n.tag in {'script', 'style', 'source'}:
            return ''
        a, tag = n.attrs, n.tag
        if tag == 'button' and a.get('data-image'):
            src = a['data-image']
            label = a.get('data-caption', '')
            record(src, 'original-image', page)
            for image in walk(n):
                if image.tag == 'img':
                    record(image.attrs.get('src'), 'display-image', page)
            overlay = text_of(n).strip()
            return f'\n\n![{label}]({link(src,dest)})\n\n[{overlay}]({link(src,dest)})\n\n'
        if tag == 'img':
            src = a['src']
            record(src, 'display-image', page)
            return f'\n\n![{a.get("alt", "")}]({link(src,dest)})\n\n'
        if tag == 'video':
            source = next(x for x in walk(n) if x.tag == 'source')
            src = source.attrs['src']
            record(src, 'video', page)
            return f'\n\n[播放原视频：{a.get("aria-label", "视频")}]({link(src,dest)})\n\n'
        inner = ''.join(render(x, dest, page) for x in n.children)
        if tag == 'a':
            href = a.get('href', '')
            record(href, 'document-or-link', page)
            return f' [{inner.strip()}]({link(href,dest)}) '
        if tag in {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}:
            return '\n\n'+'#'*int(tag[1])+' '+inner.strip()+'\n\n'
        if tag == 'br':
            return ' '
        if tag == 'span':
            return ' '+inner.strip()+' '
        if tag in {'strong', 'b', 'em'}:
            return '**'+inner.strip()+'**'
        if tag == 'li':
            return '\n- '+inner.strip()+'\n'
        if tag == 'blockquote':
            return '\n\n> '+inner.strip()+'\n\n'
        if tag == 'summary':
            return '\n\n#### '+inner.strip()+'\n\n> 转录说明：此组在原版默认折叠，以下完整保留。\n\n'
        if tag in {'div', 'section', 'article', 'aside', 'nav', 'header', 'footer',
                   'p', 'figure', 'figcaption', 'ul', 'ol', 'details', 'small'}:
            return '\n\n'+inner.strip()+'\n\n'
        return inner

    for page in data['pages']:
        dest = PAGES/page['file']
        dest.parent.mkdir(parents=True, exist_ok=True)
        tree = Reader(page['html']).root
        body = render(tree, dest, page['id'])
        body = '\n'.join(line.rstrip() for line in body.splitlines())
        body = re.sub(r'\n{3,}', '\n\n', body).strip()+'\n'
        chunks = list(original_text_chunks(tree))
        missing = [t for t in chunks if compact(t) not in compact(body)]
        if missing:
            raise ValueError(f'Original text missing from {page["id"]}: {missing[:3]}')
        header = (f'# 原版：{page["title"]}（完整正文还原）\n\n'
                  f'> 固定来源：`{data["ref"]}`，原路由：`{page["route"]}`。'
                  '从原版现有渲染结果转录，不是重新撰写的页面稿；原有事实表述保留原样，'
                  '不等于本轮已重新核实。图片引用原件，视频保留文件入口；'
                  '折叠内容在此全部展开。Markdown 内章节导航回到对应全文，'
                  '原版章节跳转与视觉表现见 UI/UX 基线。\n\n')
        dest.write_text(header+body, encoding='utf-8')
        audit.append({'id':page['id'],'file':str(dest.relative_to(BASE)),
                      'route':page['route'],'chinese_text_chunks':len(chunks),
                      'missing_text_chunks':len(missing)})

    shared_dest = PAGES/'shared.md'
    shared = '\n\n'.join(render(Reader(data['shared'][k]).root, shared_dest, 'shared')
                          for k in ['header', 'footer', 'noscript'])
    shared = '\n'.join(line.rstrip() for line in shared.splitlines())
    shared_dest.write_text('# 原版共用导航、页脚与无脚本提示\n\n'
                          f'> 固定来源：`{data["ref"]}:index.html`。\n\n'
                          +re.sub(r'\n{3,}', '\n\n', shared).strip()+'\n', encoding='utf-8')
    assets = []
    for name, entry in sorted(media.items()):
        sha = subprocess.check_output(['git','rev-parse',data['ref']+':'+name],cwd=ROOT,text=True).strip()
        current = subprocess.check_output(['git','hash-object',name],cwd=ROOT,text=True).strip()
        if current != sha:
            raise ValueError('Shared asset differs from fixed original: '+name)
        assets.append({'path':name,'blob':sha,'kinds':sorted(entry['kinds']),
                       'pages':sorted(entry['pages'])})
    manifest = {'source_commit':data['ref'],'sources':data['sources'],
                'pages':audit,'projects':data['projects'],'assets':assets,
                'note':'Resource counts measure references, not content quality or distinct creative works.'}
    (BASE/'media-index.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'pages':len(audit),'text_chunks':sum(p['chinese_text_chunks'] for p in audit),
                      'missing_chunks':sum(p['missing_text_chunks'] for p in audit),
                      'fixed_original_assets':len(assets)},ensure_ascii=False))


if __name__ == '__main__':
    main()
