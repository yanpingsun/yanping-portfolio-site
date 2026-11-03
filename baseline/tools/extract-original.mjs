// Read the fixed original implementation; emit Markdown, never website files.
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));
const ref = 'c9fc45a4417e7a8cfca30cc6536adcbaa66bcfe0';
const sources = ['index.html', 'portfolio-2026.js', 'portfolio-2026-content.js',
  'portfolio-2026-wireframes.js', 'portfolio-2026.css',
  'portfolio-2026-wireframes.css', 'portfolio-2.css'];
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const read = name => git(['show', `${ref}:${name}`]);
const ctx = vm.createContext({ document: { getElementById: () => ({}) } });
vm.runInContext(read('portfolio-2026-content.js'), ctx);
vm.runInContext(read('portfolio-2026-wireframes.js'), ctx);
const app = read('portfolio-2026.js');
// Only data and existing render functions. Do not run routing/event handlers.
vm.runInContext(app.slice(0, app.indexOf('\nfunction route()')), ctx);
const rendered = vm.runInContext(`({
  pages: [
    {id:'home',route:'#/',title:'首页',file:'home.md',html:home()},
    {id:'works',route:'#/works',title:'项目目录',file:'works.md',html:works()},
    {id:'about',route:'#/about',title:'关于我',file:'about.md',html:about()},
    ...PROJECTS.map(p=>({id:p.id,route:'#/project/'+p.id,title:p.name,
      file:'projects/'+(p.id==='clean'?'cleanser':p.id)+'.md',html:project(p)}))
  ],
  projects: PROJECTS.map(p=>({id:p.id,name:p.name,
    chapters:p.chapters.map(c=>({id:c.id,title:c.title,kind:c.kind||'content',
      images:c.images.length,documents:c.links.length})),
    videos:p.videos.map(v=>({title:v.title,src:v.src})),
    wireframes:PROJECT_WIREFRAMES[p.id]?{
      groups:PROJECT_WIREFRAMES[p.id].cases.length,
      featured:PROJECT_WIREFRAMES[p.id].featured,
      pdf:PROJECT_WIREFRAMES[p.id].base+PROJECT_WIREFRAMES[p.id].pdf
    }:null
  }))
})`, ctx);
const index = read('index.html');
rendered.shared = {
  header:index.match(/<header[\s\S]*?<\/header>/)[0],
  footer:index.match(/<footer[\s\S]*?<\/footer>/)[0],
  noscript:index.match(/<noscript>[\s\S]*?<\/noscript>/)[0]
};
rendered.ref = ref;
rendered.sources = sources.map(file=>({file,blob:git(['rev-parse',`${ref}:${file}`])}));
const result = spawnSync('python3', [path.join(root, 'baseline/tools/html_to_markdown.py')],
  {cwd:root,input:JSON.stringify(rendered),encoding:'utf8',maxBuffer:4*1024*1024});
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
if (result.status !== 0) process.exit(result.status || 1);
