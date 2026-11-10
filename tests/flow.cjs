const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(require('node:path').resolve(__dirname,'../Stenopfad.html'),'utf8');
const errors=[];
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://appassets.androidplatform.net/',beforeParse(w){
 w.scrollTo=()=>{};w.__resizeObservers=[];w.ResizeObserver=class{constructor(){this.disconnected=false;w.__resizeObservers.push(this);}observe(){}disconnect(){this.disconnected=true;}};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};
 w.HTMLElement.prototype.getBoundingClientRect=()=>({width:360,height:280,left:0,top:0});
 w.HTMLCanvasElement.prototype.getContext=()=>Object.fromEntries(['setTransform','clearRect','beginPath','moveTo','lineTo','stroke'].map(k=>[k,()=>{}]));
 w.addEventListener('error',e=>errors.push(e.error));
}});
const w=dom.window,doc=w.document;
const click=s=>{const e=doc.querySelector(s);assert.ok(e,`Missing ${s}`);e.click();};
const value=expr=>JSON.parse(w.eval(`JSON.stringify(${expr})`));
function draw(){const el=doc.querySelector('#ink');for(const [name,x] of [['pointerdown',100],['pointermove',110],['pointermove',120],['pointermove',130],['pointerup',130]]){const e=new w.Event(name,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:1,clientX:x,clientY:140});el['on'+name](e);}}
function answer(correct=true){const id=w.eval('session.tasks[session.index].id'),choice=doc.querySelector(`[data-answer${correct?'="'+id+'"':']:not([data-answer="'+id+'"'}]`);assert.equal(choice.getAttribute('role'),'radio');choice.click();assert.equal(choice.getAttribute('aria-checked'),'true');click('#check');click('#check');}
function finishCard(correct=true){assert.equal(doc.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'),'1');click('#next');assert.ok(doc.querySelector('#compare').disabled);draw();assert.ok(!doc.querySelector('#compare').disabled);click('#undo');assert.ok(doc.querySelector('#compare').disabled);draw();click('#compare');answer(correct);draw();click('#compare');click('#confident');}
assert.equal(value('CONTENT.cards.length'),105);assert.equal(value('CONTENT.lessons.length'),26);
assert.equal(new Set(value('CONTENT.cards.map(c=>c.id)')).size,105);
assert.equal(value('new Set(CONTENT.lessons.flatMap(l=>l.cards)).size'),105);
click('[data-min="3"]');click('#start');finishCard();
assert.equal(value('state.learned.length'),1);assert.equal(value('state.xp'),20);assert.equal(value('state.sessions'),1);assert.equal(value('state.completed.length'),0);assert.equal(value('dueIds().length'),0);
click('#home');click('#start');finishCard(false);assert.equal(value('state.learned.length'),1);assert.equal(value('dueIds().length'),1);
click('#home');click('#start');finishCard();click('#home');click('#start');finishCard();assert.equal(value('state.learned.length'),3);assert.equal(value('state.completed[0]'),'L01');
// Saved results survive reload; aborted tasks grant no XP.
const saved=JSON.parse(w.localStorage.getItem('stenopfad.v1'));assert.equal(saved.learned.length,3);
click('#home');const xp=value('state.xp');click('#start');click('#leave');click('#exit');assert.equal(value('state.xp'),xp);
// Paper is a fully usable fallback for drawing tasks.
click('#start');click('#next');click('#paper');assert.equal(doc.querySelector('#compare').disabled,false);assert.match(doc.querySelector('#write-feedback').textContent,/Übung auf Papier/);click('#compare');assert.ok(doc.querySelector('[role="radiogroup"]'));click('#leave');click('#exit');
// Backup cannot inject script, unknown cards, invalid schedules, or impossible progress.
assert.throws(()=>w.StenoCore.validate({...saved,learned:['<script>bad</script>']}));
assert.throws(()=>w.StenoCore.validate({...saved,review:{b:{level:99,due:1}}}));
assert.throws(()=>w.StenoCore.validate({...saved,xp:-1}));
assert.throws(()=>w.StenoCore.validate({...saved,learned:['__proto__']}));
assert.throws(()=>w.StenoCore.validate({...saved,review:JSON.parse('{"__proto__":{"level":1,"due":1}}')}));
assert.throws(()=>w.StenoCore.validate({...saved,days:['2026-02-31']}));
assert.throws(()=>w.StenoCore.validate({...saved,completed:['L02']}));
assert.throws(()=>w.StenoCore.validate({...saved,completed:['L01','L03']}));
click('[data-nav="stats"]');click('#export');const backup=doc.querySelector('#backup').value;assert.equal(JSON.parse(backup).learned.length,3);
doc.querySelector('#backup').value='garbage';click('#import');assert.equal(value('state.learned.length'),3);
doc.querySelector('#backup').value=backup;click('#import');click('#restore');assert.equal(value('state.xp'),xp);
// Collection filters, references, repeated drawing and empty review state.
click('[data-nav="collection"]');doc.querySelector('#search').value='nicht';doc.querySelector('#search').dispatchEvent(new w.Event('input'));assert.equal(doc.querySelectorAll('[data-card]').length,1);
click('[data-nav="write"]');assert.match(doc.querySelector('#sentences').textContent,/erste Lesefolge wartet/);draw();click('#clear');click('[data-nav="stats"]');assert.equal(w.__resizeObservers.at(-1).disconnected,true);click('#source');assert.equal(doc.querySelector('.reference-page').getAttribute('alt').includes('Seite 2'),true);
// Local calendar arithmetic stays correct across DST boundaries.
assert.equal(w.StenoCore.shiftDay('2026-03-29',1),'2026-03-30');assert.equal(w.StenoCore.shiftDay('2026-10-25',-1),'2026-10-24');
assert.equal(errors.length,0,errors.map(String).join('\n'));
console.log('PASS: 105 content mappings; learning flows; drawing and paper fallback; accessibility states; observer cleanup; backup validation; gated reading sequences; reference; DST.');
dom.window.close();
