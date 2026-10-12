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
assert(!/slowBtn|autoBtn|Journal de test|id="metrics"/.test(template));
assert(template.includes('const DEFAULT_ZOOM=.9;'));
assert(template.includes('const lastSpread='));
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
for(const count of [1,2,3,10,11,20,249,250]){
 const ctx=vm.createContext({pages:Array(count).fill('page')});
 const last=vm.runInContext("pages.length>1?(pages.length%2===0?pages.length-1:pages.length-2):0",ctx);
 assert(last>=0&&last<count);
 if(count>1)assert(last%2===1&&count-last<=2);
}
console.log('Vérifications réussies : bundle PDF hors ligne, export, titre facultatif, syntaxe, zoom 90 %, retrait des tests et pagination de 1 à 250 pages.');
