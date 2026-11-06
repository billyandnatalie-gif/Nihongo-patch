/* Nihongo Path: original guided Japanese immersion practice. No API keys or paid backend. */
(() => {
 'use strict';
 const KEY='nihongo_path_local_v1';
 const today=()=>new Date().toLocaleDateString('en-CA');
 const defaultState=()=>({completed:[],lessonAttempts:{},scenariosDone:[],review:{},activityDays:[],sessions:0,minutes:0,logs:[],prefs:{english:true,romaji:false,rate:0.85},lastLesson:'n5-01',initialLevel:'N5'});
 let state=defaultState();
 try{const stored=JSON.parse(localStorage.getItem(KEY)||'null');if(stored&&typeof stored==='object')state={...defaultState(),...stored,prefs:{...defaultState().prefs,...(stored.prefs||{})}};}catch(e){}
 const ui={view:'home',level:'ALL',lessonId:null,drill:0,lessonFeedback:null,sceneId:null,sceneTurn:0,sceneFeedback:null,reviewShow:false,quizId:null,quizFeedback:null,listeningHide:true,recording:false};
 const app=document.getElementById('app');
 const pct=(a,b)=>b?Math.round((a/b)*100):0;
 const e=(s)=>String(s==null?'':s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const ls=id=>LESSONS.find(l=>l.id===id);
 const sc=id=>SCENARIOS.find(s=>s.id===id);
 const allDone=()=>state.completed.length;
 const remain=()=>LESSONS.find(l=>!state.completed.includes(l.id))||LESSONS[LESSONS.length-1];
 const recordActivity=()=>{const d=today();if(!state.activityDays.includes(d)){state.activityDays.push(d);state.activityDays=state.activityDays.slice(-365);}};
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch(err){toast('Saving is blocked here. Try opening the app through localhost or HTTPS.');}};
 const log=(kind,title,detail)=>{state.logs.unshift({day:today(),kind,title,detail});state.logs=state.logs.slice(0,50);};
 let toastTimer;
 function toast(message){let node=document.getElementById('toast');if(!node)return;node.textContent=message;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3500);}
 function streak(){let dates=new Set(state.activityDays);let d=new Date();let cur=0;const key=x=>x.toLocaleDateString('en-CA');if(!dates.has(key(d)))d.setDate(d.getDate()-1);while(dates.has(key(d))){cur++;d.setDate(d.getDate()-1);}return cur;}
 function levelTag(level){return `<span class="tag ${level.toLowerCase()}">${level} · ${level==='N5'?'Foundations':level==='N4'?'Everyday':'Intermediate'}</span>`;}
 const navs=[['home','⌂','Overview'],['lessons','▤','Lessons'],['voice','◉','Voice Lab'],['review','◇','Review'],['plan','▦','Study Plan'],['settings','⚙','Settings']];
 function frame(content,eyebrow,title){
  const completed=pct(state.completed.length,LESSONS.length);
  const nav=navs.map(([key,ic,name])=>`<button class="nav-item ${ui.view===key?'active':''}" data-nav="${key}" aria-label="${name}"><span class="nav-icon">${ic}</span>${name}</button>`).join('');
  app.innerHTML=`<div class="app"><aside class="sidebar"><div class="brand"><div class="brand-symbol">日</div><div><div class="brand-name">Nihongo Path</div><div class="brand-caption">Japanese immersion</div></div></div><div class="side-label">Your learning studio</div><nav class="nav">${nav}</nav><div class="sidebar-bottom"><div class="progress-side"><strong>日本語の旅</strong><p>${allDone()} of ${LESSONS.length} guided lessons completed</p><div class="progress-track"><span style="width:${completed}%"></span></div><p style="margin-bottom:0">${completed}% of the curriculum</p></div><div class="side-footer">Your practice stays on this device</div></div></aside><main class="main"><div class="topbar"><div><div class="eyebrow">${eyebrow}</div><h1 class="page-title">${title}</h1></div><div class="top-actions"><span class="top-pill">🔥 ${streak()} day streak</span><span class="top-pill">✓ ${allDone()} lessons</span></div></div>${content}<div class="footer">Nihongo Path · Original self-study companion · N5–N3-oriented · Not an official JLPT qualification</div></main></div><div class="toaster" id="toast" role="status" aria-live="polite"></div>`;
 }
 function render(){if(ui.view==='home')renderHome();if(ui.view==='lessons')renderLessons();if(ui.view==='lesson')renderLesson();if(ui.view==='voice')renderVoice();if(ui.view==='scenario')renderScenario();if(ui.view==='review')renderReview();if(ui.view==='plan')renderPlan();if(ui.view==='settings')renderSettings();}
 const btn=(label,action,cls='btn-primary',extra='')=>`<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;
 function renderHome(){
  const next=remain();
  const reviewCount=dueCards().length;
  const latest=state.logs.slice(0,3).map(x=>`<div class="skill-row"><div><strong>${e(x.title)}</strong><p class="small muted">${e(x.detail)}</p></div><span class="small muted">${e(x.day)}</span></div>`).join('');
  const hero=`<section class="hero"><div class="hero-copy"><small>YOUR JAPANESE JOURNEY</small><h2>Speak a little Japanese<br>every single day.</h2><p>Listen, answer out loud, review what you forget, and build confidence for everyday life in Japan.</p><div class="btn-row">${btn('Continue: '+e(next.title)+' →','continue','btn-primary btn-large')}${btn('Start speaking 🎙','open-voice','btn-light btn-large')}</div></div><div class="hero-jp" aria-hidden="true">日本語</div></section>`;
  const metrics=`<div class="grid four spaced"><div class="panel metric"><div class="icon-wrap">📚</div><strong>${allDone()}/${LESSONS.length}</strong><span>Lessons completed</span></div><div class="panel metric"><div class="icon-wrap">🎙</div><strong>${state.sessions}</strong><span>Practice sessions</span></div><div class="panel metric"><div class="icon-wrap">🧠</div><strong>${reviewCount}</strong><span>Review cards due</span></div><div class="panel metric"><div class="icon-wrap">⏱</div><strong>${state.minutes}</strong><span>Planned study minutes</span></div></div>`;
  const cards=[['📘','Structured lesson','Grammar, examples, listening and spoken recall.','lessons'],['🎤','Real-life role-play','Trains, apartments, work, cafés and clinics.','voice'],['🧠','Memory review','Recall vocabulary with spaced intervals.','review']].map(([icon,title,desc,dest])=>`<button class="panel compact quick-link" data-nav="${dest}" style="width:100%;text-align:left;cursor:pointer"><span class="quick-icon">${icon}</span><span style="flex:1"><strong>${title}</strong><p>${desc}</p></span><span>→</span></button>`).join('');
  frame(`${hero}${metrics}<div class="section-heading"><h2>Choose your next activity</h2><span class="hint">Small steps, repeated often</span></div><div class="grid three">${cards}</div><div class="grid two spaced"><section class="panel"><h3>Lesson pathway</h3><p class="screen-lead">All levels are visible; advance at a pace that fits you.</p>${['N5','N4','N3'].map(level=>{const count=LESSONS.filter(l=>l.level===level).length;const done=LESSONS.filter(l=>l.level===level&&state.completed.includes(l.id)).length;return `<div class="progress-level"><div class="label-line"><strong>${level} · ${level==='N5'?'Beginner':level==='N4'?'Elementary':'Intermediate'}</strong><span>${done}/${count}</span></div><div class="stat-line"><div style="width:${pct(done,count)}%"></div></div></div>`;}).join('')}<div class="btn-row">${btn('Browse lessons','open-lessons','btn-secondary')}</div></section><section class="panel"><h3>Learning record</h3><p class="screen-lead">Highlights from this device.</p>${latest||'<div class="empty" style="padding:24px 4px"><div class="illustration">🌱</div><h3>Start your first session</h3><p>Your learning record will appear here.</p></div>'}<div class="btn-row">${btn('Export progress','export','btn-quiet')}</div></section></div><div class="notice">🎙 Voice practice works best in Chrome or Edge with a Japanese voice installed. Speech-to-text checks words that were recognized, not precise pronunciation. For unrestricted AI conversation, use the ChatGPT Voice handoff in Voice Lab.</div>`, 'WELCOME BACK','Your immersion dashboard');
 }
 function renderLessons(){
  const tabs=['ALL','N5','N4','N3'].map(level=>`<button class="tab ${ui.level===level?'active':''}" data-action="filter-level" data-level="${level}">${level==='ALL'?'All lessons':level}</button>`).join('');
  const cards=LESSONS.filter(l=>ui.level==='ALL'||l.level===ui.level).map((l,i)=>`<div class="panel lesson-card"><div class="lesson-head">${levelTag(l.level)}${state.completed.includes(l.id)?'<span class="tag done">✓ Done</span>':'<span class="progress-count">~25 min</span>'}</div><h3>${e(l.title)}</h3><p>${e(l.topic)}</p><button class="btn ${state.completed.includes(l.id)?'btn-quiet':'btn-secondary'}" data-action="start-lesson" data-id="${l.id}">${state.completed.includes(l.id)?'Review lesson ↗':'Open lesson →'}</button></div>`).join('');
  frame(`<p class="screen-lead">An original, progressive course inspired by retrieval practice, comprehensible input and everyday Japanese. Level labels indicate approximate learning bands, not guaranteed exam readiness.</p><div class="tabs">${tabs}</div><div class="grid three">${cards}</div>`, 'STRUCTURED PATH','Learn Japanese step by step');
 }
 function renderLesson(){
  const l=ls(ui.lessonId)||remain();ui.lessonId=l.id; const i=Math.min(ui.drill,l.drills.length-1);ui.drill=i;const d=l.drills[i];const tried=new Set(state.lessonAttempts[l.id]||[]);
  const v=l.vocab.map(v=>`<div class="vocab-item"><div><span class="jp">${e(v[0])}</span><span class="reading">${e(v[1])}</span></div><span class="english">${e(v[2])}</span><button class="btn btn-quiet btn-sm" data-action="speak-text" data-text="${e(v[0])}" title="Hear Japanese">🔊</button></div>`).join('');
  const examples=l.examples.map(x=>`<div class="example"><div><div class="jp">${e(x[0])}</div><div class="english">${e(x[1])}</div></div><button class="btn btn-quiet btn-sm" data-action="speak-text" data-text="${e(x[0])}">🔊</button></div>`).join('');
  const feedback=ui.lessonFeedback?feedbackBox(ui.lessonFeedback):'';
  const english=state.prefs.english?`<div class="helper">Meaning: ${e(d[2])}</div>`:'';
  const speakerText=ui.listeningHide?`<span class="muted small">Japanese prompt hidden — listen first, then reveal if needed.</span>`:`<div class="big-jp">${e(d[0])}</div><div class="reading">${e(d[1])}</div>`;
  const prompt=`<section class="panel"><div class="lesson-head"><h3>Speak from memory</h3><span class="tag">${i+1} of ${l.drills.length}</span></div><div class="dialogue-card"><span class="mini-label">Listen to your teacher</span><div class="btn-row">${btn('🔊 Hear the question','hear-question','btn-primary')}${btn(ui.listeningHide?'👁 Show Japanese':'🙈 Hide Japanese','toggle-hide','btn-quiet')}</div><div style="margin-top:15px">${speakerText}</div>${english}<div class="divider"></div><div class="mini-label">Your speaking goal</div><p style="margin-top:6px;font-weight:700">${e(d[5])}</p><div class="btn-row">${btn('🎙 Speak your answer','mic-lesson','btn-dark',speechSupported()?'':'disabled')}${btn('🔊 Hear model answer','hear-answer','btn-quiet')}</div><div class="answer-box"><input id="typed-response" aria-label="Type your answer in Japanese" placeholder="Or type your answer in Japanese…"><button class="btn btn-secondary" data-action="check-typed-lesson">Check text</button></div>${feedback}<div class="btn-row">${btn('✓ I practiced this','practice-done','btn-secondary')}${i>0?btn('← Previous','prev-drill','btn-outline'):''}${i<l.drills.length-1?btn('Next prompt →','next-drill','btn-primary'):''}</div></div></section>`;
  const canFinish=tried.size>=l.drills.length;
  const finish=`<div class="panel compact" style="margin-top:18px;display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap"><div><strong>${tried.size} of ${l.drills.length} spoken-response prompts practiced</strong><p class="small muted">Complete both prompts before marking this lesson finished.</p></div>${btn(state.completed.includes(l.id)?'✓ Completed':'Complete lesson →','finish-lesson',state.completed.includes(l.id)?'btn-quiet':'btn-primary',canFinish?'':'disabled')}</div>`;
  frame(`<div class="lesson-hero"><div>${levelTag(l.level)}<h2 style="margin-top:10px">${e(l.title)}</h2><p>${e(l.topic)}</p></div>${btn('← All lessons','open-lessons','btn-quiet')}</div><div class="grid two"><section class="panel"><h3>What you will learn</h3><p class="screen-lead">${e(l.grammar)}</p><h3 style="margin:17px 0 9px">Vocabulary</h3>${v}</section><section class="panel"><h3>Native-style examples</h3><p class="small muted" style="margin:6px 0 10px">Listen, repeat, then try recalling without reading.</p>${examples}<div class="note" style="margin-top:20px">💡 Focus on understandable, natural responses—not speed. You can repeat any audio as often as you like.</div></section></div><div class="section-heading"><h2>Interactive practice</h2><span class="hint">Speak first; read afterward</span></div>${prompt}${finish}<p class="scope-notice">Voice recognition can mis-transcribe correct speech and cannot provide a reliable pronunciation grade. It offers a rough transcript comparison with a model answer—not an official proficiency evaluation.</p>`,l.level+' / GUIDED LESSON','Learn, listen & respond');
 }
 function feedbackBox(f){return `<div class="response ${f.kind==='warning'?'warn':''}"><strong>${e(f.title)}</strong><p style="margin-top:4px">${e(f.text)}</p><p style="margin-top:7px"><strong>Model:</strong> ${e(f.model)}</p>${f.recognized?`<p style="margin-top:4px"><strong>Recognized:</strong> ${e(f.recognized)}</p>`:''}</div>`;}
 function renderVoice(){
  const cards=SCENARIOS.map(s=>`<div class="panel lesson-card"><div class="lesson-head">${levelTag(s.level)}${state.scenariosDone.includes(s.id)?'<span class="tag done">✓ Tried</span>':''}</div><div class="scenario"><div class="scenario-icon">${s.icon}</div><div><h3>${e(s.title)}</h3><p>${e(s.place)}</p></div></div><p>${e(s.description)}</p><button class="btn btn-secondary" data-action="open-scenario" data-id="${s.id}">Start role-play →</button></div>`).join('');
  frame(`<div class="grid two"><section class="panel"><h3>🎙 Guided conversation</h3><p class="screen-lead">Your partner speaks Japanese; you answer by voice or text. The story advances one question at a time, following a real-life situation.</p><div class="strip">Listen first. Try to understand before reading English. If you get stuck, turn translations back on in Settings.</div><p class="scope-notice">This mode uses prepared dialogue, not generative AI. It checks speech recognition text against example answers and may not understand alternate correct replies.</p></section><section class="panel"><h3>✨ Open-ended AI conversation</h3><p class="screen-lead">For natural unscripted dialogue and adaptable follow-up questions, use your existing ChatGPT Voice access alongside this app.</p>${btn('📋 Copy my Japanese coach prompt','copy-coach','btn-primary')}<div class="btn-row">${btn('Open ChatGPT ↗','open-chatgpt','btn-outline')}</div><p class="scope-notice">ChatGPT opens separately. This app cannot access your ChatGPT conversations or automatically import their results.</p></section></div><div class="section-heading"><h2>Choose a scenario</h2><span class="hint">Beginner to intermediate</span></div><div class="grid three">${cards}</div>`, 'SPEAK & LISTEN','Your Japanese voice lab');
 }
 function renderScenario(){
  const s=sc(ui.sceneId);if(!s){ui.view='voice';return renderVoice();}const t=s.turns[Math.min(ui.sceneTurn,s.turns.length-1)];
  const feedback=ui.sceneFeedback?feedbackBox(ui.sceneFeedback):'';
  const bubbles=`<div class="role-bubble"><div class="audience">👤 Your conversation partner</div>${ui.listeningHide?'<p class="muted small" style="margin-top:13px">Japanese hidden for listening practice.</p>':`<div class="jp" style="margin-top:10px">${e(t[0])}</div>`}${state.prefs.english?`<div class="helper" style="margin-top:7px">${e(t[1])}</div>`:''}</div>`;
  frame(`<div class="lesson-hero"><div><span class="tag">${s.level} · Role-play</span><h2 style="margin-top:9px">${s.icon} ${e(s.title)}</h2><p>${e(s.description)} · Turn ${ui.sceneTurn+1}/${s.turns.length}</p></div>${btn('← Scenarios','open-voice','btn-quiet')}</div><div class="panel" style="max-width:860px;margin:auto"><div class="role-bubble"><div class="mini-label">SITUATION</div><p style="margin-top:5px">${e(s.place)}</p></div>${bubbles}<div class="btn-row" style="margin:0 0 17px">${btn('🔊 Listen to your partner','hear-scene','btn-primary')}${btn(ui.listeningHide?'👁 Show Japanese':'🙈 Hide Japanese','toggle-hide','btn-quiet')}</div><div class="goal"><strong>Your response goal:</strong> ${e(t[2])}</div><div class="btn-row">${btn('🎙 Speak now','mic-scene','btn-dark',speechSupported()?'':'disabled')}${btn('🔊 Model answer','hear-scene-answer','btn-quiet')}</div><div class="answer-box"><input id="typed-response" aria-label="Type a Japanese response" placeholder="Or type your Japanese answer…"><button class="btn btn-secondary" data-action="check-typed-scene">Check</button></div>${feedback}<div class="btn-row">${ui.sceneTurn>0?btn('← Back','prev-scene','btn-outline'):''}${btn(ui.sceneTurn===s.turns.length-1?'Finish role-play ✓':'Next turn →','next-scene','btn-primary')}</div></div><p class="scope-notice" style="max-width:860px;margin:16px auto">Responding with your own wording is encouraged. The text match is only a guide; it is not a semantic or pronunciation assessment.</p>`,s.level+' / CONVERSATION','Practice with a partner');
 }
 function cards(){let a=[];LESSONS.filter(l=>state.completed.includes(l.id)).forEach(l=>l.vocab.forEach((v,i)=>a.push({id:l.id+'-'+i,level:l.level,word:v[0],reading:v[1],meaning:v[2]})));return a;}
 function dueCards(){const d=today();return cards().filter(c=>!state.review[c.id]||state.review[c.id].due<=d).sort((a,b)=>{const x=state.review[a.id]?.due||'0000';const y=state.review[b.id]?.due||'0000';return x.localeCompare(y)||(state.review[a.id]?.lastAgain||0)-(state.review[b.id]?.lastAgain||0);});}
 function renderReview(){
  const due=dueCards(),all=cards(),c=due[0];
  if(!c){frame(`<div class="panel empty"><div class="illustration">🧠</div><h3>${all.length?'You’re up to date!':'Your review deck starts after lesson one.'}</h3><p>${all.length?'No cards are due at the moment. Come back later or complete another lesson.':'Complete a guided lesson to add its vocabulary to your spaced-review deck.'}</p><div class="btn-row" style="justify-content:center">${btn('Browse lessons →','open-lessons','btn-primary')}</div></div><div class="notice">Cards are scheduled for review after 1, 3, 7 and 14+ days when marked “I knew it.” “Review again” brings them back today. Dates are stored locally.</div>`, 'SPACED REPETITION','Remember what you learn');return;}
  const front=`<div class="review-flip"><div><div class="mini-label" style="color:#afcfcc">WHAT DOES THIS MEAN?</div><h2>${e(c.word)}</h2>${ui.reviewShow?`<p style="font-size:18px;color:#fff;margin-top:12px">${e(c.reading)} · ${e(c.meaning)}</p>`:'<p>Say the meaning out loud before revealing it.</p>'}</div></div>`;
  frame(`<div class="grid two"><section class="panel"><div class="lesson-head"><h3>Cards due now</h3><span class="tag">${due.length} remaining</span></div>${front}<div class="btn-row" style="justify-content:center">${btn('🔊 Listen','hear-card','btn-outline')}${!ui.reviewShow?btn('Reveal answer','reveal-card','btn-primary'):btn('↻ Review again','grade-again','btn-quiet')+btn('✓ I knew it','grade-good','btn-secondary')}</div></section><section class="panel"><h3>How review works</h3><p class="screen-lead">Learn new vocabulary in lessons, then retrieve it from memory. Repeat difficult items more often and give easier items longer intervals.</p><div class="skill-row"><strong>Learned vocabulary</strong><span>${all.length} cards</span></div><div class="skill-row"><strong>Due for review</strong><span>${due.length} cards</span></div><div class="skill-row"><strong>Reviewed at least once</strong><span>${Object.keys(state.review).length} cards</span></div><div class="strip" style="margin-top:18px">Say your answer aloud before revealing it. This strengthens recall even when your microphone isn’t available.</div></section></div>`, 'ACTIVE RECALL','Vocabulary & memory review');
 }
 function renderPlan(){
  const schedule=[['30 min','ChatGPT Voice or Voice Lab','Listening, speaking, repetition, unscripted or guided conversations.'],['15 min','Genki textbook','Structured grammar, reading and writing. Move to Quartet after Genki II.'],['10 min','Bunpro','Grammar spaced repetition and weak-point drills.'],['10 min','Renshuu','Vocabulary, hiragana, katakana and kanji reviews.'],['10 min','Japanese audio','Beginner podcasts or later graded stories from Satori Reader.']];
  const external=[['Genki textbooks','https://genki3.japantimes.co.jp/en/','Begin with Genki I, then II.'],['Bunpro','https://bunpro.jp/','Grammar review (~$5/mo in prior estimate; check current pricing).'],['Renshuu','https://www.renshuu.org/','Free vocabulary and kanji practice.'],['Satori Reader','https://www.satorireader.com/','Optional later reading + listening (~$9/mo prior estimate).'],['ToKini Andy','https://www.tokiniandy.com/','Useful Genki/Quartet video explanations.'],['Free Tadoku books','https://tadoku.org/japanese/en/free-books-en/','Free graded Japanese readers.'],['Irodori lessons','https://www.irodori.jpf.go.jp/en/','Free Japanese for life in Japan.'],['JLPT official practice','https://www.jlpt.jp/e/samples/forlearners.html','Official sample and practice questions.']];
  frame(`<div class="grid two"><section class="panel"><div class="lesson-head"><h3>Your 60–75 minute daily plan</h3><span class="tag">Suggested</span></div><p class="small muted" style="margin-top:8px">Try 5–6 days a week. Consistency matters more than buying lots of apps.</p>${schedule.map(x=>`<div class="plan-day"><div class="time-chip">${x[0]}</div><div><strong>${e(x[1])}</strong><p>${e(x[2])}</p></div></div>`).join('')}</section><section class="panel"><h3>Milestones and checkpoints</h3><div class="plan-day"><div class="time-chip">N5</div><div><strong>Build your foundation</strong><p>Kana, introductions, objects, shopping, basic listening and short responses.</p></div></div><div class="plan-day"><div class="time-chip">N4</div><div><strong>Connect sentences</strong><p>Plans, requests, experiences, reasons and more detailed daily dialogue.</p></div></div><div class="plan-day"><div class="time-chip">N3</div><div><strong>Handle more complex situations</strong><p>Housing, work, medical visits, nuanced opinions and longer listening passages.</p></div></div><div class="notice">Passing N3 requires targeted reading, listening and grammar practice. This app alone is not a complete JLPT exam-preparation course. Japanese speaking is not tested on JLPT.</div></section></div><div class="section-heading"><h2>Companion learning materials</h2><span class="hint">Purchase selectively</span></div><div class="grid two">${external.map(x=>`<a class="panel quick-link" href="${e(x[1])}" target="_blank" rel="noopener noreferrer"><div><strong>${e(x[0])}</strong><p>${e(x[2])}</p></div><span style="font-size:23px">↗</span></a>`).join('')}</div><div class="panel spaced"><h3>Spending plan</h3><p style="margin-top:8px">You can start with this free app, your existing ChatGPT Voice access, a Genki textbook, free Renshuu and free Japanese audio. Add Bunpro if grammar retention needs more structure; add Satori Reader at a later stage. This keeps recurring spending low.</p><p class="scope-notice">Previous estimated subscription prices may change and are not live quotes. This program is independent of the linked providers.</p></div>`, 'YOUR STUDY SYSTEM','Combine speaking with real progress');
 }
 function renderSettings(){
  const p=state.prefs;
  frame(`<div class="grid two"><section class="panel"><h3>Practice preferences</h3><div class="settings-row"><div><strong>Show English meaning</strong><p>Display translations beside listening prompts.</p></div><input type="checkbox" data-setting="english" ${p.english?'checked':''} aria-label="Show English meaning"></div><div class="settings-row"><div><strong>Speak at</strong><p>Slower speech can help in early lessons.</p></div><select data-setting="rate"><option value="0.7" ${p.rate==0.7?'selected':''}>Very slow</option><option value="0.85" ${p.rate==0.85?'selected':''}>Slow</option><option value="1" ${p.rate==1?'selected':''}>Normal</option></select></div><div class="settings-row"><div><strong>Default level</strong><p>Your preferred starting band (does not lock any lessons).</p></div><select data-setting="initialLevel"><option ${state.initialLevel==='N5'?'selected':''}>N5</option><option ${state.initialLevel==='N4'?'selected':''}>N4</option><option ${state.initialLevel==='N3'?'selected':''}>N3</option></select></div><div class="strip" style="margin-top:20px">${speechSupported()?'✅ Microphone speech recognition is available in this browser.':'⚠️ No compatible Japanese speech-recognition API detected in this browser. Audio playback and typed answers still work.'}</div><p class="scope-notice">Japanese playback depends on voices installed in your operating system and browser. Chrome/Edge are often the easiest desktop options.</p></section><section class="panel"><h3>Your private progress data</h3><p class="screen-lead">Lesson progress, review dates and practice logs are saved locally in this browser. They are not synchronized across devices.</p><div class="skill-row"><strong>Lessons</strong><span>${state.completed.length}</span></div><div class="skill-row"><strong>Completed scenarios</strong><span>${state.scenariosDone.length}</span></div><div class="skill-row"><strong>Recorded activity days</strong><span>${state.activityDays.length}</span></div><div class="btn-row">${btn('⬇ Export JSON','export','btn-primary')}<label class="btn btn-outline" for="import-file" style="cursor:pointer">⬆ Import JSON</label><input type="file" accept="application/json,.json" id="import-file" class="hide"></div><div class="divider"></div><button class="btn danger" data-action="reset">Reset all progress</button><p class="scope-notice">Export a backup before switching browsers or devices. Reset requires confirmation.</p></section></div><div class="panel spaced"><h3>How voice feedback really works</h3><p class="screen-lead">The app speaks Japanese using your browser’s speech synthesis. When you speak, the browser may transcribe what it hears and the app compares that text with a sample answer. This can be useful for recall, but it is <strong>not</strong> a reliable accent rating, does not understand all valid alternative responses, and is not powered by an AI language model.</p><p>For adaptive, free-form speaking instruction, open ChatGPT Voice from Voice Lab. You can use the copyable teaching prompt to continue the same N5-to-N3 style of practice.</p></div>`, 'PERSONALIZE YOUR TRAINING','Settings & progress');
 }
 let activeUtterance=null;
 function speakJapanese(text){
  if(!('speechSynthesis' in window)){toast('Text-to-speech is not available in this browser.');return;}
  try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=Number(state.prefs.rate)||0.85;u.pitch=1;
   const voices=speechSynthesis.getVoices();const voice=voices.find(v=>/^ja[-_]/i.test(v.lang));if(voice)u.voice=voice;
   else if(voices.length)toast('No Japanese voice installed. The pronunciation may sound unnatural; install a Japanese system voice.');
   activeUtterance=u;speechSynthesis.speak(u);
  }catch(err){toast('Japanese voice playback failed on this device.');}
 }
 function speechSupported(){return !!(window.SpeechRecognition||window.webkitSpeechRecognition);}
 let recognizing=null;
 function microphone(kind){
  if(!speechSupported()){toast('This browser does not support Japanese speech recognition. Try Chrome/Edge or type your answer.');return;}
  try{
   if(recognizing){recognizing.abort();recognizing=null;}
   if('speechSynthesis' in window)speechSynthesis.cancel();
   const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;const rec=new Rec();
   rec.lang='ja-JP';rec.interimResults=false;rec.maxAlternatives=3;rec.continuous=false;
   rec.onresult=event=>{const t=event.results[0][0].transcript;submitAnswer(kind,t,'voice');};
   rec.onerror=event=>toast('Microphone: '+(event.error==='not-allowed'?'permission denied':event.error)+'. You can type your answer instead.');
   rec.onend=()=>{recognizing=null;ui.recording=false;const b=document.getElementById('mic-state');if(b)b.textContent='';};
   recognizing=rec;rec.start();ui.recording=true;toast('Listening now… speak naturally in Japanese.');
  }catch(err){toast('Could not start the microphone. Check permissions or use typed answers.');}
 }
 const normalize=x=>String(x||'').normalize('NFKC').toLowerCase().replace(/[\s。、！？.!?,\-ー]/g,'');
 function similarity(a,b){a=normalize(a);b=normalize(b);if(!a||!b)return 0;if(a===b)return 1;const dp=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=dp[0];dp[0]=i;for(let j=1;j<=b.length;j++){let t=dp[j];dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=t;}}return 1-dp[b.length]/Math.max(a.length,b.length);}
 function assess(response,model,reading,mode){
  const score=Math.max(similarity(response,model),similarity(response,reading));
  let title,text,kind='success';
  if(score>=0.78){title='Close to the model response ✓';text='Your recognized wording resembles the example. Listen again and repeat for rhythm and pacing.';}
  else if(score>=0.43){title='Partly similar — try once more';text='Your words resemble part of the example. Compare them and repeat. A different answer may also be valid.';kind='warning';}
  else{title='Compare with the model answer';text='Your response was captured, but its wording differs from the sample. It may still be correct; this app cannot judge alternate meanings reliably.';kind='warning';}
  if(mode==='voice')text+=' This is a text-recognition comparison, not a pronunciation score.';
  return {title,text,kind,model,recognized:response};
 }
 function markAttempt(id,i){if(!state.lessonAttempts[id])state.lessonAttempts[id]=[];if(!state.lessonAttempts[id].includes(i))state.lessonAttempts[id].push(i);state.lastLesson=id;recordActivity();save();}
 function submitAnswer(kind,response,mode){
  if(!response.trim()){toast('Please say or type a short Japanese answer.');return;}
  if(kind==='lesson'&&ui.view==='lesson'){
   const l=ls(ui.lessonId),d=l.drills[ui.drill];ui.lessonFeedback=assess(response,d[3],d[4],mode);markAttempt(l.id,ui.drill);render();
  }else if(kind==='scene'&&ui.view==='scenario'){
   const s=sc(ui.sceneId),t=s.turns[ui.sceneTurn];ui.sceneFeedback=assess(response,t[3],t[4],mode);recordActivity();save();render();
  }
 }
 function gradeReview(good){const c=dueCards()[0];if(!c)return;const prev=state.review[c.id]||{reps:0,interval:0};const reps=good?prev.reps+1:0;const steps=[1,3,7,14,30,60];const interval=good?steps[Math.min(reps-1,steps.length-1)]:0;const date=new Date();date.setDate(date.getDate()+interval);state.review[c.id]={reps,interval,due:good?date.toLocaleDateString('en-CA'):today()};
  if(!good){ // Move the card behind others for this session rather than getting stuck in a same-card loop.
    state.review[c.id].due=today();state.review[c.id].lastAgain=Date.now();
  }
  state.minutes+=1;recordActivity();save();ui.reviewShow=false;
  // Sort again cards behind unreviewed and other due cards when possible.
  render();
 }
 function coachPrompt(){const completed=state.completed.map(id=>ls(id)?.title).filter(Boolean);return `Act as my personal spoken Japanese conversation coach. I am working toward conversational Japanese at around the JLPT N3 comprehension level. My current study track is ${state.initialLevel}. My completed app lessons: ${completed.join(', ')||'I am beginning at N5'}. Teach with Pimsleur-style retrieval and spaced repetition, comprehensible spoken Japanese, role-playing real situations in Japan, and concise grammar corrections. Ask ONE Japanese question at a time, speak slowly at first, and wait for my spoken answer. Correct significant errors in English, give a natural Japanese model, and ask me to repeat it. Do not claim precise pronunciation scores. Gradually reduce English support. My priority situations: trains, shopping, housing, family, medical appointments, neighbors, and work. At the end give a short written summary of three errors and three phrases to review next time. Begin with a short assessment before choosing the difficulty.`;}
 function download(text,name,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);}
 function navigate(v){ui.view=v;ui.lessonFeedback=null;ui.sceneFeedback=null;render();window.scrollTo({top:0,behavior:'instant'});}
 async function copyText(s){try{await navigator.clipboard.writeText(s);toast('Copied to clipboard. Paste it into ChatGPT Voice.');}catch(err){window.prompt('Copy this Japanese coach prompt:',s);}}
 document.addEventListener('click',(event)=>{
  const b=event.target.closest('[data-action], [data-nav]');if(!b)return;
  if(b.dataset.nav){navigate(b.dataset.nav);return;}
  const act=b.dataset.action;let l,d,s,t;
  switch(act){
   case 'continue':ui.lessonId=remain().id;ui.drill=0;ui.listeningHide=true;navigate('lesson');break;
   case 'open-lessons':navigate('lessons');break;
   case 'open-voice':navigate('voice');break;
   case 'filter-level':ui.level=b.dataset.level;render();break;
   case 'start-lesson':ui.lessonId=b.dataset.id;ui.drill=0;ui.listeningHide=true;navigate('lesson');break;
   case 'speak-text':speakJapanese(b.dataset.text||'');break;
   case 'hear-question':l=ls(ui.lessonId);speakJapanese(l.drills[ui.drill][0]);break;
   case 'hear-answer':l=ls(ui.lessonId);speakJapanese(l.drills[ui.drill][3]);break;
   case 'toggle-hide':ui.listeningHide=!ui.listeningHide;render();break;
   case 'mic-lesson':microphone('lesson');break;
   case 'mic-scene':microphone('scene');break;
   case 'check-typed-lesson':submitAnswer('lesson',document.getElementById('typed-response')?.value||'','text');break;
   case 'check-typed-scene':submitAnswer('scene',document.getElementById('typed-response')?.value||'','text');break;
   case 'practice-done':markAttempt(ui.lessonId,ui.drill);ui.lessonFeedback={kind:'success',title:'Practice recorded ✓',text:'You can continue. For best results, listen and respond out loud before moving on.',model:ls(ui.lessonId).drills[ui.drill][3]};render();break;
   case 'next-drill':ui.drill=Math.min(ui.drill+1,ls(ui.lessonId).drills.length-1);ui.lessonFeedback=null;render();break;
   case 'prev-drill':ui.drill=Math.max(0,ui.drill-1);ui.lessonFeedback=null;render();break;
   case 'finish-lesson':l=ls(ui.lessonId);if((state.lessonAttempts[l.id]||[]).length<l.drills.length){toast('Practice both prompts first.');break;}if(!state.completed.includes(l.id)){state.completed.push(l.id);state.sessions++;state.minutes+=25;recordActivity();log('lesson',l.title,'Completed '+l.level+' lesson and added vocabulary reviews.');save();}toast('Lesson complete! Vocabulary is now in your review deck.');navigate('lessons');break;
   case 'open-scenario':ui.sceneId=b.dataset.id;ui.sceneTurn=0;ui.sceneFeedback=null;ui.listeningHide=true;navigate('scenario');break;
   case 'hear-scene':s=sc(ui.sceneId);speakJapanese(s.turns[ui.sceneTurn][0]);break;
   case 'hear-scene-answer':s=sc(ui.sceneId);speakJapanese(s.turns[ui.sceneTurn][3]);break;
   case 'prev-scene':ui.sceneTurn=Math.max(0,ui.sceneTurn-1);ui.sceneFeedback=null;render();break;
   case 'next-scene':s=sc(ui.sceneId);if(ui.sceneTurn<s.turns.length-1){ui.sceneTurn++;ui.sceneFeedback=null;render();}else{if(!state.scenariosDone.includes(s.id))state.scenariosDone.push(s.id);state.sessions++;state.minutes+=10;recordActivity();log('scenario',s.title,'Practiced real-life conversation.');save();toast('Role-play complete. Nice work!');navigate('voice');}break;
   case 'copy-coach':copyText(coachPrompt());break;
   case 'open-chatgpt':window.open('https://chatgpt.com/','_blank','noopener,noreferrer');break;
   case 'hear-card':d=dueCards()[0];if(d)speakJapanese(d.word);break;
   case 'reveal-card':ui.reviewShow=true;render();break;
   case 'grade-again':gradeReview(false);break;
   case 'grade-good':gradeReview(true);break;
   case 'export':download(JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2),'nihongo-path-progress-'+today()+'.json','application/json');toast('Progress exported. Keep the JSON as your backup.');break;
   case 'reset':if(confirm('Reset all Nihongo Path progress on this device? This cannot be undone unless you exported a backup.')){state=defaultState();save();navigate('home');toast('Progress reset.');}break;
  }
 });
 document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='typed-response'){event.preventDefault();submitAnswer(ui.view==='scenario'?'scene':'lesson',event.target.value,'text');}});
 document.addEventListener('change',(event)=>{
  const t=event.target;
  if(t.dataset.setting){let k=t.dataset.setting;if(k==='initialLevel')state.initialLevel=t.value;else state.prefs[k]=t.type==='checkbox'?t.checked:k==='rate'?Number(t.value):t.value;save();toast('Preference saved.');}
  if(t.id==='import-file'&&t.files?.[0]){const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(reader.result);if(!Array.isArray(x.completed)||!x.prefs)throw Error('Invalid progress file');state={...defaultState(),...x,prefs:{...defaultState().prefs,...x.prefs}};save();navigate('home');toast('Progress imported successfully.');}catch(err){toast('The file was not a valid Nihongo Path export.');}};reader.readAsText(t.files[0]);}
 });
 // Improve voice availability after browser voices load.
 if('speechSynthesis' in window){speechSynthesis.onvoiceschanged=()=>{};}
 if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
 // PWA prompt on eligible browsers.
 window.addEventListener('beforeinstallprompt',ev=>{ev.preventDefault();window.pwaInstallPrompt=ev;});
 render();
})();
