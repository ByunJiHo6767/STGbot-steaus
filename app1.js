// ===== 독립 실행용 AI 연결 (Claude 화면 밖에서 쓰기 위한 부분) =====
// server.js를 같은 주소에서 실행하면 '/api/chat' 그대로 두면 됩니다.
// 서버를 다른 주소에 두었다면 그 주소로 바꾸세요. 예: 'https://내서버.com/api/chat'
const API_URL='/api/chat';
const blobB64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
const _sample=async(input,o={})=>{
  if(!API_URL)throw{code:'none'};
  const messages=typeof input==='string'?[{role:'user',content:input}]:input;
  const images=o.images?await Promise.all(o.images.map(async b=>({d:await blobB64(b),t:b.type||'image/jpeg'}))):[];
  let r;try{r=await fetch(API_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages,images,tier:o.modelTier||'default',effort:o.effort||'medium'})})}catch(e){throw{code:'none'}}
  if(r.status===429)throw{code:'rate_limited'};
  const j=await r.json().catch(()=>({}));
  if(!r.ok||typeof j.text!=='string')throw{code:'err'};
  if(o.onText)o.onText({text:j.text});
  return{text:j.text};
};
_sample.limits=async()=>({images:true});
const claude={use:async()=>_sample};
// ===== 여기까지 =====

const $=id=>document.getElementById(id),log=$('log'),inp=$('in'),go=$('go'),W=$('welcome'),tray=$('tray');
const P={
up:'<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
down:'<path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/>',
regen:'<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
copy:'<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
vol:'<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
panel:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
unlock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
box:'<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
code:'<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
cpu:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
wave:'<path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/>',
user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
chatplus:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/>',
flask:'<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
smile:'<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
edit:'<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
camera:'<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
image:'<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
share:'<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="m16 6-4-4-4 4M12 2v13"/>',
branch:'<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>'};
const ic=(n,s=20)=>'<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+P[n]+'</svg>';
document.querySelectorAll('[data-ic]').forEach(b=>b.innerHTML=ic(b.dataset.ic)+(b.dataset.t?'<span>'+b.dataset.t+'</span>':''));
const INSTR='당신은 STGbot, 친절한 한국어 AI 도우미입니다. 간결하고 자연스럽게 답하세요. 수학은 x, y가 들어간 방정식·연립방정식·함수도 단계별로 풀되 LaTeX 없이 일반 텍스트와 유니코드(², √, π)만 쓰세요. 도형이나 함수 그래프 문제는 길이·각도·좌표축과 눈금을 표시한 그림을 함께 그리세요. 그림·이미지·도형·그래프를 요청받으면 완성된 <svg viewBox="0 0 800 600"> 하나를 답변에 직접 포함하세요(스크립트·외부 링크·코드펜스 없이). 첨부된 사진과 파일 내용은 볼 수 있지만 링크(URL)는 열 수 없으니, 링크를 주면 솔직히 그렇게 말하고 내용을 붙여넣어 달라고 하세요. 모르는 것은 솔직히 말하세요.';
let chats=[{m:[]}],cur=0,pend=[],infoMode=false;
let user=null,ckey='stg-chats';
try{user=localStorage.getItem('stg-user');if(user)ckey='stg-chats:'+user}catch(e){}
try{const sv=JSON.parse(localStorage.getItem(ckey)||'null');if(sv&&sv.length){chats=sv;cur=chats.length-1}}catch(e){}
const saveChats=()=>{try{localStorage.setItem(ckey,JSON.stringify(chats.map(c=>({rs:c.rs,m:c.m.filter(x=>!x.busy&&(x.r==='u'||x.t)).map(x=>({r:x.r,t:x.t,send:x.send,att:x.att,like:x.like}))}))))}catch(e){}};
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const toast=s=>{const t=$('toast');t.textContent=s;t.style.opacity=1;clearTimeout(toast.k);toast.k=setTimeout(()=>t.style.opacity=0,2000)};
const strip=s=>s.replace(/```(?:svg|xml|html)?/g,'').replace(/<svg[\s\S]*?(<\/svg>|$)/i,'').trim();
const copyText=t=>(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();const ok=document.execCommand('copy');a.remove();if(!ok)throw 0});
function fill(b,full,done){
  b.textContent=strip(full)||(/<svg/i.test(full)?'그리는 중…':'…');
  const m=done&&full.match(/<svg[\s\S]*?<\/svg>/i);
  if(m){const i=document.createElement('img');i.alt='AI가 그린 그림';i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(m[0]);b.prepend(i);b.classList.add('has')}
}
function acts(m,i){
  const w=el('div'),d=el('div','acts'),more=el('div','more');
  const mk=(n,f)=>{const b=el('button','ib');b.innerHTML=ic(n);b.onclick=()=>f(b);return b};
  const sync=()=>{up.classList.toggle('on',m.like===1);dn.classList.toggle('on',m.like===-1)};
  const up=mk('up',()=>{m.like=m.like===1?0:1;sync()}),dn=mk('down',()=>{m.like=m.like===-1?0:-1;sync()});sync();
  const ms=(n,t,f)=>{const b=el('button','o');b.innerHTML=ic(n,16)+'<span>'+t+'</span>';b.onclick=f;more.appendChild(b)};
  ms('share','공유',async()=>{const t=strip(m.t);try{if(navigator.share){await navigator.share({text:t});return}}catch(e){if(e&&e.name==='AbortError')return}
    copyText(t).then(()=>toast('답변을 복사했어요')).catch(()=>toast('공유할 수 없어요'))});
  ms('branch','새 채팅으로 분기',()=>{chats.push({m:chats[cur].m.slice(0,i+1).map(x=>({r:x.r,t:x.t,send:x.send,att:x.att}))});cur=chats.length-1;render();toast('새 채팅으로 분기했어요')});
  const sp=el('span','sp');
  d.append(up,dn,mk('regen',()=>regen(i)),mk('copy',()=>copyText(strip(m.t)).then(()=>toast('복사했어요')).catch(()=>toast('복사할 수 없어요'))),mk('more',()=>more.classList.toggle('on')),sp,
    mk('vol',()=>{try{if(speechSynthesis.speaking){speechSynthesis.cancel();return}}catch(e){}speak(m.t)}));
  w.append(d,more);return w;
}
function row(m,i){
  const r=el('div','row '+m.r),b=el('div','msg '+m.r);r.appendChild(b);m.el=b;
  if(m.r==='u'){b.textContent=m.t;if(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+$/u.test(m.t)&&!(m.att&&m.att.length))b.classList.add('stk');
    if(m.att&&m.att.length)b.appendChild(el('div','att','첨부: '+m.att.join(', ')))}
  else{fill(b,m.t,!m.busy);if(!m.busy&&m.t)r.appendChild(acts(m,i))}
  return r;
}
function render(){
  [...log.querySelectorAll('.row')].forEach(n=>n.remove());
  const c=chats[cur];const wasHidden=W.style.display==='none';W.style.display=c.m.length?'none':'';if(!c.m.length&&wasHidden)pickMsg();
  c.m.forEach((m,i)=>log.appendChild(row(m,i)));
  log.scrollTop=log.scrollHeight;histRender();saveChats();
}
function histRender(){const l=$('sl');l.innerHTML='';
  if(chats.length===1&&!chats[0].m.length){l.appendChild(el('div',null,'아직 기록이 없어요'));return}
  chats.forEach((c,k)=>{const d=el('div','hi'+(k===cur?' cur':'')),t=el('div'),x=el('button','ib');x.innerHTML=ic('trash',18);
    t.append(el('b',null,(k+1)+'. '+(c.m[0]?c.m[0].t:'새 대화')),el('small',null,c.m.length+'개 메시지'));
    x.onclick=e=>{e.stopPropagation();chats.splice(k,1);if(!chats.length)chats.push({m:[]});if(k<cur)cur--;cur=Math.min(cur,chats.length-1);render()};
    d.onclick=()=>{cur=k;showChat();render()};
    d.append(t,x);l.appendChild(d)})}
function trayRender(){
  tray.innerHTML='';
  pend.forEach((p,i)=>{const s=el('span',null,p.label);s.insertAdjacentHTML('beforeend',ic('x',12));s.onclick=()=>{pend.splice(i,1);trayRender()};tray.appendChild(s)});
}
async function shrink(f){
  try{const bm=await createImageBitmap(f),s=Math.min(1,1280/Math.max(bm.width,bm.height)),cv=document.createElement('canvas');
    cv.width=Math.round(bm.width*s);cv.height=Math.round(bm.height*s);cv.getContext('2d').drawImage(bm,0,0,cv.width,cv.height);
    return await new Promise(r=>cv.toBlob(r,'image/jpeg',.85))}catch(e){return f}
}
async function take(files){
  for(const f of files){
    if(f.type.startsWith('image/')){pend.push({kind:'img',label:'사진',blob:await shrink(f)})}
    else if(/\.(pdf|docx?|xlsx?|pptx?|zip|hwp)$/i.test(f.name)){toast('이 형식은 아직 읽을 수 없어요 (텍스트 파일만 가능)')}
    else{const t=await f.text();pend.push({kind:'file',label:f.name,name:f.name,text:t.slice(0,15000)})}
  }
  trayRender();
}
async function run(c,blobs){
  const am={r:'a',t:'',busy:true};c.m.push(am);render();
  try{
    const sample=await claude.use('sample');if(!sample)throw{code:'none'};
    const o={cache:false,modelTier:think==='max'?'complex':MD[model].t,effort:TH[think].e,onText:t=>{am.t=t.text;fill(am.el,t.text,false);log.scrollTop=log.scrollHeight}};
    if(blobs.length){if(!(await sample.limits()).images)throw{code:'noimg'};o.images=blobs}
    let h=c.m.slice(0,-1).map(m=>({role:m.r==='u'?'user':'assistant',content:m.send||m.t})).slice(-20);
    if(h[0].role!=='user')h.shift();h[0]={role:'user',content:INSTR+'\n'+LR()+'\n\n'+h[0].content};
    const r=await sample(h,o);am.t=r.text;am.busy=false;if(readOn&&speechText(am.t))speak(am.t);
  }catch(e){
    c.m.pop();
    toast(e&&e.code==='none'?'이 환경에서는 AI 기능을 쓸 수 없어요':e&&e.code==='noimg'?'지금은 사진을 읽을 수 없어요':e&&e.code==='not_granted'?'AI 사용 권한이 허용되지 않았어요':e&&e.code==='rate_limited'?'사용 한도에 도달했거나 요청이 많아요. 잠시 후 다시 시도해 주세요':'오류가 발생했어요. 다시 보내 주세요');
  }finally{go.disabled=false;if(chats[cur]===c)render();if(vcOn&&!speakingNow)setTimeout(listen,400)}
}
async function send(){
  const q=inp.value.trim();if((!q&&!pend.length)||go.disabled)return;
  try{speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(' '))}catch(e){}
  go.disabled=true;const c=chats[cur],blobs=pend.filter(p=>p.kind==='img').map(p=>p.blob);
  const rsFirst=resMode&&!c.rs;if(resMode)c.rs=true;
  let body=q||'첨부한 내용을 봐 주세요.';
  if(resMode&&q&&!rsFirst)body='[연구 모드 후속 질문] 앞선 연구 대화를 이어서, 연구 도우미로서 근거와 불확실한 점을 구분해 답해 주세요. 실시간 검색은 할 수 없으니 아는 범위에서만 답하세요.\n질문: '+q;
  else if(resMode&&q)body='[연구 요청] 다음 주제를 연구하듯 체계적으로 정리해 주세요. 개요, 핵심 쟁점, 근거와 반론, 불확실하거나 논란이 있는 점, 더 알아볼 질문 순서로 쓰고, 확실하지 않은 내용은 확실하지 않다고 표시하세요. 실시간 검색은 할 수 없으니 아는 범위에서만 답하세요.\n주제: '+q;
  else if(infoMode&&q)body='[정보 입수 요청] 다음 주제를 핵심 요약, 배경, 알아둘 점 순서로 정리해 주세요. 확실하지 않은 내용은 확실하지 않다고 표시하세요.\n주제: '+q;
  if(codeMode&&q)body=CODE_P+q;
  pend.filter(p=>p.kind==='file').forEach(f=>body+='\n\n[첨부 파일: '+f.name+']\n'+f.text);
  const um={r:'u',t:q||'(첨부)',send:body,att:pend.map(p=>p.label)};
  c.m.push(um);pend=[];inp.value='';trayRender();
  await run(c,blobs);
  if(c.m[c.m.length-1]===um){c.m.pop();inp.value=q;if(chats[cur]===c)render()}
}
function regen(i){if(go.disabled)return;go.disabled=true;const c=chats[cur];c.m.length=i;run(c,[])}
$('plus').onclick=()=>$('menu').classList.toggle('on');


document.querySelectorAll('#menu button').forEach(b=>b.onclick=()=>{$(b.dataset.k).click();$('menu').classList.remove('on')});
['cam','pho','fil'].forEach(id=>$(id).onchange=async e=>{await take([...e.target.files]);e.target.value=''});
go.onclick=send;
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send()}});
$('new').onclick=()=>{if(!chats[cur].m.length){toast('이미 새 채팅이에요');showChat();return}chats.push({m:[]});cur=chats.length-1;showChat();render();toast('대화를 저장하고 새 채팅을 시작했어요')};
$('share').onclick=async()=>{const m=chats[cur].m.filter(x=>!x.busy&&x.t);if(!m.length){toast('공유할 대화가 없어요');return}
  const t=m.map(x=>(x.r==='u'?'나: '+x.t:'STGbot: '+strip(x.t))).join('\n\n');
  try{if(navigator.share){await navigator.share({title:'STGbot 대화',text:t});return}}catch(e){if(e&&e.name==='AbortError')return}
  copyText(t).then(()=>toast('대화를 복사했어요')).catch(()=>toast('공유할 수 없어요'))};
let cards=[];try{cards=JSON.parse(localStorage.getItem('stg-cards')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('stg-cards',JSON.stringify(cards))}catch(e){}};
const grow=t=>{t.style.height='auto';t.style.height=t.scrollHeight+'px'};
const setInfo=on=>{$('info').classList.toggle('on',on);$('info').innerHTML=ic(on&&unlocked?'unlock':'lock')+'<span>'+(on?'채팅으로 돌아가기':'정보 입수')+'</span>'};
const showChat=()=>{document.body.classList.remove('bd','rs');unlocked=false;setInfo(false);setRes(resMode)};
let unlocked=false;
const PH='c018edb6c6cd7e275391906115e9e332e4fc5a4274ba086799f5263fe294c04b';
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
function lockRender(){
  const B=$('board');B.innerHTML='';
  const w=el('div','lock'),pi=el('input','inp'),ok=el('button','o',"확인");
  pi.type='password';pi.placeholder='비밀번호';pi.autocomplete='off';
  const tryIt=async()=>{let h='';try{h=await sha(pi.value)}catch(e){toast('이 환경에서는 잠금을 확인할 수 없어요');return}
    if(h===PH){unlocked=true;setInfo(true);boardRender()}else{pi.value='';toast('비밀번호가 맞지 않아요')}};
  ok.onclick=tryIt;pi.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)tryIt()};
  w.append(el('h3',null,'비밀번호를 입력하세요'),pi,ok);B.appendChild(w);pi.focus();
}
function boardRender(){
  if(!unlocked){lockRender();return}
  const B=$('board');B.innerHTML='';
  const bt=el('div','bt'),ni=el('input','inp'),nb=el('button','o');ni.placeholder='새 카드 제목';nb.innerHTML=ic('plus',16)+'<span>카드 추가</span>';
  const addCard=()=>{const t=ni.value.trim();if(!t)return;cards.unshift({title:t,items:[]});save();boardRender()};
  nb.onclick=addCard;ni.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)addCard()};
  bt.append(ni,nb);B.appendChild(bt);
  if(!cards.length)B.appendChild(el('p','mut','카드를 추가해 정보를 모아 보세요.'));
  cards.forEach((c,k)=>{
    const d=el('div','card'),h=el('div','ch'),ti=el('input'),ai=el('button','ib'),del=el('button','ib');
    ti.value=c.title;ti.oninput=()=>{c.title=ti.value;save()};
    ai.innerHTML=ic('search');ai.title='AI로 채우기';del.innerHTML=ic('trash');del.title='카드 삭제';
    del.onclick=()=>{cards.splice(k,1);save();boardRender()};
    ai.onclick=async()=>{
      if(ai.disabled)return;ai.disabled=true;toast('AI가 정리하는 중…');
      try{const sample=await claude.use('sample');if(!sample)throw 0;
        const r=await sample('주제: '+c.title+'\n이 주제의 핵심 정보를 '+LANGS[lang].ai+'로 4~6개의 짧은 항목으로 정리해 주세요. 한 줄에 하나씩, 번호나 기호나 설명 없이 항목만 출력하세요. 확실하지 않은 내용은 적지 마세요.',{cache:false});
        c.items.push(...r.text.split('\n').map(s=>s.replace(/^\s*(?:[-*•]|\d+[.)])\s*/,'').trim()).filter(Boolean).slice(0,8));
        save();boardRender();
      }catch(e){toast('AI로 채우지 못했어요');ai.disabled=false}
    };
    h.append(ti,ai,del);d.appendChild(h);
    c.items.forEach((s,j)=>{const r=el('div','it'),t=el('textarea'),x=el('button','ib');t.rows=1;t.value=s;
      t.oninput=()=>{c.items[j]=t.value;save();grow(t)};
      x.innerHTML=ic('x',16);x.title='내용 삭제';x.onclick=()=>{c.items.splice(j,1);save();boardRender()};
      r.append(t,x);d.appendChild(r)});
    const a=el('div','add'),ii=el('input','inp'),ab=el('button','ib');ii.placeholder='내용 추가';ab.innerHTML=ic('plus');
    const addIt=()=>{const v=ii.value.trim();if(!v)return;c.items.push(v);save();boardRender()};
    ab.onclick=addIt;ii.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)addIt()};
    a.append(ii,ab);d.appendChild(a);B.appendChild(d)});
  B.querySelectorAll('.it textarea').forEach(grow);
}
$('info').onclick=async()=>{
  if(document.body.classList.contains('bd')){showChat();return}
  if(!user){toast('정보 입수는 허용된 아이디로 로그인해야 해요');openDlg();return}
  let h='';try{h=await sha(user)}catch(e){toast('이 환경에서는 확인할 수 없어요');return}
  if(!IA.includes(h)){toast('이 아이디는 정보 입수를 쓸 수 없어요');return}
  document.body.classList.add('bd');document.body.classList.remove('rs');setInfo(true);setRes(false);unlocked=false;boardRender()};


let readOn=true;
const speak=t=>{try{const s=window.speechSynthesis;s.cancel();const u=new SpeechSynthesisUtterance(speechText(t));u.lang=LANGS[lang].sr;
  const vs=s.getVoices().filter(x=>x.lang.toLowerCase().replace('_','-').startsWith(LANGS[lang].sr.slice(0,2))),mv=vs.find(x=>!/female|여성/i.test(x.name)&&/male|남성|남자/i.test(x.name));
  if(mv){u.voice=mv;u.pitch=.9}else{if(vs[0])u.voice=vs[0];u.pitch=.6}
  u.rate=.95;speakingNow=true;const my=++spk;u.onend=u.onerror=()=>{if(my!==spk)return;speakingNow=false;if(vcOn)setTimeout(listen,300)};s.speak(u)}catch(e){speakingNow=false;toast('이 기기는 읽어 주기를 지원하지 않아요')}};
try{speechSynthesis.getVoices()}catch(e){}

const side=$('side');try{if(localStorage.getItem('stg-side')==='c')side.classList.add('c')}catch(e){}
$('sideT').onclick=()=>{const c=side.classList.toggle('c');try{localStorage.setItem('stg-side',c?'c':'o')}catch(e){}};
let resMode=false;
let rsTopic='',rsText='',rsBusy=false;
const setRes=on=>{$('res').classList.toggle('on',on);$('res').innerHTML=ic('flask')+'<span>'+(on?'연구 모드 켜짐':'연구')+'</span>'};
const RQ='당신은 꼼꼼한 연구 도우미입니다. 아래 주제를 한국어로 체계적으로 연구해 정리하세요. 반드시 다음 다섯 섹션만, 각 섹션은 "## 제목" 줄로 시작하세요: ## 개요, ## 핵심 쟁점, ## 근거와 반론, ## 불확실하거나 논란이 있는 점, ## 더 알아볼 질문. 각 섹션은 짧은 문장이나 항목으로 쓰고, 확실하지 않은 내용은 확실하지 않다고 표시하세요. 실시간 검색은 할 수 없으니 아는 범위에서만 쓰세요. 서론이나 맺음말 없이 섹션만 출력하세요.\n주제: ';
const secs=t=>t.split(/^##\s*/m).map(s=>s.trim()).filter(Boolean).map(s=>{const i=s.indexOf('\n');return i<0?[s,'']:[s.slice(0,i).trim(),s.slice(i+1).trim()]});
function researchRender(){
  const R=$('research');R.innerHTML='';
  const rt=el('div','rt'),ti=el('input','inp'),g2=el('button','o');ti.placeholder='연구할 주제를 입력하세요';ti.value=rsTopic;
  g2.innerHTML=ic('flask',16)+'<span>연구 시작</span>';
  const start=()=>{const t=ti.value.trim();if(t)runResearch(t)};
  g2.onclick=start;ti.onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing)start()};
  rt.append(ti,g2);R.appendChild(rt);
  if(!rsText){R.appendChild(el('p','mut','주제를 입력하면 개요, 핵심 쟁점, 근거와 반론, 불확실한 점, 더 알아볼 질문으로 정리해 줘요. (실시간 검색은 불가, AI가 아는 범위)'));return}
  if(!rsBusy){const ac=el('div','racts'),cp=el('button','o'),sv=el('button','o');
    cp.innerHTML=ic('copy',16)+'<span>복사</span>';sv.innerHTML=ic('plus',16)+'<span>카드로 저장</span>';
    cp.onclick=()=>copyText(rsText).then(()=>toast('복사했어요')).catch(()=>toast('복사할 수 없어요'));
    sv.onclick=()=>{cards.unshift({title:rsTopic,items:secs(rsText).map(s=>s[0]+': '+s[1].replace(/\s+/g,' '))});save();toast('정보 입수 카드로 저장했어요')};
    ac.append(cp,sv);R.appendChild(ac)}
  secs(rsText).forEach(s=>{const d=el('div','card rsec');d.append(el('h4',null,s[0]),el('p',null,s[1]));R.appendChild(d)});
}
async function runResearch(t){
  if(rsBusy)return;rsBusy=true;rsTopic=t;rsText='';researchRender();toast('연구하는 중…');
  try{const sample=await claude.use('sample');if(!sample)throw 0;
    const r=await sample(RQ+t,{cache:false,modelTier:'complex',onText:x=>{rsText=x.text;researchRender()}});
    rsText=r.text;
  }catch(e){toast('연구하지 못했어요. 다시 시도해 주세요')}
  rsBusy=false;researchRender();
}
$('res').onclick=()=>{showChat();resMode=!resMode;setRes(resMode);inp.placeholder=resMode?'연구할 주제나 질문을 입력하세요':'메시지를 입력하세요';toast(resMode?'연구 모드: 주제를 보내면 정리하고, 이어서 질문하며 함께 연구해요 (실시간 검색은 불가)':'연구 모드를 껐어요');inp.focus()};
