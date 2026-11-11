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
function answer(correct=true){const id=w.eval('session.tasks[session.index].id'),choice=doc.querySelector(`[data-answer${correct?'="'+id+'"':']:not([data-answer="'+id+'"'}]`),first=doc.querySelector('[data-answer]');assert.equal(choice.getAttribute('role'),'radio');first.focus();first.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(doc.querySelectorAll('[aria-checked="true"]').length,1);choice.click();assert.equal(choice.getAttribute('aria-checked'),'true');click('#check');click('#check');}
function finishCard(correct=true){assert.equal(doc.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'),'1');click('#next');assert.ok(doc.querySelector('#compare').disabled);draw();assert.ok(!doc.querySelector('#compare').disabled);click('#undo');assert.ok(doc.querySelector('#compare').disabled);draw();click('#compare');answer(correct);draw();click('#compare');click('#confident');}
assert.equal(value('CONTENT.cards.length'),105);assert.equal(value('CONTENT.lessons.length'),26);
assert.equal(new Set(value('CONTENT.cards.map(c=>c.id)')).size,105);
assert.equal(value('new Set(CONTENT.lessons.flatMap(l=>l.cards)).size'),105);
assert.equal(value('APP_VERSION'),'0.6.0');
assert.equal(value('SOURCE_CATALOG.length'),15);
assert.equal(value('fresh().version'),3);assert.equal(value('fresh().introduced.length'),0);assert.equal(value('fresh().resume'),null);
// A paused unit resumes at the next task, without granting XP twice or keeping drawing strokes.
click('[data-min="3"]');click('#start');click('#next');assert.equal(value('session.tasks[session.index].type'),'trace');assert.equal(value('state.resume.index'),1);click('#leave');click('#exit');assert.equal(value('session'),null);assert.equal(value('state.resume.index'),1);assert.ok(doc.querySelector('#resume'));click('#resume');assert.equal(value('session.tasks[session.index].type'),'trace');click('#leave');click('#exit');click('#discard-resume');assert.equal(value('state.resume'),null);
click('#start');finishCard();
assert.equal(value('state.learned.length'),1);assert.equal(value('state.introduced.length'),1);assert.equal(value('state.xp'),20);assert.equal(value('state.sessions'),1);assert.equal(value('state.completed.length'),0);assert.equal(value('dueIds().length'),0);
click('#home');click('#start');finishCard(false);assert.equal(value('state.learned.length'),1);assert.equal(value('state.introduced.length'),2);assert.equal(value('state.introduced.includes(dueIds()[0])'),true);assert.equal(value('dueIds().length'),1);
click('#home');assert.ok(doc.querySelector('#new'),'Fällige Wiederholungen müssen den Start priorisieren, ohne neue Einheiten zu verstecken');click('#new');finishCard();click('#home');click('#start');finishCard();assert.equal(value('state.learned.length'),3);assert.equal(value('state.completed[0]'),'L01');
// Saved results survive reload; aborted tasks grant no XP.
const saved=JSON.parse(w.localStorage.getItem('stenopfad.v1'));assert.equal(saved.version,3);assert.equal(saved.learned.length,3);const legacy={...saved,version:1};delete legacy.introduced;const migrated=w.StenoCore.validate(legacy);assert.equal(migrated.version,3);assert.deepEqual(JSON.parse(JSON.stringify(migrated.introduced)),[...new Set([...legacy.learned,...Object.keys(legacy.review)])]);const futureId=value('CONTENT.cards.find(c=>!state.introduced.includes(c.id)).id');assert.throws(()=>w.StenoCore.validate({...saved,review:{...saved.review,[futureId]:{level:0,due:0}}}));assert.throws(()=>w.StenoCore.validate({...saved,learned:[...saved.learned,futureId]}));assert.throws(()=>w.StenoCore.validate({...saved,resume:{lesson:'L01',tasks:[],index:0,correct:0,answered:0,xp:0,learned:[],failed:[],results:{}}}));const legacyPractice={...saved,resume:{lesson:null,tasks:['learn','trace','read','memory'].map(type=>({id:futureId,type})),index:0,correct:0,answered:0,xp:0,learned:[],failed:[],results:{}}};assert.equal(w.StenoCore.validate(legacyPractice).resume.mode,'practice','Pausierte Einzelformen aus 0.4 bleiben wiederherstellbar');const legacyWithFailed={...legacy,review:{...legacy.review,[futureId]:{level:0,due:0}}};const migratedWithFailed=w.StenoCore.validate(legacyWithFailed);assert.ok(migratedWithFailed.introduced.includes(futureId));assert.ok(!migratedWithFailed.learned.includes(futureId));
const longReviewIds=value('CONTENT.cards.slice(0,10).map(c=>c.id)'),longReview={...saved,completed:[],introduced:longReviewIds,learned:longReviewIds,review:Object.fromEntries(longReviewIds.map(id=>[id,{level:0,due:0}])),resume:{lesson:null,tasks:longReviewIds.flatMap(id=>[{id,type:'read'},{id,type:'memory'}]),index:0,correct:0,answered:0,xp:0,learned:[],failed:[],results:{}}};assert.equal(w.StenoCore.validate(longReview).resume.tasks.length,20,'Eine 15-Minuten-Wiederholung muss pausiert werden können');
click('#home');const xp=value('state.xp');click('#start');click('#leave');click('#exit');assert.equal(value('state.xp'),xp);assert.ok(value('state.resume'));click('#discard-resume');
// Paper is a fully usable fallback for drawing tasks.
click('#start');click('#next');click('#paper');assert.equal(doc.querySelector('#compare').disabled,false);assert.match(doc.querySelector('#write-feedback').textContent,/Übung auf Papier/);click('#compare');assert.ok(doc.querySelector('[role="radiogroup"]'));click('#leave');click('#exit');click('#discard-resume');
// Backup cannot inject script, unknown cards, invalid schedules, or impossible progress.
assert.throws(()=>w.StenoCore.validate({...saved,learned:['<script>bad</script>']}));
assert.throws(()=>w.StenoCore.validate({...saved,review:{b:{level:99,due:1}}}));
assert.throws(()=>w.StenoCore.validate({...saved,xp:-1}));
assert.throws(()=>w.StenoCore.validate({...saved,learned:['__proto__']}));
assert.throws(()=>w.StenoCore.validate({...saved,review:JSON.parse('{"__proto__":{"level":1,"due":1}}')}));
assert.throws(()=>w.StenoCore.validate({...saved,days:['2026-02-31']}));
assert.throws(()=>w.StenoCore.validate({...saved,completed:['L02']}));
assert.throws(()=>w.StenoCore.validate({...saved,completed:['L01','L03']}));
w.eval('state.review[Object.keys(state.review)[0]].due=Date.now()-1');click('[data-nav="stats"]');assert.ok(doc.querySelector('#review-due'));assert.match(doc.querySelector('.review-list').textContent,/heute/);assert.ok([...doc.querySelectorAll('#main aside h3')].some(h=>h.textContent===`Stenopfad ${w.eval('APP_VERSION')}`));click('#export');const backup=doc.querySelector('#backup').value;assert.equal(JSON.parse(backup).learned.length,3);
doc.querySelector('#backup').value='garbage';click('#import');assert.equal(value('state.learned.length'),3);
doc.querySelector('#backup').value=backup;click('#import');click('#restore');assert.equal(value('state.xp'),xp);
// Collection filters, references, repeated drawing and empty review state.
click('[data-nav="collection"]');doc.querySelector('#search').value='nicht';doc.querySelector('#search').dispatchEvent(new w.Event('input'));assert.equal(doc.querySelectorAll('[data-card]').length,1);const progressBeforePractice=value('({xp:state.xp,learned:[...state.learned],sessions:state.sessions,review:{...state.review}})');click('[data-card]');assert.equal(value('session.mode'),'practice');assert.equal(value('state.resume.mode'),'practice');click('#next');draw();click('#compare');draw();click('#compare');click('#confident');assert.equal(value('session'),null);assert.deepEqual(value('({xp:state.xp,learned:[...state.learned],sessions:state.sessions,review:{...state.review}})'),progressBeforePractice);assert.match(doc.querySelector('#main').textContent,/Einzelübung/);
click('#home');click('[data-nav="write"]');assert.match(doc.querySelector('#sentences').textContent,/erste Lesefolge wartet/);draw();click('#clear');w.eval("state.learned.push('k-wir','k-sind','k-es')");click('[data-nav="learn"]');click('[data-nav="write"]');const readingAnswer=doc.querySelector('[data-reading-answer="Wir sind es."]'),readingFirst=doc.querySelector('[data-reading-answer]');assert.equal(readingAnswer.getAttribute('role'),'radio');readingFirst.focus();readingFirst.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(doc.querySelectorAll('[data-reading-answer][aria-checked="true"]').length,1);readingAnswer.click();click('[data-reading-check="0"]');assert.match(doc.querySelector('#reading-feedback-0').textContent,/Richtig gelesen/);click('[data-nav="stats"]');assert.equal(w.__resizeObservers.at(-1).disconnected,true);click('#source');assert.equal(doc.querySelector('.reference-page').getAttribute('alt').includes('Seite 2'),true);assert.equal(doc.querySelectorAll('[data-source-copy]').length,15);click('[data-source-copy]');assert.match(doc.querySelector('#toast').textContent,/Adresse/);
// Local calendar arithmetic stays correct across DST boundaries.
assert.equal(w.StenoCore.shiftDay('2026-03-29',1),'2026-03-30');assert.equal(w.StenoCore.shiftDay('2026-10-25',-1),'2026-10-24');
assert.equal(errors.length,0,errors.map(String).join('\n'));
console.log('PASS: 105 content mappings; learning flows; pause/resume; isolated reference practice; source catalog; drawing and paper fallback; keyboard-accessible answers; observer cleanup; backup validation; review overview; gated reading quizzes; reference; DST.');
dom.window.close();
