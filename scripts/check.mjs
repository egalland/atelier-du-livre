import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const readJSON=id=>JSON.parse(html.match(new RegExp(`<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`))[1]);
const template=readJSON('readerTemplate'),bundle=readJSON('pdfBundle');
assert.equal(bundle.version,'5.6.205');
assert(bundle.library.length>100000&&bundle.worker.length>100000);
assert(Object.keys(bundle.assets).length>100);
assert(!/<(?:script|link)[^>]+(?:src|href)="https?:\/\//.test(html));
for(const id of ['pdfFile','bookTitle','buildButton','exportButton','preview'])assert(html.includes(`id="${id}"`));
assert(!/fullBtn|requestFullscreen|Plein écran/.test(template));
const app=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
new vm.Script(app);
const make=app.match(/function escapeHTML\(text\)\{[^\n]+\}\nfunction createBookHTML\(data,title=''\)\{[\s\S]*?\n\}/)[0];
const context=vm.createContext({template});
vm.runInContext(make,context);
for(const title of ['', 'Livre <test> & "titre"']){
 const exported=context.createBookHTML({pages:['data:image/jpeg;base64,AAAA'],filename:'test.pdf',ratio:.707},title);
 assert(!/__(PAGES|TITLE|TAB_TITLE|TITLE_HIDDEN|SPREAD_RATIO|PAGE_RATIO)__/.test(exported));
 assert(exported.includes('data:image/jpeg;base64,AAAA'));
 if(!title)assert(exported.includes('<header hidden>'));
 else assert(exported.includes('Livre &lt;test&gt; &amp; &quot;titre&quot;'));
 new vm.Script(exported.match(/<script>([\s\S]*?)<\/script>/)[1]);
}
const fit=template.match(/function fitBook\(\)\{[\s\S]*?\n\}/)[0];
let samples=0;
for(const [width,height,mobile] of [[290,240,true],[360,520,true],[710,1000,true],[900,390,false],[1160,670,false],[2380,1600,false],[3820,1990,false]]){
 for(const ratio of [.4,.707,1,1.414,2.5]){
  let bookWidth,perspective;
  const ctx=vm.createContext({bookFitFrame:1,bookWrap:{getBoundingClientRect:()=>({width,height})},getComputedStyle:()=>({paddingLeft:'14px',paddingRight:'14px',paddingTop:'12px',paddingBottom:'12px'}),isMobile:()=>mobile,book:{style:{setProperty:(name,value)=>{if(name==='--book-width')bookWidth=parseFloat(value);else if(name==='--book-perspective')perspective=parseFloat(value);else assert.fail(name);}}}});
  vm.runInContext(fit.replace('__PAGE_RATIO__',String(ratio))+';fitBook();',ctx);
  const pageWidth=bookWidth/(mobile?1:2),bookHeight=pageWidth/ratio;
  assert(bookWidth>0&&bookWidth<=width-28);
  if(width>2300&&ratio===.707)assert(bookWidth>1120);
  if(width===710&&ratio===1.414)assert(bookWidth>520);
  for(let angle=0;angle<=90;angle++)for(const u of [0,pageWidth]){
   const a=angle*Math.PI/180;
   const x=mobile?-pageWidth/2+u*Math.cos(a):u*Math.cos(a);
   const scale=perspective/(perspective-u*Math.sin(a));
   assert(Math.abs(x*scale)<=(width-28)/2+.01);
   assert(bookHeight*scale<=height-24+.01);
   samples++;
  }
 }
}
console.log(`Vérifications réussies : ressources hors ligne, export et titre facultatif, syntaxe, ${samples} projections de pages.`);
